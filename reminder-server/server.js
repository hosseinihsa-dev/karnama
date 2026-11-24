import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import webPush from 'web-push';

const {APP_ORIGIN, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT} = process.env;
if (!APP_ORIGIN || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  throw new Error('Set APP_ORIGIN and the VAPID configuration before starting.');
}
webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const db = new DatabaseSync(process.env.REMINDER_DB || 'reminders.sqlite');
db.exec(`CREATE TABLE IF NOT EXISTS devices (
  token TEXT PRIMARY KEY, subscription TEXT NOT NULL, schedule TEXT NOT NULL, expires INTEGER NOT NULL
)`);
const getDevice = db.prepare('SELECT * FROM devices WHERE token = ?');
const setDevice = db.prepare('INSERT OR REPLACE INTO devices VALUES (?, ?, ?, ?)');
const removeDevice = db.prepare('DELETE FROM devices WHERE token = ?');
const allDevices = db.prepare('SELECT * FROM devices');
const dayMs = 86_400_000;
const leadMs = 15 * 60_000;

function validSubscription(subscription) {
  if (!subscription || typeof subscription.endpoint !== 'string' || subscription.endpoint.length > 2048) return false;
  const endpoint = new URL(subscription.endpoint);
  return endpoint.origin === 'https://fcm.googleapis.com'
    && !endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash
    && /^\/(?:fcm\/send|wp)\/[A-Za-z0-9_:-]+$/.test(endpoint.pathname)
    && /^[\w-]{87}$/.test(subscription.keys?.p256dh)
    && /^[\w-]{22}$/.test(subscription.keys?.auth);
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw new Error('Request too large');
  }
  return JSON.parse(body);
}

const server = createServer(async (request, response) => {
  const reply = (status, data = {}) => {
    response.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
    response.end(JSON.stringify(data));
  };
  if (request.headers.origin !== APP_ORIGIN) return reply(403);
  response.setHeader('Access-Control-Allow-Origin', APP_ORIGIN);
  response.setHeader('Vary', 'Origin');
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    return reply(200);
  }
  if (request.method === 'GET' && request.url === '/key') return reply(200, {publicKey: VAPID_PUBLIC_KEY});
  if (request.url !== '/schedule') return reply(404);
  const credential = /^Bearer ([a-f0-9-]{72})$/.exec(request.headers.authorization || '');
  if (!credential) return reply(401);
  const token = createHash('sha256').update(credential[1]).digest('hex');
  if (request.method === 'DELETE') {
    removeDevice.run(token);
    return reply(200);
  }
  if (request.method !== 'PUT') return reply(405);
  try {
    const {subscription, times} = await readBody(request);
    if (!validSubscription(subscription) || !Array.isArray(times) || times.length > 256
      || !times.every(Number.isSafeInteger)) return reply(400);
    const now = Date.now();
    const previous = JSON.parse(getDevice.get(token)?.schedule || '[]');
    const sent = new Set(previous.filter(item => item.sent).map(item => item.due));
    const schedule = [...new Set(times)].filter(due => due > now && due < now + 31 * dayMs)
      .map(due => ({due, sent: sent.has(due)}));
    setDevice.run(token, JSON.stringify(subscription), JSON.stringify(schedule), now + 31 * dayMs);
    return reply(200);
  } catch {
    return reply(400);
  }
});

let sending = false;
async function dispatchReminders() {
  if (sending) return;
  sending = true;
  try {
    for (const {token} of allDevices.all()) {
      const device = getDevice.get(token);
      if (!device) continue;
      if (device.expires <= Date.now()) {
        removeDevice.run(token);
        continue;
      }
      for (const {due} of JSON.parse(device.schedule)) {
        const current = getDevice.get(token);
        if (!current) break;
        const schedule = JSON.parse(current.schedule);
        const reminder = schedule.find(item => item.due === due);
        const now = Date.now();
        if (!reminder || reminder.sent || due <= now || due - now > leadMs) continue;
        try {
          await webPush.sendNotification(JSON.parse(current.subscription), JSON.stringify({due}), {
            TTL: Math.max(1, Math.ceil((due - now) / 1000)), urgency: 'high', timeout: 5000,
          });
          const latest = getDevice.get(token);
          if (latest) {
            const updated = JSON.parse(latest.schedule).map(item => item.due === due ? {...item, sent: true} : item);
            setDevice.run(token, latest.subscription, JSON.stringify(updated), latest.expires);
          }
        } catch (error) {
          if ((error.statusCode === 404 || error.statusCode === 410)
            && getDevice.get(token)?.subscription === current.subscription) removeDevice.run(token);
        }
      }
    }
  } finally {
    sending = false;
  }
}

server.listen(Number(process.env.PORT || 8080), process.env.BIND || '127.0.0.1');
setInterval(() => dispatchReminders().catch(() => console.error('Reminder dispatch failed')), 15_000);

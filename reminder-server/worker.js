import { DurableObject } from 'cloudflare:workers';
import webPush from 'web-push';

const leadMs = 15 * 60_000;
const dayMs = 86_400_000;
const json = (data, status = 200) => Response.json(data, {status});

function validSubscription(subscription) {
  if (typeof subscription?.endpoint !== 'string' || subscription.endpoint.length > 2048) return false;
  const endpoint = URL.parse(subscription.endpoint);
  return endpoint?.origin === 'https://fcm.googleapis.com'
    && !endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash
    && /^\/(?:fcm\/send|wp)\/[A-Za-z0-9_:-]+$/.test(endpoint.pathname)
    && /^[\w-]{87}$/.test(subscription.keys?.p256dh)
    && /^[\w-]{22}$/.test(subscription.keys?.auth);
}

export default {
  async fetch(request, env) {
    if (request.headers.get('Origin') !== env.APP_ORIGIN) return json({}, 403);
    const headers = {
      'Access-Control-Allow-Origin': env.APP_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    };
    const path = new URL(request.url).pathname;
    let result;
    if (request.method === 'OPTIONS') result = new Response(null, {status:204});
    else if (path === '/key' && request.method === 'GET') {
      result = env.VAPID_PUBLIC_KEY ? json({publicKey:env.VAPID_PUBLIC_KEY}) : json({}, 503);
    } else if (path !== '/schedule') result = json({}, 404);
    else if (!['GET','PUT','DELETE'].includes(request.method)) result = json({}, 405);
    else {
      const credential = /^Bearer ([a-f0-9-]{72})$/.exec(request.headers.get('Authorization') || '');
      if (!credential) result = json({}, 401);
      else if (Number(request.headers.get('Content-Length')) > 16384) result = json({}, 413);
      else result = await env.DEVICES.getByName(credential[1]).fetch(request);
    }
    return new Response(result.body, {status:result.status, headers:{...Object.fromEntries(result.headers), ...headers}});
  },
};

export class ReminderDevice extends DurableObject {
  async fetch(request) {
    const storage = this.ctx.storage;
    if (request.method === 'GET') {
      const schedule = await storage.get('schedule');
      const diagnostic = await storage.get('diagnostic');
      return json({next: schedule?.pending[0] ?? null, pending: schedule?.pending.length ?? 0, diagnostic});
    }
    if (request.method === 'DELETE') {
      await storage.deleteAlarm();
      await storage.delete('schedule');
      await storage.delete('diagnostic');
      return json({});
    }
    if (!request.body) return json({}, 400);
    let payload;
    const reader = request.body.getReader();
    try {
      const decoder = new TextDecoder();
      let bytes = 0;
      let body = '';
      for (;;) {
        const {done, value} = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 16384) {
          await reader.cancel();
          return json({}, 413);
        }
        body += decoder.decode(value, {stream:true});
      }
      payload = JSON.parse(body + decoder.decode());
    } catch { return json({}, 400); }
    const {subscription, times} = payload || {};
    if (!validSubscription(subscription) || !Array.isArray(times) || times.length > 256
      || !times.every(Number.isSafeInteger)) return json({}, 400);
    const now = Date.now();
    const previous = await storage.get('schedule');
    const sent = previous?.sent.filter(due => due > now) || [];
    const pending = [...new Set(times)].filter(due => due > now && due < now + 31 * dayMs && !sent.includes(due))
      .sort((a,b) => a-b);
    await this.store({subscription, pending, sent});
    return json({next:pending[0] ?? null, pending:pending.length, diagnostic:await storage.get('diagnostic')});
  }

  async store(schedule, retryAt = 0) {
    const storage = this.ctx.storage;
    if (!schedule.pending.length && !schedule.sent.length) {
      await storage.deleteAlarm();
      await storage.delete('schedule');
      return;
    }
    await storage.put('schedule', schedule);
    const next = schedule.pending.length ? schedule.pending[0] - leadMs : Math.max(...schedule.sent);
    await storage.setAlarm(Math.max(Date.now() + 1000, retryAt, next));
  }

  async alarm() {
    const storage = this.ctx.storage;
    const schedule = await storage.get('schedule');
    if (!schedule) return;
    const now = Date.now();
    schedule.pending = schedule.pending.filter(due => due > now);
    schedule.sent = schedule.sent.filter(due => due > now);
    const due = schedule.pending[0];
    if (due === undefined || due - now > leadMs) return this.store(schedule);
    const {VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY} = this.env;
    let response;
    try {
      const details = webPush.generateRequestDetails(schedule.subscription, JSON.stringify({due}), {
        vapidDetails:{subject:VAPID_SUBJECT, publicKey:VAPID_PUBLIC_KEY, privateKey:VAPID_PRIVATE_KEY},
        TTL:Math.ceil((due-now)/1000), urgency:'high',
      });
      const headers = new Headers(details.headers);
      headers.delete('Content-Length');
      response = await fetch(details.endpoint, {
        method:details.method, headers, body:details.body, redirect:'manual',
        signal:AbortSignal.timeout(5000),
      });
      console.log('push response', response.status);
      await storage.put('diagnostic', {at:now, due, status:response.status});
    } catch (error) {
      console.error('push request failed', error.name, error.code || '',
        String(error.message || '').replace(/https?:\/\/\S+/g, '[url]'));
      await storage.put('diagnostic', {at:now, due, status:null});
    }
    const latest = await storage.get('schedule');
    if (!latest || latest.subscription.endpoint !== schedule.subscription.endpoint) return;
    if (response && [404,410].includes(response.status)) return this.store({pending:[], sent:[]});
    if (response?.ok) {
      latest.pending = latest.pending.filter(time => time !== due);
      latest.sent.push(due);
      return this.store(latest);
    }
    return this.store(latest, Date.now() + 60_000);
  }
}

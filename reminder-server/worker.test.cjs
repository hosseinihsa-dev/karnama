const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

test('a Cloudflare alarm sends once and advances to the next reminder', async () => {
  let now = 1_800_000_000_000;
  let schedule, alarmAt, delivered = 0;
  const source = fs.readFileSync(require('node:path').join(__dirname, 'worker.js'), 'utf8')
    .replace(/^import .*;$/gm, '').replace('export default', 'globalThis.router =')
    .replace('export class ReminderDevice', 'globalThis.ReminderDevice = class');
  const context = vm.createContext({
    URL, Response, Headers, AbortSignal, TextDecoder,
    Date: {now: () => now},
    DurableObject: class { constructor(ctx, env) { this.ctx = ctx; this.env = env; } },
    webPush: {generateRequestDetails: subscription => ({endpoint:subscription.endpoint, method:'POST'})},
    fetch: async (_, options) => {
      assert.equal(options.redirect, 'manual');
      delivered++;
      return new Response(null, {status:201});
    },
  });
  vm.runInContext(source, context);
  const storage = {
    get: async () => structuredClone(schedule),
    put: async (_, value) => { schedule = structuredClone(value); },
    delete: async () => { schedule = undefined; },
    setAlarm: async at => { alarmAt = at; },
    deleteAlarm: async () => { alarmAt = undefined; },
  };
  const device = new context.ReminderDevice({storage}, {});
  const times = [now + 20 * 60_000, now + 40 * 60_000];
  const subscription = {endpoint:'https://fcm.googleapis.com/wp/test', keys:{p256dh:'a'.repeat(87), auth:'b'.repeat(22)}};
  const put = () => device.fetch(new Request('https://example.com/schedule', {
    method:'PUT', body:JSON.stringify({subscription, times}),
  }));
  assert.equal((await put()).status, 200);
  assert.equal(alarmAt, now + 5 * 60_000);
  now = alarmAt;
  await device.alarm();
  assert.equal(delivered, 1);
  await put();
  assert.equal(alarmAt, now + 20 * 60_000);
  await device.alarm();
  assert.equal(delivered, 1);
  await device.fetch(new Request('https://example.com/schedule', {method:'DELETE'}));
  assert.equal(alarmAt, undefined);
});

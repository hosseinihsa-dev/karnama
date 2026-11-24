const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

test('Android schedule contains future task times without task text', () => {
  const now = new Date(2026, 10, 23, 15, 45);
  const context = vm.createContext({
    navigator:{userAgent:'Android', serviceWorker:{}},
    window:{PushManager:{}, Notification:{}, addEventListener() {}},
    document:{getElementById:()=>({}), addEventListener() {}},
    localStorage:{getItem:()=>null},
    TODAY:()=> '2026-11-23', addDays:(_, offset)=>offset,
    fromIso:()=>new Date(now),
    instOn:offset=>offset ? [] : [
      {title:'Private', time:'16:00'}, {time:'4:00'}, {time:'16:00',done:true},
      {time:'17:00',blocked:true},
    ],
    graphReadiness:task=>({blocked:task.blocked}),
  });
  const source = fs.readFileSync('views.js','utf8').split('/* Android background reminders */')[1];
  vm.runInContext(source.replace(/\nrender\(\);\s*$/, ''), context);
  assert.deepEqual(Array.from(context.reminderTasks(+now).keys()), [+now + 15 * 60_000]);
});

test('the service worker can display the reminder without an open page', async () => {
  const handlers = {};
  let notification, completion, receipt;
  const due = Date.now()+899_000;
  const context = vm.createContext({
    URL, Intl, Date, Response,
    caches:{open:async()=>({
      match:async()=>Response.json({[due]:['جلسه انبارداری']}),
      put:async (_, response)=>{ receipt = await response.json(); },
    })},
    self:{
      addEventListener:(name,fn)=>{ handlers[name]=fn; },
      registration:{
        scope:'https://example.com/karnama/',
        showNotification:async (...args)=>{ notification=args; },
      },
    },
  });
  vm.runInContext(fs.readFileSync('sw.js','utf8'), context);
  handlers.push({data:{json:()=>({due,minutes:15})},waitUntil:work=>{ completion=work; }});
  await completion;
  assert.equal(notification[0], 'جلسه انبارداری');
  assert.match(notification[1].body, /۱۵ دقیقه/);
  assert.equal(notification[1].data.page, 'https://example.com/karnama/index.html');
  assert.equal(receipt.displayed, true);
});

const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('views.js','utf8');
const fn=source.slice(source.indexOf('function setTaskClock('),source.indexOf("document.querySelectorAll('[data-time-step]')"));
const ctx=vm.createContext({S:{pv:{time:null}},slotOfTime:t=>+t.slice(0,2)<12?0:+t.slice(0,2)<18?1:2,updatePv(){},toast(){}});
vm.runInContext(fn,ctx);
const set=(...args)=>ctx.setTaskClock(...args);
set('hour','۱۸');set('minute','٣٠');assert.equal(ctx.S.pv.time,'18:30');
set('minute','',1);assert.equal(ctx.S.pv.time,'18:31');
set('minute','59');set('minute','',1);assert.equal(ctx.S.pv.time,'18:00');
set('hour','23');set('hour','',1);assert.equal(ctx.S.pv.time,'00:00');
set('hour','',-1);assert.equal(ctx.S.pv.time,'23:00');
set('minute','17');assert.equal(ctx.S.pv.time,'23:17');
for(const bad of ['60','-1','aa','']){set('minute',bad);assert.equal(ctx.S.pv.time,'23:17')}
set('hour','24');assert.equal(ctx.S.pv.time,'23:17');
assert.equal(ctx.S.pv.touched,true);
console.log('Inline clock: Persian/Arabic digits, exact minutes, bounds and wraparound passed');

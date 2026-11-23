const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('views.js', 'utf8');
const clock = source.slice(source.indexOf('function advisorCountdownTarget('), source.indexOf('function advisorHome('));
const context = vm.createContext({localStorage:{getItem:()=>null}, taskContext:task=>task.context});
vm.runInContext(fs.readFileSync('core.js','utf8')+'\n'+clock, context);
const evaluate = expression => vm.runInContext(expression, context);

assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23'})"), null);
assert.equal(evaluate("advisorCountdownTarget({date:'2026-02-30',time:'16:00'})"), null);
assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23',time:'16:00'}).at"), +new Date(2026,10,23,16));
assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23',time:'16:00',context:{deadline:{value:'2026-11-24'}}}).at"), +new Date(2026,10,25));
assert.equal(evaluate('advisorCountdownText(3661000,true,0)'), '۰۱:۰۱:۰۱');
assert.equal(evaluate('advisorCountdownText(90001000,true,0)'), '۱ روز · ۰۱:۰۰:۰۱');
assert.equal(evaluate('advisorCountdownText(1000,true,1000)'), 'مهلت گذشته');
assert.equal(evaluate('advisorCountdownText(1000,false,1001)'), 'زمان انجام رسیده');

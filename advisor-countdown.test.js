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
assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23',time:'4:00'}).at"), +new Date(2026,10,23,4));
assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23',time:'۴:۰۰'}).at"), +new Date(2026,10,23,4));
assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23',time:'24:00'})"), null);
assert.equal(evaluate("advisorCountdownTarget({date:'2026-11-23',time:'16:00',context:{deadline:{value:'2026-11-24'}}}).at"), +new Date(2026,10,25));
assert.equal(evaluate('advisorCountdownText(3661000,true,0)'), '۰۱:۰۱:۰۱');
assert.equal(evaluate('advisorCountdownText(90001000,true,0)'), '۱ روز · ۰۱:۰۰:۰۱');
assert.equal(evaluate('advisorCountdownText(1000,true,1000)'), 'مهلت گذشته');
assert.equal(evaluate('advisorCountdownText(1000,false,1001)'), 'زمان انجام رسیده');
assert.equal(evaluate("classify('جلسه انبارداری ساعت ۴').time"), '16:00');
assert.equal(evaluate("classify('جلسه انبارداری ساعت ۴ صبح').time"), '4:00');
assert.equal(evaluate("classify('جلسه انبارداری ساعت 04:00').time"), '4:00');
assert.equal(evaluate("mergeSeries([{note:'جلسه انبارداری ساعت ۴',time:'04:00'}])[0].time"), '04:00');
assert.equal(evaluate(`(() => {
  const [task]=mergeSeries([{note:'جلسه انبارداری ساعت ۴',date:'2026-11-23',time:'4:00'}]);
  const target=advisorCountdownTarget(task);
  return advisorCountdownText(target.at,target.deadline,+new Date(2026,10,23,15,45));
})()`), '۰۰:۱۵:۰۰');

const decisionContext=vm.createContext({localStorage:{getItem:()=>null}});
const projectScripts=['core.js','memory.js','behavior.js','graph.js','decision.js'];
const advisor=source.slice(source.indexOf('function advisorCountdownTarget('),source.indexOf('function tasksView('));
vm.runInContext(projectScripts.map(file=>fs.readFileSync(file,'utf8')).join('\n')+'\n'+advisor,decisionContext);
vm.runInContext(`
  S.space='work';
  const today='2026-11-23';
  const meeting={id:50,title:'جلسهٔ انبارداری',c:4,p:1,s:1,date:today,time:'16:00',done:false};
  S.tasks=[meeting,{...meeting,id:51,title:'کار منزل',meta:{domain:'home'},time:'15:50'},
    {...meeting,id:52,title:'جلسهٔ بعدی',time:'17:00'}];
`,decisionContext);
const check = expression => vm.runInContext(expression,decisionContext);
assert.equal(check("chooseNextTask(tasksInSpace(),today,945)"),null);
assert.equal(check("advisorUpcomingTask(today,945).id"),50);
assert.match(check("advisorWaitingCard(today,945)"),/جلسهٔ انبارداری.*data-upcoming="true".*دیدن کارهای ثبت‌شده/);
assert.equal(check("advisorUpcomingTask(today,960).id"),52);
assert.equal(check("chooseNextTask(tasksInSpace(),today,960).task.id"),50);

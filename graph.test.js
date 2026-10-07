const fs=require('fs'),vm=require('vm'),assert=require('assert');
const storage={},ctx=vm.createContext({console,Date,Intl,setTimeout,clearTimeout,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v}});
vm.runInContext(['core.js','memory.js','behavior.js','decision.js','graph.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`\n globalThis.A={TODAY,addDays,graphReadiness,domainPreference,importTaskGraph,validateTaskGraph,chooseNextTask,assessNowFeasibility,decisionFingerprint,setTasks:x=>S.tasks=x,tasks:()=>S.tasks};`,ctx);
const A=ctx.A,D='2026-10-07';
const fixture={format:'karnama.task-graph',source:'test',tasks:[
  {sourceId:'a',title:'مرحله اول',domain:'work',state:'ready',date:D,prerequisiteSourceIds:[]},
  {sourceId:'b',title:'مرحله دوم',domain:'home',state:'waiting',waitingReason:'منتظر پاسخ',date:D,prerequisiteSourceIds:[]},
  {sourceId:'c',title:'مرحله سوم',domain:'personal',state:'future',date:D,prerequisiteSourceIds:['a','b']}
]};
A.setTasks([{id:1,title:'کار موجود',done:false,date:D,c:12,p:1,s:1}]);
assert.equal(A.importTaskGraph(fixture).added,3);assert.equal(A.tasks()[0].title,'کار موجود');
const [a,b,c]=A.tasks().slice(1);
assert.equal(A.graphReadiness(c,D).blocked,true);a.done=true;
assert.equal(A.graphReadiness(c,D).blocked,true,'All prerequisites must finish');
assert.equal(A.assessNowFeasibility(b,{date:D,nowMin:900}).status,'blocked');
b.meta.waiting.resolvedAt='2026-10-07T10:00:00Z';
assert.equal(A.graphReadiness(b,D).blocked,false);assert.equal(b.done,false,'Resolving wait does not complete task');
b.done=true;assert.equal(A.graphReadiness(c,D).blocked,false);
const before=A.tasks().length;assert.equal(A.importTaskGraph(fixture).added,0);assert.equal(A.tasks().length,before);assert.equal(A.tasks()[1].done,true);
assert.ok(A.tasks()[2].meta.waiting.resolvedAt,'Reimport must preserve resolved waiting');
const child=A.tasks()[3];A.tasks().splice(1,1);assert.equal(A.graphReadiness(child,D).blocked,true,'Deleted prerequisite is not completed');
const dated={id:900,title:'کار زمان‌دار',time:'08:00',date:D,c:4,meta:{notBefore:'2026-10-14'}};
assert.equal(A.assessNowFeasibility(dated,{date:D,nowMin:900}).status,'blocked','Explicit time cannot bypass graph date');
assert.equal(A.domainPreference({meta:{domain:'work'}},D,600),1);
assert.equal(A.domainPreference({meta:{domain:'work'}},D,1080),-1);
assert.equal(A.domainPreference({meta:{domain:'work'}},'2026-10-08',900),1,'Thursday is workday');
assert.equal(A.domainPreference({meta:{domain:'work'}},'2026-10-09',900),-1,'Friday is not workday');
const make=(id,domain)=>({id,title:'نوشتن گزارش '+id,date:D,c:4,p:1,s:1,done:false,meta:{domain}}),work=make(11,'work'),home=make(12,'home');
A.setTasks([work,home]);assert.equal(A.chooseNextTask(A.tasks(),D,900).task.id,11);assert.equal(A.chooseNextTask(A.tasks(),D,1200).task.id,12);
A.setTasks([work]);assert.equal(A.chooseNextTask(A.tasks(),D,1200).task.id,11,'Out-of-work-hour task still allowed');
const bad=JSON.parse(JSON.stringify(fixture));bad.tasks[0].prerequisiteSourceIds=['c'];assert.throws(()=>A.importTaskGraph(bad));assert.equal(A.tasks().length,1,'Invalid import is atomic');
bad.tasks[0].prerequisiteSourceIds=['missing'];assert.throws(()=>A.validateTaskGraph(bad));
A.setTasks([{id:3,title:'مرحله اول',note:'مرحله اول',date:D,done:true,c:4,p:0,s:1}]);assert.equal(A.importTaskGraph(fixture).added,2);assert.equal(A.tasks()[0].done,true,'Existing completed task stays completed');
const backup=JSON.stringify(A.tasks());A.setTasks(JSON.parse(backup));assert.ok(A.tasks().some(t=>t.meta.prerequisiteTaskIds.length===2),'Backup roundtrip preserves edges');
console.log('Task graph: dependency, waits, dates, domain schedule, merging, backup and invalid import checks passed');

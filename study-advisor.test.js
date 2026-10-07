const fs=require('fs'),vm=require('vm'),assert=require('assert');
const storage={};
const ctx=vm.createContext({console,Date,Intl,setTimeout,clearTimeout,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},render:()=>{},toast:()=>{}});
const source=fs.readFileSync('core.js','utf8')+'\n'+fs.readFileSync('study.js','utf8').split('const studyOv=')[0]+'\n'+fs.readFileSync('views.js','utf8').split('/* ================= render ================= */')[0];
vm.runInContext(source+`\n toast=()=>{}; globalThis.A={TODAY,addDays,advisorTaskPool,studyStats,addStudyProgress,setStudy:x=>STUDY=x,setTasks:x=>S.tasks=x};`,ctx);
const A=ctx.A,D=A.TODAY();
for(const mode of ['chapter','page']){
  const p={id:1,title:'جاودانگی',mode,total:100,pace:1,endDate:A.addDays(D,9),logs:{}};
  A.setStudy([p]);A.setTasks([]);
  assert.equal(A.advisorTaskPool(D).length,1,'Unread daily study should be suggested');
  const target=A.studyStats(p,D).target;
  A.addStudyProgress(p.id,target,D);
  assert.equal(A.studyStats(p,D).target,0,'Done marks the daily quota, not the whole book');
  assert.equal(A.advisorTaskPool(D).length,0,'Completed daily quota must disappear');
  assert.ok(A.advisorTaskPool(A.addDays(D,1)).length,'Tomorrow should have a new quota');
  A.setTasks([{id:2,meta:{advisorStudy:true,studyId:1}}]);
  assert.equal(A.advisorTaskPool(D).length,0,'Postponed study clone must not reappear after completion');
}
A.setTasks([]);A.setStudy([{id:1,title:'Expired',mode:'page',total:100,endDate:A.addDays(D,-1),logs:{}}]);
assert.equal(A.advisorTaskPool(D).length,0,'No zero-quota suggestion with a nonfunctional Done action');
console.log('11 study advisor regression checks passed');

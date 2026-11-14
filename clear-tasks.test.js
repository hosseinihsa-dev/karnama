const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('views.js','utf8'),fn=src.slice(src.indexOf('function clearAllTasks(){'),src.indexOf('function doBackup(){'));
const storage={'study':'keep','memory':'keep'},ctx=vm.createContext({S:{tasks:[{id:1,done:true},{id:2,rep:'هر روز'}]},KEY:'tasks',Date,JSON,fa:x=>x,confirm:()=>false,toast(){},render(){},localStorage:{setItem:(k,v)=>storage[k]=v}});
vm.runInContext(fn,ctx);ctx.clearAllTasks();assert.equal(ctx.S.tasks.length,2);
ctx.confirm=()=>true;ctx.clearAllTasks();assert.equal(ctx.S.tasks.length,0);assert.deepEqual(JSON.parse(storage.tasks).tasks,[]);
assert.equal(JSON.parse(storage['karnama.tasks-before-clear.v1']).tasks.length,2);assert.equal(storage.study,'keep');assert.equal(storage.memory,'keep');
ctx.S.tasks=[{id:3}];ctx.localStorage.setItem=()=>{throw Error('quota')};ctx.clearAllTasks();assert.equal(ctx.S.tasks.length,1);
console.log('Clear tasks: cancel, confirmed clear, recovery copy and storage failure passed');

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const storage = {};
const context = vm.createContext({
  console, Date, Intl,
  localStorage: {
    getItem: key => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = value; },
  },
});
const read = file => fs.readFileSync(file, 'utf8');
const taskViews = read('views.js').split('/* ================= render ================= */')[0];
vm.runInContext(read('core.js') + '\n' + read('graph.js') + '\n' + taskViews, context);
vm.runInContext(`
  const date = TODAY();
  const task = {title:'پیگیری', c:4, s:1, p:1, date, done:false};
  S.tasks = [
    {...task, id:10},
    {...task, id:11, meta:{domain:'home'}},
    {...task, id:12, c:12, title:'کار شخصی'},
  ];
  const STUDY = [];
  const ids = tasks => tasks.map(task => task.id).join(',');
`, context);
const evaluate = code => vm.runInContext(code, context);

assert.equal(evaluate('ids(spaceInstancesOn(date))'), '11,12');
assert.equal(evaluate('ids(advisorTaskPool(date))'), '11,12');
assert.equal(evaluate("S.space='work'; ids(spaceInstancesOn(date))"), '10');
assert.equal(evaluate('ids(advisorTaskPool(date))'), '10');
assert.equal(evaluate("duplicateOf({...task, id:20, meta:{domain:'work'}}).id"), 10);
assert.equal(evaluate("duplicateOf({...task, id:20, meta:{domain:'home'}}).id"), 11);
assert.equal(evaluate("mergeSeries(S.tasks.slice(0,2).map(task=>({...task,rep:'هر روز'}))).length"), 2);
assert.equal(evaluate('S.tasks.length'), 3);

assert.equal(evaluate(`importTaskGraph({
  format:'karnama.task-graph', source:'spaces',
  tasks:[{sourceId:'new', title:'کار شخصی', domain:'work', state:'ready', date, prerequisiteSourceIds:[]}]
}).added`), 1);
assert.equal(evaluate("S.space='home'; ids(tasksInSpace())"), '11,12');
assert.equal(evaluate("S.space='work'; tasksInSpace().length"), 2);

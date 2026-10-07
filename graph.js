/* Local task graph. Task content is imported privately, never bundled in releases. */
const TASK_DOMAINS={work:{label:'محل کار',icon:'▣'},home:{label:'خانه و خانواده',icon:'⌂'},personal:{label:'شخصی',icon:'●'}};
function graphReadiness(t,date=TODAY()){
  const m=t.meta||{},ids=[...new Set([...(m.prerequisiteTaskIds||[]),...(m.prerequisiteTaskId?[m.prerequisiteTaskId]:[])])];
  const pending=ids.filter(id=>{const p=S.tasks.find(x=>x.id===id);return !p||!p.done});
  if(pending.length)return {blocked:true,kind:'prerequisite',reason:'اول باید همه پیش‌نیازها انجام شوند',pending};
  if(m.waiting&& !m.waiting.resolvedAt)return {blocked:true,kind:'waiting',reason:m.waiting.reason||'منتظر رفع مانع یا پاسخ دیگران',pending:[]};
  if(m.notBefore&&m.notBefore>date)return {blocked:true,kind:'date',reason:'موعد این کار هنوز نرسیده',pending:[]};
  return {blocked:false,kind:'ready',reason:'پیش‌نیازهای ثبت‌شده انجام شده‌اند',pending:[]};
}
function domainPreference(t,date=TODAY(),minutes=decisionNowMinutes()){
  const m=t.meta||{},d=taskDomain(t);if(!TASK_DOMAINS[d])return 0;
  const schedule=m.workSchedule||{days:[0,1,2,3,4,5],start:600,end:1080};
  const atWork=schedule.days.includes(wdIndex(date))&&minutes>=schedule.start&&minutes<schedule.end;
  return (d==='work')===atWork?1:-1;
}
function taskDomain(t){return TASK_DOMAINS[t.meta?.domain]?t.meta.domain:t.c===4?'work':t.c===5?'home':'personal'}
function taskDomainLabel(t){return TASK_DOMAINS[taskDomain(t)].label}
function domainChip(t){const d=taskDomain(t),x=TASK_DOMAINS[d];return x?`<span class="chip domain-${d}">${x.icon} ${x.label}</span>`:''}
function graphTaskStatus(t){if(t.done)return 'انجام‌شده';const r=graphReadiness(t);return r.blocked?r.reason:'قابل انجام'}
function validateTaskGraph(data){
  if(data?.format!=='karnama.task-graph'||!Array.isArray(data.tasks)||data.tasks.length>2000)throw new Error('فایل ورود گراف معتبر نیست');
  if(typeof data.source!=='string'||!data.source)throw new Error('منبع گراف مشخص نیست');
  if(data.workSchedule){const s=data.workSchedule;if(!Array.isArray(s.days)||s.days.some(d=>!Number.isInteger(d)||d<0||d>6)||!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<0||s.end>1440||s.start>=s.end)throw new Error('بازه کاری فایل معتبر نیست');}
  const map=new Map();
  for(const t of data.tasks){if(typeof t.sourceId!=='string'||!t.sourceId||map.has(t.sourceId)||typeof t.title!=='string'||!t.title.trim()||!Object.hasOwn(TASK_DOMAINS,t.domain)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||Number.isNaN(fromIso(t.date).getTime())||iso(fromIso(t.date))!==t.date||!Array.isArray(t.prerequisiteSourceIds)||!['ready','waiting','future'].includes(t.state)||t.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time)||t.waitingReason&&typeof t.waitingReason!=='string')throw new Error('یک کار یا تاریخ در فایل معتبر نیست');map.set(t.sourceId,t)}
  const visited=new Set(),visiting=new Set();
  function visit(id){if(visiting.has(id))throw new Error('گراف وابستگی حلقه دارد');if(visited.has(id))return;const t=map.get(id);if(!t)throw new Error('پیش‌نیاز مفقود است');visiting.add(id);t.prerequisiteSourceIds.forEach(visit);visiting.delete(id);visited.add(id)}
  map.forEach(t=>visit(t.sourceId));return true;
}
function importTaskGraph(data){
  validateTaskGraph(data);
  const original=S.tasks,copy=JSON.parse(JSON.stringify(original)),mapping=new Map(),added=[],updates=[];
  let next=Math.max(Date.now(),...copy.map(t=>+t.id||0));
  for(const record of data.tasks){
    const sourceIds=[record.sourceId];
    let t=copy.find(t=>t.meta?.graphSource===data.source&&(t.meta.graphNodeIds||[]).includes(record.sourceId));
    if(!t){const matches=copy.filter(t=>!t.meta?.graphSource&&!t.rep&&(norm(t.title)===norm(record.title.split('\n')[0])||norm(t.note)===norm(record.title)||norm(t.title)===norm(titleFrom(record.title))));if(matches.length===1)t=matches[0]}
    if(!t){const parsed=classify(record.title);t={id:++next,title:record.title.split('\n')[0],note:record.title,c:parsed.c,p:1,s:record.domain==='work'?1:2,date:record.date,time:record.time||null,done:false,rep:null,meta:parsed.meta||{}};t.meta.context=extractTaskContext(record.title,{date:record.date});copy.push(t);added.push(t.id)}
    else updates.push(t.id);
    const m=t.meta||(t.meta={});
    // Reimport preserves completion, waiting confirmations and user scheduling edits.
    const existing=m.graphSource===data.source;
    m.domain=record.domain;m.graphSource=data.source;m.graphNodeIds=[...new Set([...(m.graphNodeIds||[]),...sourceIds])];
    m.workSchedule=data.workSchedule||{days:[0,1,2,3,4,5],start:600,end:1080};
    if(!existing){m.notBefore=record.date;m.graphState=record.state;if(record.waitingReason)m.waiting={reason:record.waitingReason,resolvedAt:null};}
    mapping.set(record.sourceId,t);
  }
  for(const record of data.tasks){const t=mapping.get(record.sourceId),ids=record.prerequisiteSourceIds.map(x=>mapping.get(x).id).filter(x=>x!==t.id);t.meta.prerequisiteTaskIds=[...new Set([...(t.meta.prerequisiteTaskIds||[]),...ids])];}
  // Commit storage before in-memory state: failed writes must not leave a partial import.
  localStorage.setItem(KEY,JSON.stringify({tasks:copy}));S.tasks=copy;
  return {added:added.length,matched:updates.length,total:data.tasks.length};
}
function resolveGraphWait(id){const t=byId(id);if(!t?.meta?.waiting)return;t.meta.waiting.resolvedAt=new Date().toISOString();save();render();toast('مانع رفع شد؛ وابستگی‌ها و موعد همچنان بررسی می‌شوند.',3000)}
function graphView(){
  const tasks=S.tasks.filter(t=>t.meta?.domain&&!t.done);
  return '<h2 class="graph-title">مسیر کارها</h2><p class="graph-note">رفع انتظار فقط پاسخ یا مانع را تأیید می‌کند؛ به معنی انجام‌شدن خود کار نیست.</p><button class="graph-import" data-act="graphImport">ورود فایل گراف (افزودن به کارهای فعلی)</button>'+Object.entries(TASK_DOMAINS).map(([d,info])=>`<section class="graph-group"><h3>${info.icon} ${info.label}</h3>${tasks.filter(t=>t.meta.domain===d).map(t=>{const r=graphReadiness(t),wait=t.meta.waiting;return `<article class="graph-card"><button class="graph-task-title" data-act="edit" data-id="${t.id}">${esc(t.title)}</button><div class="chips">${domainChip(t)}<span class="chip c-nu">${fa(WD[wdIndex(t.date)]+' '+jdate(t.date))}</span></div><p>${esc(graphTaskStatus(t))}</p>${r.pending.length?'<ul>'+r.pending.map(id=>'<li>'+esc(byId(id)?.title||'پیش‌نیاز حذف‌شده؛ باید بازیابی یا اصلاح شود')+'</li>').join('')+'</ul>':''}${wait&&!wait.resolvedAt?`<p>${esc(wait.reason)}</p><button class="graph-resolve" data-act="graphResolve" data-id="${t.id}">پاسخ رسید / مانع رفع شد</button>`:''}</article>`}).join('')||'<p class="graph-note">کاری در این گروه نیست.</p>'}</section>`).join('');
}

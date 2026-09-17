/* ===== موتور مستقل «الان چیکار کنم؟» ===== */
const DECISION_KEY='karnama.decision.v1';
let DECISION=(()=>{
  try{
    const x=JSON.parse(localStorage.getItem(DECISION_KEY));
    if(x&&typeof x==='object')return {feedback:Array.isArray(x.feedback)?x.feedback:[],history:Array.isArray(x.history)?x.history:[],context:x.context&&typeof x.context==='object'?x.context:{}};
  }catch(e){}
  return {feedback:[],history:[],context:{}};
})();
const saveDecision=()=>{try{localStorage.setItem(DECISION_KEY,JSON.stringify(DECISION))}catch(e){}};
const decisionNowMinutes=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const decisionKey=t=>`${t.id}@${t.key||t.date||''}`;
const decisionMeta=t=>t.meta&&typeof t.meta==='object'?t.meta:{};
const taskContext=t=>{const x=decisionMeta(t).context;return x&&typeof x==='object'?x:null};
const decisionText=t=>norm(`${t.title||''} ${t.note||''}`);
const FEASIBLE_NOW={YES:'available',NO:'blocked',UNKNOWN:'unknown'};

/*
  لایه مستقل «قابل انجام الآن»؛ هیچ امتیاز اولویتی نمی‌دهد و چیزی درباره
  ساعت کاری واقعی، پیامد یا عادت کاربر حدس نمی‌زند.
*/
function assessNowFeasibility(t,{date=TODAY(),nowMin=decisionNowMinutes()}={}){
  const text=decisionText(t),hour=nowMin/60,unusualNight=hour<7||hour>=22;
  const result=(status,reason,source,confidence)=>({status,reason,source,confidence,date,nowMin});
  const explicit=t.time?tmin(t):null;

  /* داده صریح کاربر همیشه بر قاعده عمومی شب مقدم است. */
  if(explicit!==null){
    if(t.date>date)return result(FEASIBLE_NOW.NO,'روز ثبت‌شده این کار هنوز نرسیده است','explicit-date',1);
    if(t.date===date&&explicit>nowMin+5)return result(FEASIBLE_NOW.NO,'زمانی که کاربر ثبت کرده هنوز نرسیده است','explicit-time',1);
    return result(FEASIBLE_NOW.YES,'زمان ثبت‌شده کار رسیده است','explicit-time',1);
  }

  const remembered=userMemorySignal(t,nowMin);
  if(remembered&&remembered.hard)return result(FEASIBLE_NOW.NO,`طبق چیزی که گفته‌ای: ${remembered.reason}`,'user-memory-explicit',remembered.memory.confidence);
  const context=taskContext(t);
  if(context&&context.timeConstraint&&typeof context.timeConstraint.value==='string'){
    const value=norm(context.timeConstraint.value),cutoff=/تا\s*ظهر/.test(value)?12*60:/تا\s*عصر/.test(value)?18*60:/تا\s*شب/.test(value)?22*60:null;
    if(cutoff!==null&&nowMin>cutoff)return result(FEASIBLE_NOW.NO,'بازه زمانی صریحی که کاربر گفته گذشته است','explicit-time-constraint',1);
  }
  if(context&&context.prerequisite&&context.prerequisite.value)return result(FEASIBLE_NOW.UNKNOWN,'این کار پیش‌نیازی دارد که انجام‌شدنش هنوز مشخص نیست','explicit-prerequisite',.65);

  const external=/آتلیه|فروشگاه|مغازه|اداره|بانک|دفتر|مطب|پست|داروخانه|خرید حضوری|تحویل\s*(?:بگیر|بگیرم)|مراجعه/.test(text)||[3,7].includes(t.c);
  const otherPerson=/تماس|زنگ\s*(?:بزن|بزنم)|صحبت\s+با|جلسه|قرار|ملاقات|از\s+.+\s+بپرس|به\s+.+\s+پیام/.test(text)||t.c===0;
  const independent=/مطالعه|کتاب|بنویس|بنویسم|نوشتن|گزارش|طراحی|مرتب|دسته.?بندی|برنامه.?ریزی|یادداشت|تمرین|آموزش|نظافت|خانه|خونه/.test(text)||[1,4,5,9,11].includes(t.c);

  if(unusualNight&&external)return result(FEASIBLE_NOW.NO,'کار به حضور در یک مکان وابسته است و در این ساعت امکان انجامش روشن نیست','night-external',.9);
  if(unusualNight&&otherPerson)return result(FEASIBLE_NOW.NO,'کار به حضور یا پاسخ شخص دیگری وابسته است و در این ساعت امکان انجامش روشن نیست','night-person',.9);
  if(independent)return result(FEASIBLE_NOW.YES,'کار مستقل است و محدودیت زمانی آشکاری در متن ندارد','independent',.8);
  if(external||otherPerson)return result(FEASIBLE_NOW.UNKNOWN,'وابستگی بیرونی دارد، اما ساعت کاری یا دسترسی واقعی مشخص نیست','external-unknown',.5);
  return result(FEASIBLE_NOW.UNKNOWN,'اطلاعات کافی برای تشخیص قطعی امکان انجام وجود ندارد','insufficient-data',.3);
}

const decisionFingerprint=t=>JSON.stringify([t.title||'',t.note||'',t.date||'',t.time||'',t.s,t.p,t.c,taskContext(t)||null]);
function recentDecisionRejections(date=TODAY()){
  const map=new Map();DECISION.feedback.forEach(x=>{if(x&&x.date===date&&x.kind==='reject'&&x.taskKey)map.set(x.taskKey,x.fingerprint||null)});return map;
}

function decisionCandidates(tasks,date=TODAY(),nowMin=decisionNowMinutes()){
  const rejected=recentDecisionRejections(date),byKey=new Map();
  const add=t=>{
    const k=decisionKey(t),rejectedFingerprint=rejected.get(k);
    if(!t||t.done||(rejected.has(k)&&(!rejectedFingerprint||rejectedFingerprint===decisionFingerprint(t))))return;
    if(!byKey.has(k))byKey.set(k,t);
  };
  /* نوبت‌های معتبر امروز، از جمله تکرارهای چندساعته؛ مستقل از وضعیت نمای فعلی اپ */
  (tasks||[]).forEach(t=>{
    if(!occursOn(t,date))return;
    if(t.rep===REP_H){
      const times=doseTimes(t,date);
      times.forEach((v,i)=>{const k=date+'@'+v;add(Object.assign({},t,{date,time:v,s:slotOfTime(v),key:k,done:isDone(t,k),doseN:i+1,doseAll:times.length}))});
    }else add(Object.assign({},t,{date,key:date,done:isDone(t,date)}));
  });
  /* کارهای عقب‌افتاده غیرتکراری */
  tasks.filter(t=>!t.rep&&!t.done&&t.date<date).forEach(t=>add(Object.assign({},t,{key:t.date})));
  /* کار مهم فردا فقط وقتی ساعت ثابت ندارد؛ برای دلیل «ددلاینش فرداست» */
  const tomorrow=addDays(date,1);
  tasks.filter(t=>!t.rep&&!t.done&&t.date===tomorrow&&!t.time&&(t.p===0||/ددلاین|فوری|حتماً|حتما/.test(t.note||'')))
    .forEach(t=>add(Object.assign({},t,{key:t.date})));
  return [...byKey.values()];
}

function contextPrioritySignals(t,date=TODAY()){
  const urgency=decisionUrgency(t,date,decisionNowMinutes()),impact=decisionImpact(t);
  return {score:urgency.weight+impact.weight,reasons:[...urgency.signals,...impact.signals]};
}

function decisionUrgency(t,date,nowMin){
  const context=taskContext(t)||{},signals=[];let level=0,weight=0;
  if(context.deadline&&context.deadline.value){const d=diffDays(context.deadline.value,date);
    if(d<0){level=5;weight+=100;signals.push({w:100,text:'مهلت ثبت‌شده‌اش گذشته است',source:'deadline'})}
    else if(d===0){level=5;weight+=96;signals.push({w:96,text:'امروز مهلت دارد',source:'deadline'})}
    else if(d===1){level=4;weight+=90;signals.push({w:90,text:'تا فردا مهلت دارد',source:'deadline'})}
    else if(d<=3){level=3;weight+=76;signals.push({w:76,text:`تا ${fa(jdate(context.deadline.value))} مهلت دارد`,source:'deadline'})}
    else {level=Math.max(level,1);weight+=35;signals.push({w:35,text:`تا ${fa(jdate(context.deadline.value))} مهلت دارد`,source:'deadline'})}}
  const late=diffDays(date,t.date);if(late>0){level=Math.max(level,3);weight+=55+Math.min(20,late*4);signals.push({w:72,text:`${fa(late)} روز عقب افتاده`,source:'scheduled-late'})}
  if(t.time&&t.date<=date){const m=tmin(t);if(m!==null&&m<=nowMin+5){level=Math.max(level,4);weight+=82;signals.push({w:98,text:nowMin>=m?'زمان انجامش رسیده':'زمانش خیلی نزدیک است',source:'explicit-time'})}}
  if(context.delayConsequence&&context.delayConsequence.value){level=Math.max(level,4);weight+=68;signals.push({w:92,text:`تأخیر می‌تواند باعث «${context.delayConsequence.value}» شود`,source:'delay-consequence'})}
  if(context.commitment&&context.commitment.value){level=Math.max(level,2);weight+=42;signals.push({w:80,text:`تعهد ثبت‌شده: ${context.commitment.value}`,source:'commitment'})}
  return {level,weight,signals};
}

function decisionImpact(t){
  const context=taskContext(t)||{},signals=[];let level=0,weight=0;
  if(context.dependency&&context.dependency.value){level=Math.max(level,4);weight+=70;signals.push({w:91,text:context.dependency.value,source:'dependency'})}
  if(context.delayConsequence&&context.delayConsequence.value){level=Math.max(level,4);weight+=64;signals.push({w:90,text:`از پیامد «${context.delayConsequence.value}» جلوگیری می‌کند`,source:'consequence'})}
  if(context.opportunity&&context.opportunity.value){level=Math.max(level,3);weight+=52;signals.push({w:86,text:`فرصت مرتبط را حفظ می‌کند: ${context.opportunity.value}`,source:'opportunity'})}
  return {level,weight,signals};
}

function humanDecisionReason(trace){
  const real=[...trace.urgency.signals,...trace.impact.signals].sort((a,b)=>b.w-a.w),personal=trace.personal.signals||[],manual=trace.manual.signals||[];
  const picked=[];for(const x of real){if(!picked.some(y=>y.source===x.source)){picked.push(x);if(picked.length===2)break}}
  if(picked.length<2&&manual.length)picked.push(manual[0]);
  if(!picked.length&&personal.length&&trace.personal.score>0)picked.push(personal[0]);
  if(!picked.length&&trace.feasibility.status===FEASIBLE_NOW.YES)picked.push({text:'الآن قابل انجام است',source:'feasibility'});
  return picked.slice(0,2).map(x=>x.text).join(' و ')||'اطلاعات کافی برای یک دلیل قوی ندارم';
}

function buildDecisionTrace(t,date=TODAY(),nowMin=decisionNowMinutes()){
  const feasibility=assessNowFeasibility(t,{date,nowMin}),urgency=decisionUrgency(t,date,nowMin),impact=decisionImpact(t),remembered=userMemorySignal(t,nowMin),behavior=behaviorSignalForTask(t,nowMin),personalSignals=[];
  let personalScore=behavior.score;if(remembered&&!remembered.hard){personalScore+=remembered.score;personalSignals.push({w:60,text:remembered.reason,source:'memory'})}personalSignals.push(...behavior.reasons.map(x=>Object.assign({source:'behavior'},x)));personalScore=Math.max(-12,Math.min(12,personalScore));
  const meta=decisionMeta(t),manualSignals=[];let manualLevel=0;if(t.p===0){manualLevel=2;manualSignals.push({w:50,text:'اولویت دستی بالایی دارد',source:'manual'})}else if(t.p===1)manualLevel=1;
  if(meta.importance==='high'||meta.urgency==='high'){manualLevel=Math.max(2,manualLevel);manualSignals.push({w:52,text:meta.urgencyReason||meta.importanceReason||'به‌صورت دستی مهم ثبت شده',source:'manual-meta'})}
  if(meta.explicitPriority&&meta.explicitPriority.level==='high'){manualLevel=4;manualSignals.unshift({w:88,text:'خودت در گفت‌وگو گفتی این کار اولویت بالاتری دارد',source:'explicit-priority'})}
  if(meta.explicitPriority&&meta.explicitPriority.level==='low')manualLevel=0;
  const trace={taskKey:decisionKey(t),feasibility,urgency,impact,personal:{score:personalScore,signals:personalSignals},manual:{level:manualLevel,signals:manualSignals},dataQuality:'insufficient',result:null};
  const realEvidence=urgency.signals.length+impact.signals.length;trace.dataQuality=feasibility.status===FEASIBLE_NOW.UNKNOWN?'insufficient':realEvidence>=2?'high':realEvidence||manualSignals.length?'medium':'insufficient';
  trace.result=feasibility.status===FEASIBLE_NOW.NO?'کنار گذاشته شد':urgency.level>=4||impact.level>=4?'کاندیدای بسیار مناسب':urgency.level>=2||impact.level>=2?'کاندیدای مناسب':'کاندیدای قابل بررسی';return trace;
}

function evaluateDecisionTask(t,date=TODAY(),nowMin=decisionNowMinutes()){
  const trace=buildDecisionTrace(t,date,nowMin),late=diffDays(date,t.date),meta=decisionMeta(t);
  const duration=Number.isFinite(+meta.durationMin)&&+meta.durationMin>0?+meta.durationMin:null;
  const score=trace.urgency.weight+trace.impact.weight+trace.personal.score+trace.manual.level*8+(late>0?Math.min(12,late*2):0);
  let reason=humanDecisionReason(trace);if(!trace.urgency.signals.length&&!trace.impact.signals.length&&late>0&&t.p===0)reason=`${fa(late)} روز عقب افتاده و اولویت دستی بالایی دارد`;
  return {task:t,score,reason,duration,trace};
}

function partitionDecisionCandidates(tasks,date=TODAY(),nowMin=decisionNowMinutes()){
  const groups={available:[],unknown:[],blocked:[]};
  decisionCandidates(tasks,date,nowMin).forEach(task=>{
    const feasibility=assessNowFeasibility(task,{date,nowMin});
    groups[feasibility.status].push({task,feasibility});
  });
  return groups;
}

function chooseNextTask(tasks,date=TODAY(),nowMin=decisionNowMinutes()){
  const groups=partitionDecisionCandidates(tasks,date,nowMin);
  const pool=groups.available.length?groups.available:groups.unknown;
  const ranked=pool.map(x=>Object.assign(evaluateDecisionTask(x.task,date,nowMin),{feasibility:x.feasibility}))
    .sort((a,b)=>b.trace.urgency.level-a.trace.urgency.level||b.trace.impact.level-a.trace.impact.level||Number(!!decisionMeta(b.task).explicitPriority)-Number(!!decisionMeta(a.task).explicitPriority)||b.trace.urgency.weight-a.trace.urgency.weight||b.trace.impact.weight-a.trace.impact.weight||b.trace.manual.level-a.trace.manual.level||b.trace.personal.score-a.trace.personal.score||((a.duration||Infinity)-(b.duration||Infinity))||(a.task.id-b.task.id));
  const spoken=ranked.filter(x=>{const p=decisionMeta(x.task).explicitPriority;return p&&p.level==='high'}).sort((a,b)=>String(decisionMeta(b.task).explicitPriority.at||'').localeCompare(String(decisionMeta(a.task).explicitPriority.at||'')))[0];
  if(spoken&&ranked[0]!==spoken&&ranked[0].trace.urgency.level<5&&ranked[0].trace.impact.level<4){ranked.splice(ranked.indexOf(spoken),1);ranked.unshift(spoken)}
  const top=ranked[0];if(!top)return null;const runner=ranked[1];let confidence='medium';
  if(top.feasibility.status===FEASIBLE_NOW.UNKNOWN||top.trace.dataQuality==='insufficient')confidence='insufficient';
  else if(!runner||top.trace.urgency.level>=runner.trace.urgency.level+2||top.trace.impact.level>=runner.trace.impact.level+2)confidence='high';
  else if(top.trace.urgency.level===runner.trace.urgency.level&&top.trace.impact.level===runner.trace.impact.level&&Math.abs(top.score-runner.score)<8)confidence='insufficient';
  top.confidence=confidence;top.trace.confidence=confidence;
  if(confidence==='insufficient')top.reason=top.reason==='الآن قابل انجام است'?'با اطلاعات فعلی، این گزینه کمی مناسب‌تر به‌نظر می‌رسد':`با اطلاعات فعلی، ${top.reason}`;
  const blocked=groups.blocked.map(x=>Object.assign(evaluateDecisionTask(x.task,date,nowMin),{feasibility:x.feasibility})).filter(x=>x.trace.urgency.level>=4||x.trace.impact.level>=4).sort((a,b)=>b.trace.urgency.level-a.trace.urgency.level||b.trace.impact.level-a.trace.impact.level)[0];
  if(blocked)top.secondaryWarning={task:blocked.task,reason:blocked.feasibility.reason};
  return top;
}

function recordDecisionEvent(kind,t,detail){
  if(!t)return;
  const e={at:new Date().toISOString(),date:TODAY(),kind,taskId:t.id,taskKey:decisionKey(t),fingerprint:decisionFingerprint(t),category:t.c,taskText:`${t.title||''} ${t.note||''}`.trim(),detail:detail||null};
  if(kind==='reject')DECISION.feedback.push(e);else DECISION.history.push(e);
  if(DECISION.feedback.length>500)DECISION.feedback=DECISION.feedback.slice(-500);
  if(DECISION.history.length>500)DECISION.history=DECISION.history.slice(-500);
  saveDecision();
  observeUserMemoryEvent(kind,t,detail||{});
  recordDecisionBehavior(kind,t,detail||{});
}

function restoreDecision(data){
  if(!data||typeof data!=='object')return;
  DECISION={feedback:Array.isArray(data.feedback)?data.feedback:[],history:Array.isArray(data.history)?data.history:[],context:data.context&&typeof data.context==='object'?data.context:{}};
  saveDecision();
}

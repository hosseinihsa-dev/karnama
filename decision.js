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

  const external=/آتلیه|فروشگاه|مغازه|اداره|بانک|دفتر|مطب|پست|داروخانه|خرید حضوری|تحویل\s*(?:بگیر|بگیرم)|مراجعه/.test(text)||[3,7].includes(t.c);
  const otherPerson=/تماس|زنگ\s*(?:بزن|بزنم)|صحبت\s+با|جلسه|قرار|ملاقات|از\s+.+\s+بپرس|به\s+.+\s+پیام/.test(text)||t.c===0;
  const independent=/مطالعه|کتاب|بنویس|بنویسم|نوشتن|گزارش|طراحی|مرتب|دسته.?بندی|برنامه.?ریزی|یادداشت|تمرین|آموزش|نظافت|خانه|خونه/.test(text)||[1,4,5,9,11].includes(t.c);

  if(unusualNight&&external)return result(FEASIBLE_NOW.NO,'کار به حضور در یک مکان وابسته است و در این ساعت امکان انجامش روشن نیست','night-external',.9);
  if(unusualNight&&otherPerson)return result(FEASIBLE_NOW.NO,'کار به حضور یا پاسخ شخص دیگری وابسته است و در این ساعت امکان انجامش روشن نیست','night-person',.9);
  if(independent)return result(FEASIBLE_NOW.YES,'کار مستقل است و محدودیت زمانی آشکاری در متن ندارد','independent',.8);
  if(external||otherPerson)return result(FEASIBLE_NOW.UNKNOWN,'وابستگی بیرونی دارد، اما ساعت کاری یا دسترسی واقعی مشخص نیست','external-unknown',.5);
  return result(FEASIBLE_NOW.UNKNOWN,'اطلاعات کافی برای تشخیص قطعی امکان انجام وجود ندارد','insufficient-data',.3);
}

function recentDecisionRejections(date=TODAY()){
  const set=new Set();
  DECISION.feedback.forEach(x=>{if(x&&x.date===date&&x.kind==='reject'&&x.taskKey)set.add(x.taskKey)});
  return set;
}

function decisionCandidates(tasks,date=TODAY(),nowMin=decisionNowMinutes()){
  const rejected=recentDecisionRejections(date),byKey=new Map();
  const add=t=>{
    if(!t||t.done||rejected.has(decisionKey(t)))return;
    const k=decisionKey(t);if(!byKey.has(k))byKey.set(k,t);
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
  const c=taskContext(t);if(!c)return {score:0,reasons:[]};
  let score=0;const reasons=[];
  if(c.deadline&&c.deadline.value){
    const d=diffDays(c.deadline.value,date);
    if(d<0){score+=34;reasons.push({w:98,text:'مهلت ثبت‌شده‌اش گذشته است'})}
    else if(d===0){score+=32;reasons.push({w:96,text:'امروز مهلت دارد'})}
    else if(d===1){score+=27;reasons.push({w:94,text:'تا فردا مهلت دارد'})}
    else if(d<=3){score+=20;reasons.push({w:90,text:`تا ${fa(jdate(c.deadline.value))} مهلت دارد`})}
    else {score+=8;reasons.push({w:60,text:`تا ${fa(jdate(c.deadline.value))} مهلت دارد`})}
  }
  if(c.delayConsequence&&c.delayConsequence.value){score+=24;reasons.push({w:92,text:`تأخیر می‌تواند باعث «${c.delayConsequence.value}» شود`})}
  if(c.dependency&&c.dependency.value){score+=19;reasons.push({w:91,text:c.dependency.value})}
  if(c.opportunity&&c.opportunity.value){score+=17;reasons.push({w:88,text:`فرصت مرتبط در خطر است: ${c.opportunity.value}`})}
  if(c.commitment&&c.commitment.value){score+=14;reasons.push({w:82,text:`تعهد به دیگری در متن آمده: ${c.commitment.value}`})}
  if(c.importance&&c.importance.value&&!decisionMeta(t).importance&&!decisionMeta(t).urgency){score+=10;reasons.push({w:70,text:'اهمیت آن صریحاً در متن ثبت شده است'})}
  return {score,reasons};
}

function evaluateDecisionTask(t,date=TODAY(),nowMin=decisionNowMinutes()){
  let score=0;const reasons=[];const late=diffDays(date,t.date),meta=decisionMeta(t);
  const duration=Number.isFinite(+meta.durationMin)&&+meta.durationMin>0?+meta.durationMin:null;
  if(late>0){score+=50+Math.min(30,late*6);reasons.push({w:90,text:`${fa(late)} روز عقب افتاده`})}
  else if(t.date===date){score+=26;reasons.push({w:35,text:'برای امروز برنامه‌ریزی شده'})}
  else if(t.date===addDays(date,1)){score+=12;reasons.push({w:55,text:'ددلاینش فرداست'})}
  if(t.p===0){score+=32;reasons.push({w:75,text:'اولویت بالایی دارد'})}
  else if(t.p===1)score+=14;
  if(t.time&&t.date<=date){const m=tmin(t);if(m!==null&&m<=nowMin+5){const passed=nowMin-m;score+=passed>=0?34:18;reasons.push({w:100,text:passed>=0?'زمان انجامش رسیده':'زمانش خیلی نزدیک است'})}}
  if(t.rep){score+=8;reasons.push({w:40,text:t.doseAll>1?'نوبت فعلی یک کار تکرارشونده است':'کار تکرارشونده امروز است'})}
  if((t.moved||0)>1){score+=Math.min(14,(t.moved||0)*3);reasons.push({w:58,text:'چند بار جابه‌جا شده'})}
  if(meta.importance==='high'){score+=14;reasons.push({w:72,text:meta.importanceReason||'قبلاً مهم ثبت شده'})}
  if(meta.urgency==='high'){score+=12;reasons.push({w:78,text:meta.urgencyReason||'فوریت آن در توضیح کار مشخص است'})}
  if(duration&&duration<=30){score+=5;reasons.push({w:20,text:`${fa(duration)} دقیقه زمان ثبت شده`})}
  const context=contextPrioritySignals(t,date);score+=context.score;reasons.push(...context.reasons);
  const remembered=userMemorySignal(t,nowMin);
  if(remembered&&!remembered.hard){score+=remembered.score;reasons.push({w:remembered.score<0?45:65,text:`با توجه به شناخت قبلی: ${remembered.reason}`})}
  reasons.sort((a,b)=>b.w-a.w);
  const real=context.reasons.sort((a,b)=>b.w-a.w).slice(0,2);
  let reason=real.length?real.map(x=>x.text).join(' و '):(reasons[0]?reasons[0].text:'در میان کارهای باز، مناسب‌ترین گزینه فعلی است');
  if(!real.length&&late>0&&t.p===0)reason='این کار عقب افتاده و اولویت بالایی دارد';
  else if(!real.length&&t.date===addDays(date,1))reason='ددلاینش فرداست و هنوز انجام نشده';
  return {task:t,score,reason,duration};
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
  /* نامشخص حذف نمی‌شود؛ فقط وقتی گزینه مطمئن داریم، گزینه مطمئن‌تر مقدم است. */
  const pool=groups.available.length?groups.available:groups.unknown;
  const ranked=pool.map(x=>Object.assign(evaluateDecisionTask(x.task,date,nowMin),{feasibility:x.feasibility}))
    .sort((a,b)=>b.score-a.score||(a.task.p-b.task.p)||(a.duration-b.duration)||(a.task.id-b.task.id));
  return ranked[0]||null;
}

function recordDecisionEvent(kind,t,detail){
  if(!t)return;
  const e={at:new Date().toISOString(),date:TODAY(),kind,taskId:t.id,taskKey:decisionKey(t),category:t.c,taskText:`${t.title||''} ${t.note||''}`.trim(),detail:detail||null};
  if(kind==='reject')DECISION.feedback.push(e);else DECISION.history.push(e);
  if(DECISION.feedback.length>500)DECISION.feedback=DECISION.feedback.slice(-500);
  if(DECISION.history.length>500)DECISION.history=DECISION.history.slice(-500);
  saveDecision();
  observeUserMemoryEvent(kind,t,detail||{});
}

function restoreDecision(data){
  if(!data||typeof data!=='object')return;
  DECISION={feedback:Array.isArray(data.feedback)?data.feedback:[],history:Array.isArray(data.history)?data.history:[],context:data.context&&typeof data.context==='object'?data.context:{}};
  saveDecision();
}

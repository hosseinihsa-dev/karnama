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
const decisionText=t=>norm(`${t.title||''} ${t.note||''}`);
const decisionWords=t=>new Set(lwords(decisionText(t)));

function feedbackDetail(x){
  if(!x)return {code:'',text:''};
  if(typeof x.detail==='string')return {code:x.detail,text:''};
  return {code:x.detail&&x.detail.code||'',text:x.detail&&x.detail.text||''};
}

function relatedDecisionFeedback(t){
  const words=decisionWords(t),now=Date.now(),maxAge=90*864e5;
  return DECISION.feedback.filter(x=>{
    if(!x||!x.at||now-new Date(x.at).getTime()>maxAge)return false;
    if(x.taskId===t.id)return true;
    if(x.category!==undefined&&x.category!==t.c)return false;
    const other=new Set(lwords(x.taskText||''));let common=0;
    words.forEach(w=>{if(other.has(w))common++});
    return common>=2;
  });
}

function decisionFeasibility(t,nowMin=decisionNowMinutes()){
  const text=decisionText(t),hour=nowMin/60,night=hour<7||hour>=22,closedHours=hour<8||hour>=20;
  const external=/آتلیه|فروشگاه|مغازه|اداره|بانک|دفتر|تحویل بگیر|مراجعه|پست|داروخانه|خرید حضوری/.test(text)||[3,7].includes(t.c);
  const person=/تماس|زنگ بزن|صحبت با|جلسه|قرار|ملاقات|از .+ بپرس|به .+ پیام/.test(text)||t.c===0;
  const independent=/مطالعه|کتاب|بنویس|نوشتن|گزارش|برنامه.?ریزی|مرتب|یادداشت|تمرین|آموزش/.test(text)||[1,4,9,11].includes(t.c);
  if(night&&(external||person))return {possible:false,penalty:160,reason:external?'به محل یا ساعت کاری وابسته است و الآن زمان مطمئنی برایش نیست':'به شخص دیگری وابسته است و این ساعت برای تماس مناسب نیست'};
  if(closedHours&&external&&!independent)return {possible:false,penalty:120,reason:'به محل یا ساعت کاری وابسته است و الآن احتمال انجامش پایین است'};
  const feedback=relatedDecisionFeedback(t).slice(-5);let penalty=0,reason='';
  feedback.forEach(x=>{const d=feedbackDetail(x),z=norm(d.text);
    if(/بسته|باز نیست|ساعت کاری/.test(z)){penalty+=35;reason='قبلاً گفته‌ای این نوع کار ممکن است به ساعت کاری وابسته باشد'}
    if(/باید اول|اول باید|وابسته/.test(z)){penalty+=30;reason='قبلاً گفته‌ای انجامش به کار یا شخص دیگری وابسته است'}
    if(/تا فردا|فردا فایده|الان فایده/.test(z)){penalty+=22;reason='قبلاً گفته‌ای انجامش در این زمان فایده‌ای ندارد'}
    if(d.code==='no-energy'&&!independent)penalty+=4;
  });
  return {possible:true,penalty,reason};
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
    if(t.time){
      const m=tmin(t);
      /* کار ساعت‌دارِ آینده، هنوز کارِ قابل انجام همین لحظه نیست. */
      if(t.date===date&&m!==null&&m>nowMin+5)return;
      if(t.date>date)return;
    }
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

function evaluateDecisionTask(t,date=TODAY(),nowMin=decisionNowMinutes()){
  let score=0;const reasons=[];const late=diffDays(date,t.date),meta=decisionMeta(t);
  const duration=Number.isFinite(+meta.durationMin)&&+meta.durationMin>0?+meta.durationMin:null;
  const text=decisionText(t),feasible=decisionFeasibility(t,nowMin);
  score-=feasible.penalty||0;
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
  if(/اگر|وگرنه|جریمه|لغو|از دست|فرصت|منقضی/.test(text)){score+=18;reasons.push({w:84,text:'متن کار پیامد یا فرصت ازدست‌رفتنی را نشان می‌دهد'})}
  if(/قبل از|بعدش|وابسته|تا بتوانم|تا بتونم|اول .* بعد/.test(text)){score+=13;reasons.push({w:82,text:'انجام کار دیگری به آن وابسته است'})}
  if(/برای|به|با/.test(text)&&/آقا|خانم|دکتر|استاد|مشتری|همکار|مدیر|دوست|مرتضی|رضایی/.test(text)){score+=10;reasons.push({w:68,text:'به شخص دیگری تعهد داده شده'})}
  if(duration&&duration<=30){score+=5;reasons.push({w:20,text:`${fa(duration)} دقیقه زمان ثبت شده`})}
  if(feasible.reason)reasons.push({w:feasible.possible?76:110,text:feasible.reason});
  reasons.sort((a,b)=>b.w-a.w);
  let reason=reasons[0]?reasons[0].text:'در میان کارهای باز، مناسب‌ترین گزینه فعلی است';
  if(late>0&&t.p===0)reason='این کار عقب افتاده و اولویت بالایی دارد';
  else if(t.date===addDays(date,1))reason='ددلاینش فرداست و هنوز انجام نشده';
  return {task:t,score,reason,duration,possible:feasible.possible};
}

function chooseNextTask(tasks,date=TODAY(),nowMin=decisionNowMinutes()){
  const ranked=decisionCandidates(tasks,date,nowMin).map(t=>evaluateDecisionTask(t,date,nowMin)).filter(x=>x.possible)
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
}

function restoreDecision(data){
  if(!data||typeof data!=='object')return;
  DECISION={feedback:Array.isArray(data.feedback)?data.feedback:[],history:Array.isArray(data.history)?data.history:[],context:data.context&&typeof data.context==='object'?data.context:{}};
  saveDecision();
}

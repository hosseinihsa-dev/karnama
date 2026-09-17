/* ===== لایه مستقل «ابهام مهم»؛ حداکثر یک سؤال اختیاری برای هر ثبت ===== */
const CLARIFY_FIELDS=['deadline','delayConsequence','opportunity','commitment','dependency','prerequisite','importance','timeConstraint'];
const taskClarification=t=>t&&t.clarification&&typeof t.clarification==='object'?t.clarification:{version:1,history:[]};
const askedClarification=(t,type)=>taskClarification(t).history.some(x=>x&&x.type===type);
const hasContextFact=(c,k)=>!!(c&&c[k]&&c[k].value!==undefined&&c[k].value!==null);

function detectImportantAmbiguity(t){
  if(!t)return null;
  /* محافظه‌کارانه: برای یک کار بیش از یک بار وارد گفت‌وگوی تکمیلی نشو. */
  if(taskClarification(t).history.length)return null;
  const text=norm(`${t.title||''} ${t.note||''}`),context=taskContext(t)||{};
  const workDecision=/پروژه|طرح|سایت|قرارداد|گزارش|تحویل|مشتری|سفارش|ارائه|پیشنهاد/.test(text)||t.c===4;
  const conversation=/صحبت\s+با|تماس\s+با|زنگ\s+(?:بزن|بزنم)|جلسه\s+با|هماهنگ\s+(?:کن|کنم)\s+با/.test(text)||t.c===0;
  const simple=/خرید\s+(?:نان|نون|شیر|میوه)|قبض|قرص|دارو|پیاده.?روی|ورزش|مطالعه\s+کتاب|فیلم|سریال|نظافت/.test(text);
  if(simple)return null;

  if(conversation&&!t.time&&!hasContextFact(context,'timeConstraint')&&!askedClarification(t,'timing'))
    return {type:'timing',question:'این صحبت باید در زمان خاصی انجام بشه؟',placeholder:'مثلاً: فردا ساعت ۱۰، یا هر وقت علی پاسخ داد'};

  if(workDecision&&!hasContextFact(context,'deadline')&&!t.time&&!askedClarification(t,'deadline'))
    return {type:'deadline',question:'برای این کار مهلت مشخصی داری؟',placeholder:'مثلاً: تا فردا، یا نه؛ مهلت مشخصی ندارد'};

  const deadlineSoon=hasContextFact(context,'deadline')&&diffDays(context.deadline.value,TODAY())<=3;
  const noImpact=!hasContextFact(context,'delayConsequence')&&!hasContextFact(context,'dependency')&&!hasContextFact(context,'commitment')&&!hasContextFact(context,'opportunity');
  if(workDecision&&deadlineSoon&&noImpact&&!askedClarification(t,'consequence'))
    return {type:'consequence',question:'اگر این کار عقب بیفته، چه چیزی تحت‌تأثیر قرار می‌گیره؟',placeholder:'مثلاً: تحویل پروژه عقب می‌افتد'};
  return null;
}

function registerClarificationQuestion(t,q){
  if(!t||!q||askedClarification(t,q.type))return null;
  const state=taskClarification(t),entry={id:Date.now(),type:q.type,question:q.question,askedAt:new Date().toISOString(),status:'pending',answer:null};
  state.version=1;state.history=Array.isArray(state.history)?state.history:[];state.history.push(entry);t.clarification=state;
  return entry;
}

function updateContextUnknown(context){
  context.unknown=CLARIFY_FIELDS.filter(k=>!hasContextFact(context,k));return context;
}

function mergeAnsweredContext(base,extra){
  const out=Object.assign({version:1},base||{});
  CLARIFY_FIELDS.forEach(k=>{if(hasContextFact(extra,k)){const f=Object.assign({},extra[k]);f.source=f.source==='inferred'?'inferred-answer':'explicit-answer';out[k]=f}});
  return updateContextUnknown(out);
}

function answerClarification(t,entryId,answer){
  if(!t||!answer||!answer.trim())return false;
  const state=taskClarification(t),entry=state.history.find(x=>x.id===entryId);if(!entry||entry.status!=='pending')return false;
  const text=answer.trim(),parsed=classify(text),base=taskContext(t)||extractTaskContext(t.note||t.title||'',{date:t.date});
  let extra=extractTaskContext(text,{date:parsed.date}),evidence=text;
  if(entry.type==='deadline'&&/امروز|پس\s*فردا|فردا|شنبه|یک[‌ ]?شنبه|دو[‌ ]?شنبه|سه[‌ ]?شنبه|چهار[‌ ]?شنبه|پنج[‌ ]?شنبه|جمعه|آخر\s+(?:هفته|ماه)/.test(text)){
    extra.deadline=contextFact(parsed.date,evidence,'explicit-answer',1);t.date=parsed.date;
  }else if(entry.type==='timing'){
    const hasTiming=/ساعت\s*[\d۰-۹]|[\d۰-۹]{1,2}[:٫][\d۰-۹]{2}|امروز|پس\s*فردا|فردا|صبح|ظهر|عصر|شب/.test(text);
    if(hasTiming){
      extra.timeConstraint=contextFact({date:parsed.date,time:parsed.time||null,slot:parsed.s},evidence,'explicit-answer',1);
      if(parsed.time)t.time=parsed.time;
      if(/امروز|پس\s*فردا|فردا|شنبه|یک[‌ ]?شنبه|دو[‌ ]?شنبه|سه[‌ ]?شنبه|چهار[‌ ]?شنبه|پنج[‌ ]?شنبه|جمعه/.test(text))t.date=parsed.date;
      t.s=parsed.s;
    }
  }else if(entry.type==='consequence')extra.delayConsequence=contextFact(text,evidence,'explicit-answer',1);
  t.meta=t.meta&&typeof t.meta==='object'?t.meta:{};t.meta.context=mergeAnsweredContext(base,extra);
  entry.status='answered';entry.answer=text;entry.answeredAt=new Date().toISOString();return true;
}

function skipClarification(t,entryId){
  if(!t)return false;const state=taskClarification(t),entry=state.history.find(x=>x.id===entryId);if(!entry||entry.status!=='pending')return false;
  entry.status='skipped';entry.answeredAt=new Date().toISOString();t.clarification=state;return true;
}

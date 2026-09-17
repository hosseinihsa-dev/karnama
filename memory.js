/* ===== حافظه شخصی محلی؛ مستقل از Task و بدون وابستگی شبکه ===== */
const USER_MEMORY_KEY='karnama.userMemory.v1';
const emptyUserMemory=()=>({version:1,items:[],evidence:[],updatedAt:null});
let USER_MEMORY=(()=>{try{const x=JSON.parse(localStorage.getItem(USER_MEMORY_KEY));return normalizeUserMemory(x)}catch(e){return emptyUserMemory()}})();

function normalizeUserMemory(x){
  const m=x&&typeof x==='object'?x:emptyUserMemory();
  return {version:1,items:Array.isArray(m.items)?m.items:[],evidence:Array.isArray(m.evidence)?m.evidence:[],updatedAt:m.updatedAt||null};
}
const saveUserMemory=()=>{USER_MEMORY.updatedAt=new Date().toISOString();try{localStorage.setItem(USER_MEMORY_KEY,JSON.stringify(USER_MEMORY))}catch(e){}};
const restoreUserMemory=data=>{USER_MEMORY=normalizeUserMemory(data);saveUserMemory()};
const activeUserMemories=()=>USER_MEMORY.items.filter(x=>x&&x.active!==false);
const memoryId=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const memorySegment=min=>{const h=min/60;return h<7||h>=22?'night':h<12?'morning':h<18?'afternoon':'evening'};
const segmentFa=s=>({night:'شب',morning:'صبح',afternoon:'بعدازظهر',evening:'عصر'}[s]||s);

function memoryActivity(t){
  const text=norm(`${t&&t.title||''} ${t&&t.note||''}`);
  if(/تماس|زنگ\s*(?:بزن|بزنم|به)|صحبت\s+با|پیام\s+(?:بدم|بدهم)/.test(text)||t&&t.c===0)return 'work-call';
  if(/بانک|وام|حساب\s+بانکی|کارت\s+بانکی/.test(text)||t&&t.c===7)return 'bank';
  if(/طراحی|طرح\s+(?:سایت|پوستر|لوگو|رابط)|گرافیک/.test(text))return 'design';
  if(/خرید|فروشگاه|مغازه/.test(text)||t&&t.c===3)return 'shopping';
  return t&&Number.isInteger(t.c)?`category:${t.c}`:'general';
}
const activityFa=a=>a==='work-call'?'تماس‌های کاری':a==='bank'?'کارهای بانکی':a==='design'?'کارهای طراحی':a==='shopping'?'خرید':a.startsWith('category:')?(CATS[+a.split(':')[1]]||{}).name||'این نوع کار':'کارها';
const memorySignature=(domain,activity,segment='any')=>`${domain}|${activity}|${segment}`;
const memoryMatches=(m,t,segment)=>m&&m.active!==false&&m.activity===memoryActivity(t)&&(m.segment==='any'||m.segment===segment);

function addMemoryEvidence(kind,t,detail={},nowMin){
  const segment=memorySegment(nowMin===undefined?decisionClockMinutes():nowMin),activity=memoryActivity(t),text=String(detail.text||'').trim();
  const e={id:memoryId(),at:new Date().toISOString(),kind,activity,segment,taskId:t&&t.id||null,taskText:`${t&&t.title||''} ${t&&t.note||''}`.trim(),code:detail.code||null,text};
  USER_MEMORY.evidence.push(e);if(USER_MEMORY.evidence.length>600)USER_MEMORY.evidence=USER_MEMORY.evidence.slice(-600);return e;
}
function decisionClockMinutes(){const n=new Date();return n.getHours()*60+n.getMinutes()}

function explicitMemoryFromText(text,t){
  const s=norm(text);if(!s)return null;
  if(/شب(?:‌ها|ها)?.*(?:تماس|زنگ|صحبت\s+کاری).*(?:نمی|نمي|انجام\s+نمی)|(?:تماس|زنگ|صحبت\s+کاری).*شب(?:‌ها|ها)?.*(?:نمی|نمي)/.test(s))
    return {domain:'time-restriction',activity:'work-call',segment:'night',rule:'avoid',label:'شب‌ها تماس کاری انجام نمی‌دهم'};
  if(/(?:بانک|کار(?:های|هاي)?\s+بانکی).*(?:فقط|تنها).*(?:روز|صبح|ساعت\s+کاری)/.test(s))
    return {domain:'time-restriction',activity:'bank',segment:'night',rule:'avoid',label:'کارهای بانکی را شب انجام نمی‌دهم'};
  if(/(?:طراحی|کار(?:های|هاي)?\s+طراحی).*(?:تمرکز|آرامش).*(?:بیشتر|زیاد|لازم|نیاز)/.test(s))
    return {domain:'condition',activity:'design',segment:'any',rule:'needs-focus',label:'برای کارهای طراحی تمرکز بیشتری لازم دارم'};
  const pref=s.match(/(?:ترجیح\s+می(?:دم|دهم)|معمولاً|معمولا).*(طراحی|تماس|کار(?:های|هاي)?\s+بانکی).*(صبح|بعدازظهر|عصر|شب)/);
  if(pref){const activity=/طراحی/.test(pref[1])?'design':/بانکی/.test(pref[1])?'bank':'work-call',segment=/صبح/.test(pref[2])?'morning':/بعدازظهر/.test(pref[2])?'afternoon':/عصر/.test(pref[2])?'evening':'night';return {domain:'time-preference',activity,segment,rule:'prefer',label:`${activityFa(activity)} را ${segmentFa(segment)} ترجیح می‌دهم`}}
  const dep=s.match(/(?:این\s+کار|کار(?:های|هاي)?\s+[^،,.؛]{1,30}).*(?:به\s+(?:حضور|پاسخ)\s+([آ-ی‌]+(?:\s+[آ-ی‌]+){0,2}?)(?:\s+وابسته|\s+نیاز|$)|وابسته\s+به\s+([آ-ی‌]+(?:\s+[آ-ی‌]+){0,2}))/);
  if(dep){const who=(dep[1]||dep[2]||'شخص دیگری').trim();return {domain:'dependency',activity:memoryActivity(t),segment:'any',rule:'requires-person',label:`این نوع کار به حضور یا پاسخ ${who} وابسته است`}}
  return null;
}

function upsertExplicitMemory(spec,evidence){
  const sig=memorySignature(spec.domain,spec.activity,spec.segment),now=new Date().toISOString();
  USER_MEMORY.items.filter(x=>x.signature===sig&&x.source==='inferred').forEach(x=>{x.active=false;x.supersededAt=now});
  let m=USER_MEMORY.items.find(x=>x.signature===sig&&x.source==='explicit'&&x.active!==false);
  if(!m){m={id:memoryId(),signature:sig,domain:spec.domain,activity:spec.activity,segment:spec.segment,rule:spec.rule,label:spec.label,source:'explicit',confidence:1,support:1,contradictions:0,active:true,createdAt:now,updatedAt:now,evidenceIds:[]};USER_MEMORY.items.push(m)}
  else {m.label=spec.label;m.rule=spec.rule;m.support=(m.support||0)+1;m.confidence=1;m.updatedAt=now}
  if(evidence&&!m.evidenceIds.includes(evidence.id))m.evidenceIds.push(evidence.id);return m;
}

function inferredSpecFor(e){
  if(e.kind==='start'&&e.activity!=='general')return {domain:'time-preference',activity:e.activity,segment:e.segment,rule:'prefer',label:`معمولاً ${activityFa(e.activity)} را ${segmentFa(e.segment)} شروع می‌کنی`};
  if(e.kind!=='reject'||!['blocked','no-time','custom'].includes(e.code))return null;
  if(e.activity==='work-call'&&e.segment==='night')return {domain:'time-restriction',activity:e.activity,segment:e.segment,rule:'avoid',label:'معمولاً تماس‌های کاری را شب انجام نمی‌دهی'};
  if(e.activity==='bank'&&e.segment==='night')return {domain:'time-restriction',activity:e.activity,segment:e.segment,rule:'avoid',label:'معمولاً کارهای بانکی را شب انجام نمی‌دهی'};
  return null;
}

function updateInferredMemory(spec,evidence){
  const sig=memorySignature(spec.domain,spec.activity,spec.segment),related=USER_MEMORY.evidence.filter(e=>{const s=inferredSpecFor(e);return s&&memorySignature(s.domain,s.activity,s.segment)===sig}),support=related.length;
  let m=USER_MEMORY.items.find(x=>x.signature===sig&&x.source==='inferred');
  if(support<3){saveUserMemory();return null}
  const now=new Date().toISOString(),confidence=Math.min(.92,.55+(support-3)*.09);
  if(!m){m={id:memoryId(),signature:sig,domain:spec.domain,activity:spec.activity,segment:spec.segment,rule:spec.rule,label:spec.label,source:'inferred',confidence,support,contradictions:0,active:true,createdAt:now,updatedAt:now,evidenceIds:related.map(x=>x.id)};USER_MEMORY.items.push(m)}
  else {m.active=true;m.support=support;m.confidence=Math.max(.35,confidence-(m.contradictions||0)*.12);m.updatedAt=now;m.evidenceIds=related.map(x=>x.id)}
  saveUserMemory();return m;
}

function contradictUserMemory(t,nowMin){
  const segment=memorySegment(nowMin===undefined?decisionClockMinutes():nowMin),now=new Date().toISOString();
  activeUserMemories().filter(m=>memoryMatches(m,t,segment)&&m.rule==='avoid').forEach(m=>{
    m.contradictions=(m.contradictions||0)+1;m.updatedAt=now;
    if(m.source==='inferred'){m.confidence=Math.max(.2,(m.confidence||.55)-.14);if(m.confidence<.4)m.active=false}
    else m.confidence=Math.max(.9,(m.confidence||1)-.02);
  });
  saveUserMemory();
}

function observeUserMemoryEvent(kind,t,detail={},nowMin){
  if(!t)return null;
  if(kind==='start'){const e=addMemoryEvidence('start',t,detail,nowMin);contradictUserMemory(t,nowMin);const spec=inferredSpecFor(e);return spec?updateInferredMemory(spec,e):null}
  if(kind!=='reject')return null;
  const e=addMemoryEvidence('reject',t,detail,nowMin),explicit=explicitMemoryFromText(e.text,t);
  if(explicit){const m=upsertExplicitMemory(explicit,e);saveUserMemory();return m}
  const spec=inferredSpecFor(e);return spec?updateInferredMemory(spec,e):(saveUserMemory(),null);
}

function observeExplicitMemoryText(text,t,source='clarification'){
  const spec=explicitMemoryFromText(text,t);if(!spec)return null;
  const e=addMemoryEvidence(source,t,{code:'explicit',text});const m=upsertExplicitMemory(spec,e);saveUserMemory();return m;
}

function userMemorySignal(t,nowMin=decisionClockMinutes()){
  const segment=memorySegment(nowMin),matches=activeUserMemories().filter(m=>memoryMatches(m,t,segment)).sort((a,b)=>(b.source==='explicit')-(a.source==='explicit')||(b.updatedAt||'').localeCompare(a.updatedAt||''));
  const m=matches.find(x=>['avoid','prefer'].includes(x.rule));if(!m)return null;
  return {memory:m,hard:m.source==='explicit'&&m.rule==='avoid',score:m.rule==='avoid'?-Math.round(8+20*m.confidence):Math.round(8*m.confidence),reason:m.label};
}

function deleteUserMemory(id){const m=USER_MEMORY.items.find(x=>x.id===id);if(!m)return false;m.active=false;m.deletedAt=new Date().toISOString();saveUserMemory();return true}

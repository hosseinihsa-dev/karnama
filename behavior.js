/* ===== تاریخچه رفتار؛ رویداد خام و الگوی استنباطی جدا از حافظه صریح ===== */
const BEHAVIOR_KEY='karnama.behavior.v1',BEHAVIOR_EVENT_LIMIT=600;
const emptyBehaviorHistory=()=>({version:1,events:[],patterns:[],seenSuggestions:{},pendingAlternative:null,summary:{trimmedEvents:0},updatedAt:null});
function normalizeBehaviorHistory(x){
  const b=x&&typeof x==='object'?x:emptyBehaviorHistory();
  return {version:1,events:Array.isArray(b.events)?b.events:[],patterns:Array.isArray(b.patterns)?b.patterns:[],seenSuggestions:b.seenSuggestions&&typeof b.seenSuggestions==='object'?b.seenSuggestions:{},pendingAlternative:b.pendingAlternative||null,summary:b.summary&&typeof b.summary==='object'?b.summary:{trimmedEvents:0},updatedAt:b.updatedAt||null};
}
let BEHAVIOR=(()=>{try{return normalizeBehaviorHistory(JSON.parse(localStorage.getItem(BEHAVIOR_KEY)))}catch(e){return emptyBehaviorHistory()}})();
const saveBehavior=()=>{BEHAVIOR.updatedAt=new Date().toISOString();try{localStorage.setItem(BEHAVIOR_KEY,JSON.stringify(BEHAVIOR))}catch(e){}};
const restoreBehavior=data=>{BEHAVIOR=normalizeBehaviorHistory(data);rebuildBehaviorPatterns();saveBehavior()};
const behaviorId=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const behaviorSegment=min=>memorySegment(min===undefined?decisionClockMinutes():min);
const behaviorTaskKey=t=>`${t&&t.id||'x'}@${t&&t.key||t&&t.date||''}`;
const daysOld=at=>Math.max(0,(Date.now()-new Date(at).getTime())/864e5);
const recencyWeight=at=>Math.exp(-daysOld(at)/120);

function behaviorEvent(type,t,detail={},options={}){
  if(!t)return null;
  const nowMin=options.nowMin===undefined?decisionClockMinutes():options.nowMin,context=taskContext(t),deadline=context&&context.deadline&&context.deadline.value||null;
  const e={id:behaviorId(),at:options.at||new Date().toISOString(),type,taskId:t.id||null,taskKey:behaviorTaskKey(t),category:Number.isInteger(t.c)?t.c:null,activity:memoryActivity(t),segment:behaviorSegment(nowMin),priority:Number.isInteger(t.p)?t.p:null,deadline,deadlineDistance:deadline?diffDays(deadline,options.date||TODAY()):null,detail:detail&&typeof detail==='object'?detail:{}};
  BEHAVIOR.events.push(e);
  if(BEHAVIOR.events.length>BEHAVIOR_EVENT_LIMIT){const n=BEHAVIOR.events.length-BEHAVIOR_EVENT_LIMIT;BEHAVIOR.events=BEHAVIOR.events.slice(n);BEHAVIOR.summary.trimmedEvents=(BEHAVIOR.summary.trimmedEvents||0)+n}
  rebuildBehaviorPatterns();saveBehavior();return e;
}

function patternStats(events,positiveType,negativeType){
  const positive=events.filter(e=>e.type===positiveType),negative=events.filter(e=>e.type===negativeType),wp=positive.reduce((n,e)=>n+recencyWeight(e.at),0),wn=negative.reduce((n,e)=>n+recencyWeight(e.at),0),support=positive.length,opposition=negative.length,total=wp+wn;
  return {support,opposition,weightedSupport:+wp.toFixed(3),confidence:total?+(wp/total*Math.min(1,wp/4)).toFixed(3):0,lastAt:positive.reduce((m,e)=>!m||e.at>m?e.at:m,null),evidenceIds:positive.slice(-20).map(e=>e.id)};
}

function rebuildBehaviorPatterns(){
  const patterns=[],groups={};
  BEHAVIOR.events.filter(e=>['started','rejected'].includes(e.type)).forEach(e=>{const k=`${e.activity}|${e.segment}`;(groups[k]||(groups[k]=[])).push(e)});
  Object.entries(groups).forEach(([k,events])=>{
    const [activity,segment]=k.split('|'),accept=patternStats(events,'started','rejected'),reject=patternStats(events,'rejected','started');
    if(accept.support>=3&&accept.confidence>=.5)patterns.push(Object.assign({id:`accept|${k}`,kind:'acceptance',activity,segment,source:'inferred'},accept));
    if(reject.support>=3&&reject.confidence>=.5)patterns.push(Object.assign({id:`reject|${k}`,kind:'rejection',activity,segment,source:'inferred'},reject));
  });
  const rejectionReasons={};BEHAVIOR.events.filter(e=>e.type==='rejected'&&e.detail&&e.detail.reasonCode).forEach(e=>{const k=`${e.activity}|${e.segment}|${e.detail.reasonCode}`;(rejectionReasons[k]||(rejectionReasons[k]=[])).push(e)});
  Object.entries(rejectionReasons).forEach(([k,events])=>{if(events.length<3)return;const parts=k.split('|'),w=events.reduce((n,e)=>n+recencyWeight(e.at),0);patterns.push({id:`reason|${k}`,kind:'rejection-reason',activity:parts[0],segment:parts[1],reasonCode:parts[2],source:'inferred',support:events.length,opposition:0,weightedSupport:+w.toFixed(3),confidence:+Math.min(.85,w/5).toFixed(3),lastAt:events[events.length-1].at,evidenceIds:events.slice(-20).map(e=>e.id)})});
  const completed={};BEHAVIOR.events.filter(e=>e.type==='completed'&&e.category!==null).forEach(e=>{const k=`${e.category}|${e.segment}`;(completed[k]||(completed[k]=[])).push(e)});
  Object.entries(completed).forEach(([k,events])=>{const [category,segment]=k.split('|'),w=events.reduce((n,e)=>n+recencyWeight(e.at),0);if(events.length>=3)patterns.push({id:`complete|${k}`,kind:'completion',category:+category,segment,source:'inferred',support:events.length,opposition:0,weightedSupport:+w.toFixed(3),confidence:+Math.min(.85,w/5).toFixed(3),lastAt:events[events.length-1].at,evidenceIds:events.slice(-20).map(e=>e.id)})});
  const deadlineDone=BEHAVIOR.events.filter(e=>e.type==='completed'&&e.deadlineDistance!==null&&e.deadlineDistance<=1&&e.deadlineDistance>=0),wd=deadlineDone.reduce((n,e)=>n+recencyWeight(e.at),0);
  if(deadlineDone.length>=3)patterns.push({id:'deadline|near',kind:'deadline-completion',source:'inferred',support:deadlineDone.length,opposition:0,weightedSupport:+wd.toFixed(3),confidence:+Math.min(.8,wd/5).toFixed(3),lastAt:deadlineDone[deadlineDone.length-1].at,evidenceIds:deadlineDone.slice(-20).map(e=>e.id)});
  BEHAVIOR.patterns=patterns;return patterns;
}

function recordSuggestedBehavior(t,decision){
  const segment=behaviorSegment(),key=`${TODAY()}|${segment}|${behaviorTaskKey(t)}`;
  if(BEHAVIOR.seenSuggestions[key])return null;
  BEHAVIOR.seenSuggestions[key]=new Date().toISOString();
  const keys=Object.keys(BEHAVIOR.seenSuggestions);if(keys.length>240)keys.sort((a,b)=>BEHAVIOR.seenSuggestions[a].localeCompare(BEHAVIOR.seenSuggestions[b])).slice(0,keys.length-240).forEach(k=>delete BEHAVIOR.seenSuggestions[k]);
  const e=behaviorEvent('suggested',t,{score:decision&&decision.score||null});
  if(BEHAVIOR.pendingAlternative&&BEHAVIOR.pendingAlternative!==behaviorTaskKey(t)){behaviorEvent('alternative-suggested',t,{replacedTaskKey:BEHAVIOR.pendingAlternative});BEHAVIOR.pendingAlternative=null;saveBehavior()}
  return e;
}
function recordDecisionBehavior(kind,t,detail){
  if(kind==='start')return behaviorEvent('started',t,{});
  if(kind==='reject'){const e=behaviorEvent('rejected',t,{reasonCode:detail&&detail.code||null,reasonText:detail&&detail.text||null});BEHAVIOR.pendingAlternative=behaviorTaskKey(t);saveBehavior();return e}
  return null;
}
function recordTaskCompletedBehavior(t,key){return behaviorEvent('completed',Object.assign({},t,{key:key||t.date}),{completionRecorded:true})}
function recordTaskPostponedBehavior(t,from,to,kind='postponed'){return behaviorEvent(kind,t,{from,to,moved:t.moved||0})}
function captureMissedDeadlineBehaviors(tasks,date=TODAY()){
  (tasks||[]).filter(t=>!t.done).forEach(t=>{const c=taskContext(t),deadline=c&&c.deadline&&c.deadline.value;if(!deadline||deadline>=date)return;const marker=`missed|${t.id}|${deadline}`;if(BEHAVIOR.events.some(e=>e.detail&&e.detail.marker===marker))return;behaviorEvent('deadline-missed',t,{marker,deadline},{date})});
}

function behaviorSignalForTask(t,nowMin=decisionClockMinutes()){
  const segment=behaviorSegment(nowMin),activity=memoryActivity(t),usable=BEHAVIOR.patterns.filter(p=>p.confidence>=.5&&p.segment===segment),reasons=[];let score=0;
  usable.forEach(p=>{
    if(p.kind==='acceptance'&&p.activity===activity){const x=Math.min(7,Math.round(p.confidence*7));score+=x;reasons.push({w:32,text:`این نوع کار را معمولاً ${segmentFa(segment)} می‌پذیری`})}
    else if(p.kind==='rejection'&&p.activity===activity){const x=Math.min(7,Math.round(p.confidence*7));score-=x;reasons.push({w:28,text:`این نوع پیشنهاد را معمولاً ${segmentFa(segment)} رد می‌کنی`})}
    else if(p.kind==='completion'&&p.category===t.c){const x=Math.min(4,Math.round(p.confidence*4));score+=x;reasons.push({w:24,text:`کارهای این دسته را بیشتر ${segmentFa(segment)} انجام داده‌ای`})}
  });
  return {score:Math.max(-8,Math.min(8,score)),reasons,patterns:usable};
}

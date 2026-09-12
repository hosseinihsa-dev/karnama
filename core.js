/* ================= data ================= */
const CATS=[
 {name:'جلسه و قرار',h:255,kw:['جلسه','قرار','ملاقات','دکتر','دندان','مصاحبه','همایش','کلاس','وقت'],ic:'M17 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V9h12zM5 7V5h12v2z'},
 {name:'کتاب و مطالعه',h:150,kw:['کتاب','بخونم','مطالعه','فصل','رمان','مقاله','بخوانم'],ic:'M12 6.2C10.6 5.2 8.7 4.6 6.5 4.6c-1.3 0-2.6.2-3.8.6-.4.1-.7.5-.7.9v11.6c0 .7.6 1.1 1.2.9 1-.3 2.1-.5 3.3-.5 1.9 0 3.7.5 5 1.4.3.2.7.2 1 0 1.3-.9 3.1-1.4 5-1.4 1.2 0 2.3.2 3.3.5.6.2 1.2-.2 1.2-.9V6.1c0-.4-.3-.8-.7-.9-1.2-.4-2.5-.6-3.8-.6-2.2 0-4.1.6-5.5 1.6'},
 {name:'فیلم و سریال',h:320,kw:['فیلم','سریال','ببینم','قسمت','سینما','مستند'],ic:'M18 4v1h-2V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H6V4a1 1 0 0 0-2 0v16a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h2v1a1 1 0 0 0 2 0V4a1 1 0 0 0-2 0M8 17H6v-2h2zm0-4H6v-2h2zm0-4H6V7h2zm10 8h-2v-2h2zm0-4h-2v-2h2zm0-4h-2V7h2z'},
 {name:'خرید',h:40,kw:['بخرم','خرید','شارژ','سفارش','فروشگاه','نان','میوه','نون'],ic:'M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M7.2 14.6l.9-1.6h7.4c.7 0 1.4-.4 1.7-1l3.2-5.8a1 1 0 0 0-.9-1.5H6.2l-.7-1.5A1 1 0 0 0 4.6 2H3a1 1 0 0 0 0 2h1l3.6 7.6-1.4 2.4c-.7 1.3.2 3 1.8 3h11a1 1 0 0 0 0-2H8c-.6 0-.9-.5-.8-.9z'},
 {name:'کار و شغل',h:210,kw:['ایمیل','پروژه','گزارش','رئیس','ددلاین','ارسال','ارائه','همکار'],ic:'M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-6 0h-4V4h4z'},
 {name:'خانه و خانواده',h:20,kw:['مامان','بابا','خانه','خونه','تعمیر','نظافت','مهمان','ظرف'],ic:'M12 3 3 10v10a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5h4v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V10z'},
 {name:'ورزش و سلامتی',h:130,kw:['ورزش','باشگاه','دویدن','پیاده‌روی','پیاده روی','آب بخورم','خواب','قرص','دارو'],ic:'M20.6 8.4 19 6.8V5a2 2 0 0 0-4 0v3H9V5a2 2 0 0 0-4 0v1.8L3.4 8.4a1 1 0 0 0 1.4 1.4l.2-.2v4.8l-.2-.2a1 1 0 0 0-1.4 1.4L5 17.2V19a2 2 0 0 0 4 0v-3h6v3a2 2 0 0 0 4 0v-1.8l1.6-1.6a1 1 0 0 0-1.4-1.4l-.2.2V9.6l.2.2a1 1 0 0 0 1.4-1.4'},
 {name:'مالی و پرداخت',h:95,kw:['قسط','پرداخت','قبض','حساب','پول','بیمه','مالیات','واریز','کارت'],ic:'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H4v-6h16zm0-9H4V6h16z'},
 {name:'سفر',h:190,kw:['سفر','بلیت','بلیط','هتل','چمدان','ویزا','پرواز','مسافرت'],ic:'M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z'},
 {name:'یادگیری',h:285,kw:['یاد بگیرم','دوره','تمرین زبان','آموزش','انگلیسی','کد','بیاموزم','درس'],ic:'M12 3 1 9l11 6 9-4.9V17a1 1 0 0 0 2 0V9zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8z'},
 {name:'معنوی و عبادت',h:170,kw:['نماز','قرآن','دعا','روزه','زیارت','ذکر','مسجد'],ic:'M12 2S8 5.5 8 8.5c0 1.6.9 2.8 2 3.5H6a3 3 0 0 0-3 3V21h4v-3a2 2 0 0 1 4 0v3h2v-3a2 2 0 0 1 4 0v3h4v-6a3 3 0 0 0-3-3h-4c1.1-.7 2-1.9 2-3.5C16 5.5 12 2 12 2'},
 {name:'ایده‌ها',h:60,kw:['ایده','فکر','طرح','شاید','یادداشت'],ic:'M9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2'},
];
const SLOTS=['صبح','بعدازظهر','شب'];
const PRI=['مهم و فوری','اولویت متوسط','وقت آزاد'];
const WD=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const WDS=['شنبه','یک','دو','سه','چهار','پنج','جمعه'];
const REPS=[null,'هر روز','هر هفته','هر ماه'];
const WDV=[[5,['پنجشنبه','پنج‌شنبه','پنج شنبه']],[4,['چهارشنبه','چهار‌شنبه','چهار شنبه']],
           [3,['سه‌شنبه','سه شنبه','سهشنبه']],[2,['دوشنبه','دو شنبه']],[1,['یکشنبه','یک شنبه','۱شنبه']],
           [6,['جمعه']],[0,['شنبه']]];
const col=(h,a)=>a?`oklch(0.76 0.13 ${h} / ${a})`:`oklch(0.76 0.13 ${h})`;
const fa=s=>String(s).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

/* ---- dates: ISO strings, Persian week starts Saturday ---- */
const iso=d=>{const z=new Date(d);z.setHours(12,0,0,0);return z.toISOString().slice(0,10)};
const fromIso=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
const addDays=(s,n)=>{const d=fromIso(s);d.setDate(d.getDate()+n);return iso(d)};
const TODAY=()=>iso(new Date());
const wdIndex=s=>(fromIso(s).getDay()+1)%7;
const weekStart=s=>addDays(s,-wdIndex(s));
const diffDays=(a,b)=>Math.round((fromIso(a)-fromIso(b))/864e5);
let jf;try{jf=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long'})}catch(e){jf=null}
const jdate=s=>jf?jf.format(fromIso(s)):s;
const JM=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const jparts=(()=>{
  try{
    const f=new Intl.DateTimeFormat('en-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric'});
    return s=>{const o={};f.formatToParts(fromIso(s)).forEach(x=>o[x.type]=x.value);
      return {y:parseInt(o.year,10),m:parseInt(o.month,10),d:parseInt(o.day,10)}};
  }catch(e){
    return s=>{const d=fromIso(s);return{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate()}};
  }
})();
const endOfJMonth=d=>{let x=d,m=jparts(d).m;for(let i=0;i<32;i++){const n=addDays(x,1);if(jparts(n).m!==m)break;x=n}return x};

/* ---- recurrence: a repeating task is one series that shows on every matching day ---- */
function occursOn(t,d){
  if(!t.rep)return t.date===d;
  if(d<t.date)return false;
  if(t.until&&d>t.until)return false;
  if(t.rep==='هر روز')return true;
  if(t.rep==='هر هفته')return diffDays(d,t.date)%7===0;
  if(t.rep==='هر ماه')return jparts(d).d===jparts(t.date).d;
  return false;
}
const isDone=(t,d)=>t.rep?!!(t.doneOn&&t.doneOn[d]):!!t.done;
const instOn=d=>S.tasks.filter(t=>occursOn(t,d)).map(t=>Object.assign({},t,{date:d,done:isDone(t,d)}));

/* ---- ordering: morning → afternoon → night, then clock time, then priority ---- */
const tmin=t=>t.time?(+t.time.split(':')[0]*60+ +t.time.split(':')[1]):null;
const bySlot=(a,b)=>{
  if(!!a.done!==!!b.done)return a.done?1:-1;
  if(a.s!==b.s)return a.s-b.s;
  const x=tmin(a),y=tmin(b);
  if(x!==null&&y!==null&&x!==y)return x-y;
  if(x!==null&&y===null)return -1;
  if(x===null&&y!==null)return 1;
  return a.p-b.p;
};

/* ---- daily planner: fixed appointments stay put; flexible tasks fill free gaps ---- */
const SLOT_WINDOWS=[[8*60,13*60],[13*60,18*60],[18*60,22*60]];
const CAT_DURATION=[60,45,120,45,60,45,45,30,60,60,30,25];
const pn=s=>+String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace('٫','.');
function taskDuration(t){
  const x=(t.note||t.title||'').replace(/یک\s*ساعت/g,'1 ساعت').replace(/دو\s*ساعت/g,'2 ساعت').replace(/سه\s*ساعت/g,'3 ساعت');
  if(/نیم\s*ساعت/.test(x))return 30;
  if(/ربع\s*ساعت/.test(x))return 15;
  let m=x.match(/([\d۰-۹]+)\s*(?:دقیقه|دقه)/);if(m)return Math.max(5,Math.min(480,pn(m[1])));
  m=x.match(/([\d۰-۹]+(?:[٫.]\d+)?)\s*ساعت/);if(m)return Math.max(15,Math.min(480,Math.round(pn(m[1])*60)));
  return CAT_DURATION[t.c]||45;
}
const clock=m=>fa(`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`);
function dailyPlan(list){
  const active=list.filter(t=>!t.done),out=[],busy=[];
  active.filter(t=>t.time).forEach(t=>{
    const start=tmin(t),duration=taskDuration(t),end=start+duration;
    out.push({t,start,end,duration,fixed:true,overflow:false});busy.push([start,end]);
  });
  busy.sort((a,b)=>a[0]-b[0]);
  active.filter(t=>!t.time).sort((a,b)=>(a.s-b.s)||(a.p-b.p)).forEach(t=>{
    const duration=taskDuration(t),w=SLOT_WINDOWS[t.s]||SLOT_WINDOWS[1];let start=w[0];
    for(const b of busy){
      if(b[1]<=start||b[0]>=w[1])continue;
      if(start+duration<=b[0])break;
      if(start<b[1])start=b[1];
    }
    const overflow=start+duration>w[1];
    out.push({t,start,end:start+duration,duration,fixed:false,overflow});busy.push([start,start+duration]);busy.sort((a,b)=>a[0]-b[0]);
  });
  out.sort((a,b)=>a.start-b.start||a.t.p-b.t.p);
  for(let i=1;i<out.length;i++)if(out[i].fixed&&out[i-1].end>out[i].start)out[i].collision=true;
  return out;
}

/* ================= state ================= */
const KEY='karnama.v1';
let S={tab:0,sort:1,day:TODAY(),month:TODAY(),cat:null,sheet:false,pv:null,edit:null,planPreview:false,tasks:null};
function load(){
  try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&Array.isArray(r.tasks))return r.tasks}catch(e){}
  const t=TODAY();
  return [
    {id:1,title:'یک کار بنویس تا کارنما خودش دسته‌بندی‌اش کند',c:11,p:1,s:0,date:t,done:false},
    {id:2,title:'نیم ساعت پیاده‌روی',c:6,p:1,s:2,date:t,done:false,rep:'هر روز'},
    {id:3,title:'قبض برق را پرداخت کنم',c:7,p:0,s:1,date:addDays(t,-2),done:false},
  ];
}
/* merge duplicates left over from the old repeat logic: one series per repeating task */
function mergeSeries(tasks){
  const seen={},out=[];
  (tasks||[]).forEach(t=>{
    if(!t.rep){out.push(t);return}
    const k=[t.title,t.rep,t.c,t.s,t.p,t.time||'',t.until||''].join('|');
    if(!seen[k]){
      const m=Object.assign({},t);
      m.doneOn=Object.assign({},t.doneOn||{});
      if(t.done)m.doneOn[t.date]=1;
      m.done=false;
      seen[k]=m;out.push(m);
    }else{
      const m=seen[k];
      if(t.date<m.date)m.date=t.date;
      Object.assign(m.doneOn,t.doneOn||{});
      if(t.done)m.doneOn[t.date]=1;
    }
  });
  return out;
}
S.tasks=load();
{const before=S.tasks.length;S.tasks=mergeSeries(S.tasks);
 if(S.tasks.length!==before)try{localStorage.setItem(KEY,JSON.stringify({tasks:S.tasks}))}catch(e){}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({tasks:S.tasks}))}catch(e){}};
const PLAN_KEY='karnama.plan.v1';
const planSignature=list=>list.map(t=>[t.id,t.title,t.date,t.time||'',t.s,t.p].join(':')).sort().join('|');
function approvedPlan(list){
  try{const x=JSON.parse(localStorage.getItem(PLAN_KEY));return !!(x&&x.date===TODAY()&&x.signature===planSignature(list))}catch(e){return false}
}
function approvePlan(list){
  try{localStorage.setItem(PLAN_KEY,JSON.stringify({date:TODAY(),signature:planSignature(list)}))}catch(e){}
}

/* ---- learning: remember the categories you correct by hand ---- */
const LKEY='karnama.learn.v1';
let LEARN=(()=>{try{return JSON.parse(localStorage.getItem(LKEY))||{}}catch(e){return {}}})();
const saveLearn=()=>{try{localStorage.setItem(LKEY,JSON.stringify(LEARN))}catch(e){}};
const STOPW=new Set(['را','رو','با','برای','از','به','در','که','یک','هر','تا','این','آن','هم','ولی','اما','باید',
  'کنم','بکنم','بزنم','بگیرم','بدهم','بشه','شود','کن','بده','خودم','یادم','باشه','ساعت','روز','هفته','ماه','امروز','فردا','صبح','شب','ظهر','عصر','بعدازظهر','فوری','مهم']);
function lwords(t){
  return (t||'').replace(/[^؀-ۿ\s]/g,' ').split(/\s+/)
    .map(w=>w.replace(/[‌]/g,'')).filter(w=>w.length>=3&&!STOPW.has(w));
}
const BUILTIN_KW=new Set(CATS.flatMap(c=>c.kw.flatMap(k=>k.split(/\s+/))).map(w=>w.replace(/[‌]/g,'')));
function learnCat(text,c){
  const ws=lwords(text).filter(w=>!BUILTIN_KW.has(w));if(!ws.length)return;
  ws.forEach(w=>{LEARN[w]=c});
  const keys=Object.keys(LEARN);
  if(keys.length>600)keys.slice(0,keys.length-600).forEach(k=>delete LEARN[k]);
  saveLearn();
}

/* ================= classify ================= */
function classify(text){
  const t=(text||'').trim();
  let c=11,best=0;
  CATS.forEach((cat,i)=>{const n=cat.kw.filter(k=>t.includes(k)).length;if(n>best){best=n;c=i}});
  const lv=lwords(t).map(w=>LEARN[w]).filter(v=>v!==undefined&&v!==null);
  if(lv.length){const cnt={};lv.forEach(v=>cnt[v]=(cnt[v]||0)+1);
    c=+Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];}
  let rep=null;
  if(/هر\s?روز|روزانه/.test(t))rep='هر روز';
  else if(/هر\s?هفته|هفتگی/.test(t))rep='هر هفته';
  else if(/هر\s?ماه|ماهانه/.test(t))rep='هر ماه';
  let s=(c===6||c===10)?0:((c===1||c===2)?2:1);
  if(/صبح/.test(t))s=0;else if(/عصر|بعدازظهر|ظهر/.test(t))s=1;else if(/شب|امشب/.test(t))s=2;
  let time=null;
  const en=x=>x.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const tm=t.match(/ساعت\s*([\d۰-۹]{1,2})\s*(?:[:.٫]\s*([\d۰-۹]{2}))?/)||t.match(/\b([\d۰-۹]{1,2})[:٫]([\d۰-۹]{2})\b/);
  if(tm){
    let hh=parseInt(en(tm[1]),10);const mm=tm[2]?parseInt(en(tm[2]),10):0;
    const isMorning=/صبح/.test(t),isNoon=/ظهر/.test(t),isPm=/عصر|بعدازظهر|بعد از ظهر|شب|امشب/.test(t);
    if(isMorning&&hh===12)hh=0;
    else if((isPm||isNoon)&&hh>=1&&hh<12)hh+=12;
    if(hh>=0&&hh<=23&&mm>=0&&mm<=59){
      time=hh+':'+String(mm).padStart(2,'0');
      s=hh<12?0:(hh<18?1:2);
    }
  }
  let p=1;
  if(/فوری|امروز|سریع|مهم|ددلاین|قسط|قبض/.test(t)||c===0||c===7)p=0;
  if(c===2||c===11)p=2;
  const today=TODAY();
  let date=today;
  if(/پس\s?فردا/.test(t))date=addDays(today,2);
  else if(/فردا/.test(t))date=addDays(today,1);
  else if(/هفته\s?ی?\s?(دیگه|بعد|آینده)/.test(t))date=addDays(today,7);
  else{
    for(const [i,names] of WDV){
      const hit=names.find(n=>t.includes(n));
      if(hit){
        const cur=wdIndex(today);let d=(i-cur+7)%7;if(d===0)d=7;
        date=addDays(today,d);
        if(!rep&&new RegExp('هر\\s*'+hit.replace(/[‌ ]/g,'[‌ ]?')).test(t))rep='هر هفته';
        break;
      }
    }
  }
  let until=null;
  if(rep){
    if(/تا\s*(آخر|پایان)\s*(این\s*)?ماه/.test(t))until=endOfJMonth(today);
    else if(/تا\s*(آخر|پایان)\s*(این\s*)?هفته/.test(t))until=addDays(weekStart(today),6);
    else{
      const um=t.match(/تا\s*([\d۰-۹]{1,3})\s*(روز|هفته|ماه)/);
      if(um){const n=parseInt(en(um[1]),10)||0;
        if(n>0)until=addDays(today,um[2]==='روز'?n:um[2]==='هفته'?n*7:n*30);}
    }
  }
  return {c,s,p,rep,date,time,until};
}

/* ---- turn a free description into a short title ---- */
const T_KILL=[
  /^\s*(می‌?خوام|میخوام|می‌?خواهم|باید|لطفاً?|قراره|حتماً?|یادم باشه که|یادم باشه|یادم بنداز که|یادم بنداز|یادم بیار که|یادم بیار|یادآوریم کن که|یادآوریم کن|یادآوری کن که|یادآوری کن)\s+/,
];
const T_WORDS=['پس فردا','پس‌فردا','امروز','فردا','امشب','دیشب','صبح','ظهر','بعدازظهر','بعد از ظهر','عصر','شب',
  'هر روز','هرروز','هر هفته','هرهفته','هر ماه','هرماه',
  'هفته دیگه','هفته‌ی دیگه','هفته بعد','هفته‌ی بعد','هفته آینده','هفته‌ی آینده',
  'خیلی فوری','فوری','خیلی مهم','مهمه','ددلاین','سریع','حتما','حتماً',
  'شنبه','یکشنبه','یک شنبه','دوشنبه','دو شنبه','سه‌شنبه','سه شنبه','چهارشنبه','چهار شنبه','پنجشنبه','پنج‌شنبه','پنج شنبه','جمعه'];
function titleFrom(text){
  let t=(text||'').replace(/\s+/g,' ').trim();
  T_KILL.forEach(r=>{t=t.replace(r,'')});
  t=t.replace(/(^|\s)(یادم\s*(?:بنداز|بیار)(?:\s*که)?|یادآوریم\s*کن(?:\s*که)?|یادآوری\s*کن(?:\s*که)?)(?=\s|$)/g,' ');
  t=t.replace(/ساعت\s*[\d۰-۹]+([:.٫][\d۰-۹]+)?/g,' ');
  t=t.replace(/\b[\d۰-۹]{1,2}[:٫][\d۰-۹]{2}\b/g,' ');
  t=t.replace(/تا\s*(آخر|پایان)\s*(این\s*)?(ماه|هفته)/g,' ');
  t=t.replace(/تا\s*[\d۰-۹]{1,3}\s*(روز|هفته|ماه)\s*(دیگه|بعد|آینده)?/g,' ');
  T_WORDS.slice().sort((a,b)=>b.length-a.length).forEach(w=>{t=t.split(w).join(' ')});
  t=t.replace(/(^|\s)هر(\s|$)/g,' ');
  t=t.replace(/\s+/g,' ').replace(/^[\s,،.\-–—]+|[\s,،.\-–—]+$/g,'');
  t=t.replace(/^(که|را|رو|در|به|از)\s+/,'');
  const w=t.split(' ').filter(Boolean);
  if(w.length>8)t=w.slice(0,8).join(' ')+'…';
  t=t.trim();
  return t.length>=3?t:(text||'').trim().slice(0,60);
}

/* ================= helpers ================= */
const catChip=t=>`<span class="chip" style="color:${col(CATS[t.c].h)};background:${col(CATS[t.c].h,.13)}"><span class="d5" style="background:${col(CATS[t.c].h)}"></span>${CATS[t.c].name}</span>`;
function taskChips(t){
  let h=catChip(t)+`<span class="chip c-nu">${t.time?fa(t.time):SLOTS[t.s]}</span>`;
  if(t.rep)h+=`<span class="chip c-inf">${t.rep}${t.until?' تا '+fa(jdate(t.until)):''}</span>`;
  if(t.rem)h+=`<span class="chip c-rem">یادآور</span>`;
  return h;
}
function toast(msg,ms=3800,actionLabel=null,action=null){
  const e=document.getElementById('toast');e.textContent=msg;
  if(actionLabel&&action){const b=document.createElement('button');b.textContent=actionLabel;b.onclick=()=>{action();e.classList.remove('show')};e.appendChild(b)}
  e.classList.add('show');
  clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('show'),ms);
}
const byId=id=>S.tasks.find(t=>t.id===id);
function patch(id,ch){const t=byId(id);if(t)Object.assign(t,ch);save();render()}
function toggle(id,d){
  const t=byId(id);if(!t)return;
  if(t.rep){t.doneOn=t.doneOn||{};if(t.doneOn[d])delete t.doneOn[d];else t.doneOn[d]=1}
  else t.done=!t.done;
  save();render();
}
function remove(id){
  const index=S.tasks.findIndex(t=>t.id===id);if(index<0)return null;
  const removed=S.tasks.splice(index,1)[0];save();render();return {task:removed,index};
}
function removeWithUndo(id){
  const deleted=remove(id);if(!deleted)return;
  toast('کار حذف شد.',6000,'برگردان',()=>{
    if(S.tasks.some(t=>t.id===deleted.task.id))return;
    S.tasks.splice(Math.min(deleted.index,S.tasks.length),0,deleted.task);save();render();toast('کار برگشت.',2200);
  });
}
const norm=s=>String(s||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]+/g,' ').trim().toLowerCase();
function duplicateOf(task,exceptId=null){
  return S.tasks.find(t=>t.id!==exceptId&&norm(t.title)===norm(task.title)&&t.date===task.date&&
    (t.time||null)===(task.time||null)&&(t.rep||null)===(task.rep||null));
}

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

/* ================= state ================= */
const KEY='karnama.v1';
let S={tab:0,sort:1,day:TODAY(),month:TODAY(),sheet:false,pv:null,edit:null,tasks:null};
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

/* ================= classify ================= */
function classify(text){
  const t=(text||'').trim();
  let c=11,best=0;
  CATS.forEach((cat,i)=>{const n=cat.kw.filter(k=>t.includes(k)).length;if(n>best){best=n;c=i}});
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
    const hh=parseInt(en(tm[1]),10),mm=tm[2]?parseInt(en(tm[2]),10):0;
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
  /^\s*(می‌?خوام|میخوام|می‌?خواهم|باید|لطفاً?|قراره|حتماً?|یادم باشه که|یادم باشه|یادآوری کن که|یادآوری کن)\s+/,
];
const T_WORDS=['پس فردا','پس‌فردا','امروز','فردا','امشب','دیشب','صبح','ظهر','بعدازظهر','بعد از ظهر','عصر','شب',
  'هر روز','هرروز','هر هفته','هرهفته','هر ماه','هرماه',
  'هفته دیگه','هفته‌ی دیگه','هفته بعد','هفته‌ی بعد','هفته آینده','هفته‌ی آینده',
  'خیلی فوری','فوری','خیلی مهم','مهمه','ددلاین','سریع','حتما','حتماً',
  'شنبه','یکشنبه','یک شنبه','دوشنبه','دو شنبه','سه‌شنبه','سه شنبه','چهارشنبه','چهار شنبه','پنجشنبه','پنج‌شنبه','پنج شنبه','جمعه'];
function titleFrom(text){
  let t=(text||'').replace(/\s+/g,' ').trim();
  T_KILL.forEach(r=>{t=t.replace(r,'')});
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
function toast(msg,ms=3800){
  const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');
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
function remove(id){S.tasks=S.tasks.filter(t=>t.id!==id);save();render()}

function taskCard(t,i){
  return `<div class="task">
      <button class="box ${t.done?'on':''}" data-act="toggle" data-id="${t.id}" data-date="${t.date}">${t.done?'✓':''}</button>
      <div class="tmid"><div data-act="edit" data-id="${t.id}"><div class="ttl ${t.done?'done':''}">${esc(t.title)}</div>${t.note&&t.note!==t.title?`<div class="note">${esc(t.note)}</div>`:''}</div><div class="chips">${taskChips(t)}</div></div>
      <span class="rank">${fa(String(i+1).padStart(2,'0'))}</span></div>`;
}

/* ================= render ================= */
function render(){
  const today=TODAY();
  const overdue=S.tasks.filter(t=>!t.rep&&!t.done&&t.date<today).sort(bySlot);
  const list=instOn(today);
  const doneN=list.filter(t=>t.done).length;
  document.getElementById('sub').textContent=fa(`${WD[wdIndex(today)]} ${jdate(today)} · ${list.length} کار برای امروز · ${doneN} انجام شده`);
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',+b.dataset.tab===S.tab));
  const v=document.getElementById('view');
  v.innerHTML=[todayView,tomorrowView,weekView,monthView,catView][S.tab](overdue,list,doneN,today);
  v.querySelectorAll('[data-act]').forEach(el=>{
    el.onclick=()=>{
      const id=+el.dataset.id,a=el.dataset.act;
      if(a==='toggle')toggle(id,el.dataset.date||TODAY());
      else if(a==='edit')openSheet(id);
      else if(a==='today')patch(id,{date:TODAY()});
      else if(a==='tomorrow')patch(id,{date:addDays(TODAY(),1),moved:(byId(id).moved||0)+1});
      else if(a==='done')patch(id,{date:TODAY(),done:true});
      else if(a==='drop'){remove(id);toast('حذف شد. بعضی کارها لازم نیستند.',3000)}
      else if(a==='allToday'){overdue.forEach(t=>t.date=TODAY());save();render()}
      else if(a==='sort'){S.sort=+el.dataset.v;render()}
      else if(a==='day'){S.day=el.dataset.v;render()}
      else if(a==='mon'){S.month=el.dataset.v;render()}
    };
  });
}

function todayView(overdue,list,doneN,today){
  let h='';
  if(overdue.length){
    h+=`<div class="overdue"><div class="ov-head"><div><div class="ov-title">${fa(overdue.length)} کار از روزهای قبل مانده</div>
      <div class="ov-note">اشکالی ندارد — تصمیم بگیر: امروز، فردا، یا بی‌خیالش.</div></div>
      <button class="ov-all" data-act="allToday" data-id="0">همه به امروز</button></div>`;
    overdue.forEach(t=>{
      const late=diffDays(today,t.date);
      h+=`<div class="ov-item"><div class="ov-row"><span class="dot" style="background:${col(CATS[t.c].h)}"></span>
        <span class="ov-name" data-act="edit" data-id="${t.id}">${esc(t.title)}</span><span class="ov-late">${fa(late)} روز عقب</span></div>`;
      if((t.moved||0)>=3||late>=3)h+=`<div class="ov-nudge">سه بار جابه‌جا شده. یا به دو کار کوچک‌تر بشکنش، یا رهایش کن.</div>`;
      h+=`<div class="ov-acts">
        <button class="b-gold" data-act="today" data-id="${t.id}">امروز</button>
        <button class="b-nu" data-act="tomorrow" data-id="${t.id}">فردا</button>
        <button class="b-nu" data-act="done" data-id="${t.id}">انجام شد</button>
        <button class="b-drop" data-act="drop" data-id="${t.id}">بی‌خیال</button></div></div>`;
    });
    h+='</div>';
  }
  const pct=list.length?Math.round(doneN/list.length*100):0;
  const msg=pct===100&&list.length?'همه رو زدی. عالی بود.':pct>=50?'نصف راه رو رفتی، ادامه بده':'با یک کار کوچک شروع کن';
  h+=`<div class="prog"><div class="prog-top"><span class="prog-msg">${msg}</span><span class="prog-pct">${fa(pct)}٪</span></div>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div></div>`;
  const notes=['','صبح، بعدازظهر و شب — و در هر بازه، مهم‌ترین کار بالاتر','کارهای هم‌دسته پشت سر هم، تا یک‌جا تمامشان کنی'];
  h+=`<div><div class="seg">${['به ترتیب اولویت','به ترتیب زمان','بر اساس دسته'].map((s,i)=>
      `<button class="${S.sort===i?'on':''}" data-act="sort" data-v="${i}" data-id="0">${s}</button>`).join('')}</div>
      ${notes[S.sort]?`<div class="seg-note">${notes[S.sort]}</div>`:''}</div>`;

  const cmp=[(a,b)=>(a.done-b.done)||(a.p-b.p)||(a.s-b.s),
             bySlot,
             (a,b)=>(a.done-b.done)||(a.c-b.c)||(a.s-b.s)||(a.p-b.p)][S.sort];
  const sorted=[...list].sort(cmp);
  const gk=t=>S.sort===1?SLOTS[t.s]:S.sort===2?CATS[t.c].name:'';
  const gc={};sorted.forEach(t=>{gc[gk(t)]=(gc[gk(t)]||0)+1});
  let lh='';
  sorted.forEach((t,i)=>{
    if(S.sort!==0&&(i===0||gk(sorted[i-1])!==gk(t)))
      lh+=`<div class="ghead"><b>${gk(t)}</b><i></i><span>${fa(gc[gk(t)])} کار</span></div>`;
    lh+=taskCard(t,i);
  });
  h+=`<div class="list">${lh||'<div class="empty">امروز کاری ثبت نشده. با دکمه‌ی + شروع کن.</div>'}</div>`;
  const next=sorted.find(t=>!t.done);
  h+=`<div class="sugg"><b>پیشنهاد کارنما: </b>${next
    ?`الان بهترین وقت برای «${esc(next.title)}» است — ${next.time?fa(next.time):SLOTS[next.s]} و ${PRI[next.p]}.`
    :'کار باقی‌مانده‌ای نداری؛ یک کار از هفته را جلو بیانداز.'}</div>`;
  return h;
}

function tomorrowView(){
  const d=addDays(TODAY(),1);
  const list=instOn(d);
  const sorted=[...list].sort(bySlot);
  let h=`<div class="dayhead">فردا — ${fa(WD[wdIndex(d)]+' '+jdate(d))} · ${fa(list.length)} کار</div>`;
  let lh='';
  sorted.forEach((t,i)=>{
    if(i===0||sorted[i-1].s!==t.s||sorted[i-1].done!==t.done)
      lh+=`<div class="ghead"><b>${SLOTS[t.s]}</b><i></i><span>${fa(sorted.filter(x=>x.s===t.s).length)} کار</span></div>`;
    lh+=taskCard(t,i);
  });
  h+=`<div class="list">${lh||'<div class="empty">فردا هنوز خالی است. با دکمه‌ی + چیزی برایش بگذار.</div>'}</div>`;
  if(sorted.length)h+=`<div class="sugg"><b>یادت باشد: </b>کارهای فردا را می‌توانی همین حالا هم انجام بدهی — روی متن هر کار بزن و روزش را به امروز عوض کن.</div>`;
  return h;
}

function dayList(d){
  const dt=instOn(d).sort(bySlot);
  let h=`<div class="dayhead">${fa(WD[wdIndex(d)]+' '+jdate(d))} — ${fa(dt.length)} کار</div>`;
  if(!dt.length)return h+'<div class="empty">این روز خالیه. یک روز آزاد هم لازمه.</div>';
  return h+'<div class="list">'+dt.map(t=>`<div class="drow"><span class="acc" style="background:${col(CATS[t.c].h)}"></span>
    <div style="flex:1;min-width:0" data-act="edit" data-id="${t.id}"><div class="t">${esc(t.title)}</div>
    <div class="m">${CATS[t.c].name} · ${t.time?fa(t.time):SLOTS[t.s]} · ${PRI[t.p]}${t.rep?' · '+t.rep:''}</div></div></div>`).join('')+'</div>';
}

function weekView(){
  const today=TODAY(),ws=weekStart(today);
  let h='<div class="days">';
  for(let i=0;i<7;i++){
    const d=addDays(ws,i),n=instOn(d).length;
    h+=`<button class="day ${S.day===d?'on':''} ${d===today?'today':''}" data-act="day" data-v="${d}" data-id="0">
      <span class="dn">${WDS[i]}</span><span class="dc">${fa(n)}</span>
      <span class="dd ${n?'has':''}"></span></button>`;
  }
  h+='</div>';
  h+=dayList(S.day);
  return h;
}

function monthView(){
  const today=TODAY(),base=S.month||today,jb=jparts(base);
  const first=addDays(base,-(jb.d-1));
  const days=[];let d=first;
  while(days.length<32&&jparts(d).m===jb.m){days.push(d);d=addDays(d,1)}
  const last=days[days.length-1];
  let h=`<div class="mhead">
      <button class="mnav" data-act="mon" data-v="${addDays(first,-1)}" data-id="0">›</button>
      <b>${JM[jb.m-1]} ${fa(jb.y)}</b>
      <button class="mnav" data-act="mon" data-v="${addDays(last,1)}" data-id="0">‹</button>
    </div>`;
  h+='<div class="mgrid">'+WDS.map(w=>`<div class="mwd">${w}</div>`).join('');
  for(let i=0;i<wdIndex(first);i++)h+='<div class="mcell blank"></div>';
  days.forEach(x=>{
    const n=instOn(x).length;
    h+=`<button class="mcell ${S.day===x?'on':''} ${x===today?'today':''}" data-act="day" data-v="${x}" data-id="0">
      <span>${fa(jparts(x).d)}</span><span class="md ${n?'has':''}"></span></button>`;
  });
  h+='</div>';
  const sel=days.includes(S.day)?S.day:days.includes(today)?today:first;
  h+=dayList(sel);
  return h;
}

function catView(){
  return '<div class="grid">'+CATS.map((c,i)=>{
    const n=S.tasks.filter(t=>t.c===i&&(t.rep||!t.done)).length;
    return `<div class="cat"><div class="tile" style="color:${col(c.h)};background:${col(c.h,.13)}">
      <svg viewBox="0 0 24 24"><path d="${c.ic}"/></svg></div>
      <div class="n">${c.name}</div><div class="c">${n?fa(n)+' کار':'خالی'}</div></div>`;
  }).join('')+'</div>';
}

/* ================= capture sheet ================= */
const ov=document.getElementById('ov'),dr=document.getElementById('draft'),
      pv=document.getElementById('prev'),pc=document.getElementById('pvchips'),sb=document.getElementById('submit');

function openSheet(id){
  const t=id?byId(id):null;
  S.edit=t?t.id:null;
  document.getElementById('sh-title').textContent=t?'ویرایش کار':'چی تو ذهنته؟';
  sb.textContent=t?'ذخیره‌ی تغییرات':'بسپار به کارنما';
  document.getElementById('sh-del').style.display=t?'block':'none';
  if(t){dr.value=t.note||t.title;S.pv={c:t.c,s:t.s,p:t.p,rep:t.rep||null,until:t.until||null,date:t.date,time:t.time||null,title:t.title,locked:true}}
  else {dr.value='';S.pv=null}
  updatePv();ov.classList.add('show');setTimeout(()=>dr.focus(),60);
}
function closeSheet(){ov.classList.remove('show');dr.blur()}
document.getElementById('fab').onclick=()=>openSheet();
document.getElementById('scrim').onclick=closeSheet;

function updatePv(){
  const txt=dr.value.trim();
  sb.classList.toggle('on',txt.length>0);
  if(txt.length<=2&&!S.pv){pv.classList.remove('show');S.pv=null;return}
  if(!S.pv||!S.pv.locked)S.pv=Object.assign({locked:false},classify(txt));
  pv.classList.add('show');
  const g=S.pv,today=TODAY();
  const dl=g.date===today?'امروز':g.date===addDays(today,1)?'فردا':fa(`${WD[wdIndex(g.date)]} ${jdate(g.date)}`);
  pc.innerHTML=
    `<button class="chip" data-f="c" style="color:${col(CATS[g.c].h)};background:${col(CATS[g.c].h,.13)}"><span class="d5" style="background:${col(CATS[g.c].h)}"></span>${CATS[g.c].name}</button>`+
    `<button class="chip c-nu" data-f="date">${dl}</button>`+
    `<button class="chip c-nu" data-f="s">${SLOTS[g.s]}</button>`+
    `<button class="chip c-nu" data-f="time">${g.time?fa(g.time):'بدون ساعت'}</button>`+
    `<button class="chip c-nu" data-f="p">${PRI[g.p]}</button>`+
    `<button class="chip c-inf" data-f="rep">${g.rep||'بدون تکرار'}</button>`+
    (g.rep?`<button class="chip c-inf" data-f="until">${g.until?'تا '+fa(jdate(g.until)):'بدون پایان'}</button>`:'');
  pc.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>picker(b.dataset.f));
  const tl=document.getElementById('pv-title');
  tl.innerHTML=`<span>عنوان: </span><b>${esc(S.pv.title||titleFrom(txt))}</b><i>ویرایش</i>`;
  tl.onclick=()=>{
    const cur=S.pv.title||titleFrom(dr.value.trim());
    const v=prompt('عنوان کار:',cur);
    if(v&&v.trim()){S.pv.title=v.trim();S.pv.locked=true;updatePv()}
  };
}
dr.addEventListener('input',()=>{if(S.pv){S.pv.locked=false;S.pv.title=null}updatePv()});

/* --- picker --- */
const pk=document.getElementById('pick'),pkbx=pk.querySelector('.bx');
pk.querySelector('.bd').onclick=()=>pk.classList.remove('show');
function picker(f){
  const g=S.pv,today=TODAY();
  let title,opts;
  if(f==='c'){title='دسته';opts=CATS.map((c,i)=>({v:i,l:c.name,on:i===g.c,color:col(c.h)}))}
  else if(f==='s'){title='زمان روز';opts=SLOTS.map((s,i)=>({v:i,l:s,on:i===g.s}))}
  else if(f==='p'){title='اولویت';opts=PRI.map((s,i)=>({v:i,l:s,on:i===g.p}))}
  else if(f==='rep'){title='تکرار';opts=REPS.map((r,i)=>({v:i,l:r||'بدون تکرار',on:(g.rep||null)===r}))}
  else if(f==='until'){title='تکرار تا کِی؟';
        opts=[{v:'',l:'بدون پایان — همیشه تکرار شود',on:!g.until},
              {v:addDays(today,-1),l:'تمام شد — از امروز دیگر تکرار نشود',on:g.until===addDays(today,-1)},
              {v:addDays(weekStart(today),6),l:'تا آخر این هفته',on:g.until===addDays(weekStart(today),6)},
              {v:addDays(today,14),l:'تا دو هفته دیگر',on:g.until===addDays(today,14)},
              {v:endOfJMonth(today),l:'تا آخر این ماه',on:g.until===endOfJMonth(today)},
              {v:addDays(today,90),l:'تا سه ماه دیگر',on:g.until===addDays(today,90)}];
        for(let i=1;i<=60;i++){const d=addDays(today,i);
          opts.push({v:d,l:'تا '+fa(WD[wdIndex(d)]+' '+jdate(d)),on:g.until===d})}}
  else if(f==='time'){title='ساعت';opts=[{v:'',l:'بدون ساعت',on:!g.time}];
        for(let hh=6;hh<=23;hh++)for(const mm of ['00','30']){const v=hh+':'+mm;opts.push({v:v,l:fa(v),on:g.time===v})}}
  else{title='روز';opts=[];for(let i=0;i<15;i++){const d=addDays(today,i);
        opts.push({v:d,l:i===0?'امروز':i===1?'فردا':fa(`${WD[wdIndex(d)]} ${jdate(d)}`),on:d===g.date})}}
  pkbx.innerHTML=`<h4>${title}</h4>`+opts.map((o,i)=>
    `<button class="op ${o.on?'on':''}" data-i="${i}">${o.color?`<span class="d5" style="width:7px;height:7px;border-radius:99px;background:${o.color}"></span>`:''}${o.l}</button>`).join('');
  pkbx.querySelectorAll('.op').forEach((b,i)=>b.onclick=()=>{
    const val=opts[i].v;
    if(f==='rep')g.rep=REPS[val];
    else if(f==='until')g.until=val||null;
    else if(f==='time'){g.time=val||null;if(val){const hh=+val.split(':')[0];g.s=hh<12?0:(hh<18?1:2)}}
    else g[f]=val;
    g.locked=true;pk.classList.remove('show');updatePv();
  });
  pk.classList.add('show');
}

sb.onclick=()=>{
  const txt=dr.value.trim();if(!txt)return;
  const g=S.pv&&S.pv.locked?S.pv:classify(txt);
  const today=TODAY();
  const dl=g.date===today?'امروز':g.date===addDays(today,1)?'فردا':fa(`${WD[wdIndex(g.date)]} ${jdate(g.date)}`);
  if(S.edit){
    const t=byId(S.edit);
    if(t)Object.assign(t,{title:g.title||titleFrom(txt),note:txt,c:g.c,p:g.p,s:g.s,date:g.date,rep:g.rep||null,until:g.rep?(g.until||null):null,time:g.time||null});
    save();closeSheet();S.day=g.date;S.pv=null;S.edit=null;dr.value='';render();
    toast('تغییرات ذخیره شد.',2600);
    return;
  }
  S.tasks.push({id:Date.now(),title:g.title||titleFrom(txt),note:txt,c:g.c,p:g.p,s:g.s,date:g.date,done:false,rep:g.rep||null,until:g.rep?(g.until||null):null,time:g.time||null,rem:g.p===0});
  save();closeSheet();S.tab=g.date===addDays(today,1)?1:0;S.day=g.date;S.pv=null;dr.value='';render();
  toast(`اضافه شد به «${CATS[g.c].name}»${g.rep?' · '+g.rep+(g.until?' تا '+fa(jdate(g.until)):''):''} · پیشنهاد: ${dl} ${g.time?fa(g.time):SLOTS[g.s]}`);
};

document.getElementById('sh-del').onclick=()=>{
  if(!S.edit)return;
  remove(S.edit);S.edit=null;closeSheet();toast('کار حذف شد.',2600);
};

document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{S.tab=+b.dataset.tab;if(S.tab===2)S.day=TODAY();if(S.tab===3){S.month=TODAY();S.day=TODAY()}render()});

document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});

render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

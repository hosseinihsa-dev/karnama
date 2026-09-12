/* ===== نماها و رابط کاربری ===== */

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
  v.innerHTML=[todayView,tomorrowView,weekView,monthView,catView,studyView][S.tab](overdue,list,doneN,today);
  v.querySelectorAll('[data-act]').forEach(el=>{
    el.onclick=()=>{
      const id=+el.dataset.id,a=el.dataset.act;
      if(a==='toggle')toggle(id,el.dataset.date||TODAY());
      else if(a==='edit')openSheet(id);
      else if(a==='today')patch(id,{date:TODAY()});
      else if(a==='tomorrow')patch(id,{date:addDays(TODAY(),1),moved:(byId(id).moved||0)+1});
      else if(a==='done')patch(id,{date:TODAY(),done:true});
      else if(a==='drop')removeWithUndo(id);
      else if(a==='allToday'){overdue.forEach(t=>t.date=TODAY());save();render()}
      else if(a==='sort'){S.sort=+el.dataset.v;render()}
      else if(a==='day'){S.day=el.dataset.v;render()}
      else if(a==='mon'){S.month=el.dataset.v;render()}
      else if(a==='cat'){S.cat=el.dataset.v===''?null:+el.dataset.v;render()}
      else if(a==='backup')doBackup();
      else if(a==='restore'){const i=document.getElementById('imp');if(i)i.click()}
      else if(a==='studyAdd')openStudySheet();
      else if(a==='studyDone'){const p=studyById(id),st=p&&studyStats(p);if(p&&st.target)addStudyProgress(id,st.target)}
      else if(a==='studyProgress')amountPicker(id);
      else if(a==='studyPause'){const p=studyById(id);if(p){p.paused=!p.paused;saveStudy();render();toast(p.paused?'برنامه متوقف شد.':'برنامه دوباره فعال شد.')}}
      else if(a==='studyExtend'){const p=studyById(id);if(p){p.endDate=nextStudyDate(p,addDays(TODAY(),1),6);saveStudy();render();toast('مهلت مطالعه هفت جلسه تمدید شد.')}}
      else if(a==='studyDelete')removeStudyWithUndo(id);
      else if(a==='planPreview'){S.planPreview=true;render()}
      else if(a==='planClose'){S.planPreview=false;render()}
      else if(a==='planApprove'){approvePlan(list);S.planPreview=false;render();toast('برنامه امروز تأیید شد.',2800)}
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
  h+=studyToday(today);
  h+=plannerView(list,today);
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

function plannerView(list,d){
  const plan=dailyPlan(list),now=new Date(),nowMin=now.getHours()*60+now.getMinutes(),approved=approvedPlan(list);
  if(!plan.length)return '';
  if(!approved&&!S.planPreview)return `<button class="planner-trigger" data-act="planPreview" data-id="0"><span><b>برنامه پیشنهادی امروز</b><small>${fa(plan.length)} کار را برایت زمان‌بندی کردم</small></span><i>دیدن برنامه</i></button>`;
  const overflow=plan.filter(x=>x.overflow).length,collision=plan.filter(x=>x.collision).length;
  let h=`<section class="planner ${approved?'approved':''}"><div class="planner-head"><div><b>${approved?'برنامه امروز':'پیش‌نمایش برنامه امروز'}</b><span>کارهای ساعت‌دار ثابت‌اند؛ بقیه در زمان‌های خالی چیده شده‌اند.</span></div><em>${fa(plan.length)} بخش</em></div>`;
  if(overflow||collision)h+=`<div class="planner-warn">${collision?fa(collision)+' تداخل زمانی':''}${collision&&overflow?' · ':''}${overflow?fa(overflow)+' کار بیرون از بازه معمول':''} — برای سبک‌تر شدن روز، زمان یا روز یکی از کارها را تغییر بده.</div>`;
  h+='<div class="timeline">';
  plan.forEach(x=>{
    const live=d===TODAY()&&nowMin>=x.start&&nowMin<x.end;
    h+=`<div class="plan-row ${live?'live':''} ${x.overflow||x.collision?'risk':''}">
      <div class="plan-time"><b>${clock(x.start)}</b><span>${fa(x.duration)} دقیقه</span></div>
      <i class="plan-line"><u></u></i>
      <div class="plan-item"><button class="box" data-act="toggle" data-id="${x.t.id}" data-date="${d}" aria-label="انجام شد"></button>
        <div data-act="edit" data-id="${x.t.id}"><b>${esc(x.t.title)}</b><span>${CATS[x.t.c].name} · ${x.fixed?'ساعت ثابت':'زمان پیشنهادی'}${live?' · اکنون':''}</span></div></div></div>`;
  });
  h+='</div>';
  if(!approved)h+=`<div class="planner-confirm"><button class="b-nu" data-act="planClose" data-id="0">فعلاً نه</button><button class="b-gold" data-act="planApprove" data-id="0">این برنامه خوبه</button></div>`;
  return h+'</section>';
}

function tomorrowView(){
  const d=addDays(TODAY(),1);
  const list=instOn(d);
  const sorted=[...list].sort(bySlot);
  let h=`<div class="dayhead">فردا — ${fa(WD[wdIndex(d)]+' '+jdate(d))} · ${fa(list.length)} کار</div>`;
  const books=STUDY.filter(p=>studyRemaining(p)>0&&!p.paused&&studyActive(p,d));
  if(books.length)h+=`<div class="ghead"><b>مطالعه</b><i></i><span>${fa(books.length)} کتاب</span></div>${books.map(p=>studyCard(p,d)).join('')}`;
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
  const books=STUDY.filter(p=>studyRemaining(p)>0&&!p.paused&&studyActive(p,d));
  let h=`<div class="dayhead">${fa(WD[wdIndex(d)]+' '+jdate(d))} — ${fa(dt.length)} کار${books.length?' · '+fa(books.length)+' مطالعه':''}</div>`;
  if(books.length)h+=books.map(p=>studyCard(p,d)).join('');
  if(!dt.length&&!books.length)return h+'<div class="empty">این روز خالیه. یک روز آزاد هم لازمه.</div>';
  if(!dt.length)return h;
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

function monthHasTasks(anchor){
  let d=addDays(anchor,-(jparts(anchor).d-1));const m=jparts(anchor).m;
  for(let i=0;i<32&&jparts(d).m===m;i++){if(instOn(d).length)return true;d=addDays(d,1)}
  return false;
}

function monthView(){
  const today=TODAY(),base=S.month||today,jb=jparts(base);
  const first=addDays(base,-(jb.d-1));
  const days=[];let d=first;
  while(days.length<32&&jparts(d).m===jb.m){days.push(d);d=addDays(d,1)}
  const last=days[days.length-1];
  const prev=addDays(first,-1),next=addDays(last,1);
  const firstTask=S.tasks.reduce((m,t)=>(!m||t.date<m)?t.date:m,null);
  const floor=(firstTask&&firstTask<today)?firstTask:today;
  const showPrev=prev>=addDays(floor,-(jparts(floor).d-1));
  const showNext=monthHasTasks(next);
  let h=`<div class="mhead">
      ${showPrev?`<button class="mnav" data-act="mon" data-v="${prev}" data-id="0">›</button>`:'<span style="width:34px;flex:none"></span>'}
      <b>${JM[jb.m-1]} ${fa(jb.y)}</b>
      ${showNext?`<button class="mnav" data-act="mon" data-v="${next}" data-id="0">‹</button>`:'<span style="width:34px;flex:none"></span>'}
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

const dlabel=d=>{const t=TODAY();
  return d===t?'امروز':d===addDays(t,1)?'فردا':d===addDays(t,-1)?'دیروز':fa(WD[wdIndex(d)]+' '+jdate(d))};

function catView(){
  if(S.cat!==null&&S.cat!==undefined){
    const c=CATS[S.cat];
    const items=S.tasks.filter(t=>t.c===S.cat)
      .sort((a,b)=>((a.done?1:0)-(b.done?1:0))||(a.date<b.date?-1:a.date>b.date?1:0)||(a.s-b.s)||(a.p-b.p));
    let h=`<div class="mhead">
      <button class="mnav" data-act="cat" data-v="" data-id="0">›</button>
      <b style="display:flex;align-items:center;gap:8px">
        <span class="tile" style="width:28px;height:28px;border-radius:9px;color:${col(c.h)};background:${col(c.h,.13)}"><svg viewBox="0 0 24 24"><path d="${c.ic}"/></svg></span>
        ${c.name} — ${fa(items.length)} کار</b>
      <span style="width:34px;flex:none"></span></div>`;
    if(!items.length)h+='<div class="empty">در این دسته هنوز کاری ثبت نشده.</div>';
    else h+='<div class="list">'+items.map(t=>`<div class="drow"><span class="acc" style="background:${col(c.h)}"></span>
      <div style="flex:1;min-width:0" data-act="edit" data-id="${t.id}">
        <div class="t" ${t.done&&!t.rep?'style="text-decoration:line-through;color:#6E7179"':''}>${esc(t.title)}</div>
        <div class="m">${t.rep?t.rep+(t.until?' تا '+fa(jdate(t.until)):'')+' · از '+dlabel(t.date):dlabel(t.date)} · ${t.time?fa(t.time):SLOTS[t.s]} · ${PRI[t.p]}</div>
      </div></div>`).join('')+'</div>';
    return h;
  }
  let g='<div class="grid">'+CATS.map((c,i)=>{
    const n=S.tasks.filter(t=>t.c===i&&(t.rep||!t.done)).length;
    return `<div class="cat" data-act="cat" data-v="${i}" data-id="0"><div class="tile" style="color:${col(c.h)};background:${col(c.h,.13)}">
      <svg viewBox="0 0 24 24"><path d="${c.ic}"/></svg></div>
      <div class="n">${c.name}</div><div class="c">${n?fa(n)+' کار':'خالی'}</div></div>`;
  }).join('')+'</div>';
  return g;
}

/* ================= backup / restore ================= */
function doBackup(){
  const data={app:'karnama',v:2,at:new Date().toISOString(),tasks:S.tasks,learn:LEARN,study:STUDY};
  const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  const j=jparts(TODAY());
  a.href=url;a.download=`karnama-backup-${j.y}-${String(j.m).padStart(2,'0')}-${String(j.d).padStart(2,'0')}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
  toast('فایل پشتیبان ساخته شد.',3000);
}
function doRestore(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d||!Array.isArray(d.tasks))throw 0;
      if(!confirm(`این فایل ${d.tasks.length} کار دارد. جایگزین کارهای فعلی شود؟`))return;
      S.tasks=mergeSeries(d.tasks);
      if(d.learn&&typeof d.learn==='object'){LEARN=d.learn;saveLearn()}
      if(Array.isArray(d.study)){STUDY=d.study;saveStudy()}
      save();S.cat=null;render();
      toast('بازیابی شد.',3000);
    }catch(e){toast('این فایل پشتیبانِ کارنما نیست.',3500)}
  };
  r.readAsText(file);
}
const impEl=document.getElementById('imp');
if(impEl)impEl.onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)doRestore(f);e.target.value=''};

/* ================= capture sheet ================= */
const ov=document.getElementById('ov'),dr=document.getElementById('draft'),
      pv=document.getElementById('prev'),pc=document.getElementById('pvchips'),sb=document.getElementById('submit');

function openSheet(id){
  const t=id?byId(id):null;
  S.edit=t?t.id:null;
  document.getElementById('sh-title').textContent=t?'ویرایش کار':'چی تو ذهنته؟';
  sb.textContent=t?'ذخیره‌ی تغییرات':'بسپار به کارنما';
  document.getElementById('sh-del').style.display=t?'block':'none';
  if(t){dr.value=t.note||t.title;
    const auto=titleFrom(t.note||t.title);
    S.pv={c:t.c,s:t.s,p:t.p,rep:t.rep||null,until:t.until||null,date:t.date,time:t.time||null,
          title:t.title,titleManual:t.title!==auto,touched:true};}
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
  if(!S.pv)S.pv=Object.assign({touched:false,titleManual:false},classify(txt));
  else if(!S.pv.touched&&!S.edit){
    const keep=S.pv.titleManual?S.pv.title:null;
    S.pv=Object.assign({touched:false,titleManual:!!keep,title:keep},classify(txt));
  }
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
  tl.innerHTML=`<span>عنوان: </span><b>${esc(S.pv.titleManual&&S.pv.title?S.pv.title:titleFrom(txt))}</b><i>ویرایش</i>`;
  tl.onclick=()=>{
    const cur=S.pv.titleManual&&S.pv.title?S.pv.title:titleFrom(dr.value.trim());
    const v=prompt('عنوان کار:',cur);
    if(v&&v.trim()){S.pv.title=v.trim();S.pv.titleManual=true;S.pv.touched=true;updatePv()}
  };
}
dr.addEventListener('input',()=>updatePv());

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
    g.touched=true;pk.classList.remove('show');updatePv();
  });
  pk.classList.add('show');
}

/* --- how much did you read? (in-app, instead of prompt) --- */
function amountPicker(id){
  const p=studyById(id);if(!p)return;
  const max=studyRemaining(p);if(!max)return;
  const st=studyStats(p),unit=p.mode==='page'?'صفحه':'فصل';
  const vals=[];
  const push=n=>{n=Math.min(max,Math.round(n));if(n>0&&!vals.includes(n))vals.push(n)};
  if(st.target)push(st.target);
  [1,2,3,5,10,15,20,25,30,40,50,75,100].forEach(push);
  push(max);
  vals.sort((a,b)=>a-b);
  pkbx.innerHTML=`<h4>چقدر خواندی؟ (حداکثر ${fa(max)} ${unit})</h4>`+
    vals.map((n,i)=>`<button class="op" data-i="${i}">${fa(n)} ${unit}${n===st.target?' — سهمِ امروز':''}${n===max?' — تا آخر کتاب':''}</button>`).join('');
  pkbx.querySelectorAll('.op').forEach((b,i)=>b.onclick=()=>{
    pk.classList.remove('show');addStudyProgress(id,vals[i]);
  });
  pk.classList.add('show');
}

sb.onclick=()=>{
  const txt=dr.value.trim();if(!txt)return;
  const g=S.pv||Object.assign({titleManual:false},classify(txt));
  const ttl=(g.titleManual&&g.title)?g.title:titleFrom(txt);
  const today=TODAY();
  const dl=g.date===today?'امروز':g.date===addDays(today,1)?'فردا':fa(`${WD[wdIndex(g.date)]} ${jdate(g.date)}`);
  {const auto=classify(txt);if(g.c!==auto.c)learnCat(txt,g.c);}
  if(S.edit){
    const t=byId(S.edit);
    const changes={title:ttl,note:txt,c:g.c,p:g.p,s:g.s,date:g.date,rep:g.rep||null,until:g.rep?(g.until||null):null,time:g.time||null};
    if(duplicateOf(changes,S.edit)){toast('این کار قبلاً با همین روز و ساعت ثبت شده است.',4000);return}
    if(t)Object.assign(t,changes);
    save();closeSheet();S.day=g.date;S.pv=null;S.edit=null;dr.value='';render();
    toast('تغییرات ذخیره شد.',2600);
    return;
  }
  const newTask={id:Date.now(),title:ttl,note:txt,c:g.c,p:g.p,s:g.s,date:g.date,done:false,rep:g.rep||null,until:g.rep?(g.until||null):null,time:g.time||null,rem:g.p===0};
  if(duplicateOf(newTask)){toast('این کار قبلاً با همین روز و ساعت ثبت شده است.',4000);return}
  S.tasks.push(newTask);
  save();closeSheet();S.tab=g.date===addDays(today,1)?1:0;S.day=g.date;S.pv=null;dr.value='';render();
  toast(`اضافه شد به «${CATS[g.c].name}»${g.rep?' · '+g.rep+(g.until?' تا '+fa(jdate(g.until)):''):''} · پیشنهاد: ${dl} ${g.time?fa(g.time):SLOTS[g.s]}`);
};

document.getElementById('sh-del').onclick=()=>{
  if(!S.edit)return;
  const id=S.edit;S.edit=null;closeSheet();removeWithUndo(id);
};

document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{S.tab=+b.dataset.tab;if(S.tab===2)S.day=TODAY();if(S.tab===3){S.month=TODAY();S.day=TODAY()}if(S.tab===4)S.cat=null;render()});

const sideMenu=document.getElementById('side-menu'),menuBtn=document.getElementById('menu-btn');
function openMenu(){sideMenu.classList.add('show');sideMenu.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');document.body.classList.add('menu-open')}
function closeMenu(){sideMenu.classList.remove('show');sideMenu.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}
menuBtn.onclick=openMenu;
document.getElementById('menu-close').onclick=closeMenu;
sideMenu.querySelector('.side-scrim').onclick=closeMenu;
document.getElementById('menu-categories').onclick=()=>{S.tab=4;S.cat=null;closeMenu();render()};
document.getElementById('side-backup').onclick=()=>{closeMenu();doBackup()};
document.getElementById('side-restore').onclick=()=>{closeMenu();if(impEl)impEl.click()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sideMenu.classList.contains('show'))closeMenu()});

document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});

render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

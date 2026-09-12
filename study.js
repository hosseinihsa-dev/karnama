/* ===== برنامه مطالعه ===== */
const STUDY_KEY='karnama.study.v1';
let STUDY=(()=>{try{const x=JSON.parse(localStorage.getItem(STUDY_KEY));return Array.isArray(x)?x:[]}catch(e){return []}})();
const saveStudy=()=>{try{localStorage.setItem(STUDY_KEY,JSON.stringify(STUDY))}catch(e){}};
const studyById=id=>STUDY.find(p=>p.id===id);
const studyDone=p=>Object.values(p.logs||{}).reduce((a,n)=>a+(+n||0),0)+(p.initialDone||0);
const studyRemaining=p=>Math.max(0,p.total-studyDone(p));
const studyActive=(p,d)=>!p.paused&&(p.days||[0,1,2,3,4,5,6]).includes(wdIndex(d));
function studyDaysBetween(p,a,b){let n=0,d=a;while(d<=b){if(studyActive(p,d))n++;d=addDays(d,1)}return n}
function nextStudyDate(p,start,steps=0){let d=start,n=0;for(let i=0;i<740;i++,d=addDays(d,1)){if(studyActive(p,d)){if(n===steps)return d;n++}}return d}
function studyStats(p,d=TODAY()){
  const remaining=studyRemaining(p),doneToday=+(p.logs&&p.logs[d]||0),active=studyActive(p,d);
  let target=0,finish=p.endDate||d;
  if(p.paused)return {remaining,done:studyDone(p),doneToday,target,finish,pct:p.total?Math.min(100,Math.round(studyDone(p)/p.total*100)):0};
  if(p.mode==='page'){
    const future=studyDaysBetween(p,addDays(d,1),p.endDate);
    if(active&&d<=p.endDate){
      const share=Math.ceil((remaining+doneToday)/Math.max(1,future+1));
      target=Math.max(0,Math.min(remaining,share-doneToday));
    }
  }else{
    target=active?Math.max(0,Math.min(remaining,p.pace-doneToday)):0;
    const sessions=Math.ceil(remaining/Math.max(1,p.pace));
    finish=sessions?nextStudyDate(p,target?d:addDays(d,1),sessions-1):d;
  }
  return {remaining,done:studyDone(p),doneToday,target,finish,pct:p.total?Math.min(100,Math.round(studyDone(p)/p.total*100)):0};
}
const studyUnit=(p,n)=>`${fa(n)} ${p.mode==='page'?'صفحه':'فصل'}`;
function addStudyProgress(id,amount,date=TODAY()){
  const p=studyById(id);if(!p||amount<=0)return;
  const n=Math.min(studyRemaining(p),Math.max(0,Math.round(amount)));if(!n)return;
  p.logs=p.logs||{};p.logs[date]=(+p.logs[date]||0)+n;saveStudy();render();
  const st=studyStats(p,date);toast(st.remaining?`${studyUnit(p,n)} ثبت شد؛ ${studyUnit(p,st.remaining)} باقی مانده.`:`«${p.title}» تمام شد!`,3500);
}

function studyToday(d){
  const due=STUDY.filter(p=>studyRemaining(p)>0&&!p.paused&&studyActive(p,d));
  if(!due.length)return '';
  return `<div class="ghead"><b>مطالعه امروز</b><i></i><span>${fa(due.length)} کتاب</span></div>`+
    due.map(p=>studyCard(p,d,true)).join('');
}

function studyCard(p,d=TODAY(),today=false){
  const st=studyStats(p,d),unit=p.mode==='page'?'صفحه':'فصل',isCurrent=d===TODAY();
  const expired=p.mode==='page'&&st.remaining>0&&d>p.endDate;
  const first=st.done+1,last=Math.min(p.total,st.done+st.target);
  const range=p.mode==='page'?`صفحات ${fa(first)} تا ${fa(last)}`:(first===last?`فصل ${fa(first)}`:`فصل‌های ${fa(first)} تا ${fa(last)}`);
  const target=st.remaining===0?'تمام‌شده':p.paused?'متوقف شده':expired?'مهلت برنامه تمام شده است':(st.doneToday&&st.target)?`امروز ${studyUnit(p,st.doneToday)} خواندی — <strong>${range}</strong> مانده`:st.doneToday?`امروز ${studyUnit(p,st.doneToday)} خواندی — سهم امروز تمام شد`:st.target?`امروز <strong>${range}</strong> را بخوان`:'امروز روز مطالعه نیست';
  const displayFinish=p.mode==='chapter'?studyStats(p,TODAY()).finish:st.finish;
  return `<div class="study-card ${today?'today':''}"><div class="study-card-top"><div class="study-book"><b>${esc(p.title)}</b><span>${studyUnit(p,st.done)} از ${studyUnit(p,p.total)}</span></div><span class="study-pct">${fa(st.pct)}٪</span></div>
    <div class="track"><div class="fill" style="width:${st.pct}%"></div></div>
    <div class="study-target">${target}</div>
    <div class="study-meta"><span>${studyUnit(p,st.remaining)} باقی مانده</span><span>پایان: ${fa(jdate(displayFinish))}</span></div>
    ${isCurrent?`<div class="study-actions">${st.target?`<button class="b-gold" data-act="studyDone" data-id="${p.id}">مطالعه کردم</button>`:''}${expired?`<button class="b-gold" data-act="studyExtend" data-id="${p.id}">تمدید ۷ جلسه</button>`:''}<button class="b-nu" data-act="studyProgress" data-id="${p.id}">ثبت مقدار</button>${today?'':`<button class="b-nu" data-act="studyPause" data-id="${p.id}">${p.paused?'ادامه':'توقف'}</button><button class="study-danger" data-act="studyDelete" data-id="${p.id}">حذف</button>`}</div>`:''}</div>`;
}

function studyView(){
  let h=`<div class="study-head"><div><h2>برنامه‌های مطالعه</h2><div class="ov-note">برنامه هر روز با پیشرفتت تنظیم می‌شود.</div></div><button class="study-add" data-act="studyAdd" data-id="0">کتاب تازه</button></div>`;
  if(!STUDY.length)return h+'<div class="empty">هنوز برنامه‌ای نداری. اولین کتابت را اضافه کن.</div>';
  const active=STUDY.filter(p=>studyRemaining(p)>0),finished=STUDY.filter(p=>studyRemaining(p)===0);
  h+='<div class="list">'+active.map(p=>studyCard(p)).join('')+'</div>';
  if(finished.length)h+=`<div class="ghead"><b>تمام‌شده‌ها</b><i></i><span>${fa(finished.length)} کتاب</span></div><div class="list">${finished.map(p=>studyCard(p)).join('')}</div>`;
  return h;
}

function removeStudyWithUndo(id){
  const i=STUDY.findIndex(p=>p.id===id);if(i<0)return;const p=STUDY.splice(i,1)[0];saveStudy();render();
  toast('برنامه مطالعه حذف شد.',6000,'برگردان',()=>{STUDY.splice(Math.min(i,STUDY.length),0,p);saveStudy();render()});
}

/* ================= study capture ================= */
const studyOv=document.getElementById('study-ov'),studyMode=document.getElementById('study-mode');
const studyInputs=['study-name','study-total','study-start','study-pace'].map(id=>document.getElementById(id));
document.getElementById('study-day-list').innerHTML=WD.map((d,i)=>`<label><input type="checkbox" value="${i}" checked><span>${WDS[i]}</span></label>`).join('');
function selectedStudyDays(){return [...document.querySelectorAll('#study-day-list input:checked')].map(x=>+x.value)}
function resetStudyForm(){
  studyInputs[0].value='';studyInputs[1].value='';studyInputs[2].value='1';studyInputs[3].value='';studyMode.value='page';
  document.querySelectorAll('#study-day-list input').forEach(x=>x.checked=true);updateStudyForm();
}
function openStudySheet(){resetStudyForm();studyOv.classList.add('show');setTimeout(()=>studyInputs[0].focus(),50)}
function closeStudySheet(){studyOv.classList.remove('show')}
document.getElementById('study-scrim').onclick=closeStudySheet;
function studyDraft(){
  const mode=studyMode.value,total=+studyInputs[1].value,start=Math.max(1,+studyInputs[2].value||1),pace=+studyInputs[3].value,days=selectedStudyDays();
  return {mode,total,start,pace,days,title:studyInputs[0].value.trim()};
}
function updateStudyForm(){
  const chapter=studyMode.value==='chapter';
  document.getElementById('study-total-label').textContent=chapter?'تعداد کل فصل‌ها':'تعداد کل صفحات';
  document.getElementById('study-start-label').textContent=chapter?'شروع از فصل':'شروع از صفحه';
  document.getElementById('study-pace-label').textContent=chapter?'روزانه چند فصل؟':'چند روز فرصت داری؟';
  const x=studyDraft(),box=document.getElementById('study-preview');
  if(!x.total||!x.pace||x.start>x.total||!x.days.length){box.textContent='اطلاعات را کامل کن تا برنامه را ببینی.';return}
  const p={mode:x.mode,total:x.total,pace:x.pace,days:x.days,initialDone:x.start-1,logs:{},startDate:TODAY()};
  if(x.mode==='page'){
    p.endDate=nextStudyDate(p,TODAY(),x.pace-1);const daily=Math.ceil((x.total-x.start+1)/x.pace);
    box.innerHTML=`پیشنهاد: روزی حدود <b>${studyUnit(p,daily)}</b> · پایان ${fa(jdate(p.endDate))}`;
  }else{
    const sessions=Math.ceil((x.total-x.start+1)/x.pace),finish=nextStudyDate(p,TODAY(),sessions-1);
    box.innerHTML=`برنامه: روزی <b>${studyUnit(p,x.pace)}</b> · پایان تقریبی ${fa(jdate(finish))}`;
  }
}
studyMode.onchange=updateStudyForm;
studyInputs.forEach(x=>x.addEventListener('input',updateStudyForm));
document.getElementById('study-day-list').addEventListener('change',updateStudyForm);
document.getElementById('study-save').onclick=()=>{
  const x=studyDraft();
  if(!x.title||!x.total||!x.pace||x.start>x.total||!x.days.length){toast('نام کتاب و عددهای برنامه را درست وارد کن.',3500);return}
  const p={id:Date.now(),title:x.title,mode:x.mode,total:Math.round(x.total),pace:Math.round(x.pace),days:x.days,initialDone:x.start-1,logs:{},startDate:TODAY(),paused:false};
  if(x.mode==='page')p.endDate=nextStudyDate(p,TODAY(),p.pace-1);
  STUDY.push(p);saveStudy();closeStudySheet();S.tab=5;render();toast('برنامه مطالعه ساخته شد.',2800);
};

/* ===== برنامه مطالعه ===== */
const STUDY_KEY='karnama.study.v1';
let STUDY=(()=>{try{const x=JSON.parse(localStorage.getItem(STUDY_KEY));return Array.isArray(x)?x:[]}catch(e){return []}})();
const saveStudy=()=>{try{localStorage.setItem(STUDY_KEY,JSON.stringify(STUDY))}catch(e){}};
/* توقف از برنامه حذف شده؛ برنامه‌های قدیمیِ متوقف‌شده دوباره فعال می‌شوند. */
if(STUDY.some(p=>p.paused)){STUDY.forEach(p=>delete p.paused);saveStudy()}
const studyById=id=>STUDY.find(p=>p.id===id);
const studyDone=p=>Object.values(p.logs||{}).reduce((a,n)=>a+(+n||0),0)+(p.initialDone||0);
const studyRemaining=p=>Math.max(0,p.total-studyDone(p));
const studyActive=(p,d)=>(p.days||[0,1,2,3,4,5,6]).includes(wdIndex(d));
function studyDaysBetween(p,a,b){let n=0,d=a;while(d<=b){if(studyActive(p,d))n++;d=addDays(d,1)}return n}
function nextStudyDate(p,start,steps=0){let d=start,n=0;for(let i=0;i<740;i++,d=addDays(d,1)){if(studyActive(p,d)){if(n===steps)return d;n++}}return d}
function studyStats(p,d=TODAY()){
  const remaining=studyRemaining(p),doneToday=+(p.logs&&p.logs[d]||0),active=studyActive(p,d);
  let target=0,finish=p.endDate||d;
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
  const due=STUDY.filter(p=>{
    const st=studyStats(p,d),expired=p.mode==='page'&&st.remaining>0&&d>p.endDate;
    return st.remaining>0&&studyActive(p,d)&&(st.target>0||expired);
  });
  if(!due.length)return '';
  return `<div class="ghead"><b>مطالعه امروز</b><i></i><span>${fa(due.length)} کتاب</span></div>`+
    `<div class="study-strip">${due.map(p=>studyCard(p,d,true)).join('')}</div>`;
}

function studyCard(p,d=TODAY(),today=false){
  const st=studyStats(p,d),unit=p.mode==='page'?'صفحه':'فصل',isCurrent=d===TODAY();
  const expired=p.mode==='page'&&st.remaining>0&&d>p.endDate;
  const first=st.done+1,last=Math.min(p.total,st.done+st.target);
  const chapterNames=p.mode==='chapter'&&Array.isArray(p.chapterTitles)?p.chapterTitles.slice(first-1,last).filter(Boolean):[];
  const namedRange=chapterNames.length>3?chapterNames.slice(0,3).map(x=>`«${esc(x)}»`).join('، ')+` و ${fa(chapterNames.length-3)} فصل دیگر`:chapterNames.map(x=>`«${esc(x)}»`).join('، ');
  const range=p.mode==='page'?`صفحات ${fa(first)} تا ${fa(last)}`:(namedRange||(first===last?`فصل ${fa(first)}`:`فصل‌های ${fa(first)} تا ${fa(last)}`));
  const target=st.remaining===0?'تمام‌شده':expired?'مهلت برنامه تمام شده است':(st.doneToday&&st.target)?`امروز ${studyUnit(p,st.doneToday)} خواندی — <strong>${range}</strong> مانده`:st.doneToday?`امروز ${studyUnit(p,st.doneToday)} خواندی — سهم امروز تمام شد`:st.target?`امروز <strong>${range}</strong> را بخوان`:'امروز روز مطالعه نیست';
  const displayFinish=p.mode==='chapter'?studyStats(p,TODAY()).finish:st.finish;
  return `<div class="study-card ${today?'today':''}"><div class="study-card-top"><div class="study-book"><b>${esc(p.title)}</b><span>${studyUnit(p,st.done)} از ${studyUnit(p,p.total)}</span></div><span class="study-pct">${fa(st.pct)}٪</span></div>
    <div class="track"><div class="fill" style="width:${st.pct}%"></div></div>
    <div class="study-target">${target}</div>
    <div class="study-meta"><span>${studyUnit(p,st.remaining)} باقی مانده</span><span>پایان: ${fa(jdate(displayFinish))}</span></div>
    ${isCurrent?`<div class="study-actions">${st.target?`<button class="b-gold" data-act="studyDone" data-id="${p.id}">مطالعه کردم</button>`:''}${expired?`<button class="b-gold" data-act="studyExtend" data-id="${p.id}">تمدید ۷ جلسه</button>`:''}<button class="b-nu" data-act="studyProgress" data-id="${p.id}">ثبت مقدار</button>${today?'':`<button class="b-nu" data-act="studyEdit" data-id="${p.id}">ویرایش برنامه</button><button class="study-danger" data-act="studyDelete" data-id="${p.id}">حذف برنامه</button>`}</div>`:''}</div>`;
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
const studyOv=document.getElementById('study-ov'),studyMode=document.getElementById('study-mode'),studyPlanKind=document.getElementById('study-plan-kind');
const studyInputs=['study-name','study-total','study-start','study-pace'].map(id=>document.getElementById(id));
const studyChapterTitles=document.getElementById('study-chapter-titles');
const studySheetTitle=document.getElementById('study-sheet-title'),studySave=document.getElementById('study-save');
let STUDY_EDIT_ID=null;
const chapterTitles=()=>studyChapterTitles.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
document.getElementById('study-day-list').innerHTML=WD.map((d,i)=>`<label><input type="checkbox" value="${i}" checked><span>${WDS[i]}</span></label>`).join('');
function selectedStudyDays(){return [...document.querySelectorAll('#study-day-list input:checked')].map(x=>+x.value)}
function resetStudyForm(){
  studyInputs[0].value='';studyInputs[1].value='';studyInputs[1].readOnly=false;delete studyInputs[1].dataset.autoTotal;studyInputs[2].value='1';studyInputs[2].readOnly=false;studyInputs[3].value='';studyChapterTitles.value='';studyMode.value='page';studyPlanKind.value='deadline';
  document.querySelectorAll('#study-day-list input').forEach(x=>x.checked=true);updateStudyForm();
}
function openStudySheet(){STUDY_EDIT_ID=null;resetStudyForm();studySheetTitle.textContent='برنامه مطالعه تازه';studySave.textContent='ساخت برنامه';studyOv.classList.add('show');setTimeout(()=>studyInputs[0].focus(),50)}
function editStudySheet(id){
  const p=studyById(id);if(!p)return;
  STUDY_EDIT_ID=id;resetStudyForm();studySheetTitle.textContent='ویرایش برنامه مطالعه';studySave.textContent='ذخیره تغییرات';
  studyInputs[0].value=p.title;studyMode.value=p.mode;studyPlanKind.value=p.planKind||'deadline';studyInputs[1].value=p.total;
  studyInputs[2].value=Math.min(p.total,studyDone(p)+1);studyInputs[2].readOnly=true;studyInputs[3].value=p.pace;
  studyChapterTitles.value=Array.isArray(p.chapterTitles)?p.chapterTitles.join('\n'):'';
  document.querySelectorAll('#study-day-list input').forEach(x=>x.checked=(p.days||[0,1,2,3,4,5,6]).includes(+x.value));
  updateStudyForm();studyOv.classList.add('show');setTimeout(()=>studyInputs[0].focus(),50);
}
function closeStudySheet(){studyOv.classList.remove('show');STUDY_EDIT_ID=null}
document.getElementById('study-scrim').onclick=closeStudySheet;
function studyDraft(){
  const mode=studyMode.value,titles=mode==='chapter'?chapterTitles():[],total=titles.length||+studyInputs[1].value,start=Math.max(1,+studyInputs[2].value||1),pace=+studyInputs[3].value,days=selectedStudyDays();
  return {mode,planKind:mode==='page'?studyPlanKind.value:'daily',total,start,pace,days,title:studyInputs[0].value.trim(),chapterTitles:titles};
}
function updateStudyForm(){
  const chapter=studyMode.value==='chapter';
  const titles=chapter?chapterTitles():[];
  document.getElementById('study-plan-kind-field').style.display=chapter?'none':'flex';
  document.getElementById('study-chapter-titles-field').style.display=chapter?'flex':'none';
  if(titles.length){studyInputs[1].value=titles.length;studyInputs[1].readOnly=true;studyInputs[1].dataset.autoTotal='1'}
  else{if(studyInputs[1].dataset.autoTotal)studyInputs[1].value='';studyInputs[1].readOnly=false;delete studyInputs[1].dataset.autoTotal}
  document.getElementById('study-total-label').textContent=chapter?(titles.length?'تعداد فصل‌ها (خودکار)':'تعداد فصل‌ها'):'تعداد کل صفحات';
  document.getElementById('study-start-label').textContent=STUDY_EDIT_ID?(chapter?'فصل بعدی':'صفحه بعدی'):(chapter?'شروع از فصل':'شروع از صفحه');
  document.getElementById('study-pace-label').textContent=chapter?'روزانه چند فصل؟':studyPlanKind.value==='daily'?'روزانه چند صفحه؟':'چند روز فرصت داری؟';
  const x=studyDraft(),box=document.getElementById('study-preview');
  if(STUDY_EDIT_ID){const p=studyById(STUDY_EDIT_ID),done=p?studyDone(p):0;if(x.total&&x.total<done){box.innerHTML=`تا الان <b>${studyUnit(p,done)}</b> ثبت شده؛ تعداد کل باید حداقل ${fa(done)} باشد.`;box.classList.add('warn');return}}
  box.classList.remove('warn');
  if(!x.total||!x.pace||x.start>x.total||!x.days.length){box.textContent='اطلاعات را کامل کن تا برنامه را ببینی.';return}
  const p={mode:x.mode,total:x.total,pace:x.pace,days:x.days,initialDone:x.start-1,logs:{},startDate:TODAY()};
  if(x.mode==='page'){
    const remaining=x.total-x.start+1;
    const sessions=x.planKind==='daily'?Math.ceil(remaining/x.pace):x.pace;
    const daily=x.planKind==='daily'?Math.min(x.pace,remaining):Math.ceil(remaining/x.pace);
    p.endDate=nextStudyDate(p,TODAY(),sessions-1);
    box.innerHTML=`برنامه: روزی حدود <b>${studyUnit(p,daily)}</b> · پایان ${fa(jdate(p.endDate))} · ${fa(sessions)} جلسه مطالعه`;
  }else{
    const sessions=Math.ceil((x.total-x.start+1)/x.pace),finish=nextStudyDate(p,TODAY(),sessions-1);
    box.innerHTML=`برنامه: روزی <b>${studyUnit(p,x.pace)}</b> · پایان تقریبی ${fa(jdate(finish))}`;
  }
}
studyMode.onchange=updateStudyForm;
studyPlanKind.onchange=updateStudyForm;
studyInputs.forEach(x=>x.addEventListener('input',updateStudyForm));
studyChapterTitles.addEventListener('input',updateStudyForm);
document.getElementById('study-day-list').addEventListener('change',updateStudyForm);
studySave.onclick=()=>{
  const x=studyDraft();
  if(!x.title||!x.total||!x.pace||(!STUDY_EDIT_ID&&x.start>x.total)||!x.days.length){toast('نام کتاب و عددهای برنامه را درست وارد کن.',3500);return}
  if(STUDY_EDIT_ID){
    const p=studyById(STUDY_EDIT_ID);if(!p)return;
    const done=studyDone(p);if(x.total<done){toast(`تعداد کل نمی‌تواند از مقدار خوانده‌شده (${fa(done)}) کمتر باشد.`,4000);return}
    p.title=x.title;p.mode=x.mode;p.planKind=x.planKind;p.total=Math.round(x.total);p.pace=Math.round(x.pace);p.days=x.days;
    if(x.mode==='chapter'&&x.chapterTitles.length)p.chapterTitles=x.chapterTitles;else delete p.chapterTitles;
    if(x.mode==='page'){
      const remaining=Math.max(0,p.total-done),sessions=x.planKind==='daily'?Math.ceil(remaining/p.pace):p.pace;
      p.endDate=nextStudyDate(p,TODAY(),Math.max(0,sessions-1));
    }else delete p.endDate;
    saveStudy();closeStudySheet();S.tab=5;render();toast('تغییرات برنامه ذخیره شد.',2800);return;
  }
  const p={id:Date.now(),title:x.title,mode:x.mode,planKind:x.planKind,total:Math.round(x.total),pace:Math.round(x.pace),days:x.days,initialDone:x.start-1,logs:{},startDate:TODAY()};
  if(x.mode==='chapter'&&x.chapterTitles.length)p.chapterTitles=x.chapterTitles;
  if(x.mode==='page'){
    const remaining=p.total-p.initialDone;
    const sessions=x.planKind==='daily'?Math.ceil(remaining/p.pace):p.pace;
    p.endDate=nextStudyDate(p,TODAY(),sessions-1);
  }
  STUDY.push(p);saveStudy();closeStudySheet();S.tab=5;render();toast('برنامه مطالعه ساخته شد.',2800);
};

/* ===== نماها و رابط کاربری ===== */

function taskCard(t,i){
  return `<div class="task">
      <button class="box ${t.done?'on':''}" data-act="toggle" data-id="${t.id}" data-date="${t.key||t.date}">${t.done?'✓':''}</button>
      <div class="tmid"><div data-act="edit" data-id="${t.id}"><div class="ttl ${t.done?'done':''}">${esc(t.title)}${t.doseAll>1?` <span style="color:#8A8D95;font-weight:500">(نوبت ${fa(t.doseN)} از ${fa(t.doseAll)})</span>`:''}</div>${t.note&&t.note!==t.title?`<div class="note">${esc(t.note)}</div>`:''}</div><div class="chips">${taskChips(t)}</div></div>
      <span class="rank">${fa(String(i+1).padStart(2,'0'))}</span></div>`;
}
function advisorTaskPool(date=TODAY()){
  const tasks=[...S.tasks],now=new Date(),slot=slotOfTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
  (STUDY||[]).filter(p=>studyRemaining(p)>0&&studyActive(p,date)).forEach(p=>tasks.push({id:-Math.abs(+p.id||1),title:`مطالعه ${p.title}`,note:`برنامه مطالعه ${p.title}`,c:1,p:1,s:slot,date,done:false,rep:null,time:null,meta:{advisorStudy:true,studyId:p.id}}));
  return tasks;
}

/* ================= render ================= */
function render(){
  const today=TODAY();
  captureMissedDeadlineBehaviors(S.tasks,today);
  const overdue=S.tasks.filter(t=>!t.rep&&!t.done&&t.date<today).sort(bySlot);
  const list=instOn(today);
  const doneN=list.filter(t=>t.done).length;
  document.body.classList.toggle('advisor-mode',S.tab===0);
  const greetEl=document.getElementById('greet'),subEl=document.getElementById('sub');if(greetEl)greetEl.textContent=S.tab===0?'کارنما':S.tab===7?'کارها':'سلام! امروز مال توست';if(subEl)subEl.textContent=S.tab===0?fa(`${WD[wdIndex(today)]} ${jdate(today)}`):fa(`${list.length} کار برای امروز · ${doneN} انجام شده`);
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',+b.dataset.tab===S.tab));
  const v=document.getElementById('view');
  const pages={0:advisorHome,1:tomorrowView,2:weekView,3:monthView,4:catView,5:studyView,6:plannerPage,7:tasksView};
  v.innerHTML=(pages[S.tab]||advisorHome)(overdue,list,doneN,today);
  v.querySelectorAll('[data-act]').forEach(el=>{
    el.onclick=()=>{
      const id=+el.dataset.id,a=el.dataset.act;
      if(a==='toggle')toggle(id,el.dataset.date||TODAY());
      else if(a==='edit')openSheet(id);
      else if(a==='today'){const t=byId(id),from=t&&t.date;if(t)recordTaskPostponedBehavior(t,from,TODAY(),'rescheduled');patch(id,{date:TODAY()})}
      else if(a==='tomorrow'){const t=byId(id),to=addDays(TODAY(),1);if(t)recordTaskPostponedBehavior(t,t.date,to);patch(id,{date:to,moved:(byId(id).moved||0)+1})}
      else if(a==='done'){const t=byId(id);if(t)recordTaskCompletedBehavior(t,TODAY());patch(id,{date:TODAY(),done:true})}
      else if(a==='drop')removeWithUndo(id);
      else if(a==='allToday'){overdue.forEach(t=>{recordTaskPostponedBehavior(t,t.date,TODAY(),'rescheduled');t.date=TODAY()});save();render()}
      else if(a==='sort'){S.sort=+el.dataset.v;render()}
      else if(a==='day'){S.day=el.dataset.v;render()}
      else if(a==='mon'){S.month=el.dataset.v;render()}
      else if(a==='cat'){S.cat=el.dataset.v===''?null:+el.dataset.v;render()}
      else if(a==='backup')doBackup();
      else if(a==='restore'){const i=document.getElementById('imp');if(i)i.click()}
      else if(a==='studyAdd')openStudySheet();
      else if(a==='studyEdit')editStudySheet(id);
      else if(a==='studyDone'){const p=studyById(id),st=p&&studyStats(p);if(p&&st.target)addStudyProgress(id,st.target)}
      else if(a==='studyProgress')amountPicker(id);
      else if(a==='studyExtend'){const p=studyById(id);if(p){p.endDate=nextStudyDate(p,addDays(TODAY(),1),6);saveStudy();render();toast('مهلت مطالعه هفت جلسه تمدید شد.')}}
      else if(a==='studyDelete')removeStudyWithUndo(id);
      else if(a==='decisionStart'){
        const x=decisionCandidates(S.tab===0?advisorTaskPool():S.tasks,TODAY()).find(t=>t.id===id&&decisionKey(t)===(el.dataset.key||decisionKey(t)))||byId(id);
        if(x){recordDecisionEvent('start',x);toast(`«${x.title}» را شروع کردی؛ وقتی تمام شد تیک انجام را بزن.`,3500)}
      }
      else if(a==='decisionReject')decisionRejectPicker(id,el.dataset.key);
      else if(a==='decisionDone'){const x=decisionCandidates(S.tab===0?advisorTaskPool():S.tasks,TODAY()).find(t=>t.id===id&&decisionKey(t)===(el.dataset.key||decisionKey(t)))||byId(id);if(x&&x.meta&&x.meta.advisorStudy){const p=studyById(x.meta.studyId),st=p&&studyStats(p);if(p&&st.target)addStudyProgress(p.id,st.target)}else if(x)toggle(x.id,x.key||TODAY());toast('انجام شد؛ پیشنهاد بعدی را بررسی کردم.',2600)}
      else if(a==='taskMode'){S.taskMode=el.dataset.v;render()}
      else if(a==='planPreview'){S.planPreview=true;render()}
      else if(a==='planClose'){S.planPreview=false;S.tab=0;render()}
      else if(a==='planApprove'){approvePlan(list);S.planPreview=false;render();toast('برنامه امروز تأیید شد.',2800)}
    };
  });
  bindAdvisorChat();
}

function advisorHome(overdue,list,doneN,today){
  const x=chooseNextTask(advisorTaskPool(today),today),chat=(S.advisorChat||[]).slice(-6);
  if(x)recordSuggestedBehavior(x.task,x);
  const proposal=x?`<div class="advisor-proposal"><span>پیشنهاد الآن</span><h2>${esc(x.task.title)}</h2><p>${esc(x.reason)}</p><div><button data-act="decisionReject" data-id="${x.task.id}" data-key="${esc(decisionKey(x.task))}">الان نمی‌تونم</button><button class="primary" data-act="decisionStart" data-id="${x.task.id}" data-key="${esc(decisionKey(x.task))}">شروع می‌کنم</button></div></div>`:`<div class="advisor-proposal empty"><h2>فعلاً پیشنهاد مشخصی ندارم</h2><p>هر کاری توی ذهنت هست بنویس یا بگو.</p></div>`;
  return `<section class="coach-home"><div class="coach-glow"></div><div class="coach-orb"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M7 7c6 0 10 3 13 8 3-5 7-8 13-8v7c-6 0-9 4-9 10v10h-8V24c0-6-3-10-9-10z"/></svg></div><h2 class="coach-question">الان دوست داری<br>روی چی تمرکز کنیم؟</h2><div class="coach-hints"><button data-advisor-text="الان چیکار کنم؟">الان چیکار کنم؟</button><button data-advisor-text="یه کار سبک‌تر بده">یک کار سبک‌تر</button><button data-advisor-text="کارهای امروز رو بگو">کارهای امروز</button></div>${proposal}${chat.length?`<div class="advisor-messages">${chat.map(m=>`<div class="advisor-msg ${m.role}">${esc(m.text)}</div>`).join('')}</div>`:''}<div class="coach-compose"><button class="coach-plus" id="coach-plus" aria-label="افزودن کار با جزئیات">+</button><textarea id="advisor-input" rows="1" aria-label="پیام به کارنما" placeholder="هرچی توی ذهنته بنویس..."></textarea><button id="advisor-send" aria-label="فرستادن پیام"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><button id="advisor-voice" aria-label="گفت‌وگوی صوتی با کارنما"><svg viewBox="0 0 24 24" fill="none"><path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4m7-4a7 7 0 0 1-14 0m7 7v4m-4 0h8"/></svg></button></div></section><div id="voice-stage" class="voice-stage" aria-hidden="true"><div class="voice-stage-glow"></div><button id="voice-close" aria-label="بستن شنیدن صدا">×</button><span>کارنما گوش می‌دهد...</span><div class="voice-orb"></div><p id="voice-transcript">صحبت کن؛ اگر کار باشد خودکار ثبتش می‌کنم.</p><button id="voice-stop" aria-label="پایان ضبط"><svg viewBox="0 0 24 24" fill="none"><path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4m7-4a7 7 0 0 1-14 0m7 7v4"/></svg></button></div>`;
}

function tasksView(overdue,list,doneN,today){
  const modes=[['today','امروز'],['tomorrow','فردا'],['dates','تاریخ‌ها'],['done','انجام‌شده']];
  let h=`<div class="tasks-head"><div><span>مدیریت</span><h2>همه کارها</h2></div><button data-act="backup" data-id="0">پشتیبان</button></div><div class="task-modes">${modes.map(x=>`<button class="${S.taskMode===x[0]?'on':''}" data-act="taskMode" data-v="${x[0]}" data-id="0">${x[1]}</button>`).join('')}</div>`;
  if(S.taskMode==='tomorrow')return h+tomorrowView();
  if(S.taskMode==='dates')return h+monthView();
  if(S.taskMode==='done'){
    const done=S.tasks.filter(t=>!t.rep&&t.done).sort((a,b)=>b.date.localeCompare(a.date));
    return h+`<div class="list">${done.length?done.map((t,i)=>taskCard(Object.assign({},t,{done:true,key:t.date}),i)).join(''):'<div class="empty">هنوز کار انجام‌شده‌ای برای نمایش نیست.</div>'}</div>`;
  }
  const sorted=[...list].sort(bySlot);if(overdue.length)h+=`<div class="tasks-overdue-note">${fa(overdue.length)} کار عقب‌افتاده هم پایین فهرست امروز دیده می‌شود.</div>`;
  const combined=[...sorted,...overdue.filter(t=>!sorted.some(x=>x.id===t.id))];
  return h+`<div class="list">${combined.length?combined.map((t,i)=>taskCard(t,i)).join(''):'<div class="empty">امروز کاری ثبت نشده.</div>'}</div>`;
}

function todayView(overdue,list,doneN,today){
  let h=decisionPanel(today);
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
  h+=studyToday(today);
  return h;
}

function decisionPanel(today,x=chooseNextTask(S.tasks,today),advisor=false){
  if(!x)return `<section class="decision-card empty-decision ${advisor?'advisor-decision':''}"><div class="decision-kicker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3m-3 18h6"/></svg><span>الان چیکار کنم؟</span></div><p>فعلاً کار مشخصی ندارم که با اطمینان پیشنهاد بدهم.</p></section>`;
  const t=x.task,key=decisionKey(t),when=t.time?` · ${fa(t.time)}`:'';
  recordSuggestedBehavior(t,x);
  return `<section class="decision-card ${advisor?'advisor-decision':''}"><div class="decision-kicker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3m-3 18h6"/></svg><span>${advisor?'پیشنهاد من برای الآن':'الان چیکار کنم؟'}</span></div>
    <div class="decision-label">${advisor?'به نظرم الآن بهتره روی این تمرکز کنی':'پیشنهاد کارنما'}</div><h2>${esc(t.title)}</h2>
    <div class="decision-meta"><span>${CATS[t.c].name}${when}</span>${x.duration?`<span>${fa(x.duration)} دقیقه</span>`:''}</div>
    <p class="decision-reason">${esc(x.reason)}</p>
    <div class="decision-actions"><button class="decision-later" data-act="decisionReject" data-id="${t.id}" data-key="${esc(key)}">الان نمی‌تونم</button><button class="decision-start" data-act="decisionStart" data-id="${t.id}" data-key="${esc(key)}">شروع می‌کنم</button></div>
    ${advisor?`<button class="decision-done" data-act="decisionDone" data-id="${t.id}" data-key="${esc(key)}">این کار را انجام دادم</button>`:''}
    ${x.secondaryWarning?`<div class="decision-secondary"><b>برای بعد یادت باشد:</b> «${esc(x.secondaryWarning.task.title)}» مهم است، اما الآن ${esc(x.secondaryWarning.reason)}</div>`:''}
  </section>`;
}

function decisionRejectPicker(id,key){
  const t=decisionCandidates(S.tab===0?advisorTaskPool():S.tasks,TODAY()).find(x=>x.id===id&&decisionKey(x)===key)||byId(id);if(!t)return;
  pk._onDismiss=null;
  pk.classList.remove('cat-mode');pkbx.classList.remove('cat-mode');
  const reasons=[['no-time','وقت ندارم'],['no-energy','انرژی ندارم'],['blocked','شرایطش فراهم نیست'],['other','دلیل دیگر']];
  pkbx.innerHTML=`<h4>چرا الان نمی‌تونی؟</h4><div class="decision-reject-note">این بازخورد فقط برای بهترشدن پیشنهادهای بعدی روی همین دستگاه ذخیره می‌شود.</div>`+
    reasons.map((r,i)=>`<button class="op" data-i="${i}">${r[1]}</button>`).join('')+
    `<div class="decision-custom"><label for="decision-own-reason">دلیل خودم <span>اختیاری</span></label><textarea id="decision-own-reason" rows="3" placeholder="مثلاً: آتلیه الان بسته است"></textarea><button data-own-reason="1">ثبت دلیل من</button></div>`;
  const finish=(code,text='')=>{recordDecisionEvent('reject',t,{code,text:text.trim()||null});pk.classList.remove('show');render();toast('متوجه شدم؛ پیشنهاد بعدی را با این بازخورد بررسی کردم.',2800)};
  pkbx.querySelectorAll('.op').forEach((b,i)=>b.onclick=()=>finish(reasons[i][0]));
  pkbx.querySelector('[data-own-reason]').onclick=()=>{const input=pkbx.querySelector('#decision-own-reason');if(!input.value.trim()){toast('اگر خواستی دلیل خودت را بنویس؛ یا یکی از گزینه‌های بالا را بزن.',3000);input.focus();return}finish('custom',input.value)};
  pk.classList.add('show');
}

const ADVISOR_CHAT_KEY='karnama.advisor.chat.v1';let ACTIVE_SPEECH=null;
try{if(!S.advisorChat.length){const saved=JSON.parse(localStorage.getItem(ADVISOR_CHAT_KEY));if(Array.isArray(saved))S.advisorChat=saved.slice(-24)}}catch(e){}
function advisorSay(role,text){S.advisorChat=S.advisorChat||[];S.advisorChat.push({role,text,at:new Date().toISOString()});if(S.advisorChat.length>24)S.advisorChat=S.advisorChat.slice(-24);try{localStorage.setItem(ADVISOR_CHAT_KEY,JSON.stringify(S.advisorChat))}catch(e){}}
function advisorNextText(){const n=chooseNextTask(advisorTaskPool(),TODAY());return n?`پیشنهاد بعدی من «${n.task.title}» است؛ ${n.reason}.`:'فعلاً کار مشخص دیگری ندارم که با اطمینان پیشنهاد بدهم.'}
function advisorTaskReference(text,current){
  const n=norm(text),active=S.tasks.filter(t=>!t.done);if(/(?:این|همین|این یکی|همین یکی)s*(?:کار)?/.test(n)&&current)return current;
  const ignored=new Set(['نه','ولی','اما','به','نظرم','فکر','میکنم','می‌کنم','کار','اون','آن','این','خیلی','واقعا','واقعاً','مهم','مهمتره','مهم‌تره','اولویت','بالاتره','بالاتر','بیشتره','بیشتر','چون','رو','را']);
  const words=n.replace(/[؟?،,.؛:!]/g,' ').split(/\s+/).map(x=>x.replace(/‌/g,'')).filter(x=>x.length>1&&!ignored.has(x));
  let best=null,bestScore=0;for(const task of active){const hay=norm(`${task.title} ${task.note||''}`).replace(/‌/g,''),score=words.reduce((s,w)=>s+(hay.includes(w)?Math.max(2,w.length):0),0)+(words.length&&hay.includes(words.join(' '))?12:0);if(score>bestScore){best=task;bestScore=score}}
  return bestScore>=3?best:null;
}
function setExplicitTaskPriority(task,text,level='high'){
  task.p=level==='high'?0:2;task.meta=task.meta&&typeof task.meta==='object'?task.meta:{};task.meta.importance=level;task.meta.importanceReason=text;task.meta.explicitPriority={level,at:new Date().toISOString(),evidence:text,source:'explicit-chat'};
  const context=Object.assign({version:1},taskContext(task)||extractTaskContext(task.note||task.title,{date:task.date}));context.importance=contextFact(level==='high'?'important':'low',text,'explicit-chat',1);task.meta.context=updateContextUnknown(context);save();
}
function advisorPriorityReply(target){const next=chooseNextTask(advisorTaskPool(),TODAY()),state=assessNowFeasibility(target,{date:TODAY()});if(next&&next.task.id===target.id)return `«${target.title}» را با اولویت بالاتر ثبت کردم و حالا پیشنهاد اصلی من همین کار است.`;if(state.status!=='available')return `اولویت «${target.title}» را بالاتر ثبت کردم؛ اما الآن پیشنهاد اصلی‌اش نکردم، چون ${state.reason}. ${advisorNextText()}`;return `اولویت «${target.title}» را بالاتر ثبت کردم. ${advisorNextText()}`}
function advisorTaskIntent(text){
  const t=norm(text).trim();if(!t)return false;
  if(/[؟?]$/.test(t)||/^(چرا|چطور|چجوری|چی|چه |آیا|میشه|می‌شه|میتونی|می‌تونی|به نظرت|راهنمایی)/.test(t))return false;
  if(/^(سلام|خوبی|مرسی|ممنون|باشه|اوکی|نه|بله|آره)$/.test(t))return false;
  if(/چرا این|سبک.?تر|الان نمی.?تونم|بذار.*فردا|مهم نیست|انجامش دادم|انجام شد|تموم شد|چه کار/.test(t))return false;
  const action=/(?:باید|یادم بنداز|یادآوری|قرار دارم|جلسه دارم|وقت دارم|می.?خوام).+|(?:کنم|بکنم|بدم|بدهم|بگیرم|برم|بیام|بخرم|بخونم|بخوانم|ببینم|بنویسم|بفرستم|پرداخت کنم|تماس بگیرم|زنگ بزنم|رزرو کنم|تحویل بدم|تمام کنم)(?:\s|$)/;
  const schedule=/(امروز|فردا|پس.?فردا|امشب|صبح|ظهر|عصر|شب|شنبه|یک.?شنبه|دوشنبه|سه.?شنبه|چهار.?شنبه|پنج.?شنبه|جمعه|ساعت\s*[\d۰-۹]+)/;
  return action.test(t)||(schedule.test(t)&&/(جلسه|قرار|کلاس|دکتر|خرید|تماس|تحویل|ارسال|پرداخت|قبض|کتاب|مطالعه)/.test(t));
}
function addTaskFromAdvisor(text){
  const g=Object.assign({titleManual:false},classify(text)),title=titleFrom(text)||text.trim();if(g.c===11&&!/(ایده|فکر|شاید|یادداشت)/.test(text))g.c=12;
  const task={id:Date.now(),title,note:text.trim(),c:g.c,p:g.p,s:g.s,date:g.date,done:false,rep:g.rep||null,every:g.rep===REP_H?(g.every||8):null,until:g.rep?(g.until||null):null,time:g.time||null,rem:g.p===0,meta:Object.assign({},g.meta||{})};
  if(duplicateOf(task))return {duplicate:true,task};
  S.tasks.push(task);const question=detectImportantAmbiguity(task),entry=question?registerClarificationQuestion(task,question):null;save();return {task,question,entry};
}
function setChatPrerequisite(t,text){
  const base=byId(t.id);if(!base)return;const m=text.match(/(?:بدون|اول\s+باید)\s+(.+?)(?:\s+(?:نمی|نمیشه|نمی‌شه|انجام|باشه|بشه)|$)/),value=(m&&m[1]||text).trim();
  base.meta=base.meta&&typeof base.meta==='object'?base.meta:{};const context=Object.assign({version:1},taskContext(base)||extractTaskContext(base.note||base.title,{date:base.date}));context.prerequisite=contextFact(value,text,'explicit-chat',1);base.meta.context=updateContextUnknown(context);save();
}
function handleAdvisorMessage(raw){
  const text=raw.trim();if(!text)return;advisorSay('user',text);
  const before=chooseNextTask(advisorTaskPool(),TODAY()),current=before&&before.task&&byId(before.task.id);
  if(S.advisorPending&&S.advisorPending.kind==='priority-target'){
    const target=advisorTaskReference(text,current);S.advisorPending=null;if(target){setExplicitTaskPriority(target,text);advisorSay('assistant',advisorPriorityReply(target))}else advisorSay('assistant','هنوز نتوانستم کار موردنظرت را پیدا کنم؛ اسمش را دقیق‌تر بگو یا از بخش «کارها» انتخابش کن.');render();return
  }
  if(/(?:مهم.?تر|اولویت\s*(?:بالاتر|بیشتر)|بالاترین\s*اولویت)/.test(text)){
    const target=advisorTaskReference(text,current);if(target){setExplicitTaskPriority(target,text);advisorSay('assistant',advisorPriorityReply(target))}else{S.advisorPending={kind:'priority-target'};const names=S.tasks.filter(z=>!z.done).slice(0,3).map(z=>`«${z.title}»`).join('، ');advisorSay('assistant',`کدام کار را می‌گویی؟ اسمش را بگو${names?'؛ مثلاً '+names:''}.`)}render();return
  }
  if(/(?:این|همین).*(?:مهم نیست|کم.?اهمیت)|(?:مهم نیست|کم.?اهمیت).*(?:این|همین)/.test(text)&&current){setExplicitTaskPriority(current,text,'low');advisorSay('assistant',`اهمیت «${current.title}» را پایین‌تر ثبت کردم. ${advisorNextText()}`);render();return}
  if(advisorTaskIntent(text)){
    const made=addTaskFromAdvisor(text);if(made.duplicate)advisorSay('assistant',`«${made.task.title}» از قبل در کارهایت هست.`);else{const t=made.task,when=t.date===TODAY()?'امروز':t.date===addDays(TODAY(),1)?'فردا':fa(jdate(t.date));advisorSay('assistant',`فهمیدم که این یک کار است؛ «${t.title}» را برای ${when}${t.time?' ساعت '+fa(t.time):''} در «${CATS[t.c].name}» ثبت کردم.`)}render();return
  }
  const x=chooseNextTask(advisorTaskPool(),TODAY()),t=x&&x.task,base=t&&byId(t.id);if(!t){advisorSay('assistant','فعلاً پیشنهادی ندارم؛ اگر کاری در ذهنت هست طبیعی بنویس تا ثبتش کنم.');render();return}
  S.advisorContext={taskId:t.id,taskKey:decisionKey(t),at:new Date().toISOString()};
  if(/^(سلام|سلام خوبی|خوبی|چه خبر)/.test(norm(text))){advisorSay('assistant',`سلام. حواسم به کارهایت هست؛ الآن پیشنهادم «${t.title}» است. می‌خواهی دلیلش را بگویم یا گزینه دیگری پیدا کنم؟`);render();return}
  if(/^(مرسی|ممنون|دمت گرم|باشه ممنون)/.test(norm(text))){advisorSay('assistant','خواهش می‌کنم. هر تغییری در شرایطت پیش آمد همین‌جا بگو تا پیشنهاد را دوباره تنظیم کنم.');render();return}
  if(/^(نه|نه این نه|این نه|یکی دیگه|یه چیز دیگه|پس چی)/.test(norm(text))){recordDecisionEvent('reject',t,{code:'conversation-skip',text});advisorSay('assistant',`باشه، این گزینه را فعلاً کنار گذاشتم. ${advisorNextText()}`);render();return}
  if(/کارهای امروز|کارای امروز/.test(text)){const items=instOn(TODAY()).filter(z=>!z.done).slice(0,5);advisorSay('assistant',items.length?`امروز ${fa(items.length)} کار اولت این‌هاست: ${items.map(z=>`«${z.title}»`).join('، ')}${instOn(TODAY()).filter(z=>!z.done).length>5?' و چند کار دیگر.':'.'}`:'برای امروز کار انجام‌نشده‌ای نداری.');render();return}
  if(/کارهای فردا|کارای فردا|فردا چی دارم/.test(text)){const items=instOn(addDays(TODAY(),1)).filter(z=>!z.done).slice(0,5);advisorSay('assistant',items.length?`برای فردا این‌ها را داری: ${items.map(z=>`«${z.title}»`).join('، ')}.`:'برای فردا هنوز کاری ثبت نکرده‌ای.');render();return}
  if(/الان چیکار|چه کار.*انجام/.test(text)){advisorSay('assistant',`پیشنهاد من «${t.title}» است؛ ${x.reason}.`);render();return}
  if(t.meta&&t.meta.advisorStudy){
    if(/چرا|دلیل/.test(text))advisorSay('assistant',`دلیل پیشنهادم اینه که ${x.reason}.`);
    else if(/انجامش دادم|انجام شد|خوندم|خواندم/.test(text)){const p=studyById(t.meta.studyId),st=p&&studyStats(p);if(p&&st.target)addStudyProgress(p.id,st.target);advisorSay('assistant',`مطالعه امروز ثبت شد. ${advisorNextText()}`)}
    else if(/سبک|حوصله|انرژی|نمی.?تونم/.test(text)){recordDecisionEvent('reject',t,{code:'no-energy',text});advisorSay('assistant',advisorNextText())}
    else advisorSay('assistant','درباره این پیشنهاد می‌توانی دلیلش را بپرسی، بگویی امروز مطالعه کردی یا یک گزینه سبک‌تر بخواهی.');
    render();return
  }
  if(!base){advisorSay('assistant','این پیشنهاد از برنامه مطالعه آمده و ویرایشش از بخش «مطالعه» انجام می‌شود.');render();return}
  if(/چرا|دلیل/.test(text)){advisorSay('assistant',`دلیل پیشنهادم اینه که ${x.reason}.`);render();return}
  if(/بدون\s+.+(?:نمی|نمیشه|نمی‌شه)|اول\s+باید/.test(text)){
    setChatPrerequisite(t,text);recordDecisionEvent('reject',t,{code:'blocked',text});advisorSay('assistant',`این مانع را برای همین کار ثبت کردم. ${advisorNextText()}`);render();return
  }
  if(/(?:بذار|بزار|منتقل).*(?:فردا)|فردا.*(?:انجام|بذار|بزار)/.test(text)){
    const from=base.date,to=addDays(TODAY(),1);recordTaskPostponedBehavior(base,from,to);base.date=to;base.moved=(base.moved||0)+1;save();advisorSay('assistant',`«${base.title}» را برای فردا گذاشتم. ${advisorNextText()}`);render();return
  }
  if(/سبک|آسون|آسان|کوتاه/.test(text)){
    recordDecisionEvent('reject',t,{code:'lighter',text});advisorSay('assistant',advisorNextText());render();return
  }
  if(/حوصله|انرژی|خسته/.test(text)){
    recordDecisionEvent('reject',t,{code:'no-energy',text});advisorSay('assistant',`متوجه شدم. ${advisorNextText()}`);render();return
  }
  if(/(?:انجامش دادم|انجام شد|تموم شد|تمام شد)/.test(text)){
    if(base.rep){base.doneOn=base.doneOn||{};base.doneOn[t.key||TODAY()]=1}else base.done=true;recordTaskCompletedBehavior(base,t.key||TODAY());save();advisorSay('assistant',`ثبت شد. ${advisorNextText()}`);render();return
  }
  const moreImportant=text.match(/(?:پروژه|کار)?\s*([آ-ی‌]{2,}(?:\s+[آ-ی‌]{2,}){0,2})\s+مهم.?تر/);
  if(moreImportant){const needle=norm(moreImportant[1]),target=S.tasks.find(z=>z.id!==base.id&&norm(z.title).includes(needle));if(target){target.p=0;target.meta=target.meta&&typeof target.meta==='object'?target.meta:{};target.meta.importance='high';target.meta.importanceReason=text;if(/مهم نیست/.test(text))base.p=2;save();advisorSay('assistant',`اولویت «${target.title}» را بالاتر ثبت کردم. ${advisorNextText()}`);render();return}}
  if(/مهم نیست|کم.?اهمیت/.test(text)){
    base.p=2;base.meta=base.meta&&typeof base.meta==='object'?base.meta:{};base.meta.importance='low';base.meta.importanceReason=text;save();advisorSay('assistant',`اهمیت «${base.title}» را اصلاح کردم. ${advisorNextText()}`);render();return
  }
  if(/تا\s+(?:ظهر|عصر|شب)|فقط.*وقت/.test(text)){
    base.meta=base.meta&&typeof base.meta==='object'?base.meta:{};const context=Object.assign({version:1},taskContext(base)||extractTaskContext(base.note||base.title,{date:base.date}));context.timeConstraint=contextFact(text,text,'explicit-chat',1);base.meta.context=updateContextUnknown(context);save();advisorSay('assistant','این محدودیت زمانی را برای همین کار ثبت کردم و در تصمیم‌های بعدی در نظر می‌گیرم.');render();return
  }
  advisorSay('assistant',`من حرفت را به همین پیشنهاد ربط دادم، اما هنوز دقیق نفهمیدم چه تغییری می‌خواهی. می‌توانی مثلاً بگویی «چرا؟»، «این نه»، «بذارش فردا» یا اسم کار مهم‌تر را بگویی.`);render();
}
function bindAdvisorChat(){
  const input=document.getElementById('advisor-input'),send=document.getElementById('advisor-send'),voice=document.getElementById('advisor-voice'),plus=document.getElementById('coach-plus'),stage=document.getElementById('voice-stage');if(!input||!send)return;
  const submit=()=>{const text=input.value.trim();if(text)handleAdvisorMessage(text)};send.onclick=submit;input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit()}};
  if(plus)plus.onclick=()=>openSheet();
  document.querySelectorAll('[data-advisor-text]').forEach(b=>b.onclick=()=>handleAdvisorMessage(b.dataset.advisorText));
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!voice)return;
  voice.onclick=()=>{
    if(!SpeechRecognition){toast('این نسخه مرورگر تشخیص گفتار را پشتیبانی نمی‌کند؛ با Chrome به‌روز امتحان کن.',6000);return}
    if(ACTIVE_SPEECH){try{ACTIVE_SPEECH.abort()}catch(e){}ACTIVE_SPEECH=null}
    const rec=new SpeechRecognition(),out=document.getElementById('voice-transcript');let finalText='',started=false,errorShown=false;ACTIVE_SPEECH=rec;
    voice.disabled=true;voice.classList.add('listening');document.body.classList.add('voice-listening');if(stage){stage.classList.add('show');stage.setAttribute('aria-hidden','false')}if(out)out.textContent='در حال فعال‌کردن میکروفون...';
    const close=()=>{ACTIVE_SPEECH=null;voice.disabled=false;voice.classList.remove('listening');document.body.classList.remove('voice-listening');if(stage){stage.classList.remove('show');stage.setAttribute('aria-hidden','true')}};
    rec.lang='fa-IR';rec.interimResults=true;rec.continuous=false;
    rec.onstart=()=>{started=true;if(out)out.textContent='دارم گوش می‌دهم...'};
    const stop=()=>{try{rec.stop()}catch(e){close()}};const closeBtn=document.getElementById('voice-close'),stopBtn=document.getElementById('voice-stop');if(closeBtn)closeBtn.onclick=stop;if(stopBtn)stopBtn.onclick=stop;
    rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const part=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=part;else interim+=part}if(out)out.textContent=finalText||interim||'دارم گوش می‌دهم...'};
    rec.onerror=e=>{errorShown=true;const msg=e.error==='not-allowed'||e.error==='service-not-allowed'?'اجازه میکروفون بسته است. روی قفل کنار آدرس سایت بزن و Microphone را روی Allow بگذار.':e.error==='network'?'تشخیص گفتار Chrome به اینترنت وصل نشد. VPN را خاموش و روشن کن یا اتصال دیگری امتحان کن.':e.error==='audio-capture'?'میکروفون در دسترس نیست؛ برنامه‌های ضبط صدا یا تماس را ببند.':e.error==='language-not-supported'?'تشخیص فارسی روی این نسخه Chrome پشتیبانی نمی‌شود.':e.error==='no-speech'?'صدایی نشنیدم؛ دوباره بزن و بعد از بازشدن صفحه صحبت کن.':`خطای وویس: ${e.error||'نامشخص'}`;if(out)out.textContent=msg;toast(msg,7000);setTimeout(close,1800)};
    rec.onend=()=>{if(finalText.trim()){close();handleAdvisorMessage(finalText.trim())}else if(!errorShown){close();toast(started?'چیزی نشنیدم؛ دوباره امتحان کن.':'میکروفون شروع نشد؛ مجوز سایت را بررسی کن.',5000)}};
    try{rec.start()}catch(e){close();toast('میکروفون در حال استفاده است؛ چند لحظه دیگر دوباره امتحان کن.',4500)}
  };
}

function plannerPage(overdue,list,doneN,today){
  let h=`<div class="mhead">
      <button class="mnav" data-act="planClose" data-id="0">›</button>
      <b>برنامه‌ی پیشنهادی امروز</b>
      <span style="width:34px;flex:none"></span></div>`;
  const body=plannerView(list,today);
  return h+(body||'<div class="empty">امروز کار فعالی نداری که برایش برنامه بچینم.</div>');
}

function plannerView(list,d){
  const plan=dailyPlan(list),now=new Date(),nowMin=now.getHours()*60+now.getMinutes(),approved=approvedPlan(list);
  if(!plan.length)return '';
  const overflow=plan.filter(x=>x.overflow).length,collision=plan.filter(x=>x.collision).length;
  let h=`<section class="planner ${approved?'approved':''}"><div class="planner-head"><div><b>${approved?'برنامه تأییدشده':'پیش‌نمایش'}</b><span>کارهای ساعت‌دار ثابت‌اند؛ بقیه در زمان‌های خالی چیده شده‌اند.</span></div><em>${fa(plan.length)} بخش</em></div>`;
  if(overflow||collision)h+=`<div class="planner-warn">${collision?fa(collision)+' تداخل زمانی':''}${collision&&overflow?' · ':''}${overflow?fa(overflow)+' کار بیرون از بازه معمول':''} — برای سبک‌تر شدن روز، زمان یا روز یکی از کارها را تغییر بده.</div>`;
  h+='<div class="timeline">';
  plan.forEach(x=>{
    const live=d===TODAY()&&nowMin>=x.start&&nowMin<x.end;
    h+=`<div class="plan-row ${live?'live':''} ${x.overflow||x.collision?'risk':''}">
      <div class="plan-time"><b>${clock(x.start)}</b><span>${fa(x.duration)} دقیقه</span></div>
      <i class="plan-line"><u></u></i>
      <div class="plan-item"><button class="box" data-act="toggle" data-id="${x.t.id}" data-date="${x.t.key||d}" aria-label="انجام شد"></button>
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
  const books=STUDY.filter(p=>studyRemaining(p)>0&&studyActive(p,d));
  if(books.length)h+=`<div class="ghead"><b>مطالعه</b><i></i><span>${fa(books.length)} کتاب</span></div><div class="study-strip">${books.map(p=>studyCard(p,d)).join('')}</div>`;
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
  const books=STUDY.filter(p=>studyRemaining(p)>0&&studyActive(p,d));
  let h=`<div class="dayhead">${fa(WD[wdIndex(d)]+' '+jdate(d))} — ${fa(dt.length)} کار${books.length?' · '+fa(books.length)+' مطالعه':''}</div>`;
  if(books.length)h+=`<div class="study-strip">${books.map(p=>studyCard(p,d)).join('')}</div>`;
  if(!dt.length&&!books.length)return h+'<div class="empty">این روز خالیه. یک روز آزاد هم لازمه.</div>';
  if(!dt.length)return h;
  return h+'<div class="list">'+dt.map(t=>`<div class="drow"><span class="acc" style="background:${col(CATS[t.c].h)}"></span>
    <div style="flex:1;min-width:0" data-act="edit" data-id="${t.id}"><div class="t">${esc(t.title)}</div>
    <div class="m">${CATS[t.c].name} · ${t.time?fa(t.time):SLOTS[t.s]} · ${PRI[t.p]}${t.rep?' · '+repLabel(t):''}</div></div></div>`).join('')+'</div>';
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
        <div class="m">${t.rep?repLabel(t)+(t.until?' تا '+fa(jdate(t.until)):'')+' · از '+dlabel(t.date):dlabel(t.date)} · ${t.time?fa(t.time):SLOTS[t.s]} · ${PRI[t.p]}</div>
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
  const data={app:'karnama',v:7,at:new Date().toISOString(),tasks:S.tasks,learn:LEARN,study:STUDY,decision:DECISION,userMemory:USER_MEMORY,behavior:BEHAVIOR,advisorChat:S.advisorChat||[]};
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
      if(d.decision&&typeof d.decision==='object')restoreDecision(d.decision);
      if(d.userMemory&&typeof d.userMemory==='object')restoreUserMemory(d.userMemory);
      if(d.behavior&&typeof d.behavior==='object')restoreBehavior(d.behavior);
      if(Array.isArray(d.advisorChat)){S.advisorChat=d.advisorChat.slice(-24);try{localStorage.setItem(ADVISOR_CHAT_KEY,JSON.stringify(S.advisorChat))}catch(e){}}
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
    S.pv={c:t.c,s:t.s,p:t.p,rep:t.rep||null,every:t.every||null,until:t.until||null,date:t.date,time:t.time||null,
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
    `<button class="chip c-inf" data-f="rep">${g.rep?repLabel(g):'بدون تکرار'}</button>`+
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

/* ورود صوتی فقط متن را پر می‌کند؛ تحلیل و ذخیره دقیقاً همان مسیر ورود متنی است. */
const mic=document.getElementById('voice-input');
if(mic){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){mic.classList.add('unsupported');mic.title='تشخیص گفتار در این مرورگر پشتیبانی نمی‌شود'}
  else{
    let rec=null;
    mic.onclick=()=>{
      if(rec){try{rec.stop()}catch(e){}return}
      rec=new SpeechRecognition();rec.lang='fa-IR';rec.interimResults=false;rec.maxAlternatives=1;
      mic.classList.add('listening');mic.setAttribute('aria-label','پایان ورود صوتی');
      rec.onresult=e=>{const text=e.results&&e.results[0]&&e.results[0][0]&&e.results[0][0].transcript;if(text){dr.value=(dr.value.trim()?dr.value.trim()+' ': '')+text.trim();updatePv()}};
      rec.onerror=e=>{if(e.error!=='aborted')toast(e.error==='not-allowed'?'اجازه میکروفون داده نشد؛ همچنان می‌توانی تایپ کنی.':'صدا تشخیص داده نشد؛ دوباره امتحان کن یا تایپ کن.',3500)};
      rec.onend=()=>{rec=null;mic.classList.remove('listening');mic.setAttribute('aria-label','ورود صوتی کار')};
      try{rec.start()}catch(e){rec=null;mic.classList.remove('listening');toast('میکروفون شروع نشد؛ ورود متنی همچنان در دسترس است.',3500)}
    };
  }
}

/* --- picker --- */
const pk=document.getElementById('pick'),pkbx=pk.querySelector('.bx');
pk.querySelector('.bd').onclick=()=>{if(typeof pk._onDismiss==='function')pk._onDismiss();pk._onDismiss=null;pk.classList.remove('show');pkbx.classList.remove('memory-box')};
function picker(f){
  pk._onDismiss=null;
  pkbx.classList.remove('memory-box');
  const g=S.pv,today=TODAY();
  pk.classList.toggle('cat-mode',f==='c');
  pkbx.classList.toggle('cat-mode',f==='c');
  if(f==='date'||f==='until'){calAnchor=null;calPicker(f);return}
  let title,opts;
  if(f==='c'){
    pkbx.innerHTML=`<h4>دسته را انتخاب کن</h4><div class="cat-picker">${CATS.map((c,i)=>
      `<button class="cat-choice ${i===g.c?'on':''}" data-i="${i}" style="--cat-color:${col(c.h)};--cat-bg:${col(c.h,.13)}" aria-label="${c.name}">
        <span class="cat-choice-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${c.ic}"/></svg></span>
        <span>${c.name}</span>
      </button>`).join('')}</div>`;
    pkbx.querySelectorAll('.cat-choice').forEach(b=>b.onclick=()=>{
      g.c=+b.dataset.i;g.touched=true;pk.classList.remove('show');updatePv();
    });
    pk.classList.add('show');return;
  }
  else if(f==='s'){title='زمان روز';opts=SLOTS.map((s,i)=>({v:i,l:s,on:i===g.s}))}
  else if(f==='p'){title='اولویت';opts=PRI.map((s,i)=>({v:i,l:s,on:i===g.p}))}
  else if(f==='rep'){title='تکرار';opts=REPS.map((r,i)=>({v:i,l:r===REP_H?`هر چند ساعت یک‌بار (مثل دارو)`:(r||'بدون تکرار'),on:(g.rep||null)===r}))}
  else if(f==='every'){title='هر چند ساعت یک‌بار؟';
        opts=EVERY_OPTS.map(n=>({v:n,l:`هر ${fa(n)} ساعت — روزی ${fa(Math.round(24/n))} نوبت`,on:(g.every||8)===n}))}
  else if(f==='time'){
    pkbx.innerHTML=`<h4>ساعت دقیق</h4><div class="time-exact">
      <label for="exact-time">ساعت و دقیقه را انتخاب کن</label>
      <input id="exact-time" type="time" step="60" value="${g.time||''}">
      <div><button class="b-nu" data-no-time="1">بدون ساعت</button><button class="b-gold" data-save-time="1">تأیید ساعت</button></div>
    </div>`;
    const input=pkbx.querySelector('#exact-time');
    pkbx.querySelector('[data-no-time]').onclick=()=>{g.time=null;g.touched=true;pk.classList.remove('show');updatePv()};
    pkbx.querySelector('[data-save-time]').onclick=()=>{
      if(!input.value){toast('ساعت و دقیقه را انتخاب کن.',2500);return}
      g.time=input.value;const hh=+g.time.split(':')[0];g.s=hh<12?0:(hh<18?1:2);
      g.touched=true;pk.classList.remove('show');updatePv();
    };
    pk.classList.add('show');setTimeout(()=>input.focus(),40);return;
  }
  else{title='روز';opts=[];for(let i=0;i<15;i++){const d=addDays(today,i);
        opts.push({v:d,l:i===0?'امروز':i===1?'فردا':fa(`${WD[wdIndex(d)]} ${jdate(d)}`),on:d===g.date})}}
  pkbx.innerHTML=`<h4>${title}</h4>`+opts.map((o,i)=>
    `<button class="op ${o.on?'on':''}" data-i="${i}">${o.color?`<span class="d5" style="width:7px;height:7px;border-radius:99px;background:${o.color}"></span>`:''}${o.l}</button>`).join('');
  pkbx.querySelectorAll('.op').forEach((b,i)=>b.onclick=()=>{
    const val=opts[i].v;
    if(f==='rep'){
      g.rep=REPS[val];
      if(g.rep===REP_H){if(!g.every)g.every=8;g.touched=true;updatePv();return picker('every')}
    }
    else if(f==='every')g.every=val;
    else g[f]=val;
    g.touched=true;pk.classList.remove('show');updatePv();
  });
  pk.classList.add('show');
}

/* --- pick an exact day from a Jalali calendar --- */
let calAnchor=null;
function calPicker(f){
  const g=S.pv,today=TODAY();
  const cur=(f==='until'?g.until:g.date)||today;
  if(!calAnchor)calAnchor=cur;
  const jb=jparts(calAnchor);
  const first=addDays(calAnchor,-(jb.d-1));
  const days=[];let d=first;
  while(days.length<32&&jparts(d).m===jb.m){days.push(d);d=addDays(d,1)}
  const prev=addDays(first,-1),next=addDays(days[days.length-1],1);
  const endWeek=addDays(weekStart(today),6),nextWeek=addDays(endWeek,1);
  const quick=f==='date'?`<div class="date-quick">
      <button data-quick="${today}" class="${cur===today?'on':''}">امروز</button>
      <button data-quick="${addDays(today,1)}" class="${cur===addDays(today,1)?'on':''}">فردا</button>
      <button data-quick="${endWeek}" class="${cur===endWeek?'on':''}">آخر این هفته</button>
      <button data-quick="${nextWeek}" class="${cur===nextWeek?'on':''}">شنبه آینده</button>
    </div>`:`<div class="date-quick one"><button data-no-end="1" class="${!g.until?'on':''}">بدون پایان؛ همیشه تکرار شود</button></div>`;
  let h=`<h4>${f==='until'?'تکرار تا کدام روز؟':'کار برای کدام روز؟'}</h4>${quick}
    <div class="mhead" style="margin:2px 0 6px">
      <button class="mnav" data-cal="${prev}">›</button>
      <b>${JM[jb.m-1]} ${fa(jb.y)}</b>
      <button class="mnav" data-cal="${next}">‹</button>
    </div><div class="mgrid">`+WDS.map(w=>`<div class="mwd">${w}</div>`).join('');
  for(let i=0;i<wdIndex(first);i++)h+='<div class="mcell blank"></div>';
  days.forEach(x=>{
    h+=`<button class="mcell ${x===cur?'on':''} ${x===today?'today':''}" data-pick="${x}"><span>${fa(jparts(x).d)}</span></button>`;
  });
  h+='</div>';
  pkbx.innerHTML=h;
  pkbx.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{
    g.date=b.dataset.quick;g.touched=true;calAnchor=null;pk.classList.remove('show');updatePv();
  });
  const noEnd=pkbx.querySelector('[data-no-end]');
  if(noEnd)noEnd.onclick=()=>{g.until=null;g.touched=true;calAnchor=null;pk.classList.remove('show');updatePv()};
  pkbx.querySelectorAll('[data-cal]').forEach(b=>b.onclick=()=>{calAnchor=b.dataset.cal;calPicker(f)});
  pkbx.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
    const v=b.dataset.pick;
    if(f==='until')g.until=v;else g.date=v;
    g.touched=true;calAnchor=null;pk.classList.remove('show');updatePv();
  });
  pk.classList.add('show');
}

/* --- how much did you read? (in-app, instead of prompt) --- */
function amountPicker(id){
  pk._onDismiss=null;
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

function clarificationPicker(t,q,entry){
  if(!t||!q||!entry)return;
  pkbx.classList.remove('memory-box');
  const dismiss=()=>{if(skipClarification(t,entry.id)){save();toast('کار ثبت شد؛ فعلاً بدون پاسخ ادامه می‌دهیم.',2600)}};
  pk.classList.remove('cat-mode');pkbx.classList.remove('cat-mode');pk._onDismiss=dismiss;
  pkbx.innerHTML=`<div class="clarify-kicker">یک سؤال کوتاه و اختیاری</div><h4>${esc(q.question)}</h4><div class="clarify-note">کار همین حالا ثبت شده؛ پاسخ فقط کمک می‌کند پیشنهادهای همین کار دقیق‌تر شوند.</div>
    <textarea id="clarify-answer" rows="3" placeholder="${esc(q.placeholder||'پاسخت را کوتاه بنویس')}"></textarea>
    <div class="clarify-actions"><button data-clarify-skip="1">فعلاً نه</button><button data-clarify-save="1">ثبت پاسخ</button></div>`;
  const input=pkbx.querySelector('#clarify-answer');
  pkbx.querySelector('[data-clarify-skip]').onclick=()=>{pk._onDismiss=null;dismiss();pk.classList.remove('show')};
  pkbx.querySelector('[data-clarify-save]').onclick=()=>{
    if(!input.value.trim()){toast('یک پاسخ کوتاه بنویس یا «فعلاً نه» را بزن.',2600);input.focus();return}
    if(answerClarification(t,entry.id,input.value)){save();pk._onDismiss=null;pk.classList.remove('show');render();toast('پاسخ به زمینه همین کار اضافه شد.',2800)}
  };
  pk.classList.add('show');setTimeout(()=>input.focus(),80);
}

function userMemoryPicker(){
  pk._onDismiss=null;pk.classList.remove('cat-mode');pkbx.classList.remove('cat-mode');pkbx.classList.add('memory-box');
  const items=activeUserMemories().sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  pkbx.innerHTML=`<div class="memory-head"><div><div class="clarify-kicker">حافظه محلی و خصوصی</div><h4>چیزهایی که کارنما درباره من یاد گرفته</h4></div><span>${fa(items.length)} مورد</span></div>
    <div class="memory-note">این اطلاعات فقط روی همین دستگاه است و برای بهترشدن پیشنهادها استفاده می‌شود.</div>
    <div class="memory-list">${items.length?items.map(m=>`<div class="memory-item"><div><span class="memory-source ${m.source}">${m.source==='explicit'?'خودت گفتی':'از چند رفتار مشابه'}</span><b>${esc(m.label)}</b><small>${m.source==='inferred'?`اطمینان ${fa(Math.round((m.confidence||0)*100))}٪ · ${fa(m.support||0)} شاهد`:'اطلاعات صریح با اعتبار بالا'}</small></div><button data-memory-delete="${esc(m.id)}" aria-label="حذف این حافظه">حذف</button></div>`).join(''):'<div class="memory-empty">هنوز الگوی قابل اتکایی یاد نگرفته‌ام.</div>'}</div>
    <button class="memory-close" data-memory-close="1">بستن</button>`;
  pkbx.querySelectorAll('[data-memory-delete]').forEach(b=>b.onclick=()=>{if(deleteUserMemory(b.dataset.memoryDelete)){userMemoryPicker();toast('این حافظه حذف شد؛ کارها و تاریخچه تغییری نکردند.',2800)}});
  pkbx.querySelector('[data-memory-close]').onclick=()=>{pk.classList.remove('show');pkbx.classList.remove('memory-box')};
  pk.classList.add('show');
}

sb.onclick=()=>{
  const txt=dr.value.trim();if(!txt)return;
  const g=S.pv||Object.assign({titleManual:false},classify(txt));
  const ttl=(g.titleManual&&g.title)?g.title:titleFrom(txt);
  const today=TODAY();
  const dl=g.date===today?'امروز':g.date===addDays(today,1)?'فردا':fa(`${WD[wdIndex(g.date)]} ${jdate(g.date)}`);
  const analyzed=classify(txt);if(g.c!==analyzed.c)learnCat(txt,g.c);
  if(S.edit){
    const t=byId(S.edit);
    const changes={title:ttl,note:txt,c:g.c,p:g.p,s:g.s,date:g.date,rep:g.rep||null,every:g.rep===REP_H?(g.every||8):null,until:g.rep?(g.until||null):null,time:g.time||null,meta:Object.assign({},t&&t.meta||{},g.meta||{},analyzed.meta||{})};
    if(duplicateOf(changes,S.edit)){toast('این کار قبلاً با همین روز و ساعت ثبت شده است.',4000);return}
    const oldDate=t&&t.date;if(t)Object.assign(t,changes);
    if(t&&oldDate!==t.date)recordTaskPostponedBehavior(t,oldDate,t.date,t.date>oldDate?'postponed':'rescheduled');
    const question=t?detectImportantAmbiguity(t):null,entry=t&&question?registerClarificationQuestion(t,question):null;
    save();closeSheet();S.day=g.date;S.pv=null;S.edit=null;dr.value='';render();
    if(entry)setTimeout(()=>clarificationPicker(t,question,entry),80);else toast('تغییرات ذخیره شد.',2600);
    return;
  }
  const newTask={id:Date.now(),title:ttl,note:txt,c:g.c,p:g.p,s:g.s,date:g.date,done:false,rep:g.rep||null,every:g.rep===REP_H?(g.every||8):null,until:g.rep?(g.until||null):null,time:g.time||null,rem:g.p===0,meta:Object.assign({},g.meta||{},analyzed.meta||{})};
  if(duplicateOf(newTask)){toast('این کار قبلاً با همین روز و ساعت ثبت شده است.',4000);return}
  S.tasks.push(newTask);
  const question=detectImportantAmbiguity(newTask),entry=question?registerClarificationQuestion(newTask,question):null;
  save();closeSheet();S.tab=0;S.day=g.date;S.pv=null;dr.value='';render();
  if(entry)setTimeout(()=>clarificationPicker(newTask,question,entry),80);
  else toast(`اضافه شد به «${CATS[g.c].name}»${g.rep?' · '+repLabel(g)+(g.until?' تا '+fa(jdate(g.until)):''):''} · پیشنهاد: ${dl} ${g.time?fa(g.time):SLOTS[g.s]}`);
};

document.getElementById('sh-del').onclick=()=>{
  if(!S.edit)return;
  const id=S.edit;S.edit=null;closeSheet();removeWithUndo(id);
};

document.querySelectorAll('nav button[data-tab]').forEach(b=>b.onclick=()=>{S.tab=+b.dataset.tab;if(S.tab===7&&!S.taskMode)S.taskMode='today';if(S.tab===3){S.month=TODAY();S.day=TODAY()}if(S.tab===4)S.cat=null;render()});

const sideMenu=document.getElementById('side-menu'),menuBtn=document.getElementById('menu-btn');
function openMenu(){sideMenu.classList.add('show');sideMenu.setAttribute('aria-hidden','false');menuBtn.setAttribute('aria-expanded','true');document.body.classList.add('menu-open')}
function closeMenu(){sideMenu.classList.remove('show');sideMenu.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}
menuBtn.onclick=openMenu;
document.getElementById('menu-close').onclick=closeMenu;
sideMenu.querySelector('.side-scrim').onclick=closeMenu;
document.getElementById('menu-advisor').onclick=()=>{S.tab=0;closeMenu();render()};
document.getElementById('menu-tasks').onclick=()=>{S.tab=7;S.taskMode=S.taskMode||'today';closeMenu();render()};
document.getElementById('menu-new-task').onclick=()=>{closeMenu();openSheet()};
document.getElementById('menu-study').onclick=()=>{S.tab=5;closeMenu();render()};
document.getElementById('menu-categories').onclick=()=>{S.tab=4;S.cat=null;closeMenu();render()};
document.getElementById('menu-week').onclick=()=>{S.tab=7;S.taskMode='dates';S.day=TODAY();S.month=TODAY();closeMenu();render()};
document.getElementById('menu-planner').onclick=()=>{S.tab=6;S.planPreview=true;closeMenu();render()};
document.getElementById('menu-memory').onclick=()=>{closeMenu();userMemoryPicker()};
document.getElementById('side-backup').onclick=()=>{closeMenu();doBackup()};
document.getElementById('side-restore').onclick=()=>{closeMenu();if(impEl)impEl.click()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sideMenu.classList.contains('show'))closeMenu()});

document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});

render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

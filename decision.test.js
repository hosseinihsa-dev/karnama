const fs=require('fs'),vm=require('vm'),assert=require('assert');
const mem={};
global.localStorage={getItem:k=>mem[k]||null,setItem:(k,v)=>{mem[k]=String(v)}};
const source=fs.readFileSync('core.js','utf8')+'\n'+fs.readFileSync('decision.js','utf8')+`\n;globalThis.api={TODAY,addDays,classify,titleFrom,decisionCandidates,evaluateDecisionTask,chooseNextTask,recordDecisionEvent,restoreDecision,setTasks:x=>S.tasks=x,getDecision:()=>DECISION,reset:()=>{DECISION={feedback:[],history:[],context:{}}}};`;
vm.runInThisContext(source,{filename:'decision-bundle.js'});
const A=global.api,D=A.TODAY();let id=100;
const task=(x={})=>Object.assign({id:id++,title:'کار آزمایشی',note:'',c:12,p:1,s:1,date:D,done:false,rep:null,time:null},x);
const pick=(tasks,now=10*60)=>{A.setTasks(tasks);return A.chooseNextTask(tasks,D,now)};

/* ۱۵ سناریوی کاربر: عادی، عقب‌افتاده، ساعت‌دار، تکراری، انجام‌شده و داده قدیمی */
A.reset();
let t=task({title:'کار امروز'});assert.equal(pick([t]).task.id,t.id,'۱: کار امروز پیشنهاد شود');
let late=task({title:'کار عقب‌افتاده',date:A.addDays(D,-3),p:0});assert.equal(pick([t,late]).task.id,late.id,'۲: عقب‌افتاده مهم مقدم باشد');
let future=task({title:'قرار ساعت ۲۳',time:'23:00',p:0});assert.equal(pick([future],10*60),null,'۳: کار ساعت‌دار آینده زود پیشنهاد نشود');
let due=task({title:'قرار ساعت ۹',time:'09:00'});assert.equal(pick([due],10*60).task.id,due.id,'۴: موعد رسیده پیشنهاد شود');
let done=task({title:'انجام‌شده',done:true});assert.equal(pick([done]),null,'۵: انجام‌شده حذف شود');
let tomorrow=task({title:'ارسال فوری فردا',date:A.addDays(D,1),p:0});assert.equal(pick([tomorrow]).task.id,tomorrow.id,'۶: کار مهم فردا دیده شود');
let ordinaryTomorrow=task({title:'کار معمولی فردا',date:A.addDays(D,1),p:1});assert.equal(pick([ordinaryTomorrow]),null,'۷: کار معمولی فردا پیشنهاد زودهنگام نشود');
let daily=task({title:'ورزش روزانه',rep:'هر روز',date:A.addDays(D,-4)});assert.equal(pick([daily]).task.id,daily.id,'۸: تکرار روزانه معتبر باشد');
let weekly=task({title:'کار هفتگی',rep:'هر هفته',date:A.addDays(D,-1)});assert.equal(pick([weekly]),null,'۹: تکرار هفتگی در روز نامعتبر ظاهر نشود');
let old=task({title:'داده نسخه قدیمی'});delete old.meta;assert.doesNotThrow(()=>pick([old]),'۱۰: داده نسخه قدیمی بدون meta امن باشد');
let short=task({title:'کار کوتاه',meta:{durationMin:15}}),long=task({title:'کار بلند',meta:{durationMin:120}});assert.equal(pick([short,long]).task.id,short.id,'۱۱: در شرایط برابر کار کوتاه‌تر ترجیح داده شود');
let urgent=task({title:'کار فوری',meta:{urgency:'high',urgencyReason:'فوری ثبت شده'}});assert.equal(pick([short,urgent]).task.id,urgent.id,'۱۲: فوریت ذخیره‌شده اثر کند');
A.reset();let first=task({title:'گزینه اول',p:0}),second=task({title:'گزینه دوم'});assert.equal(pick([first,second]).task.id,first.id);A.recordDecisionEvent('reject',first,'no-time');assert.equal(pick([first,second]).task.id,second.id,'۱۳: رد پیشنهاد باعث چرخش شود');
A.reset();let repeated=task({title:'دارو',rep:'هر چند ساعت',every:8,time:'08:00',date:A.addDays(D,-1)});let doses=A.decisionCandidates([repeated],D,17*60);assert.ok(doses.some(x=>x.time==='00:00')&&doses.some(x=>x.time==='08:00')&&doses.some(x=>x.time==='16:00')&&!doses.some(x=>x.time==='23:00'),'۱۴: فقط نوبت‌های رسیده چندساعته نمایش داده شوند');
let reason=A.evaluateDecisionTask(late,D,10*60).reason;assert.ok(reason.includes('عقب افتاده')&&reason.includes('اولویت'),'۱۵: دلیل قابل فهم ساخته شود');

let shop=task({title:'رفتن به فروشگاه',note:'امشب حتماً به فروشگاه بروم',c:3,p:0}),report=task({title:'نوشتن گزارش',note:'گزارش پروژه را بنویسم',c:4,p:1}),study=task({title:'مطالعه کتاب',c:1,p:1});assert.notEqual(pick([shop,report,study],3*60+30).task.id,shop.id,'۱۶: فروشگاه نیمه‌شب پیشنهاد نشود');
let call=task({title:'تماس با آقای رضایی',note:'با آقای رضایی تماس بگیرم',c:0,p:0});assert.equal(pick([call],3*60+30),null,'۱۷: تماس با شخص نیمه‌شب پیشنهاد نشود');
assert.equal(A.evaluateDecisionTask(task({title:'کار بدون مدت'}),D,10*60).duration,null,'۱۸: مدت ساختگی ساخته نشود');
assert.equal(A.evaluateDecisionTask(task({title:'کار بیست دقیقه‌ای',meta:{durationMin:20}}),D,10*60).duration,20,'۱۹: مدت ثبت‌شده حفظ شود');
assert.equal(A.classify('هر ۸ ساعت قرص بخورم از ساعت ۸ صبح').meta.durationMin,undefined,'۲۰: فاصله تکرار به‌جای مدت کار ثبت نشود');
assert.equal(A.titleFrom('فردا حتماً با آقای رضایی تماس بگیرم و درباره مبلغ نهایی قرارداد سایت صحبت کنم'),'تماس با آقای رضایی درباره قرارداد سایت','۲۱: عنوان عملیاتی کوتاه استخراج شود');
assert.equal(A.titleFrom('خرید نان'),'خرید نان','۲۲: عنوان کوتاه سالم حفظ شود');
A.reset();let studio=task({title:'گرفتن عکس از آتلیه',note:'عکس‌ها را از آتلیه بگیرم',c:12});A.recordDecisionEvent('reject',studio,{code:'custom',text:'آتلیه الان بسته است.'});assert.equal(A.getDecision().feedback[0].detail.text,'آتلیه الان بسته است.','۲۳: دلیل شخصی همراه کار ذخیره شود');
let similarStudio=task({title:'تحویل عکس از آتلیه',note:'عکس‌ها را از آتلیه تحویل بگیرم',c:12}),plain=task({title:'مرتب کردن یادداشت‌ها',c:11});assert.equal(pick([similarStudio,plain],19*60).task.id,plain.id,'۲۴: بازخورد مشابه به‌صورت نرم در پیشنهاد بعدی اثر کند');
let restored={feedback:[{at:new Date().toISOString(),date:D,kind:'reject',taskId:999,taskKey:'999@x',detail:'no-time'}],history:[],context:{}};assert.doesNotThrow(()=>A.restoreDecision(restored),'۲۵: دلیل رد نسخه قبلی مهاجرت امن داشته باشد');

console.log('۲۵ سناریوی تصمیم، عنوان و مهاجرت با موفقیت گذشت.');

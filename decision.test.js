const fs=require('fs'),vm=require('vm'),assert=require('assert');
const mem={};
global.localStorage={getItem:k=>mem[k]||null,setItem:(k,v)=>{mem[k]=String(v)}};
const source=fs.readFileSync('core.js','utf8')+'\n'+fs.readFileSync('memory.js','utf8')+'\n'+fs.readFileSync('decision.js','utf8')+'\n'+fs.readFileSync('clarify.js','utf8')+`\n;globalThis.api={TODAY,addDays,classify,extractTaskContext,titleFrom,contextPrioritySignals,detectImportantAmbiguity,registerClarificationQuestion,answerClarification,skipClarification,decisionNowMinutes,assessNowFeasibility,partitionDecisionCandidates,decisionCandidates,evaluateDecisionTask,chooseNextTask,recordDecisionEvent,restoreDecision,observeUserMemoryEvent,observeExplicitMemoryText,userMemorySignal,activeUserMemories,deleteUserMemory,restoreUserMemory,setTasks:x=>S.tasks=x,getTasks:()=>S.tasks,getMemory:()=>USER_MEMORY,getDecision:()=>DECISION,reset:()=>{DECISION={feedback:[],history:[],context:{}};restoreUserMemory({version:1,items:[],evidence:[]})}};`;
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

let shop=task({title:'رفتن به فروشگاه',note:'امشب حتماً به فروشگاه بروم',c:3,p:0}),report=task({title:'نوشتن گزارش',note:'گزارش پروژه را بنویسم',c:4,p:1}),files=task({title:'مرتب‌کردن فایل‌ها',c:12,p:1});assert.notEqual(pick([shop,report,files],3*60+30).task.id,shop.id,'۱۶: فروشگاه نیمه‌شب پیشنهاد نشود');
let call=task({title:'تماس با مشتری',note:'با مشتری تماس بگیرم',c:0,p:0});assert.equal(pick([call],3*60+30),null,'۱۷: تماس با شخص نیمه‌شب پیشنهاد نشود');
assert.equal(A.evaluateDecisionTask(task({title:'کار بدون مدت'}),D,10*60).duration,null,'۱۸: مدت ساختگی ساخته نشود');
assert.equal(A.evaluateDecisionTask(task({title:'کار بیست دقیقه‌ای',meta:{durationMin:20}}),D,10*60).duration,20,'۱۹: مدت ثبت‌شده حفظ شود');
assert.equal(A.classify('هر ۸ ساعت قرص بخورم از ساعت ۸ صبح').meta.durationMin,undefined,'۲۰: فاصله تکرار به‌جای مدت کار ثبت نشود');
assert.equal(A.titleFrom('فردا حتماً با آقای رضایی تماس بگیرم و درباره مبلغ نهایی قرارداد سایت صحبت کنم'),'تماس با آقای رضایی درباره قرارداد سایت','۲۱: عنوان عملیاتی کوتاه استخراج شود');
assert.equal(A.titleFrom('خرید نان'),'خرید نان','۲۲: عنوان کوتاه سالم حفظ شود');
A.reset();let studio=task({title:'گرفتن عکس از آتلیه',note:'عکس‌ها را از آتلیه بگیرم',c:12});A.recordDecisionEvent('reject',studio,{code:'custom',text:'آتلیه الان بسته است.'});assert.equal(A.getDecision().feedback[0].detail.text,'آتلیه الان بسته است.','۲۳: دلیل شخصی همراه کار ذخیره شود');
let similarStudio=task({title:'تحویل عکس از آتلیه',note:'عکس‌ها را از آتلیه تحویل بگیرم',c:12}),plain=task({title:'مرتب کردن یادداشت‌ها',c:11});assert.equal(pick([similarStudio,plain],19*60).task.id,plain.id,'۲۴: گزینه قابل‌انجام بر گزینه نامشخص مقدم باشد');
let restored={feedback:[{at:new Date().toISOString(),date:D,kind:'reject',taskId:999,taskKey:'999@x',detail:'no-time'}],history:[],context:{}};assert.doesNotThrow(()=>A.restoreDecision(restored),'۲۵: دلیل رد نسخه قبلی مهاجرت امن داشته باشد');

assert.equal(A.assessNowFeasibility(studio,{date:D,nowMin:3*60+30}).status,'blocked','۲۶: آتلیه در ساعت نامتعارف فعلاً قابل انجام نباشد');
assert.equal(A.assessNowFeasibility(studio,{date:D,nowMin:11*60}).status,'unknown','۲۷: آتلیه در روز بدون حدس ساعت کاری نامشخص باشد');
assert.equal(A.assessNowFeasibility(report,{date:D,nowMin:3*60+30}).status,'available','۲۸: نوشتن گزارش در شب حذف نشود');
assert.equal(A.assessNowFeasibility(files,{date:D,nowMin:3*60+30}).status,'available','۲۹: مرتب‌کردن فایل‌ها در شب حذف نشود');
let explicitNow=task({title:'گرفتن عکس از آتلیه',note:'رفتن به آتلیه',time:'03:00',c:12});assert.equal(A.assessNowFeasibility(explicitNow,{date:D,nowMin:3*60+30}).status,'available','۳۰: ساعت صریح کاربر بر قاعده شب مقدم باشد');
let explicitFuture=task({title:'کار ساعت چهار',time:'04:00'});let futureState=A.assessNowFeasibility(explicitFuture,{date:D,nowMin:3*60+30});assert.equal(futureState.status,'blocked','۳۱: ساعت صریح آینده هنوز قابل انجام نباشد');assert.equal(futureState.source,'explicit-time','۳۲: دلیل کنارگذاری به شکل داده نگه داشته شود');
let vague=task({title:'یک کار نامشخص',c:12});assert.equal(A.assessNowFeasibility(vague,{date:D,nowMin:12*60}).status,'unknown','۳۳: کمبود داده به‌جای غیرممکن، نامشخص باشد');assert.equal(pick([vague],12*60).task.id,vague.id,'۳۴: کار نامشخص در نبود گزینه مطمئن حذف نشود');
let groups=A.partitionDecisionCandidates([studio,report,vague],D,3*60+30);assert.ok(groups.blocked.some(x=>x.task.id===studio.id)&&groups.available.some(x=>x.task.id===report.id)&&groups.unknown.some(x=>x.task.id===vague.id),'۳۵: سه وضعیت داخلی مستقل تفکیک شوند');
let legacy=task({title:'کار قدیمی'});delete legacy.note;delete legacy.meta;assert.doesNotThrow(()=>A.assessNowFeasibility(legacy,{date:D,nowMin:12*60}),'۳۶: کار قدیمی بدون فیلد جدید خراب نشود');

let customer=A.classify('تا فردا گزارش رو بفرستم چون مشتری منتظره').meta.context;assert.ok(customer.deadline&&customer.commitment&&customer.dependency,'۳۷: ددلاین و تعهد و وابستگی صریح استخراج شوند');assert.equal(customer.delayConsequence,null,'۳۸: پیامد بدون شاهد ساخته نشود');
let book=A.classify('این هفته کتاب بخونم').meta.context;assert.ok(!book.deadline&&!book.delayConsequence&&!book.commitment&&!book.dependency,'۳۹: مطالعه عادی Context ساختگی نگیرد');
let designText='تا پنجشنبه طرح سایت رو تموم کنم چون برنامه‌نویس منتظره وگرنه پروژه عقب میفته',designParsed=A.classify(designText),design=designParsed.meta.context;assert.equal(A.titleFrom(designText),'تکمیل طرح سایت','۴۰: عنوان کوتاه عملیاتی استخراج شود');assert.ok(design.deadline&&design.dependency&&design.delayConsequence,'۴۱: زمینه واقعی طرح استخراج شود');assert.equal(design.dependency.source,'inferred','۴۲: استنباط سیستم از گفته صریح تفکیک شود');assert.ok(design.dependency.evidence.includes('برنامه‌نویس منتظره'),'۴۳: شاهد متن حفظ شود');
let photo=A.classify('عکس‌های محمد رو از آتلیه بگیر').meta.context;assert.ok(!photo.deadline&&!photo.delayConsequence&&!photo.opportunity&&!photo.commitment&&!photo.dependency&&!photo.importance,'۴۴: برای آتلیه اهمیت یا پیامد اختراع نشود');
let contextual=task({title:'ارسال گزارش',note:'تا فردا گزارش رو بفرستم چون مشتری منتظره',c:4,p:1,date:D,meta:{context:customer}}),ordinary=task({title:'مرتب کردن فایل‌ها',c:12,p:1,date:D});assert.equal(pick([ordinary,contextual],12*60).task.id,contextual.id,'۴۵: Context واقعی بین اولویت‌های یکسان تفاوت ایجاد کند');
let blockedImportant=task({title:'عکس‌های محمد را از آتلیه بگیر',note:'تا فردا عکس‌ها را از آتلیه بگیرم وگرنه پروژه عقب میفته',c:3,p:0,meta:{context:A.classify('تا فردا عکس‌ها را از آتلیه بگیرم وگرنه پروژه عقب میفته').meta.context}});assert.equal(pick([blockedImportant,ordinary],3*60+30).task.id,ordinary.id,'۴۶: اهمیت بالا فیلتر امکان‌پذیری را دور نزند');
assert.doesNotThrow(()=>A.evaluateDecisionTask(legacy,D,12*60),'۴۷: کار قدیمی بدون Context همچنان امتیاز بگیرد');
let backed=JSON.parse(JSON.stringify({tasks:[contextual]}));assert.equal(backed.tasks[0].meta.context.commitment.evidence,customer.commitment.evidence,'۴۸: Context در JSON پشتیبان حفظ شود');
let explained=A.evaluateDecisionTask(contextual,D,12*60).reason;assert.ok(explained.includes('فردا')&&explained.includes('وابسته'),'۴۹: دلیل پیشنهاد به داده واقعی تکیه کند');

let bread=task({title:'خرید نان',note:'خرید نان',c:3,meta:A.classify('خرید نان').meta});assert.equal(A.detectImportantAmbiguity(bread),null,'۵۰: کار ساده سؤال غیرضروری نگیرد');
let vagueDesign=task({title:'انجام طرح سایت',note:'طرح سایت رو انجام بدم',c:4,meta:A.classify('طرح سایت رو انجام بدم').meta}),dq=A.detectImportantAmbiguity(vagueDesign);assert.equal(dq.type,'deadline','۵۱: ابهام تعیین‌کننده طرح به سؤال مهلت تبدیل شود');
let talk=task({title:'صحبت با علی درباره پروژه',note:'با علی درباره پروژه صحبت کنم',c:0,meta:A.classify('با علی درباره پروژه صحبت کنم').meta}),tq=A.detectImportantAmbiguity(talk);assert.equal(tq.type,'timing','۵۲: گفت‌وگوی مبهم فقط سؤال زمان بگیرد');
assert.equal(A.detectImportantAmbiguity(contextual),null,'۵۳: کار دارای ددلاین و وابستگی سؤال تکمیلی نگیرد');
let dEntry=A.registerClarificationQuestion(vagueDesign,dq);assert.ok(dEntry&&vagueDesign.clarification.history.length===1,'۵۴: فقط یک سؤال در سابقه ثبت شود');assert.equal(A.detectImportantAmbiguity(vagueDesign),null,'۵۵: همان سؤال دوباره مطرح نشود');
let answerDate=A.addDays(D,1);assert.ok(A.answerClarification(vagueDesign,dEntry.id,'تا فردا'),'۵۶: پاسخ اختیاری به کار متصل شود');assert.equal(vagueDesign.meta.context.deadline.value,answerDate,'۵۷: پاسخ ددلاین Context را به‌روزرسانی کند');assert.equal(vagueDesign.meta.context.deadline.source,'explicit-answer','۵۸: پاسخ صریح از استنباط تفکیک شود');
let talkEntry=A.registerClarificationQuestion(talk,tq);assert.ok(A.skipClarification(talk,talkEntry.id),'۵۹: گزینه فعلاً نه سؤال را رد کند');assert.equal(talk.clarification.history[0].status,'skipped','۶۰: رد سؤال ذخیره شود');assert.equal(A.detectImportantAmbiguity(talk),null,'۶۱: سؤال ردشده بی‌دلیل تکرار نشود');
let noAnswer=task({title:'طرح تازه',note:'طرح تازه پروژه را انجام بدم',c:4,meta:A.classify('طرح تازه پروژه را انجام بدم').meta}),nq=A.detectImportantAmbiguity(noAnswer),ne=A.registerClarificationQuestion(noAnswer,nq);assert.ok(ne&&noAnswer.title==='طرح تازه','۶۲: سؤال مانع ثبت یا تغییر کار نشود');
let oldClarify=task({title:'کار قدیمی',note:'کار قدیمی'});delete oldClarify.clarification;assert.doesNotThrow(()=>A.detectImportantAmbiguity(oldClarify),'۶۳: نبود تاریخچه در داده قدیمی امن باشد');
let clarifyBackup=JSON.parse(JSON.stringify({tasks:[vagueDesign,talk]}));assert.equal(clarifyBackup.tasks[0].clarification.history[0].status,'answered','۶۴: پاسخ در JSON پشتیبان حفظ شود');assert.equal(clarifyBackup.tasks[1].clarification.history[0].status,'skipped','۶۵: رد سؤال در JSON پشتیبان حفظ شود');

A.reset();let nightCall=task({title:'تماس کاری با مشتری',note:'با مشتری تماس کاری بگیرم',c:0});
A.observeUserMemoryEvent('reject',nightCall,{code:'no-energy',text:'امشب خسته‌ام'},23*60);assert.equal(A.activeUserMemories().length,0,'۶۶: یک دلیل موقت قانون دائمی نسازد');
A.observeUserMemoryEvent('reject',nightCall,{code:'blocked'},23*60);A.observeUserMemoryEvent('reject',task({title:'تماس با همکار',c:0}),{code:'no-time'},23*60);assert.equal(A.activeUserMemories().length,0,'۶۷: کمتر از سه شاهد مشابه حافظه استنباطی نسازد');
A.observeUserMemoryEvent('reject',task({title:'زنگ به مشتری',c:0}),{code:'blocked'},23*60);let inferred=A.activeUserMemories()[0];assert.ok(inferred&&inferred.source==='inferred'&&inferred.support===3,'۶۸: سه رفتار مشابه حافظه استنباطی بسازد');assert.equal(A.userMemorySignal(nightCall,23*60).hard,false,'۶۹: حافظه استنباطی قانون قطعی نباشد');
let beforeConfidence=inferred.confidence;A.observeUserMemoryEvent('start',nightCall,{},23*60);assert.ok(inferred.confidence<beforeConfidence&&inferred.contradictions===1,'۷۰: رفتار متناقض اعتبار الگوی استنباطی را کم کند');
let explicit=A.observeExplicitMemoryText('من شب‌ها تماس کاری انجام نمی‌دم',nightCall);assert.ok(explicit&&explicit.source==='explicit'&&explicit.confidence===1,'۷۱: گفته صریح با اعتبار بالاتر ذخیره شود');assert.equal(inferred.active,false,'۷۲: گفته صریح جدیدتر حافظه استنباطی هم‌موضوع را کنار بزند');assert.equal(A.userMemorySignal(nightCall,23*60).hard,true,'۷۳: فقط محدودیت صریح بتواند مانع قطعی شود');
let timedCall=task({title:'تماس کاری ساعت ۲۳',c:0,time:'23:00'});assert.equal(A.assessNowFeasibility(timedCall,{date:D,nowMin:23*60+5}).status,'available','۷۴: ساعت صریح همان کار بر حافظه عمومی مقدم باشد');
A.setTasks([nightCall,timedCall]);assert.ok(A.deleteUserMemory(explicit.id),'۷۵: کاربر بتواند حافظه اشتباه را حذف کند');assert.equal(A.getTasks().length,2,'۷۶: حذف حافظه هیچ Taskی را حذف نکند');
let memoryBackup=JSON.parse(JSON.stringify({userMemory:A.getMemory()}));assert.ok(memoryBackup.userMemory.evidence.length>=5,'۷۷: شواهد حافظه در پشتیبان JSON حفظ شوند');assert.doesNotThrow(()=>A.restoreUserMemory(undefined),'۷۸: داده قدیمی بدون User Memory سالم بارگذاری شود');
A.reset();let designStart=task({title:'طراحی صفحه اصلی',c:4});A.observeUserMemoryEvent('start',designStart,{},9*60);A.observeUserMemoryEvent('start',designStart,{},9*60);A.observeUserMemoryEvent('start',designStart,{},9*60);let preference=A.activeUserMemories()[0];assert.ok(preference&&preference.rule==='prefer'&&A.userMemorySignal(designStart,9*60).score>0,'۷۹: چند شروع مشابه ترجیح زمانی نرم بسازد');
let samePriority=task({title:'مرتب‌کردن فایل‌ها',c:12});assert.equal(pick([samePriority,designStart],9*60).task.id,designStart.id,'۸۰: ترجیح استنباطی به‌صورت سیگنال نرم وارد پیشنهاد شود');
A.reset();let statedPref=A.observeExplicitMemoryText('ترجیح میدم کارهای طراحی رو صبح انجام بدم',designStart);assert.ok(statedPref&&statedPref.domain==='time-preference'&&statedPref.source==='explicit','۸۱: ترجیح زمانی صریح ساختاریافته ذخیره شود');
let dependency=A.observeExplicitMemoryText('این کار به پاسخ مرتضی وابسته است',designStart);assert.ok(dependency&&dependency.domain==='dependency'&&dependency.rule==='requires-person','۸۲: وابستگی صریح به شخص در حافظه قابل ثبت باشد');

console.log('۸۲ سناریوی تصمیم، Context، سؤال تکمیلی، حافظه شخصی و مهاجرت با موفقیت گذشت.');

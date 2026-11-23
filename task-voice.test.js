const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sessions = [];
const timers = new Map();
let timerId = 0;
const mic = {classList: new Set(), setAttribute() {}};
mic.classList.remove = value => mic.classList.delete(value);
const draft = {value: 'قبلی'};
const messages = [];
class SpeechRecognition {
  start() { sessions.push(this); }
  stop() { this.stopped = true; }
  abort() { this.aborted = true; }
}

const source = fs.readFileSync('views.js', 'utf8');
const voice = source.slice(source.indexOf("const mic=document.getElementById('voice-input')"), source.indexOf('/* --- picker --- */'));
const context = vm.createContext({
  window: {SpeechRecognition}, document: {getElementById: () => mic},
  dr: draft, updatePv() {}, toast: text => messages.push(text),
  setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
  clearTimeout: id => timers.delete(id),
});
vm.runInContext(voice, context);
const phrase = transcript => Object.assign([{transcript}], {isFinal: true});
const tick = () => { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); };

mic.onclick();
const first = sessions[0];
assert.equal(first.continuous, true);
const firstPhrase = phrase('فردا صبح');
first.onresult({resultIndex: 0, results: [firstPhrase]});
first.onresult({resultIndex: 1, results: [firstPhrase, phrase('به علی زنگ بزنم')]});
assert.equal(draft.value, 'قبلی فردا صبح به علی زنگ بزنم');
first.onerror({error: 'no-speech'});
first.onend();
assert.equal(mic.classList.has('listening'), true);
tick();
const second = sessions[1];
mic.onclick();
assert.equal(second.stopped, true);
second.onresult({resultIndex: 0, results: [phrase('ساعت ده')]});
second.onend();
assert.equal(draft.value, 'قبلی فردا صبح به علی زنگ بزنم ساعت ده');
assert.equal(timers.size, 0);
assert.equal(mic.classList.has('listening'), false);

mic.onclick();
const third = sessions[2];
vm.runInContext('cancelTaskVoice()', context);
assert.equal(third.aborted, true);
third.onresult({resultIndex: 0, results: [phrase('متن قدیمی')]});
third.onend();
assert.equal(draft.value, 'قبلی فردا صبح به علی زنگ بزنم ساعت ده');
assert.equal(timers.size, 0);

mic.onclick();
sessions.at(-1).onerror({error: 'not-allowed'});
sessions.at(-1).onend();
assert.equal(messages.length, 1);
assert.equal(timers.size, 0);

mic.onclick();
for (let i = 0; i < 3; i++) {
  sessions.at(-1).onend();
  tick();
}
sessions.at(-1).onend();
assert.equal(timers.size, 0);
assert.equal(mic.classList.has('listening'), false);

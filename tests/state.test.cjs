const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initial, reduce, SECRET } = require('../src/state.js');
const edit = (s, value) => reduce(s, {type:'EDIT',value});
const calc = s => reduce(s,{type:'CALCULATE'});
const unlock = s => reduce(s,{type:'UNLOCK',code:SECRET});
test('starts locked; valid calculation opens paywall without revealing answer', () => {
  const s = calc(edit(initial(),'6*7')); assert.equal(s.unlocked,false); assert.equal(s.result,null); assert.equal(s.modal,'plans'); assert.deepEqual(s.history,[]);
});
test('invalid expressions show error without opening paywall', () => { const s = calc(edit(initial(),'1/0')); assert.ok(s.error); assert.equal(s.modal,null); });
test('wrong code remains locked; normalized code unlocks', () => {
  const s = reduce({...initial(),modal:'code'}, {type:'UNLOCK',code:'wrong'}); assert.equal(s.unlocked,false); assert.ok(s.error);
  assert.equal(reduce(s,{type:'UNLOCK',code:'  not   paying today  '}).unlocked,true);
});
test('unlock preserves operation; gives real result on demand', () => { const s = calc(unlock(edit(initial(),'(2+3)*4'))); assert.equal(s.result,20); assert.equal(s.modal,null); assert.equal(s.history.length,1); });
test('relock clears result/history/receipt but preserves expression and angle', () => {
  let s = calc(unlock(edit(initial(),'42'))); s = reduce(s,{type:'ANGLE'}); s = reduce(s,{type:'LOCK'});
  assert.equal(s.unlocked,false); assert.equal(s.result,null); assert.deepEqual(s.history,[]); assert.equal(s.receipt,null); assert.equal(s.expression,'42'); assert.equal(s.angle,'RAD'); assert.equal(calc(s).modal,'plans');
});
test('both checkout paths charge zero and never unlock', () => {
  for (const plan of ['single','premium']) { let s = reduce(initial(),{type:'SELECT_PLAN',plan}); assert.equal(s.modal,'checkout'); s=reduce(s,{type:'SIMULATE'}); assert.deepEqual(s.receipt,{charged:0,plan}); assert.equal(s.unlocked,false); assert.equal(s.modal,'receipt'); }
});
test('editing and angle changes invalidate displayed result', () => { const s=calc(unlock(edit(initial(),'sin(30)'))); assert.equal(edit(s,'3').result,null); const r=reduce(s,{type:'ANGLE'}); assert.equal(r.result,null); assert.notEqual(calc(r).result,s.result); });
test('history bounded to four entries and errors do not enter it', () => { let s=unlock(initial()); for(let i=0;i<8;i++) s=calc(edit(s,String(i))); assert.equal(s.history.length,4); s=calc(edit(s,'sqrt(-2)')); assert.equal(s.history.length,4); assert.equal(s.result,null); });
test('state transitions immutable; close and clear work', () => { const s=initial(); const next=edit(s,'12'); assert.equal(s.expression,''); assert.equal(reduce(next,{type:'CLEAR'}).expression,''); assert.equal(reduce({...next,modal:'plans'},{type:'CLOSE'}).modal,null); });
test('input length bounded', () => assert.equal(edit(initial(),'1'.repeat(300)).expression.length,240));

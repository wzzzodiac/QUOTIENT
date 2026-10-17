const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluate, format, CalculationError } = require('../src/math.js');
const cases = [
  ['2+2',4],['7-12',-5],['6×7',42],['9÷3',3],['2+3*4',14],['(2+3)*4',20],['2*(3+(4*5))',46],
  ['0,1+0.2',0.3],['.5 + 1.',1.5],['-2^2',-4],['(-2)^2',4],['2^3^2',512],['2^-2',0.25],['3--2',5],
  ['200*10%',20],['200+10%',200.1],['(40+10)%',.5],['sqrt(81)',9],['√(16)',4],['sin(30)',.5],
  ['cos(180)',-1],['tan(45)',1],['log(1000)',3],['ln(e)',1],['pi*2',Math.PI*2],['abs(-7)',7],
  ['1e-7*1e7',1],['0^0',1],['-0',0],['1/3',1/3],['2^-3^2',1/512],['2^3%',2**.03]
];
for (const [source, expected] of cases) test(`${source} = ${expected}`, () => assert.ok(Math.abs(evaluate(source)-expected) <= 1e-12*Math.max(1,Math.abs(expected))));
test('radians', () => { assert.ok(Math.abs(evaluate('sin(pi/2)','RAD')-1)<1e-12); assert.ok(Math.abs(evaluate('cos(pi)','RAD')+1)<1e-12); });
for (const source of ['', '2+', '1/0', 'sqrt(-1)', 'log(0)', 'ln(-2)', 'tan(90)', 'tan(270)', '(-2)^.5', '10^1000', '1e999', '(2+3', '2+3)', '2(3)', '2pi', 'sin 30', 'sin()', '1..2', 'alert(1)', 'constructor(1)', 'toString(1)', 'globalThis', '1;2', '2**3', '2+<!--', '('.repeat(241)]) {
  test(`rejects ${source.slice(0,30) || 'empty'}`, () => assert.throws(() => evaluate(source), CalculationError));
}
test('undefined tangent in radians', () => assert.throws(() => evaluate('tan(pi/2)', 'RAD'), CalculationError));
test('readable precision and round-trip scientific notation', () => { assert.equal(format(evaluate('0.1+0.2')),'0.3'); assert.equal(evaluate(format(1e-15)),1e-15); assert.equal(format(-0),'0'); });

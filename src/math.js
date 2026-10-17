/* Small, explicit expression grammar. No dynamic code execution. */
(function (root) {
  'use strict';
  const MAX_LENGTH = 240;
  class CalculationError extends Error {}
  const fail = message => { throw new CalculationError(message); };
  function evaluate(expression, angle = 'DEG') {
    if (typeof expression !== 'string' || expression.length > MAX_LENGTH) fail('Expression too long (240 characters max).');
    const source = expression.toLowerCase().replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replaceAll(',', '.').replaceAll('π', 'pi').replaceAll('√', 'sqrt');
    const tokens = [];
    let cursor = 0;
    while (cursor < source.length) {
      if (/\s/.test(source[cursor])) { cursor++; continue; }
      const tail = source.slice(cursor);
      const number = tail.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/);
      if (number) { tokens.push({ type: 'number', value: Number(number[0]) }); cursor += number[0].length; continue; }
      const name = tail.match(/^[a-z]+/);
      if (name) { tokens.push({ type: 'name', value: name[0] }); cursor += name[0].length; continue; }
      if ('+-*/^()%'.includes(source[cursor])) { tokens.push({ type: source[cursor++] }); continue; }
      fail('Unsupported symbol.');
    }
    if (!tokens.length) fail('Enter an expression first.');
    tokens.push({ type: 'end' });
    let index = 0;
    const peek = () => tokens[index].type;
    const take = () => tokens[index++];
    const finite = value => {
      if (!Number.isFinite(value)) fail('Result is outside the finite real-number range.');
      return Object.is(value, -0) ? 0 : value;
    };
    const trigArg = value => angle === 'DEG' ? value * Math.PI / 180 : value;
    const functions = {
      sqrt: v => { if (v < 0) fail('Negative square roots are not real numbers.'); return Math.sqrt(v); },
      sin: v => Math.sin(trigArg(v)), cos: v => Math.cos(trigArg(v)),
      tan: v => { if (Math.abs(Math.cos(trigArg(v))) < 1e-14) fail('Tangent is undefined at this angle.'); return Math.tan(trigArg(v)); },
      ln: v => { if (v <= 0) fail('Logarithms require a positive number.'); return Math.log(v); },
      log: v => { if (v <= 0) fail('Logarithms require a positive number.'); return Math.log10(v); },
      abs: Math.abs
    };
    function primary() {
      const token = take();
      if (token.type === 'number') return finite(token.value);
      if (token.type === '(') {
        const value = sum();
        if (peek() !== ')') fail('Missing closing parenthesis.');
        take(); return value;
      }
      if (token.type === 'name') {
        if (token.value === 'pi') return Math.PI;
        if (token.value === 'e') return Math.E;
        if (!Object.hasOwn(functions, token.value)) fail('Unknown function. Try sin, cos, tan, sqrt, log or ln.');
        if (peek() !== '(') fail('Use parentheses after a function.');
        take(); const value = sum();
        if (peek() !== ')') fail('Missing function closing parenthesis.');
        take(); return finite(functions[token.value](value));
      }
      fail('Incomplete expression. Check numbers and parentheses.');
    }
    function postfix() {
      let value = primary();
      while (peek() === '%') { take(); value /= 100; }
      return value;
    }
    function power() {
      const value = postfix();
      if (peek() === '^') { take(); return finite(value ** unary()); }
      return value;
    }
    function unary() {
      if (peek() === '+') { take(); return unary(); }
      if (peek() === '-') { take(); return -unary(); }
      return power();
    }
    function product() {
      let value = unary();
      while (peek() === '*' || peek() === '/') {
        const op = take().type, rhs = unary();
        if (op === '/' && rhs === 0) fail('Cannot divide by zero. Even for money.');
        value = finite(op === '*' ? value * rhs : value / rhs);
      }
      return value;
    }
    function sum() {
      let value = product();
      while (peek() === '+' || peek() === '-') {
        const op = take().type, rhs = product();
        value = finite(op === '+' ? value + rhs : value - rhs);
      }
      return value;
    }
    const result = finite(sum());
    if (peek() !== 'end') fail('Check parentheses or add a multiplication sign.');
    return result;
  }
  function format(value) { return Number(value.toPrecision(12)).toString(); }
  const api = { evaluate, format, CalculationError, MAX_LENGTH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrollMath = api;
})(globalThis);

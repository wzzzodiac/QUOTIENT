(function (root) {
  'use strict';
  const math = typeof module !== 'undefined' && module.exports ? require('./math.js') : root.TrollMath;
  // A theatrical unlock, not authentication. Intentionally documented.
  const SECRET = 'NOT PAYING TODAY';
  const initial = () => ({ unlocked: false, expression: '', result: null, error: '', angle: 'DEG', modal: null, plan: 'single', receipt: null, history: [], attempts: 0 });
  function reduce(state, action) {
    switch (action.type) {
      case 'EDIT': return { ...state, expression: action.value.slice(0, math.MAX_LENGTH), result: null, error: '' };
      case 'CLEAR': return { ...state, expression: '', result: null, error: '' };
      case 'ANGLE': return { ...state, angle: state.angle === 'DEG' ? 'RAD' : 'DEG', result: null, error: '' };
      case 'CALCULATE': {
        try {
          const value = math.evaluate(state.expression, state.angle);
          if (!state.unlocked) return { ...state, modal: 'plans', error: '', result: null, attempts: state.attempts + 1 };
          return { ...state, result: value, error: '', history: [{ expression: state.expression, value, angle: state.angle }, ...state.history].slice(0, 4) };
        } catch (error) { return { ...state, result: null, error: error.message }; }
      }
      case 'PLANS': return { ...state, modal: 'plans' };
      case 'CODE': return { ...state, modal: 'code', error: '' };
      case 'UNLOCK': return action.code.trim().replace(/\s+/g, ' ').toUpperCase() === SECRET
        ? { ...state, unlocked: true, modal: null, error: '' }
        : { ...state, error: 'Wrong code. Greed wins again.' };
      case 'LOCK': return { ...initial(), expression: state.expression, angle: state.angle };
      case 'SELECT_PLAN': return { ...state, plan: action.plan === 'premium' ? 'premium' : 'single', modal: 'checkout', error: '' };
      case 'SIMULATE': return { ...state, modal: 'receipt', receipt: { charged: 0, plan: state.plan }, error: '' };
      case 'CLOSE': return { ...state, modal: null, error: '' };
      default: return state;
    }
  }
  const api = { SECRET, initial, reduce };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrollState = api;
})(globalThis);

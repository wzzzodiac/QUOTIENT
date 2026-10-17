/* DOM adapter: mathematics and transitions live in independent modules. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const input = $('expression'), dialog = $('modal');
  let state = TrollState.initial(), renderedModal = null, returnFocus = null;
  function dispatch(action) { state = TrollState.reduce(state, action); render(); }
  function insert(text) {
    const start = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? start;
    const replaceResult = state.result !== null && !/^[+−×÷*/^%]/.test(text);
    const before = replaceResult ? '' : state.result !== null ? String(state.result) : input.value.slice(0, start);
    const after = replaceResult || state.result !== null ? '' : input.value.slice(end);
    dispatch({ type: 'EDIT', value: before + text + after });
    input.focus({ preventScroll: true });
    input.setSelectionRange(before.length + text.length, before.length + text.length);
  }
  function remove() {
    const start = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? start;
    const cut = start === end ? Math.max(0, start - 1) : start;
    dispatch({ type: 'EDIT', value: input.value.slice(0, cut) + input.value.slice(end) });
    input.focus({ preventScroll: true }); input.setSelectionRange(cut, cut);
  }
  function calculate() { dispatch({ type: 'CALCULATE' }); }
  function close() { dispatch({ type: 'CLOSE' }); }
  function render() {
    if (input.value !== state.expression) input.value = state.expression;
    $('calculator').classList.toggle('unlocked', state.unlocked);
    $('device-status').innerHTML = `<i></i> ${state.unlocked ? 'UNLOCKED' : 'LOCKED'}`;
    $('display-label').textContent = 'EXPRESSION';
    $('access').textContent = state.unlocked ? 'Lock again ↗' : 'Have a code? ↗';
    $('equals-copy').textContent = state.unlocked ? 'Calculate' : 'Get result';
    $('angle').textContent = state.angle;
    $('angle').setAttribute('aria-label', `Change angle unit, currently ${state.angle === 'DEG' ? 'degrees' : 'radians'}`);
    const mathError = state.error && state.modal !== 'code';
    $('result').textContent = mathError ? state.error : state.result !== null ? TrollMath.format(state.result) : state.unlocked ? 'Ready' : 'Result locked';
    $('result').className = mathError ? 'has-error' : state.result !== null ? 'has-result' : '';
    input.setAttribute('aria-invalid', mathError ? 'true' : 'false');
    $('history').hidden = state.history.length === 0;
    $('history-list').replaceChildren(...state.history.map(entry => {
      const item = document.createElement('li');
      item.textContent = `${entry.expression} = ${TrollMath.format(entry.value)} `;
      const angle = document.createElement('small'); angle.textContent = entry.angle; item.append(angle); return item;
    }));
    if (mathError) $('status').textContent = state.error;
    else if (state.result !== null) $('status').textContent = `Result: ${TrollMath.format(state.result)}.`;
    else $('status').textContent = '';
    if (state.modal !== renderedModal) {
      renderedModal = state.modal;
      if (state.modal) {
        if (!dialog.open) returnFocus = document.activeElement;
        renderModal();
        if (!dialog.open) dialog.showModal();
        if (state.modal === 'code') $('unlock-code').focus();
        else $('close-modal').focus();
      } else if (dialog.open) {
        dialog.close();
        (returnFocus?.isConnected ? returnFocus : input).focus({ preventScroll: true });
      }
    }
    if (state.modal === 'code') $('code-error').textContent = state.error;
  }
  function renderModal() {
    const views = {
      plans: `<div class="modal-eyebrow">MATHEMATICS AS A SERVICE</div>
        <h2 class="modal-title" id="modal-title">Your answer.<br>Our ransom.</h2>
        <p class="modal-lead">${state.attempts > 1 ? 'Still cheaper than ignorance. Allegedly.' : 'Choose your financial mistake.'}</p>
        <div class="plans">
          <section class="plan"><h3 class="plan-name">Single answer</h3><div class="plan-price">€80</div><span class="plan-period">per result</span><p class="plan-description">One answer. No mercy.</p><button class="secondary" data-plan="single">Choose single ↗</button></section>
          <section class="plan featured"><span class="plan-tag">CFO APPROVED</span><h3 class="plan-name">Unlimited</h3><div class="plan-price">€999</div><span class="plan-period">per month</span><p class="plan-description">Generational debt. But decimals.</p><button class="primary" data-plan="premium">Choose unlimited ↗</button></section>
        </div><div class="modal-secondary"><button class="text-button" data-code>Have a code? ↗</button></div>`,
      checkout: `<div class="modal-eyebrow">SIMULATED CHECKOUT</div><h2 class="modal-title" id="modal-title">Last rites.<br>For your wallet.</h2>
        <div class="fake-card"><div class="fake-card-top"><span>DIGNITY CARD</span><span>∅</span></div><div class="fake-card-main">We accept poor decisions.</div><small>Fictional payment method</small></div>
        <div class="receipt-line"><span>${state.plan === 'premium' ? 'Unlimited / month' : 'Single answer'}</span><s>€${state.plan === 'premium' ? '999' : '80'}</s></div><div class="receipt-line total"><span>Actual charge</span><span>€0.00</span></div>
        <button class="primary full-width" id="simulate">Simulate payment · €0 ↗</button><div class="modal-secondary"><button class="text-button" id="back-plans">Back to plans</button></div>`,
      receipt: `<div class="modal-eyebrow">FICTIONAL RECEIPT</div><h2 class="modal-title" id="modal-title">You survived capitalism.</h2><div class="receipt-hero">€0.00</div><p class="receipt-copy">Nothing charged. Use this code to unlock:</p><p class="stamp">${TrollState.SECRET}</p><button class="primary full-width" data-code>Enter code ↗</button>`,
      code: `<div class="modal-eyebrow">UNLOCK</div><h2 class="modal-title" id="modal-title">Opt out of capitalism.</h2><form class="code-form" id="unlock-form"><label for="unlock-code">Secret code</label><input id="unlock-code" type="text" autocomplete="off" spellcheck="false" maxlength="60" placeholder="Three words. Zero euros." aria-describedby="code-error code-hint"><p class="code-error" id="code-error" role="alert"></p><button class="primary full-width" type="submit">Unlock ↗</button><p class="hint" id="code-hint">Hint: ${TrollState.SECRET}. Security was extra.</p></form>`
    };
    $('modal-content').innerHTML = views[state.modal];
    dialog.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => dispatch({ type: 'SELECT_PLAN', plan: button.dataset.plan })));
    dialog.querySelectorAll('[data-code]').forEach(button => button.addEventListener('click', () => dispatch({ type: 'CODE' })));
    $('simulate')?.addEventListener('click', () => dispatch({ type: 'SIMULATE' }));
    $('back-plans')?.addEventListener('click', () => dispatch({ type: 'PLANS' }));
    $('unlock-form')?.addEventListener('submit', event => { event.preventDefault(); dispatch({ type: 'UNLOCK', code: $('unlock-code').value }); });
  }
  input.addEventListener('input', () => dispatch({ type: 'EDIT', value: input.value }));
  document.querySelectorAll('[data-insert]').forEach(button => button.addEventListener('click', () => insert(button.dataset.insert)));
  document.querySelector('[data-action="clear"]').addEventListener('click', () => { dispatch({ type: 'CLEAR' }); input.focus({ preventScroll: true }); });
  document.querySelector('[data-action="delete"]').addEventListener('click', remove);
  $('calculate').addEventListener('click', calculate);
  $('angle').addEventListener('click', () => dispatch({ type: 'ANGLE' }));
  $('access').addEventListener('click', () => dispatch({ type: state.unlocked ? 'LOCK' : 'CODE' }));
  $('view-plans').addEventListener('click', () => dispatch({ type: 'PLANS' }));
  $('science-toggle').addEventListener('click', () => {
    $('science').hidden = !$('science').hidden;
    $('science-toggle').setAttribute('aria-expanded', String(!$('science').hidden));
    $('science-toggle').innerHTML = `ƒx <span>Scientific</span> ${$('science').hidden ? '+' : '−'}`;
  });
  $('math-info').addEventListener('click', () => { $('math-help').open = true; $('math-help').scrollIntoView({ block: 'center' }); });
  $('close-modal').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, input, [tabindex="0"]')].filter(element => !element.disabled);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
  });
  document.addEventListener('keydown', event => {
    if (dialog.open || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (event.key === 'Escape') { event.preventDefault(); dispatch({ type: 'CLEAR' }); return; }
    if ((event.key === 'Enter' && (target === input || target === document.body)) || event.key === '=') {
      event.preventDefault(); calculate(); return;
    }
    if (target === input && state.result !== null && /^[0-9.,()+*/^%\-]$/.test(event.key)) { event.preventDefault(); insert(event.key); return; }
    if (target === input || target.closest('input, textarea, select, summary, a')) return;
    if (/^[0-9.,()+*/^%\-]$/.test(event.key)) { event.preventDefault(); insert(event.key); }
    else if (event.key === 'Backspace') { event.preventDefault(); remove(); }
  });
  render();
})();

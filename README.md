# QUOTIENT — The price of knowing

A browser-based calculator parody. €80 per answer, €999 per month, **€0 actually charged**.

## Play online

[Open QUOTIENT](https://wzzzodiac.github.io/QUOTIENT/)

## Run locally

Double-click **OPEN-CALCULATOR.bat** to open in Edge (or your default browser if Edge is unavailable). You can also open `index.html` directly. No installation or dependencies. Keep `src/` beside `index.html`. The original launcher still works as an alias.

Optional HTTP preview with Node.js 20+:

```powershell
node serve.cjs
```

Open http://127.0.0.1:8786. Ctrl+C stops the server. Calculations run entirely in your browser; no accounts, payments, analytics or persistent storage. Reloading locks the calculator again.

## Unlock

Click **Have a code?** and enter:

```text
NOT PAYING TODAY
```

Case and extra spaces do not matter. Your expression stays in place; press Enter to calculate. **Lock again** clears results and history while preserving the expression. The code is defined in `src/state.js`; it is a joke, not authentication. Simulated payments reveal the code but do not unlock automatically.

## Controls

- Enter or `=`: calculate. Escape: close a dialog, otherwise clear.
- Backspace / ⌫: delete. AC: clear. Arrow keys and selection: edit.
- After a result, an operator continues from it; a digit starts over.
- **Scientific**: sin, cos, tan, sqrt, powers, log, ln, abs, π and e.
- **DEG / RAD**: degrees or radians for trigonometry.

## Math rules

- `%` means divide by 100: `200*10% = 20`; `200+10% = 200.1`.
- Multiplication must be explicit: `2*(3+4)`.
- `2^3^2 = 512`; `-2^2 = -4`; `(-2)^2 = 4`.
- `log` is base 10; `ln` is natural. Functions need parentheses.
- Decimal points and commas are accepted; results use decimal points. Scientific notation such as `1e-7` is supported.
- IEEE 754 arithmetic, 12 displayed significant digits, 240-character input limit. Internal precision is retained when chaining results. `0^0 = 1` follows JavaScript's numeric convention.
- Invalid syntax, division by zero, invalid real-number domains and non-finite results produce errors.

## Tests and structure

```powershell
node --test tests/*.test.cjs
```

71 tests, no package installation. See `evidence/VERIFICATION.md` for browser checks and limitations.

| File | Role |
| --- | --- |
| `index.html`, `src/styles.css` | Layout, accessibility and responsive styling |
| `src/math.js` | Explicit tokenizer/parser; no dynamic code execution |
| `src/state.js` | Pure state transitions and unlock code |
| `src/app.js` | UI, keyboard and dialogs |
| `tests/` | Math and state tests using Node's built-in runner |
| `serve.cjs` | Optional loopback-only static server |

No `eval`, `Function`, third-party libraries or remote assets. User expressions are never inserted as HTML. CSP blocks connections and form submissions.

## Scope

Hosted on GitHub Pages, with offline use supported. No payment service. Symbolic derivatives, integrals and advanced statistics are not implemented. Physical mobile devices, screen readers and cross-browser coverage remain future checks.

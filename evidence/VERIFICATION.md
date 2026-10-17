# QUOTIENT verification

## English copy revision — 18 October 2026

- 71/71 automated math and state tests passed. See `tests.txt`.
- `src/app.js` syntax check passed.
- Edge desktop: reviewed the shortened home screen, paywall, simulated checkout, receipt, code dialog and errors.
- The previous Spanish code is rejected. ` not   paying today ` unlocks successfully.
- Pending `0.1+0.2` evaluates to `0.3` after unlocking. Decimal output now uses a point.
- `1/0` displays an English domain error. Relocking works.
- Console: no warnings or errors during these checks.
- `desktop.jpg` and `paywall-desktop.jpg` were refreshed for the English revision.
- Source scan found no remaining Spanish copy in the UI, runtime errors, README, server output or tests.

## Baseline coverage retained

The initial delivery also verified keypad input, chained calculations, scientific DEG/RAD calculations, history clearing, Escape, focus restoration and circular Tab navigation in Edge. Geometry and interactions were checked at 320, 390 and 768 CSS pixels in the integrated Chromium browser. These were not repeated as a full suite for this copy revision; the evaluator and interaction architecture remain unchanged.

## Limits

The launcher has been inspected and the Edge installation path exists. Direct file opening remains a manual check because browser automation blocks file URLs; functional browser checks used the loopback HTTP server. Physical mobile devices, screen readers, Firefox, Safari and a full WCAG audit have not been tested. Mobile screenshot capture was unavailable during baseline QA.

The original launcher filename remains a compatibility alias for `OPEN-CALCULATOR.bat`. This report describes the local preview checks performed before publication. No payment service or external application assets were introduced. The preview server is stopped after verification.

# Scoped verification · October 19, 2026

Repository: `goatcheese98/component-forge`. Restored source and current default branch both started at `d6636bca9ebe8f8bb4d6d4ccb7328586743048d3`, clean. Work branch: `codex/lum-component-gallery`. Other repository checkouts were not changed. Setup helpers and source SHA were verified; source implementation supersedes baseline-only onboarding limits as authorized in the brief.

## Reproduced baseline

With the restored locked dependencies: `npm run build` exited **2** and `npm run typecheck` exited **2** (import/local `generateCSSCode` collision); read-only `npm exec eslint .` exited **2** (missing ESLint 9 flat config); `npm test -- --run` exited **1** (no tests). Before dependencies were linked, commands exited 127; those are setup results, not application defects. The original lint script contained `--fix` and was not run. A later consumer fixture reproduced exit **2** because emitted declarations referenced the application's `@/lib/types` alias; relative source imports fixed it.

## Final checks

All commands ran in the managed cloud workspace using Node 24.19.0. A fresh `npm ci` completed from the unchanged lockfile (326 packages); checks below used that fresh installation.

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci --prefix work/frozen-install --cache /workspace/component-forge/work/npm-cache --no-audit --no-fund` | 0 | Frozen install; package/lock copied into ignored scratch directory |
| `npm run typecheck` | 0 | Strict Vue/application, test and ESLint config types |
| `npm run lint` | 0 | Read-only ESLint; Node 24 native TS config avoids upgrading jiti |
| `npm test` | 0 | 9 focused tests: validated preset roundtrip, independent reset state, malformed/unsafe storage, deterministic full CSS, gradient/shadow/dimensions, clipboard promise/rejection |
| `npm run build` | 0 | Static app output in `dist-dev`, no declarations emitted into source |
| `npm run check:lib` | 0 | Separate library build, declaration consumer without app aliases, ESM + CJS export loading |
| `CHROMIUM_PATH=/usr/bin/chromium python3 tests/browser.py` | 0 | 5 real browser test groups against the built static app |
| `git diff --check` | 0 | Whitespace check |

Cloud browser: Chromium 154.0.8037.57, Playwright 1.62.0, headless. Browser HTTP requests were restricted by the test harness to its loopback preview; fonts were served with the app. Checks cover label edit → preview → clipboard → save → reload, duplicate replacement, deletion/undo, reset, native clipboard write/read, corrupt and denied storage, clipboard denial, required input submission, native disabled/loading, actual Tab/Enter/Space focus and activation, radio arrow keys, Escape/returned dialog focus, accessible labels, every control group, Tailwind access, light/dark, reduced motion, and no document overflow at 320/768/1440 widths. Storage and clipboard error paths were deliberately injected; a separate test used the real browser clipboard API.

The browser suite caught and verified the fix for Reset leaving preset selection stale after a queued label watcher. Consumer checks caught and verified the declaration alias leak. Screenshots are supporting visual evidence, not the functional test result.

## Review and limits

Reviewed all changed source for state ownership, input trust boundaries, text interpolation, storage failure, asynchronous clipboard feedback, export fidelity, component/event exports, mobile overflow, focus, motion and build separation. Native controls use per-instance Vue IDs. Final review aligned real preview hover with the generated hover rule and retained reactive button-text props and ThemeSelector attribute forwarding. No application JavaScript migration is claimed: existing app/components were already Vue/TypeScript; this slice strengthens strict checking and removes permissive `any` utilities. Existing legacy Tailwind/PostCSS JavaScript configs are untouched. Dependencies and lockfile were not upgraded.

CI now has a 15-minute read-only quality job using these commands, with browser artifacts retained seven days. Local cloud checks are complete; a hosted GitHub Actions run is separate evidence and is not claimed here.

Remaining limits: candidate v1 is not user-approved; original Paper PNG was not supplied; screenshot readback predates the stated leaf token correction. Only Chromium was exercised (no Safari/Firefox or screen-reader certification). Experimental palettes/effects remain opt-in and are not a claim of universal contrast for arbitrary user configurations. CSS includes required theme definitions; Tailwind export documents companion state/keyframe CSS. Browser tests use loopback storage/clipboard permission contexts, not a production origin. Browserslist emits an old-data advisory; no broad dependency refresh was performed. No provider integration, secret provisioning, package publication, merge or production deployment occurred.

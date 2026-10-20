# Package and persistence boundary checkpoint

| Debt before (`88c398ba`) | After |
| --- | --- |
| Export helpers interpolated caller-provided CSS without runtime validation; seven new regression cases failed | All CSS/style/Tailwind entry points validate before generating output; typed `parseButtonState`, `parsePresets`, `serializePresets` and capacity constant exported |
| Shape-only persistence checks accepted malformed hex, RGB alpha/channels, Bézier and font-size values | Field grammar and numeric constraints shared between imports, persistence and export; unsupported data is rejected before output/write |
| Public object copying could trust inherited data or custom JSON serialization | Required configuration fields must be own properties; copied output contains only known data fields and never invokes a custom `toJSON` |
| Vue 3.5.18 and compiler/SSR/source-map/CSS dependencies had high advisory paths | Vue 3.5.42 + peer security floor; source-map-js 1.2.2, PostCSS 8.5.31, nanoid 3.3.20 and required compatible Vue compiler transitives locked |
| GSAP was installed as a runtime dependency, with no imports/references in application/library code | Unused direct dependency removed; CSS-based experiments retain their behavior |
| Capacity/Undo corruption was previously repaired | Regression preserved, not reopened or bypassed |
| Two handwritten legacy JS configuration files remain (Tailwind/PostCSS) | Unchanged tooling files; touched app/public-boundary code remains strict TypeScript. No whole-repository migration claim |

## Checks

Fresh `npm ci` from the updated lockfile installed 325 packages. Commands: `npm run typecheck`, read-only `npm run lint`, `npm test` (21), `npm run build`, `npm run check:packed` (including library/declarations, actual isolated tarball ESM/CommonJS, public validation and SSR), and `CHROMIUM_PATH=/usr/bin/chromium python3 tests/browser.py` (7 groups). All exit 0. The prior 100 → delete → save → blocked undo → free slot → restore → reload regression is retained.

The [malformed-preset recovery capture](design/screens/malformed-preset-recovery.png) shows the existing nonblocking recovery state, usable native preview and explicit focus. Tests assert original storage is unchanged and malformed CSS is absent from export. Layout, LUM tokens, component identity, mathematical transforms and native Vue framework are unchanged. Paper candidate approval and original PNG remain unavailable; this capture is from cloud Chromium, not Paper.

## Dependency audit

`npm audit --omit=dev --json` returned 0 with zero findings before and after. That alone excluded Vue's development/peer copy and was insufficient evidence: the full audit was inspected too. At that intermediate Vue checkpoint, full findings changed from **67 (46 high / 3 critical)** to **55 (34 high / 3 critical)**. Vue/runtime/compiler/SSR, source-map-js, PostCSS and nanoid had no entries in that checkpoint's full report. The current authoritative full report is linked from the tooling triage. [Machine-readable before/after summary](dependency-audit-summary.json).

Relevant advisory paths addressed:

- Vue SSR attribute-name XSS: [GHSA-g2v6-rqmx-r4w6](https://github.com/advisories/GHSA-g2v6-rqmx-r4w6), patched by Vue 3.5.42. The static lab has no server renderer at runtime, but library consumers can use Vue SSR; the peer floor now requires the fixed compatible patch. The actual packed library is rendered and its label escaping verified with that patched Vue.
- Compiler source-map offset denial of service: [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), patched source-map-js 1.2.2.
- PostCSS previous-map file disclosure and nanoid generator issues are absent after the required compatible dependency refresh. No blanket audit fix, major framework replacement or unrelated tooling upgrade was used.

Remaining findings concern development tooling (including Vite/Vitest UI, ESLint and Tailwind-related build packages), not code included in the static application or externalized Vue runtime entry points. They are **not declared resolved**. These packages can present risk when their servers or processors handle untrusted input; this slice uses trusted repository sources, non-watch tests and loopback browser previews. This was the intermediate 55-record baseline, not a harmless-tooling classification. The subsequent [advisory-by-advisory tooling triage](tooling-security-triage.md) patches reachable compatible paths and records every remaining blocker; no checks were disabled. There are no known remaining high findings on the inspected shipped/runtime paths after this patch, not a guarantee that arbitrary downstream deployments are safe.

Exact serving model ID and reasoning setting are not exposed in this session. The session describes the assistant as Codex based on GPT-6; that is not an exact model/runtime identifier. No local desktop, paid infrastructure, credential provisioning, package publication, merge or production release was used.

Final tooling follow-up: Vite 7.3.7 / Vitest 4.1.11 and compatible transitive repairs reduce the full audit to 9 records (6 high, 3 moderate, zero critical), representing two unresolved upstream/parent-major blockers. See the linked triage for all 41 advisory URLs and all 55 original affected package records.

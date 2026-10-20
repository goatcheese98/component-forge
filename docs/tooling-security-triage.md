# Advisory-by-advisory tooling triage

Baseline: 55 affected package records, covering 41 distinct advisory URLs. Final: **9 affected records: 6 high, 3 moderate, 0 critical**. These are **two unresolved advisories**, not nine independent exploits. All 55 original package records, exact installed nodes/chains, propagation to leaf advisories and final status are retained in [tooling-triage.json](security/tooling-triage.json). [Original full audit](security/full-audit-baseline.json) · [Final full audit](security/full-audit-final.json).

## Execution and repairs

Normal builds, lint and test workers are treated as potential execution paths. Development-only classification is not a security exemption. The Vite and Vitest UI server paths are especially reachable when the advertised servers run. Windows-specific conditions and vulnerable optional operations are distinguished below.

- Compatible Vite 7.3.7, Rollup 4.64.12, esbuild 0.28.2 and same-major parser/glob/cache repairs address recorded server/build/lint advisories. The unused @vue/eslint-config-prettier preset was removed; the active flat config did not import it. Standalone Prettier remains available.
- Vitest 3.2.6 fixes the older critical UI advisory but still requires vulnerable tinypool ^1.1.1 and is below the 4.1.11 mock-route repair. There is no fixed 1.x tinypool release. Vitest/UI 4.1.11 is the narrow required test-runner migration: its declared Node/Vite peers accept existing Node 24 and Vite 7, and existing 21 tests pass without rewritten assertions or disabled checks. It removes tinypool rather than forcing an out-of-range pool dependency.
- test:ui is explicitly bound to 127.0.0.1. Cloud HTTP probes start both patched Vite dev and Vitest UI servers, verify expected app/module/UI content, and terminate their own process groups. All seven application browser groups and the actual packed consumer pass after the changes. CI now runs the server smoke too.
- Full npm audit still exits **1** because of the blockers below; omit-dev audit exits 0. There are no audit ignores, --force installs, blanket overrides, removed checks or softened CI failures. Existing quality CI remains a functional gate, not a claim that the full audit is clean.

## Precise remaining blockers and smallest safe plan

1. **braces 3.0.3 — high, GHSA-vfj7-8cjw-p6xm.** No published safe version exists: npm registry latest/listed maximum is 3.0.3 and the advisory covers <=3.0.3. Tailwind 3.4.17 reaches it through micromatch 4.0.8 and chokidar 3.6.0 (also its fast-glob chain). Current content globs in tailwind.config.js are tracked constants, not application/preset text. That constrains the trigger but does not repair the library. Do not accept external arbitrary glob configuration; keep the read-only 15-minute isolated CI job and dev servers on loopback. Smallest upstream repair: a released braces backport within ^3.0.3 followed by frozen reinstall and these regressions. Until then, removing this chain requires replacing the parent glob/watch stack, e.g. an assessed Tailwind 4 scanner migration. That is a separate CSS/framework compatibility change, not a safe fabricated 3.0.4 upgrade.
2. **postcss-selector-parser <7.1.6 — moderate, GHSA-rj75-hqrm-r3gf.** ESLint now uses fixed 7.1.6, but Tailwind 3/PostCSS nested still require parser ^6.1.2/^6.1.1 and @tailwindcss/typography 0.5.20 pins 6.0.10. Upstream fixed version is 7.1.6. Applying it through a blanket override violates parent major constraints. CSS source from PRs/imported styles can exercise the parser during builds; the gallery does not execute a runtime CSS compiler. Smallest safe plan: assess a parent release on parser 7, or an upstream 6.x backport; if neither is available, plan Tailwind/PostCSS parent migration and separately remove or update the typography integration with demonstrated usage checks. Keep untrusted style processing isolated and time-bounded. Preserve Paper/LUM tokens and compare 320/768/1440 light/dark captures, CSS/Tailwind exports, all controls and package consumers before adopting that major migration.

Neither remaining advisory needs a credential, paid service, merge or production release. A safe upstream backport or an explicitly reviewed parent-stack migration is the compatibility blocker; no security-clean claim is made.

## Every baseline advisory

<details>
<summary>GHSA-vfj7-8cjw-p6xm · high · unresolved</summary>

[braces vulnerable to stack-exhaustion denial of service through deeply nested patterns](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)

**Exact baseline chain(s):**

- `component-forge > tailwindcss@3.4.17 > chokidar@3.6.0 > braces@3.0.3`

**Affected range(s):** `<=3.0.3`

**Fixed/repaired version:** No published fixed braces version. Registry latest is 3.0.3; advisory covers <=3.0.3.

**Execution path and actual exposure:** Tailwind content discovery/watch loads braces via micromatch and chokidar. Deep attacker-controlled glob patterns can exhaust the stack. Current patterns are fixed tracked strings (tailwind.config.js), not gallery input or file contents; no pattern-input API exists in the app. This remains an unresolved high advisory, not harmless tooling.

</details>

<details>
<summary>GHSA-rj75-hqrm-r3gf · moderate · unresolved</summary>

[PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)

**Exact baseline chain(s):**

- `component-forge > @tailwindcss/typography@0.5.16 > postcss-selector-parser@6.0.10`
- `component-forge > eslint-plugin-vue@10.3.0 > postcss-selector-parser@6.1.2`
- `component-forge > tailwindcss@3.4.17 > postcss-nested@6.2.0 > postcss-selector-parser@6.1.2`
- `component-forge > tailwindcss@3.4.17 > postcss-selector-parser@6.1.2`

**Affected range(s):** `<7.1.6`

**Fixed/repaired version:** 7.1.6; retained Tailwind/PostCSS/typography constraints also install 6.0.10/6.1.5. The earlier 6.1.0..<6.1.3 recursion issue was patched in affected 6.1.5 nodes.

**Execution path and actual exposure:** Tailwind/PostCSS/typography can parse CSS selectors supplied by repository source. Untrusted PR CSS or imported project styles can trigger CPU exhaustion during build; this is a real build-input exposure. Some parents still constrain parser 6.x, so the remaining advisory is not declared resolved.

</details>

<details>
<summary>GHSA-5gmw-xhrv-c9v3 · critical · repaired_or_removed</summary>

[Tinypool: Prototype Pollution gadget in worker options leads to Remote Code Execution](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3)

**Exact baseline chain(s):**

- `component-forge > vitest@3.2.4 > tinypool@1.1.1`

**Affected range(s):** `<=2.1.0`

**Fixed/repaired version:** 2.1.2 fixes both pool advisories, but Vitest 3 declares ^1.1.1 and no fixed 1.x exists. Repair: Vitest 4.1.11 removes tinypool.

**Execution path and actual exposure:** Vitest 3 normal test runs execute this worker pool. The RCE gadgets require prototype pollution plus affected worker/run options; no pollution source was demonstrated in project tests, but the affected worker operation is used in CI. Vitest 4 removes this dependency entirely, avoiding an incompatible override of Vitest 3's ^1.1.1 constraint.

</details>

<details>
<summary>GHSA-5xrq-8626-4rwp · critical · repaired_or_removed</summary>

[When Vitest UI server is listening, arbitrary file can be read and executed](https://github.com/advisories/GHSA-5xrq-8626-4rwp)

**Exact baseline chain(s):**

- `component-forge > vitest@3.2.4`

**Affected range(s):** `<3.2.6`

**Fixed/repaired version:** Verified repaired installed release(s): vitest 4.1.11

**Execution path and actual exposure:** The advertised test:ui command starts the affected server. An attacker reaching its API is the stated file-read/execution precondition; loopback alone is not considered a fix. The patched UI and real loopback HTTP endpoint were verified.

</details>

<details>
<summary>GHSA-85c8-ppgw-ccpr · critical · repaired_or_removed</summary>

[Tinypool: Prototype Pollution Gadget to RCE in run() options](https://github.com/advisories/GHSA-85c8-ppgw-ccpr)

**Exact baseline chain(s):**

- `component-forge > vitest@3.2.4 > tinypool@1.1.1`

**Affected range(s):** `<2.1.2`

**Fixed/repaired version:** 2.1.2 fixes both pool advisories, but Vitest 3 declares ^1.1.1 and no fixed 1.x exists. Repair: Vitest 4.1.11 removes tinypool.

**Execution path and actual exposure:** Vitest 3 normal test runs execute this worker pool. The RCE gadgets require prototype pollution plus affected worker/run options; no pollution source was demonstrated in project tests, but the affected worker operation is used in CI. Vitest 4 removes this dependency entirely, avoiding an incompatible override of Vitest 3's ^1.1.1 constraint.

</details>

<details>
<summary>GHSA-23c5-xmqv-rm74 · high · repaired_or_removed</summary>

[minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2`

**Affected range(s):** `<3.1.4`, `>=9.0.0 <9.0.7`

**Fixed/repaired version:** Verified repaired installed release(s): minimatch 10.2.6/3.1.5/9.0.9

**Execution path and actual exposure:** File-discovery and lint/build filtering invoke glob matching. Backtracking needs adversarial pattern structure; current include/exclude patterns are tracked constants. PR/configuration changes remain a possible CI resource-exhaustion path, so compatible branches were patched.

</details>

<details>
<summary>GHSA-25h7-pfq9-p65f · high · repaired_or_removed</summary>

[flatted vulnerable to unbounded recursion DoS in parse() revive phase](https://github.com/advisories/GHSA-25h7-pfq9-p65f)

**Exact baseline chain(s):**

- `component-forge > @vitest/ui@3.2.4 > flatted@3.3.3`

**Affected range(s):** `<3.4.0`

**Fixed/repaired version:** Verified repaired installed release(s): flatted 3.4.4

**Execution path and actual exposure:** ESLint file-cache tooling depends on flatted. Parsing poisoned cache data is the trigger; lint currently runs without --cache and no cache import is exposed. Parser patches were installed, not ignored.

</details>

<details>
<summary>GHSA-2883-xcg3-v3hh · high · repaired_or_removed</summary>

[js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > js-yaml@4.1.0`

**Affected range(s):** `>=4.0.0 <4.3.2`

**Fixed/repaired version:** Verified repaired installed release(s): js-yaml 4.3.2

**Execution path and actual exposure:** ESLint legacy configuration support depends on YAML parsing. Adversarial merge keys/aliases/omap data trigger these advisories; the active configuration is eslint.config.ts and no YAML config import is exposed to gallery users. Compatible parser repairs were installed.

</details>

<details>
<summary>GHSA-3jxr-9vmj-r5cp · high · repaired_or_removed</summary>

[brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.16`, `>=2.0.0 <2.1.2`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-3ppc-4f35-3m26 · high · repaired_or_removed</summary>

[minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2`

**Affected range(s):** `<3.1.3`, `>=9.0.0 <9.0.6`

**Fixed/repaired version:** Verified repaired installed release(s): minimatch 10.2.6/3.1.5/9.0.9

**Execution path and actual exposure:** File-discovery and lint/build filtering invoke glob matching. Backtracking needs adversarial pattern structure; current include/exclude patterns are tracked constants. PR/configuration changes remain a possible CI resource-exhaustion path, so compatible branches were patched.

</details>

<details>
<summary>GHSA-52cp-r559-cp3m · high · repaired_or_removed</summary>

[js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > js-yaml@4.1.0`

**Affected range(s):** `>=4.0.0 <4.3.0`

**Fixed/repaired version:** Verified repaired installed release(s): js-yaml 4.3.2

**Execution path and actual exposure:** ESLint legacy configuration support depends on YAML parsing. Adversarial merge keys/aliases/omap data trigger these advisories; the active configuration is eslint.config.ts and no YAML config import is exposed to gallery users. Compatible parser repairs were installed.

</details>

<details>
<summary>GHSA-5j98-mcp5-4vw2 · high · repaired_or_removed</summary>

[glob CLI: Command injection via -c/--cmd executes matches with shell:true](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)

**Exact baseline chain(s):**

- `component-forge > tailwindcss@3.4.17 > sucrase@3.35.0 > glob@10.4.5`

**Affected range(s):** `>=10.2.0 <10.5.0`

**Fixed/repaired version:** Verified repaired installed release(s): glob 10.5.0

**Execution path and actual exposure:** The command-injection advisory is in the glob CLI -c/--cmd shell path. The repository uses glob programmatically through tooling and has no glob -c/--cmd invocation. The CLI package was nevertheless patched to 10.5.0.

</details>

<details>
<summary>GHSA-5p4m-2wfm-xmqj · high · repaired_or_removed</summary>

[JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > js-yaml@4.1.0`

**Affected range(s):** `>=4.0.0 <4.3.1`

**Fixed/repaired version:** Verified repaired installed release(s): js-yaml 4.3.2

**Execution path and actual exposure:** ESLint legacy configuration support depends on YAML parsing. Adversarial merge keys/aliases/omap data trigger these advisories; the active configuration is eslint.config.ts and no YAML config import is exposed to gallery users. Compatible parser repairs were installed.

</details>

<details>
<summary>GHSA-6j4f-fj2g-mc7p · high · repaired_or_removed</summary>

[brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.19`, `>=2.0.0 <2.1.5`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-73wf-gq98-2v4g · high · repaired_or_removed</summary>

[Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)](https://github.com/advisories/GHSA-73wf-gq98-2v4g)

**Exact baseline chain(s):**

- `component-forge > autoprefixer@10.4.21 > browserslist@4.25.1`

**Affected range(s):** `<=4.28.6`

**Fixed/repaired version:** Verified repaired installed release(s): browserslist 4.29.4

**Execution path and actual exposure:** Autoprefixer/build processing loads Browserslist. Distinct adversarial queries or a malicious browserslist-stats.json trigger the cache/prototype paths; no custom statistics file or user-controlled query is present. Long-lived dev/build tooling can still be exposed by changed project configuration; patched within the existing major.

</details>

<details>
<summary>GHSA-7r86-cg39-jmmj · high · repaired_or_removed</summary>

[minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2`

**Affected range(s):** `<3.1.3`, `>=9.0.0 <9.0.7`

**Fixed/repaired version:** Verified repaired installed release(s): minimatch 10.2.6/3.1.5/9.0.9

**Execution path and actual exposure:** File-discovery and lint/build filtering invoke glob matching. Backtracking needs adversarial pattern structure; current include/exclude patterns are tracked constants. PR/configuration changes remain a possible CI resource-exhaustion path, so compatible branches were patched.

</details>

<details>
<summary>GHSA-c2c7-rcm5-vvqj · high · repaired_or_removed</summary>

[Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj)

**Exact baseline chain(s):**

- `component-forge > @vitest/ui@3.2.4 > tinyglobby@0.2.14 > picomatch@4.0.3`
- `component-forge > tailwindcss@3.4.17 > micromatch@4.0.8 > picomatch@2.3.1`
- `component-forge > vite@7.0.5 > picomatch@4.0.3`
- `component-forge > vitest@3.2.4 > picomatch@4.0.3`
- `component-forge > vue-tsc@3.0.3 > @vue/language-core@3.0.3 > picomatch@4.0.3`

**Affected range(s):** `<2.3.2`, `>=4.0.0 <4.0.4`

**Fixed/repaired version:** Verified repaired installed release(s): picomatch 2.3.2/4.0.7

**Execution path and actual exposure:** Vite/Tailwind/test discovery uses pattern matching. Adversarial POSIX classes or extglob patterns are the trigger, not ordinary label/preset data. Tracked build patterns constrain current inputs; patched in both installed major branches.

</details>

<details>
<summary>GHSA-c83g-rgw3-j3cx · high · repaired_or_removed</summary>

[Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM](https://github.com/advisories/GHSA-c83g-rgw3-j3cx)

**Exact baseline chain(s):**

- `component-forge > autoprefixer@10.4.21 > browserslist@4.25.1`

**Affected range(s):** `<=4.28.6`

**Fixed/repaired version:** Verified repaired installed release(s): browserslist 4.29.4

**Execution path and actual exposure:** Autoprefixer/build processing loads Browserslist. Distinct adversarial queries or a malicious browserslist-stats.json trigger the cache/prototype paths; no custom statistics file or user-controlled query is present. Long-lived dev/build tooling can still be exposed by changed project configuration; patched within the existing major.

</details>

<details>
<summary>GHSA-fx2h-pf6j-xcff · high · repaired_or_removed</summary>

[vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.3.4`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>

<details>
<summary>GHSA-mh99-v99m-4gvg · high · repaired_or_removed</summary>

[brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.17`, `>=2.0.0 <2.1.3`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-mw96-cpmx-2vgc · high · repaired_or_removed</summary>

[Rollup 4 has Arbitrary File Write via Path Traversal](https://github.com/advisories/GHSA-mw96-cpmx-2vgc)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5 > rollup@4.45.1`

**Affected range(s):** `>=4.0.0 <4.59.0`

**Fixed/repaired version:** Verified repaired installed release(s): rollup 4.64.12

**Execution path and actual exposure:** Application/library builds execute Rollup output generation. The write-path advisory needs attacker-controlled output filenames/path construction; output paths here are tracked vite.config.ts values. Build plugins or untrusted source/configuration can widen exposure. Patched to a fixed 4.x release.

</details>

<details>
<summary>GHSA-p9ff-h696-f583 · high · repaired_or_removed</summary>

[Vite Vulnerable to Arbitrary File Read via Vite Dev Server WebSocket](https://github.com/advisories/GHSA-p9ff-h696-f583)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.3.1`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>

<details>
<summary>GHSA-qhr7-859c-m2p7 · high · repaired_or_removed</summary>

[brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion](https://github.com/advisories/GHSA-qhr7-859c-m2p7)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.20`, `>=2.0.0 <2.1.6`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-rf6f-7fwh-wjgh · high · repaired_or_removed</summary>

[Prototype Pollution via parse() in NodeJS flatted](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh)

**Exact baseline chain(s):**

- `component-forge > @vitest/ui@3.2.4 > flatted@3.3.3`

**Affected range(s):** `<=3.4.1`

**Fixed/repaired version:** Verified repaired installed release(s): flatted 3.4.4

**Execution path and actual exposure:** ESLint file-cache tooling depends on flatted. Parsing poisoned cache data is the trigger; lint currently runs without --cache and no cache import is exposed. Parser patches were installed, not ignored.

</details>

<details>
<summary>GHSA-rgw5-rvv9-x895 · high · repaired_or_removed</summary>

[brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.18`, `>=2.0.0 <2.1.4`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-g4jq-h2w9-997c · low · repaired_or_removed</summary>

[Vite middleware may serve files starting with the same name with the public directory](https://github.com/advisories/GHSA-g4jq-h2w9-997c)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.0.6`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>

<details>
<summary>GHSA-jqfw-vq24-v9c3 · low · repaired_or_removed</summary>

[Vite's `server.fs` settings were not applied to HTML files](https://github.com/advisories/GHSA-jqfw-vq24-v9c3)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.0.6`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>

<details>
<summary>GHSA-w9m9-85wc-3x92 · low · repaired_or_removed</summary>

[postcss-selector-parser allows denial of service through uncontrolled AST recursion](https://github.com/advisories/GHSA-w9m9-85wc-3x92)

**Exact baseline chain(s):**

- `component-forge > @tailwindcss/typography@0.5.16 > postcss-selector-parser@6.0.10`
- `component-forge > eslint-plugin-vue@10.3.0 > postcss-selector-parser@6.1.2`
- `component-forge > tailwindcss@3.4.17 > postcss-nested@6.2.0 > postcss-selector-parser@6.1.2`
- `component-forge > tailwindcss@3.4.17 > postcss-selector-parser@6.1.2`

**Affected range(s):** `>=6.1.0 <6.1.3`

**Fixed/repaired version:** 7.1.6; retained Tailwind/PostCSS/typography constraints also install 6.0.10/6.1.5. The earlier 6.1.0..<6.1.3 recursion issue was patched in affected 6.1.5 nodes.

**Execution path and actual exposure:** Tailwind/PostCSS/typography can parse CSS selectors supplied by repository source. Untrusted PR CSS or imported project styles can trigger CPU exhaustion during build; this is a real build-input exposure. Some parents still constrain parser 6.x, so the remaining advisory is not declared resolved.

</details>

<details>
<summary>GHSA-2g4f-4pwh-qvx6 · moderate · repaired_or_removed</summary>

[ajv has ReDoS when using `$data` option](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > ajv@6.12.6`

**Affected range(s):** `<6.14.0`

**Fixed/repaired version:** Verified repaired installed release(s): ajv 6.15.0

**Execution path and actual exposure:** ESLint loads Ajv for configuration/schema checks. The ReDoS advisory requires the $data option and adversarial schema/data; this repository uses a checked-in flat TS config and does not enable $data. A compatible patch was still installed.

</details>

<details>
<summary>GHSA-3v7f-55p6-f55p · moderate · repaired_or_removed</summary>

[Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p)

**Exact baseline chain(s):**

- `component-forge > @vitest/ui@3.2.4 > tinyglobby@0.2.14 > picomatch@4.0.3`
- `component-forge > tailwindcss@3.4.17 > micromatch@4.0.8 > picomatch@2.3.1`
- `component-forge > vite@7.0.5 > picomatch@4.0.3`
- `component-forge > vitest@3.2.4 > picomatch@4.0.3`
- `component-forge > vue-tsc@3.0.3 > @vue/language-core@3.0.3 > picomatch@4.0.3`

**Affected range(s):** `<2.3.2`, `>=4.0.0 <4.0.4`

**Fixed/repaired version:** Verified repaired installed release(s): picomatch 2.3.2/4.0.7

**Execution path and actual exposure:** Vite/Tailwind/test discovery uses pattern matching. Adversarial POSIX classes or extglob patterns are the trigger, not ordinary label/preset data. Tracked build patterns constrain current inputs; patched in both installed major branches.

</details>

<details>
<summary>GHSA-48c2-rrv3-qjmp · moderate · repaired_or_removed</summary>

[yaml is vulnerable to Stack Overflow via deeply nested YAML collections](https://github.com/advisories/GHSA-48c2-rrv3-qjmp)

**Exact baseline chain(s):**

- `component-forge > tailwindcss@3.4.17 > postcss-load-config@4.0.2 > yaml@2.8.0`

**Affected range(s):** `>=2.0.0 <2.8.3`

**Fixed/repaired version:** Verified repaired installed release(s): yaml 2.9.1

**Execution path and actual exposure:** PostCSS/config loaders can parse YAML configuration. Deep malicious collections are the trigger. Current PostCSS config is JS, not YAML; repository/configuration inputs could still change that exposure. Compatible parser patch installed.

</details>

<details>
<summary>GHSA-4w7w-66w2-5vf9 · moderate · repaired_or_removed</summary>

[Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.3.1`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>

<details>
<summary>GHSA-82fw-gwwq-j7x9 · moderate · repaired_or_removed</summary>

[Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock](https://github.com/advisories/GHSA-82fw-gwwq-j7x9)

**Exact baseline chain(s):**

- `component-forge > vitest@3.2.4`
- `component-forge > vitest@3.2.4 > @vitest/mocker@3.2.4`

**Affected range(s):** `>=2.1.0 <4.1.11`

**Fixed/repaired version:** Verified repaired installed release(s): @vitest/mocker 4.1.11, vitest 4.1.11

**Execution path and actual exposure:** The test UI/API and redirect-mock route can handle attacker-controlled URL paths when the test server is listening. test:ui is an advertised command, so this was treated as reachable server tooling, not dismissed because tests are development dependencies. The advertised test:ui command starts the affected server. An attacker reaching its API is the stated file-read/execution precondition; loopback alone is not considered a fix. The patched UI and real loopback HTTP endpoint were verified.

</details>

<details>
<summary>GHSA-93m4-6634-74q7 · moderate · repaired_or_removed</summary>

[vite allows server.fs.deny bypass via backslash on Windows](https://github.com/advisories/GHSA-93m4-6634-74q7)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.0.7`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>

<details>
<summary>GHSA-f886-m6hf-6m8v · moderate · repaired_or_removed</summary>

[brace-expansion: Zero-step sequence causes process hang and memory exhaustion](https://github.com/advisories/GHSA-f886-m6hf-6m8v)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.13`, `>=2.0.0 <2.0.3`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-h67p-54hq-rp68 · moderate · repaired_or_removed</summary>

[JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > js-yaml@4.1.0`

**Affected range(s):** `>=4.0.0 <=4.1.1`

**Fixed/repaired version:** Verified repaired installed release(s): js-yaml 4.3.2

**Execution path and actual exposure:** ESLint legacy configuration support depends on YAML parsing. Adversarial merge keys/aliases/omap data trigger these advisories; the active configuration is eslint.config.ts and no YAML config import is exposed to gallery users. Compatible parser repairs were installed.

</details>

<details>
<summary>GHSA-mh29-5h37-fv8m · moderate · repaired_or_removed</summary>

[js-yaml has prototype pollution in merge (<<)](https://github.com/advisories/GHSA-mh29-5h37-fv8m)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > js-yaml@4.1.0`

**Affected range(s):** `>=4.0.0 <4.1.1`

**Fixed/repaired version:** Verified repaired installed release(s): js-yaml 4.3.2

**Execution path and actual exposure:** ESLint legacy configuration support depends on YAML parsing. Adversarial merge keys/aliases/omap data trigger these advisories; the active configuration is eslint.config.ts and no YAML config import is exposed to gallery users. Compatible parser repairs were installed.

</details>

<details>
<summary>GHSA-p498-v437-472g · moderate · repaired_or_removed</summary>

[humanfs: Recursive copy follows symlinked files and copies data from outside the source tree](https://github.com/advisories/GHSA-p498-v437-472g)

**Exact baseline chain(s):**

- `component-forge > eslint@9.31.0 > @humanfs/node@0.16.6`

**Affected range(s):** `<0.16.8`

**Fixed/repaired version:** Verified repaired installed release(s): @humanfs/node 0.16.8

**Execution path and actual exposure:** ESLint uses humanfs for repository traversal. The vulnerable recursive-copy API requires a copy operation over attacker-controlled symlinks; these scripts do not call that API. It was patched rather than exempted.

</details>

<details>
<summary>GHSA-px8p-9vwx-vf98 · moderate · repaired_or_removed</summary>

[fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives](https://github.com/advisories/GHSA-px8p-9vwx-vf98)

**Exact baseline chain(s):**

- `component-forge > @vitest/ui@3.2.4 > fflate@0.8.2`

**Affected range(s):** `>=0.8.0 <0.8.3`

**Fixed/repaired version:** Verified repaired installed release(s): fflate 0.8.3

**Execution path and actual exposure:** Vitest UI/report tooling can decompress archives. The malformed ZIP64 precondition is not exposed as a gallery upload endpoint; unsafe report/archive input could still trigger it. Patched to 0.8.3.

</details>

<details>
<summary>GHSA-q2hr-2g5m-vwhr · moderate · repaired_or_removed</summary>

[brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr)

**Exact baseline chain(s):**

- `component-forge > @vue/eslint-config-typescript@14.6.0 > @typescript-eslint/utils@8.38.0 > @typescript-eslint/typescript-estree@8.38.0 > minimatch@9.0.5 > brace-expansion@2.0.2`
- `component-forge > eslint@9.31.0 > @eslint/config-array@0.21.0 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > @eslint/eslintrc@3.3.1 > minimatch@3.1.2 > brace-expansion@1.1.12`
- `component-forge > eslint@9.31.0 > minimatch@3.1.2 > brace-expansion@1.1.12`

**Affected range(s):** `<1.1.21`, `>=2.0.0 <2.1.7`

**Fixed/repaired version:** Verified repaired installed release(s): brace-expansion 1.1.21/2.1.7/5.0.12

**Execution path and actual exposure:** Build/lint glob discovery can invoke expansion. Exploitation requires adversarial expanding/nested pattern text; current content patterns are fixed in tracked configuration, but untrusted CI configuration changes could exercise the function. Compatible patched branches were installed.

</details>

<details>
<summary>GHSA-v6wh-96g9-6wx3 · moderate · repaired_or_removed</summary>

[launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3)

**Exact baseline chain(s):**

- `component-forge > vite@7.0.5`

**Affected range(s):** `>=7.0.0 <=7.3.4`

**Fixed/repaired version:** Verified repaired installed release(s): vite 7.3.7

**Execution path and actual exposure:** npm run dev and Vitest UI run Vite server code. Adversarial HTTP/WebSocket paths can reach file-serving/optimized-map handlers; Windows-only paths do not trigger on this Linux executor but remain relevant to developers. Vite 7.3.7 patches the recorded server advisories; real dev HTTP responses were checked.

</details>


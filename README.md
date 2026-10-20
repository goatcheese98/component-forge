# Component Forge

Vue 3 / TypeScript button laboratory and component gallery. Neutral LUM chrome is the default; existing effect presets and Style, Effects, Transform and Layout controls remain available for experiments.

Use Node 24 and the committed npm lockfile:

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run check:lib
npm run check:packed
```

`build` checks the application and writes a static site to `dist-dev/`. `build:lib` separately emits ESM (`dist/index.esm.js`), CommonJS (`dist/index.cjs`), `dist/style.css` and declarations rooted at `dist/index.d.ts`. `check:lib` also verifies both module formats and typechecks a consumer without application aliases. `check:packed` additionally extracts an actual `npm pack --ignore-scripts` tarball and verifies package-name consumer declarations, ESM and CommonJS. Nothing is published by these checks. Publishing remains a separate, unperformed operation.

Real browser checks against the built static site:

```sh
pip install -r tests/requirements-browser.txt
python -m playwright install --with-deps chromium
npm run build
python tests/browser.py
```

Cloud images with system Chromium can use `CHROMIUM_PATH=/usr/bin/chromium`. Browser evidence is written to ignored `work/browser/`; the suite starts and stops its own loopback preview on port 5175. Quality CI has read-only repository permissions, a 15-minute bound, and runs the same checks. No deployment job is configured.

For a future Cloudflare Pages setup, the verified static build command is `npm run build` and output directory is `dist-dev`. No server adapter, Workers runtime, credentials or production deployment is needed for this static slice, and none has been provisioned or invoked.

See [design provenance](docs/design/button-lab.md) and [verification/limits](docs/verification.md).

## Importing configuration safely

Public exporters still accept `ButtonTestState`; they now validate it at runtime as well. Invalid input throws `TypeError('Invalid button configuration')` before any CSS or Tailwind text is produced. For untrusted JSON/object input:

```ts
import { parseButtonState, generateCSSCode, parsePresets, serializePresets } from 'component-forge'
const external: unknown = JSON.parse(sourceText)
const css = generateCSSCode(parseButtonState(external))
const saved = serializePresets(parsePresets(presetJSON))
```

Handle parser errors at the import boundary. `parseButtonState` returns an independent copy of known data fields; it does not invoke custom serialization methods. Presets retain the shared 100-item/200,000-character storage bounds. Supported colors are 3/4/6/8-digit hex, transparent, `var(--acc)`, comma RGB/HSL functions and three-channel space RGB/HSL. Easing is a named easing or four-value cubic Bézier with x coordinates in [0,1]. Unsupported/invalid CSS is rejected rather than exported as broken rules.

Vue's peer minimum is now 3.5.42 for its compatible SSR security fix; the lockfile fixes related compiler/source-map/CSS dependencies. Unused GSAP was removed. [Audit scope and remaining tooling findings](docs/boundary-hardening.md) distinguish shipped/runtime code from development tooling. The packed consumer exercises declarations, public validation, escaped-label SSR and ESM/CommonJS without publishing.

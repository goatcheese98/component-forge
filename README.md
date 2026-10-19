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

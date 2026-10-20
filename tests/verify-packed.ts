import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, renameSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(root, 'work'), { recursive: true })
const consumer = mkdtempSync(join(root, 'work', 'packed-consumer-'))
const packed: unknown = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', consumer], {
  cwd: root, encoding: 'utf8', env: { ...process.env, npm_config_cache: join(root, 'work', 'npm-cache') }
}))
assert.ok(Array.isArray(packed) && packed.length === 1)
const entry: unknown = packed[0]
assert.ok(entry && typeof entry === 'object' && 'filename' in entry && typeof entry.filename === 'string')
assert.match(entry.filename, /^[a-zA-Z0-9.-]+\.tgz$/)
// A distinct package scope prevents repository self-reference from bypassing the tarball.
writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'component-forge-packed-consumer', private: true, type: 'module' }))
const modules = join(consumer, 'node_modules')
mkdirSync(modules)
execFileSync('tar', ['-xzf', join(consumer, entry.filename), '-C', modules])
renameSync(join(modules, 'package'), join(modules, 'component-forge'))
writeFileSync(join(consumer, 'index.ts'), `import { ButtonTestingLab, ThemeSelector, Icon, generateCSSCode, generateCSSFromState, generateTailwindClasses, parseButtonState, parsePresets, serializePresets, type ButtonTestState } from 'component-forge'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
const render = (state: ButtonTestState): string => generateCSSCode(state)
void [ButtonTestingLab, ThemeSelector, Icon, render]
const external: unknown = null
for (const exporter of [generateCSSCode, generateCSSFromState, generateTailwindClasses]) {
  let rejected = false
  try { exporter(external as ButtonTestState) } catch (error: unknown) { rejected = error instanceof TypeError && error.message === 'Invalid button configuration' }
  if (!rejected) throw new Error('Packed export did not validate its public boundary')
}
const parseExternal = (value: unknown): ButtonTestState => parseButtonState(value)
if (serializePresets(parsePresets('[]')) !== '[]') throw new Error('Preset parser roundtrip failed')
void parseExternal
const markup = await renderToString(createSSRApp(ButtonTestingLab, { buttonText: '<script>alert(1)</script>' }))
if (markup.includes('<script>') || !markup.includes('&lt;script&gt;')) throw new Error('Packed SSR label was not escaped')
const theme = await renderToString(createSSRApp(ThemeSelector))
if (!theme.includes('Theme')) throw new Error('Packed theme selector failed SSR')
`)
writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { strict: true, noEmit: true, module: 'ESNext', moduleResolution: 'Bundler', target: 'ES2022', skipLibCheck: false },
  include: ['index.ts']
}))
execFileSync(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(consumer, 'tsconfig.json')], { stdio: 'inherit' })
execFileSync(process.execPath, [join(consumer, 'index.ts')], { stdio: 'inherit' })
const require = createRequire(join(consumer, 'index.cjs'))
assert.equal(require.resolve('component-forge'), join(modules, 'component-forge', 'dist', 'index.cjs'))
const cjs: unknown = require('component-forge')
assert.ok(cjs && typeof cjs === 'object' && 'ButtonTestingLab' in cjs && 'generateCSSCode' in cjs)
console.log('Packed tarball: strict declarations, public validation, escaped-label SSR, ESM and CommonJS passed; no publish scripts ran.')

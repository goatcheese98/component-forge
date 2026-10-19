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
writeFileSync(join(consumer, 'index.ts'), `import { ButtonTestingLab, ThemeSelector, Icon, generateCSSCode, type ButtonTestState } from 'component-forge'
const render = (state: ButtonTestState): string => generateCSSCode(state)
void [ButtonTestingLab, ThemeSelector, Icon, render]
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
console.log('Packed tarball: strict consumer declarations, ESM and CommonJS passed; no publish scripts ran.')

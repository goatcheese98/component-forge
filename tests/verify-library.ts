import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const esm: unknown = await import(new URL('../dist/index.esm.js', import.meta.url).href)
const cjs: unknown = createRequire(import.meta.url)('../dist/index.cjs')
for (const library of [esm, cjs]) {
  assert.ok(library && typeof library === 'object')
  for (const key of ['ButtonTestingLab', 'ThemeSelector', 'Icon', 'generateCSSCode', 'generateCSSFromState', 'generateTailwindClasses', 'copyToClipboard']) {
    assert.ok(key in library, `Missing public export: ${key}`)
  }
}
console.log('ESM + CJS public exports load successfully')

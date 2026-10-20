import { describe, expect, it, vi } from 'vitest'
import { cloneState, defaultButtonState, initialButtonState, parsePresets, presets, serializePresets, MAX_PRESETS, parseButtonState } from '../src/lib/button-state'
import { copyToClipboard, generateCSSCode, generateCSSFromState, generateTailwindClasses } from '../src/lib/utils'

describe('configuration and persistence boundary', () => {
  it('roundtrips every built-in without sharing reset state', () => {
    const custom = presets.map((p, i) => ({ ...p, id: `custom-${i}`, label: '<img onerror=alert(1)>' }))
    expect(parsePresets(JSON.stringify(custom))).toEqual(custom)
    const changed = cloneState(defaultButtonState)
    changed.border.radius = 40
    expect(initialButtonState().border.radius).toBe(8)
    expect(initialButtonState({ border: changed.border }).border.radius).toBe(40)
    expect(defaultButtonState.border.radius).toBe(8)
  })
  it('uses the read boundary for writes at capacity, rejecting overflow and invalid configs', () => {
    const collection = Array.from({ length: MAX_PRESETS }, (_, i) => ({ id: `custom-${i}`, name: `Preset ${i}`, description: 'Custom', config: cloneState(defaultButtonState) }))
    expect(parsePresets(serializePresets(collection))).toEqual(collection)
    expect(() => serializePresets([...collection, { ...collection[0]!, id: 'custom-extra' }])).toThrow()
    const invalid = [{ ...collection[0]!, config: { ...defaultButtonState, border: { ...defaultButtonState.border, radius: -1 } } }]
    expect(() => serializePresets(invalid)).toThrow()
    expect(collection).toHaveLength(MAX_PRESETS)
  })
  it.each(['{', '{}', '[{}]', JSON.stringify([{ id:'neutral' }]), 'x'.repeat(200001)])('rejects malformed storage', raw => {
    expect(() => parsePresets(raw)).toThrow()
  })
  it('rejects CSS injection and nonfinite/out-of-bounds numbers', () => {
    const config = cloneState(defaultButtonState)
    const raw = () => JSON.stringify([{ id:'custom-1', name:'Unsafe', description:'Test', config }])
    config.background.color = 'red; } body { display: none'
    expect(() => parsePresets(raw())).toThrow()
    config.background.color = 'url(https://example.com)'
    expect(() => parsePresets(raw())).toThrow()
    config.background.color = '#ffffff'
    config.border.radius = -1
    expect(() => parsePresets(raw())).toThrow()
    expect(initialButtonState({ transform: { ...config.transform, scale: Infinity } })).toEqual(defaultButtonState)
  })
})
describe('export fidelity', () => {
  it('includes dimensions, valid gradient directions, both shadows, tokens and reduced motion', () => {
    const config = cloneState(presets.find(p => p.id === 'cyberpunk')!.config)
    config.size.width = '180px'
    const styles = generateCSSFromState(config)
    expect(styles.background).toBe('linear-gradient(to right, #9933ff, #00d4ff)')
    expect(styles.width).toBe('180px')
    expect(styles.boxSizing).toBe('border-box')
    expect(styles.boxShadow).toContain(', ')
    const code = generateCSSCode(config)
    expect(code).toContain('width: 180px;')
    expect(code).toContain('prefers-reduced-motion')
    expect(code).toContain('@keyframes glow-pulse')
    expect(generateCSSCode(defaultButtonState)).toContain('--on-acc: #141210')
    expect(generateCSSCode(defaultButtonState)).toBe(generateCSSCode(initialButtonState()))
    expect(generateTailwindClasses(config)).toContain('[width:180px]')
  })
  it('reports clipboard rejection and does not resolve before the write completes', async () => {
    let resolveWrite!: () => void
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(() => new Promise<void>(resolve => { resolveWrite = resolve })) } })
    let complete = false
    const pending = copyToClipboard('code').then(() => { complete = true })
    await Promise.resolve()
    expect(complete).toBe(false)
    resolveWrite()
    await pending
    expect(complete).toBe(true)
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    await expect(copyToClipboard('code')).rejects.toThrow('denied')
    vi.unstubAllGlobals()
  })
})

describe('public export trust boundary', () => {
  it.each([generateCSSFromState, generateCSSCode, generateTailwindClasses])('rejects CSS rule injection before generating output', exporter => {
    const injected = cloneState(defaultButtonState)
    injected.background.color = 'red; } body { display: none; /*'
    expect(() => exporter(injected)).toThrow('Invalid button configuration')
  })
  it.each(['#12345', 'rgb(,,,,)', 'rgba(1,2,3,8)', 'rgb(10%,20,30)'])('rejects malformed persisted CSS values', color => {
    const config = cloneState(defaultButtonState)
    config.background.color = color
    expect(() => serializePresets([{ id:'custom-invalid', name:'Invalid', description:'Test', config }])).toThrow()
  })
  it('rejects malformed persisted easing and font size', () => {
    for (const timing of ['cubic-bezier(0,1)', 'cubic-bezier(2,0,0,1)']) {
      const config = cloneState(defaultButtonState)
      config.transition.timing = timing
      expect(() => serializePresets([{ id:'custom-invalid', name:'Invalid', description:'Test', config }])).toThrow()
    }
    const config = cloneState(defaultButtonState)
    config.typography.size = 'auto'
    expect(() => generateCSSCode(config)).toThrow('Invalid button configuration')
  })
})

it('parses public unknown input into an independent typed state and preserves valid CSS grammars', () => {
  const external: unknown = JSON.parse(JSON.stringify(defaultButtonState))
  const result = parseButtonState(external)
  result.border.radius = 30
  expect((external as typeof result).border.radius).toBe(8)
  for (const color of ['#abcd', '#aabbccdd', 'rgb(10 20 30)', 'rgba(10,20,30,.5)', 'hsl(120,50%,40%)']) {
    const state = cloneState(defaultButtonState)
    state.background.color = color
    expect(generateCSSFromState(parseButtonState(state)).background).toBe(color)
  }
  for (const value of [null, [], {}, 'not a configuration']) expect(() => parseButtonState(value)).toThrow('Invalid button configuration')
})

it('rejects CSS-invalid numeric values at the shared public boundary', () => {
  const config = cloneState(defaultButtonState)
  config.typography.weight = -1
  expect(() => parseButtonState(config)).toThrow('Invalid button configuration')
  config.typography.weight = 500
  config.backdrop.contrast = -1
  expect(() => parseButtonState(config)).toThrow('Invalid button configuration')
})

it('requires own configuration fields and ignores custom serialization methods at the public boundary', () => {
  expect(() => parseButtonState(Object.create(defaultButtonState))).toThrow('Invalid button configuration')
  const toJSON = vi.fn(() => ({ unsafe: true }))
  const input = { ...cloneState(defaultButtonState), toJSON }
  expect(parseButtonState(input)).toEqual(defaultButtonState)
  expect(toJSON).not.toHaveBeenCalled()
  expect(generateCSSCode(input)).toContain('background: var(--acc)')
})

it('normalizes imported preset configs before cloning or exporting unknown nested data', () => {
  const config = JSON.stringify(defaultButtonState).slice(0, -1) + ',"extra":' + '['.repeat(10000) + '0' + ']'.repeat(10000) + '}'
  const raw = '[{"id":"custom-depth","name":"Depth","description":"Test","config":' + config + '}]'
  const imported = parsePresets(raw)
  expect(() => cloneState(imported[0]!.config)).not.toThrow()
  expect(imported[0]!.config).toEqual(defaultButtonState)
})

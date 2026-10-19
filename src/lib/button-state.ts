import type { ButtonTestState, ComponentPreset } from './types'

export const defaultButtonState: ButtonTestState = {
  glow: { enabled: false, intensity: 50, color: '#ff6600', animated: false },
  transform: { scale: 100, rotate: 0, skewX: 0, skewY: 0, perspective: false },
  transition: { duration: 300, timing: 'ease', enabled: false },
  hoverEffect: 'none',
  background: { type: 'solid', color: 'var(--acc)', gradientStart: '#ff6600', gradientEnd: '#00d4ff', gradientDirection: 'to-r' },
  typography: { weight: 500, size: '1rem', spacing: 0, transform: 'none' },
  size: { width: 'auto', height: 'auto', padding: 12 },
  border: { radius: 8, width: 1, style: 'solid', color: 'transparent' },
  backdrop: { blur: 0, brightness: 100, contrast: 100 },
  shadow: { enabled: false, x: 0, y: 4, blur: 15, spread: 0, color: 'rgba(0,0,0,0.2)' }
}

export const presets: ComponentPreset[] = [
  { id: 'neutral', name: 'LUM / Neutral', description: 'Accessible neutral default', config: defaultButtonState },
  {
    id: 'standard',
    name: '🎯 Standard DaisyUI',
    description: 'Clean, standard DaisyUI button styling',
    config: { ...defaultButtonState }
  },
  {
    id: 'enhanced-tailwind',
    name: '✨ Enhanced Tailwind',
    description: 'Button with hover scale, rotation, and shadow effects',
    config: {
      ...defaultButtonState,
      transform: { scale: 110, rotate: 1, skewX: 0, skewY: 0, perspective: false },
      shadow: { enabled: true, x: 0, y: 4, blur: 25, spread: 0, color: 'rgba(0,0,0,0.3)' }
    }
  },
  {
    id: 'apex-glow',
    name: '🔥 Apex Glow',
    description: 'Custom glow effect with Apex orange theme',
    config: {
      ...defaultButtonState,
      glow: { enabled: true, intensity: 80, color: '#ff6600', animated: true },
      transform: { scale: 102, rotate: 0, skewX: 0, skewY: 0, perspective: false },
      shadow: { enabled: true, x: 0, y: 8, blur: 25, spread: 0, color: 'rgba(255,102,0,0.5)' }
    }
  },
  {
    id: 'cyberpunk',
    name: '⚡ Cyberpunk',
    description: 'Futuristic button with neon gradient and effects',
    config: {
      ...defaultButtonState,
      glow: { enabled: true, intensity: 90, color: '#00d4ff', animated: true },
      transform: { scale: 105, rotate: 0, skewX: -2, skewY: 0, perspective: false },
      transition: { duration: 400, timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      background: { type: 'gradient', color: '#ff6600', gradientStart: '#9933ff', gradientEnd: '#00d4ff', gradientDirection: 'to-r' },
      typography: { weight: 700, size: '1rem', spacing: 1, transform: 'uppercase' },
      size: { width: 'auto', height: 'auto', padding: 20 },
      border: { radius: 0, width: 2, style: 'solid', color: '#00d4ff' },
      backdrop: { blur: 4, brightness: 110, contrast: 120 },
      shadow: { enabled: true, x: 0, y: 0, blur: 20, spread: 2, color: 'rgba(0,212,255,0.4)' }
    }
  },
  {
    id: 'glassmorphism',
    name: '🌟 Glassmorphism',
    description: 'Modern glass effect with backdrop blur',
    config: {
      ...defaultButtonState,
      transform: { scale: 102, rotate: 0, skewX: 0, skewY: 0, perspective: false },
      transition: { duration: 250, timing: 'ease-out', enabled: true },
      background: { type: 'solid', color: 'rgba(255,255,255,0.1)', gradientStart: '#ff6600', gradientEnd: '#00d4ff', gradientDirection: 'to-r' },
      typography: { weight: 500, size: '1rem', spacing: 0.5, transform: 'none' },
      size: { width: 'auto', height: 'auto', padding: 18 },
      border: { radius: 16, width: 1, style: 'solid', color: 'rgba(255,255,255,0.2)' },
      backdrop: { blur: 12, brightness: 105, contrast: 105 },
      shadow: { enabled: true, x: 0, y: 8, blur: 32, spread: 0, color: 'rgba(0,0,0,0.1)' }
    }
  }
]

export const cloneState = (state: ButtonTestState): ButtonTestState => JSON.parse(JSON.stringify(state))

// Storage is untrusted. Bound size, shape, numeric ranges, and CSS strings before use.
function validShape(value: unknown, sample: unknown): boolean {
  if (typeof sample === 'number') return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 10000
  if (typeof sample === 'boolean') return typeof value === 'boolean'
  if (typeof sample === 'string') return typeof value === 'string' && value.length <= 100 && /^[a-zA-Z0-9#(),.% +\-]*$|^var\(--(?:acc|on-acc)\)$/.test(value)
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.entries(sample as Record<string, unknown>).every(([key, item]) => validShape(record[key], item))
}
export function isButtonState(value: unknown): value is ButtonTestState {
  if (!validShape(value, defaultButtonState)) return false
  const state = value as ButtonTestState
  const color = (text: string): boolean => /^(#[0-9a-fA-F]{3,8}|transparent|var\(--acc\)|(?:rgb|rgba|hsl|hsla)\([0-9.,% ]+\))$/.test(text)
  const length = (text: string): boolean => /^(auto|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%))$/.test(text)
  return ['solid', 'gradient'].includes(state.background.type) &&
    ['to-r','to-l','to-t','to-b','to-tr','to-tl','to-br','to-bl'].includes(state.background.gradientDirection) &&
    [state.background.color, state.background.gradientStart, state.background.gradientEnd, state.border.color, state.glow.color, state.shadow.color].every(color) &&
    [state.typography.size, state.size.width, state.size.height].every(length) &&
    ['none','uppercase','lowercase','capitalize'].includes(state.typography.transform) &&
    ['none','solid','dashed','dotted','double'].includes(state.border.style) &&
    /^(ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier\([-0-9., ]+\))$/.test(state.transition.timing) &&
    state.border.radius >= 0 && state.border.radius <= 100 && state.border.width >= 0 && state.border.width <= 20 &&
    state.size.padding >= 0 && state.size.padding <= 100 && state.transform.scale >= 0 && state.transform.scale <= 300 &&
    state.transition.duration >= 0 && state.transition.duration <= 10000 &&
    state.glow.intensity >= 0 && state.glow.intensity <= 100 && state.shadow.blur >= 0 && state.shadow.blur <= 100 &&
    state.backdrop.blur >= 0 && state.backdrop.blur <= 100

}
export function parsePresets(raw: string): ComponentPreset[] {
  if (raw.length > 200000) throw new Error('Preset storage is too large')
  const value: unknown = JSON.parse(raw)
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid preset list')
  const seen = new Set<string>()
  for (const item of value) {
    if (!item || typeof item !== 'object') throw new Error('Invalid preset')
    const record = item as Record<string, unknown>
    if (typeof record.id !== 'string' || !/^custom-[a-zA-Z0-9-]{1,80}$/.test(record.id) || seen.has(record.id) ||
        typeof record.name !== 'string' || record.name.trim().length < 1 || record.name.length > 40 ||
        typeof record.description !== 'string' || record.description.length > 100 || !isButtonState(record.config) ||
        (record.label !== undefined && (typeof record.label !== 'string' || record.label.length > 80))) throw new Error('Invalid preset')
    seen.add(record.id)
  }
  return value as ComponentPreset[]
}
export function initialButtonState(partial?: Partial<ButtonTestState>): ButtonTestState {
  const merged = { ...cloneState(defaultButtonState), ...partial }
  return isButtonState(merged) ? cloneState(merged) : cloneState(defaultButtonState)
}

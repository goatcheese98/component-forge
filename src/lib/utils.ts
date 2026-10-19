import type { ButtonTestState } from './types'

export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) throw new Error('Copy unavailable')
  await navigator.clipboard.writeText(text)
}

export function generateCSSFromState(state: ButtonTestState): Record<string, string> {
  const directions: Record<string, string> = { 'to-r': 'to right', 'to-l': 'to left', 'to-t': 'to top', 'to-b': 'to bottom', 'to-tr': 'to top right', 'to-tl': 'to top left', 'to-br': 'to bottom right', 'to-bl': 'to bottom left' }
  const shadows: string[] = []
  if (state.glow.enabled) shadows.push(`0 4px ${15 * state.glow.intensity / 100}px ${state.glow.color}`)
  if (state.shadow.enabled) shadows.push(`${state.shadow.x}px ${state.shadow.y}px ${state.shadow.blur}px ${state.shadow.spread}px ${state.shadow.color}`)
  return {
    boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', maxWidth: '100%',
    fontFamily: 'Geist, system-ui, sans-serif', lineHeight: '1.25', cursor: 'pointer',
    color: state.background.color === 'var(--acc)' ? 'var(--on-acc)' : '#ffffff',
    background: state.background.type === 'gradient' ? `linear-gradient(${directions[state.background.gradientDirection] ?? 'to right'}, ${state.background.gradientStart}, ${state.background.gradientEnd})` : state.background.color,
    transition: state.transition.enabled ? `transform ${state.transition.duration}ms ${state.transition.timing}, filter ${state.transition.duration}ms ${state.transition.timing}` : 'none',
    transform: `${state.transform.perspective ? 'perspective(600px) ' : ''}scale(${state.transform.scale / 100}) rotate(${state.transform.rotate}deg) skewX(${state.transform.skewX}deg) skewY(${state.transform.skewY}deg)`,
    fontWeight: String(state.typography.weight), fontSize: state.typography.size,
    letterSpacing: `${state.typography.spacing}px`, textTransform: state.typography.transform,
    borderRadius: `${state.border.radius}px`, borderWidth: `${state.border.width}px`, borderStyle: state.border.style, borderColor: state.border.color,
    padding: `${state.size.padding}px ${state.size.padding * 2}px`, width: state.size.width, height: state.size.height,
    boxShadow: shadows.join(', ') || 'none',
    animation: state.glow.enabled && state.glow.animated ? 'glow-pulse 2s ease-in-out infinite alternate' : 'none',
    backdropFilter: `blur(${state.backdrop.blur}px) brightness(${state.backdrop.brightness}%) contrast(${state.backdrop.contrast}%)`
  }
}

const kebab = (key: string): string => key.replace(/([A-Z])/g, '-$1').toLowerCase()
const rules = (state: ButtonTestState): string => Object.entries(generateCSSFromState(state)).map(([key, value]) => `  ${kebab(key)}: ${value};`).join('\n')
export function generateCSSCode(state: ButtonTestState): string {
  return `/* Required themed tokens. Self-host Geist or use the system fallback. */
:root { --acc: #18181b; --on-acc: #ffffff; --fg: #18181b; }
[data-theme="dark"] { --acc: #d6a828; --on-acc: #141210; --fg: #ececee; }
.custom-button {
${rules(state)}
}
.custom-button:hover:not(:disabled), .custom-button[data-state="hover"] { filter: brightness(1.12); }
.custom-button:focus-visible, .custom-button[data-state="focus"] { outline: 2px solid var(--fg); outline-offset: 2px; }
.custom-button:disabled { cursor: not-allowed; }
@keyframes glow-pulse { from { filter: brightness(1); } to { filter: brightness(1.2); } }
@media (prefers-reduced-motion: reduce) { .custom-button { transition: none !important; animation: none !important; } }`
}
export function generateTailwindClasses(state: ButtonTestState): string {
  // Arbitrary properties preserve every configuration value; scan this literal with Tailwind 3.
  return Object.entries(generateCSSFromState(state)).map(([key, value]) => `[${kebab(key)}:${value.replace(/ /g, '_')}]`).join(' ') + ' focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:animate-none'
}

import type { ButtonTestState } from './types'

// Utility functions for Component Forge

export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(resolve).catch(reject)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        resolve()
      }
    } catch (err) {
      reject(err)
    }
  })
}

export function generateTailwindClasses(state: ButtonTestState): string {
  const classes = ['btn', 'btn-primary']
  
  if (state.transition.enabled) {
    classes.push(`transition-all duration-${state.transition.duration}`)
  }
  
  if (state.transform.scale !== 100) {
    classes.push(`hover:scale-${state.transform.scale}`)
  }
  
  if (state.transform.rotate !== 0) {
    classes.push(`hover:rotate-${state.transform.rotate}`)
  }
  
  return classes.join(' ')
}

export function generateCSSFromState(state: ButtonTestState): Record<string, any> {
  const styles: Record<string, any> = {
    transition: state.transition.enabled 
      ? `all ${state.transition.duration}ms ${state.transition.timing}` 
      : 'none',
    transform: `
      scale(${state.transform.scale / 100}) 
      rotate(${state.transform.rotate}deg)
      skewX(${state.transform.skewX}deg)
      skewY(${state.transform.skewY}deg)
    `.replace(/\s+/g, ' ').trim(),
    fontWeight: state.typography.weight.toString(),
    fontSize: state.typography.size,
    letterSpacing: `${state.typography.spacing}px`,
    textTransform: state.typography.transform,
    borderRadius: `${state.border.radius}px`,
    borderWidth: `${state.border.width}px`,
    borderStyle: state.border.style,
    borderColor: state.border.color,
    padding: `${state.size.padding}px`
  }

  // Background
  if (state.background.type === 'gradient') {
    styles.background = `linear-gradient(${state.background.gradientDirection}, ${state.background.gradientStart}, ${state.background.gradientEnd})`
  } else if (state.background.type === 'solid') {
    styles.backgroundColor = state.background.color
  }

  // Glow effect
  if (state.glow.enabled) {
    const intensity = state.glow.intensity / 100
    styles.boxShadow = `0 4px ${15 * intensity}px ${state.glow.color}${Math.round(0.3 * intensity * 255).toString(16).padStart(2, '0')}`
    
    if (state.glow.animated) {
      styles.animation = 'glow-pulse 2s ease-in-out infinite alternate'
    }
  }

  // Custom shadow
  if (state.shadow.enabled) {
    styles.boxShadow = `${state.shadow.x}px ${state.shadow.y}px ${state.shadow.blur}px ${state.shadow.spread}px ${state.shadow.color}`
  }

  // Backdrop effects
  if (state.backdrop.blur > 0 || state.backdrop.brightness !== 100 || state.backdrop.contrast !== 100) {
    styles.backdropFilter = `blur(${state.backdrop.blur}px) brightness(${state.backdrop.brightness}%) contrast(${state.backdrop.contrast}%)`
  }

  return styles
}

export function generateCSSCode(state: ButtonTestState): string {
  const styles = generateCSSFromState(state)
  return `.custom-button {
${Object.entries(styles)
  .map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
  .join('\n')}
}`
}
// Common types for Component Forge

export interface ButtonTestState {
  glow: {
    enabled: boolean
    intensity: number
    color: string
    animated: boolean
  }
  transform: {
    scale: number
    rotate: number
    skewX: number
    skewY: number
    perspective: boolean
  }
  transition: {
    duration: number
    timing: string
    enabled: boolean
  }
  hoverEffect: string
  background: {
    type: 'solid' | 'gradient'
    color: string
    gradientStart: string
    gradientEnd: string
    gradientDirection: string
  }
  typography: {
    weight: number
    size: string
    spacing: number
    transform: string
  }
  size: {
    width: string
    height: string
    padding: number
  }
  border: {
    radius: number
    width: number
    style: string
    color: string
  }
  backdrop: {
    blur: number
    brightness: number
    contrast: number
  }
  shadow: {
    enabled: boolean
    x: number
    y: number
    blur: number
    spread: number
    color: string
  }
}

export interface ComponentPreset {
  id: string
  name: string
  description: string
  config: ButtonTestState
}

export type ThemeType = 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate' | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden' | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe' | 'black' | 'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business' | 'acid' | 'lemonade' | 'night' | 'coffee' | 'winter' | 'dim' | 'nord' | 'sunset'
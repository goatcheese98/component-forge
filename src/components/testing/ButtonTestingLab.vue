<template>
  <div class="button-testing-lab">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2">🧪 Button Testing Laboratory</h2>
      <p class="text-base-content/70">
        Interactive testing environment to experiment with button effects, animations, and styling in real-time.
      </p>
    </div>

    <!-- Presets Section -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-4">🎨 Presets</h3>
      
      <!-- Built-in Presets -->
      <div class="mb-4">
        <h4 class="text-md font-medium mb-2">Built-in Presets</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <button
            v-for="preset in presets"
            :key="preset.id"
            @click="loadPreset(preset.id)"
            class="btn btn-outline btn-sm text-left flex-col h-auto py-2 px-3"
            :class="{ 'btn-primary': selectedPreset === preset.id }"
          >
            <div class="font-medium text-xs">{{ preset.name }}</div>
            <div class="text-xs opacity-60 mt-1">{{ preset.description }}</div>
          </button>
        </div>
      </div>

      <!-- Custom Presets -->
      <div v-if="customPresets.length > 0" class="mb-4">
        <h4 class="text-md font-medium mb-2">Custom Presets</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div
            v-for="preset in customPresets"
            :key="preset.id"
            class="relative"
          >
            <button
              @click="loadPreset(preset.id)"
              class="btn btn-outline btn-sm text-left flex-col h-auto py-2 px-3 w-full"
              :class="{ 'btn-secondary': selectedPreset === preset.id }"
            >
              <div class="font-medium text-xs">{{ preset.name }}</div>
              <div class="text-xs opacity-60 mt-1">{{ preset.description }}</div>
            </button>
            <button
              @click="deleteCustomPreset(preset.id)"
              class="btn btn-error btn-xs absolute -top-1 -right-1 w-4 h-4 min-h-4 p-0"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Save New Preset -->
      <div class="flex gap-2 items-end">
        <div v-if="showPresetSave" class="form-control flex-1">
          <input
            type="text"
            v-model="newPresetName"
            placeholder="Enter preset name..."
            class="input input-bordered input-sm"
            @keypress.enter="saveCustomPreset"
          />
        </div>
        <button
          v-if="!showPresetSave"
          @click="showPresetSave = true"
          class="btn btn-success btn-sm"
        >
          💾 Save Current as Preset
        </button>
        <template v-else>
          <button
            @click="saveCustomPreset"
            class="btn btn-success btn-sm"
            :disabled="!newPresetName.trim()"
          >
            ✅ Save
          </button>
          <button
            @click="showPresetSave = false; newPresetName = ''"
            class="btn btn-ghost btn-sm"
          >
            ❌
          </button>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Live Preview Column -->
      <div class="lg:col-span-1">
        <h3 class="text-lg font-semibold mb-4">Live Preview</h3>
        
        <!-- Test Button -->
        <div class="flex items-center justify-center p-8 bg-base-300/50 rounded-lg mb-4">
          <button 
            class="btn btn-primary"
            :style="computedButtonStyles"
          >
            {{ buttonText }}
          </button>
        </div>
        
        <!-- Code Export -->
        <div class="space-y-2">
          <button 
            @click="() => copyToClipboard(generateTailwindCode())"
            class="btn btn-outline btn-sm w-full"
          >
            📋 Copy Tailwind Classes
          </button>
          <button 
            @click="() => copyToClipboard(generateCSSCode())"
            class="btn btn-outline btn-sm w-full"
          >
            📋 Copy CSS Code
          </button>
          <button 
            @click="resetAll"
            class="btn btn-ghost btn-sm w-full"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      <!-- Controls Column -->
      <div class="lg:col-span-2">
        <h3 class="text-lg font-semibold mb-4">Controls</h3>
        
        <!-- Control Tabs -->
        <div class="tabs tabs-boxed mb-4">
          <button 
            class="tab"
            :class="{ 'tab-active': activeTab === 'effects' }"
            @click="activeTab = 'effects'"
          >
            ✨ Effects
          </button>
          <button 
            class="tab"
            :class="{ 'tab-active': activeTab === 'transform' }"
            @click="activeTab = 'transform'"
          >
            🔄 Transform
          </button>
          <button 
            class="tab"
            :class="{ 'tab-active': activeTab === 'style' }"
            @click="activeTab = 'style'"
          >
            🎨 Style
          </button>
          <button 
            class="tab"
            :class="{ 'tab-active': activeTab === 'layout' }"
            @click="activeTab = 'layout'"
          >
            📐 Layout
          </button>
        </div>

        <!-- Tab Content -->
        <div class="bg-base-100 p-4 rounded-lg min-h-[400px]">
          <component :is="activeTabComponent" v-model="buttonState" />
        </div>
      </div>
    </div>

    <!-- Code Preview Section -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-4">Generated Code</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="mockup-code text-xs">
          <pre data-prefix="HTML"><code>&lt;button class="{{ generateTailwindCode() }}"&gt;</code></pre>
          <pre data-prefix="$"><code>  {{ buttonText }}</code></pre>
          <pre data-prefix="$"><code>&lt;/button&gt;</code></pre>
        </div>
        
        <div class="mockup-code text-xs">
          <pre data-prefix="CSS"><code>{{ generateCSSCode() }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ButtonTestState, ComponentPreset } from '@/lib/types'
import { copyToClipboard, generateTailwindClasses, generateCSSCode } from '@/lib/utils'
import EffectsTab from './tabs/EffectsTab.vue'
import TransformTab from './tabs/TransformTab.vue'
import StyleTab from './tabs/StyleTab.vue'
import LayoutTab from './tabs/LayoutTab.vue'

interface Props {
  buttonText?: string
  initialState?: Partial<ButtonTestState>
}

interface Emits {
  (e: 'state-changed', state: ButtonTestState): void
  (e: 'preset-loaded', preset: ComponentPreset): void
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Test Button'
})

const emit = defineEmits<Emits>()

const activeTab = ref('effects')
const selectedPreset = ref<string | null>(null)
const newPresetName = ref('')
const showPresetSave = ref(false)

// Default button state
const defaultButtonState: ButtonTestState = {
  glow: { enabled: false, intensity: 50, color: '#ff6600', animated: false },
  transform: { scale: 100, rotate: 0, skewX: 0, skewY: 0, perspective: false },
  transition: { duration: 300, timing: 'ease', enabled: true },
  hoverEffect: 'none',
  background: { type: 'solid', color: '#ff6600', gradientStart: '#ff6600', gradientEnd: '#00d4ff', gradientDirection: 'to-r' },
  typography: { weight: 500, size: '1rem', spacing: 0, transform: 'none' },
  size: { width: 'auto', height: 'auto', padding: 16 },
  border: { radius: 8, width: 1, style: 'solid', color: 'transparent' },
  backdrop: { blur: 0, brightness: 100, contrast: 100 },
  shadow: { enabled: false, x: 0, y: 4, blur: 15, spread: 0, color: 'rgba(0,0,0,0.2)' }
}

const buttonState = ref<ButtonTestState>({ ...defaultButtonState, ...props.initialState })
const customPresets = ref<ComponentPreset[]>([])

// Built-in presets
const presets: ComponentPreset[] = [
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

// Computed styles for test button
const computedButtonStyles = computed(() => {
  const styles: Record<string, any> = {
    transition: buttonState.value.transition.enabled 
      ? `all ${buttonState.value.transition.duration}ms ${buttonState.value.transition.timing}` 
      : 'none',
    transform: `
      scale(${buttonState.value.transform.scale / 100}) 
      rotate(${buttonState.value.transform.rotate}deg)
      skewX(${buttonState.value.transform.skewX}deg)
      skewY(${buttonState.value.transform.skewY}deg)
    `.replace(/\s+/g, ' ').trim(),
    fontWeight: buttonState.value.typography.weight.toString(),
    fontSize: buttonState.value.typography.size,
    letterSpacing: `${buttonState.value.typography.spacing}px`,
    textTransform: buttonState.value.typography.transform,
    borderRadius: `${buttonState.value.border.radius}px`,
    borderWidth: `${buttonState.value.border.width}px`,
    borderStyle: buttonState.value.border.style,
    borderColor: buttonState.value.border.color,
    padding: `${buttonState.value.size.padding}px`
  }

  // Background
  if (buttonState.value.background.type === 'gradient') {
    styles.background = `linear-gradient(${buttonState.value.background.gradientDirection}, ${buttonState.value.background.gradientStart}, ${buttonState.value.background.gradientEnd})`
  } else if (buttonState.value.background.type === 'solid') {
    styles.backgroundColor = buttonState.value.background.color
  }

  // Glow effect
  if (buttonState.value.glow.enabled) {
    const intensity = buttonState.value.glow.intensity / 100
    styles.boxShadow = `0 4px ${15 * intensity}px ${buttonState.value.glow.color}${Math.round(0.3 * intensity * 255).toString(16).padStart(2, '0')}`
    
    if (buttonState.value.glow.animated) {
      styles.animation = 'glow-pulse 2s ease-in-out infinite alternate'
    }
  }

  // Custom shadow
  if (buttonState.value.shadow.enabled) {
    styles.boxShadow = `${buttonState.value.shadow.x}px ${buttonState.value.shadow.y}px ${buttonState.value.shadow.blur}px ${buttonState.value.shadow.spread}px ${buttonState.value.shadow.color}`
  }

  // Backdrop effects
  if (buttonState.value.backdrop.blur > 0 || buttonState.value.backdrop.brightness !== 100 || buttonState.value.backdrop.contrast !== 100) {
    styles.backdropFilter = `blur(${buttonState.value.backdrop.blur}px) brightness(${buttonState.value.backdrop.brightness}%) contrast(${buttonState.value.backdrop.contrast}%)`
  }

  return styles
})

// Active tab component
const activeTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'effects': return EffectsTab
    case 'transform': return TransformTab
    case 'style': return StyleTab
    case 'layout': return LayoutTab
    default: return EffectsTab
  }
})

// Methods
const generateTailwindCode = () => generateTailwindClasses(buttonState.value)
const generateCSSCode = () => generateCSSCode(buttonState.value)

const loadPreset = (presetId: string) => {
  const preset = [...presets, ...customPresets.value].find(p => p.id === presetId)
  if (preset) {
    buttonState.value = JSON.parse(JSON.stringify(preset.config))
    selectedPreset.value = presetId
    emit('preset-loaded', preset)
  }
}

const saveCustomPreset = () => {
  if (newPresetName.value.trim()) {
    const newPreset: ComponentPreset = {
      id: `custom-${Date.now()}`,
      name: `💎 ${newPresetName.value}`,
      description: 'Custom user-created preset',
      config: JSON.parse(JSON.stringify(buttonState.value))
    }
    customPresets.value.push(newPreset)
    newPresetName.value = ''
    showPresetSave.value = false
    selectedPreset.value = newPreset.id
    
    // Save to localStorage
    localStorage.setItem('button-presets', JSON.stringify(customPresets.value))
  }
}

const deleteCustomPreset = (presetId: string) => {
  customPresets.value = customPresets.value.filter(p => p.id !== presetId)
  if (selectedPreset.value === presetId) {
    selectedPreset.value = null
  }
  localStorage.setItem('button-presets', JSON.stringify(customPresets.value))
}

const resetAll = () => {
  buttonState.value = { ...defaultButtonState }
  selectedPreset.value = null
}

// Watch for state changes
import { watch } from 'vue'
watch(buttonState, (newState) => {
  emit('state-changed', newState)
}, { deep: true })

// Load custom presets from localStorage
onMounted(() => {
  const saved = localStorage.getItem('button-presets')
  if (saved) {
    try {
      customPresets.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load custom presets:', e)
    }
  }
})
</script>

<style scoped>
.button-testing-lab {
  @apply w-full;
}

/* Glow Pulse Animation */
@keyframes glow-pulse {
  from { 
    filter: brightness(1) saturate(1); 
  }
  to { 
    filter: brightness(1.2) saturate(1.3); 
  }
}
</style>
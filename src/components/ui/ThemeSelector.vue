<template>
  <div class="theme-selector">
    <!-- Mobile/Compact Theme Toggle Button -->
    <div class="sm:hidden">
      <button 
        class="btn btn-circle btn-outline" 
        @click="cycleTheme()"
        :class="{ 'loading': isTransitioning }"
        :title="`Current: ${currentTheme.displayName}`"
      >
        <Icon :name="currentThemeIcon" class="w-5 h-5" />
      </button>
    </div>

    <!-- Desktop Theme Selector -->
    <div class="hidden sm:flex items-center gap-2">
      <span class="text-sm font-medium opacity-70">Theme:</span>
      <div class="flex bg-base-200 rounded-lg p-1 gap-1">
        <button
          v-for="theme in availableThemes"
          :key="theme.name"
          @click="setTheme(theme.name)"
          class="btn btn-sm"
          :class="{
            'btn-primary': selectedTheme === theme.name,
            'btn-ghost': selectedTheme !== theme.name,
            'loading': isTransitioning && selectedTheme === theme.name
          }"
          :disabled="isTransitioning"
        >
          {{ theme.displayName }}
        </button>
      </div>
    </div>

    <!-- Theme Preview Cards (Optional, for larger screens) -->
    <div v-if="showPreviews" class="hidden lg:flex gap-4 mt-4">
      <div
        v-for="theme in availableThemes"
        :key="`preview-${theme.name}`"
        class="theme-preview-card"
        :class="{ 'active': selectedTheme === theme.name }"
        @click="setTheme(theme.name)"
      >
        <div class="preview-colors" :style="getPreviewStyle(theme)">
          <div class="color-dot primary"></div>
          <div class="color-dot secondary"></div>
          <div class="color-dot accent"></div>
        </div>
        <span class="text-xs mt-2">{{ theme.displayName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ThemeType } from '@/lib/types'
import Icon from './Icon.vue'

interface Props {
  showPreviews?: boolean
  modelValue?: ThemeType
}

interface Emits {
  (e: 'update:modelValue', value: ThemeType): void
  (e: 'theme-changed', value: ThemeType): void
}

const props = withDefaults(defineProps<Props>(), {
  showPreviews: false,
  modelValue: 'light'
})

const emit = defineEmits<Emits>()

const isTransitioning = ref(false)
const selectedTheme = ref<ThemeType>(props.modelValue)

interface ThemeDefinition {
  name: ThemeType
  displayName: string
  colors: {
    primary: string
    secondary: string
    accent: string
    'base-100': string
  }
}

const availableThemes: ThemeDefinition[] = [
  { 
    name: 'light', 
    displayName: 'Light',
    colors: { primary: '#570df8', secondary: '#f000b8', accent: '#37cdbe', 'base-100': '#ffffff' }
  },
  { 
    name: 'dark', 
    displayName: 'Dark',
    colors: { primary: '#661ae6', secondary: '#d926aa', accent: '#1fb2a5', 'base-100': '#2a303c' }
  },
  { 
    name: 'cupcake', 
    displayName: 'Cupcake',
    colors: { primary: '#65c3c8', secondary: '#ef9fbc', accent: '#eeaf3a', 'base-100': '#faf7f5' }
  },
  { 
    name: 'synthwave', 
    displayName: 'Synthwave',
    colors: { primary: '#e779c1', secondary: '#58c7f3', accent: '#f3cc30', 'base-100': '#2d1b69' }
  }
]

const currentTheme = computed(() => 
  availableThemes.find(t => t.name === selectedTheme.value) || availableThemes[0]
)

const currentThemeIcon = computed(() => {
  switch (selectedTheme.value) {
    case 'light': return 'sun'
    case 'dark': return 'moon'
    default: return 'palette'
  }
})

const setTheme = (theme: ThemeType) => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  selectedTheme.value = theme
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', theme)
  
  emit('update:modelValue', theme)
  emit('theme-changed', theme)
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

const cycleTheme = () => {
  const currentIndex = availableThemes.findIndex(t => t.name === selectedTheme.value)
  const nextIndex = (currentIndex + 1) % availableThemes.length
  setTheme(availableThemes[nextIndex].name)
}

const getPreviewStyle = (theme: ThemeDefinition) => {
  return {
    '--preview-primary': theme.colors.primary,
    '--preview-secondary': theme.colors.secondary,
    '--preview-accent': theme.colors.accent,
    '--preview-base': theme.colors['base-100'],
  }
}
</script>

<style scoped>
.theme-selector {
  @apply flex items-center justify-center;
}

.theme-preview-card {
  @apply flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent cursor-pointer transition-all duration-200;
  @apply hover:scale-105;
  background: var(--preview-base);
  border-color: transparent;
}

.theme-preview-card:hover {
  border-color: hsl(var(--primary) / 0.3);
}

.theme-preview-card.active {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
  transform: scale(1.05);
}

.preview-colors {
  @apply flex gap-1;
}

.color-dot {
  @apply w-3 h-3 rounded-full;
}

.color-dot.primary {
  background-color: var(--preview-primary);
}

.color-dot.secondary {
  background-color: var(--preview-secondary);
}

.color-dot.accent {
  background-color: var(--preview-accent);
}

/* Smooth transitions for theme switching */
.theme-selector {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-preview-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
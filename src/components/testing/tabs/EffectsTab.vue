<template>
  <div class="effects-tab space-y-6">
    <!-- Glow Effects -->
    <div>
      <h4 class="font-medium mb-3">Glow Effects</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">Enable Glow</span> 
            <input 
              type="checkbox" 
              class="toggle toggle-primary" 
              v-model="localState.glow.enabled" 
            />
          </label>
        </div>
        
        <div class="form-control" v-if="localState.glow.enabled">
          <label class="cursor-pointer label">
            <span class="label-text">Animated Glow</span> 
            <input 
              type="checkbox" 
              class="toggle toggle-secondary" 
              v-model="localState.glow.animated" 
            />
          </label>
        </div>
        
        <div class="form-control" v-if="localState.glow.enabled">
          <label class="label">
            <span class="label-text">Intensity: {{ localState.glow.intensity }}%</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="localState.glow.intensity" 
            class="range range-primary" 
          />
        </div>
        
        <div class="form-control" v-if="localState.glow.enabled">
          <label class="label">
            <span class="label-text">Glow Color</span>
          </label>
          <input 
            type="color" 
            v-model="localState.glow.color" 
            class="input input-bordered w-full h-10" 
          />
        </div>
      </div>
    </div>

    <!-- Shadow Effects -->
    <div>
      <h4 class="font-medium mb-3">Shadow Effects</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">Enable Custom Shadow</span> 
            <input 
              type="checkbox" 
              class="toggle toggle-accent" 
              v-model="localState.shadow.enabled" 
            />
          </label>
        </div>
        
        <template v-if="localState.shadow.enabled">
          <div class="form-control">
            <label class="label">
              <span class="label-text">X Offset: {{ localState.shadow.x }}px</span>
            </label>
            <input 
              type="range" 
              min="-20" 
              max="20" 
              v-model="localState.shadow.x" 
              class="range range-accent" 
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Y Offset: {{ localState.shadow.y }}px</span>
            </label>
            <input 
              type="range" 
              min="-20" 
              max="20" 
              v-model="localState.shadow.y" 
              class="range range-accent" 
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Blur: {{ localState.shadow.blur }}px</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              v-model="localState.shadow.blur" 
              class="range range-accent" 
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Backdrop Filters -->
    <div>
      <h4 class="font-medium mb-3">Backdrop Filters</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Blur: {{ localState.backdrop.blur }}px</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="20" 
            v-model="localState.backdrop.blur" 
            class="range range-info" 
          />
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Brightness: {{ localState.backdrop.brightness }}%</span>
          </label>
          <input 
            type="range" 
            min="50" 
            max="150" 
            v-model="localState.backdrop.brightness" 
            class="range range-info" 
          />
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Contrast: {{ localState.backdrop.contrast }}%</span>
          </label>
          <input 
            type="range" 
            min="50" 
            max="150" 
            v-model="localState.backdrop.contrast" 
            class="range range-info" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonTestState } from '@/lib/types'

interface Props {
  modelValue: ButtonTestState
}

interface Emits {
  (e: 'update:modelValue', value: ButtonTestState): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localState = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
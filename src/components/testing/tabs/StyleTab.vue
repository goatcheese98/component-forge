<template>
  <div class="style-tab space-y-6">
    <!-- Background -->
    <div>
      <h4 class="font-medium mb-3">Background</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Background Type</span>
          </label>
          <select v-model="localState.background.type" class="select select-bordered w-full">
            <option value="solid">Solid Color</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
        
        <div class="form-control" v-if="localState.background.type === 'solid'">
          <label class="label">
            <span class="label-text">Background Color</span>
          </label>
          <input 
            type="color" 
            v-model="localState.background.color" 
            class="input input-bordered w-full h-10" 
          />
        </div>
      </div>
    </div>

    <!-- Typography -->
    <div>
      <h4 class="font-medium mb-3">Typography</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Font Weight: {{ localState.typography.weight }}</span>
          </label>
          <input 
            type="range" 
            min="100" 
            max="900" 
            step="100"
            v-model="localState.typography.weight" 
            class="range range-accent" 
          />
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Letter Spacing: {{ localState.typography.spacing }}px</span>
          </label>
          <input 
            type="range" 
            min="-2" 
            max="5" 
            step="0.5"
            v-model="localState.typography.spacing" 
            class="range range-accent" 
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
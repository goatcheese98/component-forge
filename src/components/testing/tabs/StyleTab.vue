<template>
  <div class="style-tab space-y-6">
    <label class="field">Size
      <select :value="localState.size.padding" @change="localState.size.padding = Number(($event.target as HTMLSelectElement).value)">
        <option :value="8">Small</option><option :value="12">Medium</option><option :value="16">Large</option>
        <option v-if="![8,12,16].includes(localState.size.padding)" :value="localState.size.padding">Custom</option>
      </select>
    </label>
    <label class="field">Corner radius: <span class="numeric">{{ localState.border.radius }} px</span>
      <input v-model.number="localState.border.radius" type="range" min="0" max="50">
    </label>
    <details><summary>More style settings</summary>
    <!-- Background -->
    <div>
      <h4 class="font-medium mb-3">Background</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label" :for="`${uid}-StyleTab-1`">
            <span class="label-text">Background Type</span>
          </label>
          <select :id="`${uid}-StyleTab-1`" v-model="localState.background.type" class="select select-bordered w-full">
            <option value="solid">Solid Color</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>

        <div class="form-control" v-if="localState.background.type === 'solid'">
          <label class="label" :for="`${uid}-StyleTab-2`">
            <span class="label-text">Background Color</span>
          </label>
          <input :id="`${uid}-StyleTab-2`"
            type="color"
            :value="localState.background.color.startsWith('var(') ? '#18181b' : localState.background.color"
            @input="localState.background.color = ($event.target as HTMLInputElement).value"
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
          <label class="label" :for="`${uid}-StyleTab-3`">
            <span class="label-text">Font Weight: {{ localState.typography.weight }}</span>
          </label>
          <input :id="`${uid}-StyleTab-3`"
            type="range"
            min="100"
            max="900"
            step="100"
            v-model.number="localState.typography.weight"
            class="range range-accent"
          />
        </div>

        <div class="form-control">
          <label class="label" :for="`${uid}-StyleTab-4`">
            <span class="label-text">Letter Spacing: {{ localState.typography.spacing }}px</span>
          </label>
          <input :id="`${uid}-StyleTab-4`"
            type="range"
            min="-2"
            max="5"
            step="0.5"
            v-model.number="localState.typography.spacing"
            class="range range-accent"
          />
        </div>
      </div>
    </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import type { ButtonTestState } from '../../../lib/types'

interface Props {
  modelValue: ButtonTestState
}

interface Emits {
  (e: 'update:modelValue', value: ButtonTestState): void
}

const uid = useId()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localState = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="layout-tab space-y-6">
    <!-- Border & Shape -->
    <div>
      <h4 class="font-medium mb-3">Border & Shape</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label" :for="`${uid}-LayoutTab-1`">
            <span class="label-text">Border Radius: {{ localState.border.radius }}px</span>
          </label>
          <input :id="`${uid}-LayoutTab-1`"
            type="range"
            min="0"
            max="50"
            v-model.number="localState.border.radius"
            class="range range-warning"
          />
        </div>

        <div class="form-control">
          <label class="label" :for="`${uid}-LayoutTab-2`">
            <span class="label-text">Border Width: {{ localState.border.width }}px</span>
          </label>
          <input :id="`${uid}-LayoutTab-2`"
            type="range"
            min="0"
            max="10"
            v-model.number="localState.border.width"
            class="range range-warning"
          />
        </div>
      </div>
    </div>

    <!-- Spacing -->
    <div>
      <h4 class="font-medium mb-3">Spacing</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label" :for="`${uid}-LayoutTab-3`">
            <span class="label-text">Padding: {{ localState.size.padding }}px</span>
          </label>
          <input :id="`${uid}-LayoutTab-3`"
            type="range"
            min="4"
            max="40"
            v-model.number="localState.size.padding"
            class="range range-success"
          />
        </div>
      </div>
    </div>
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

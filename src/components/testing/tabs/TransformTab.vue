<template>
  <div class="transform-tab space-y-6">
    <div>
      <h4 class="font-medium mb-3">Transform Effects</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label" :for="`${uid}-TransformTab-1`">
            <span class="label-text">Scale: {{ localState.transform.scale }}%</span>
          </label>
          <input :id="`${uid}-TransformTab-1`"
            type="range"
            min="50"
            max="200"
            v-model.number="localState.transform.scale"
            class="range range-secondary"
          />
        </div>

        <div class="form-control">
          <label class="label" :for="`${uid}-TransformTab-2`">
            <span class="label-text">Rotation: {{ localState.transform.rotate }}°</span>
          </label>
          <input :id="`${uid}-TransformTab-2`"
            type="range"
            min="-45"
            max="45"
            v-model.number="localState.transform.rotate"
            class="range range-secondary"
          />
        </div>
      </div>
    </div>

    <div>
      <h4 class="font-medium mb-3">Transition Settings</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">Enable Transitions</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              v-model="localState.transition.enabled"
            />
          </label>
        </div>

        <div class="form-control" v-if="localState.transition.enabled">
          <label class="label" :for="`${uid}-TransformTab-3`">
            <span class="label-text">Duration: {{ localState.transition.duration }}ms</span>
          </label>
          <input :id="`${uid}-TransformTab-3`"
            type="range"
            min="100"
            max="2000"
            step="100"
            v-model.number="localState.transition.duration"
            class="range range-primary"
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

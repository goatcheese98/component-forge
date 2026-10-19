<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ThemeType } from '../../lib/types'
const props = withDefaults(defineProps<{ showPreviews?: boolean; modelValue?: ThemeType }>(), { modelValue: 'light' })
const emit = defineEmits<{ 'update:modelValue': [value: ThemeType]; 'theme-changed': [value: ThemeType] }>()
const selected = ref<ThemeType>(props.modelValue)
watch(() => props.modelValue, value => { selected.value = value })
watch(selected, value => {
  document.documentElement.dataset.theme = value
  emit('update:modelValue', value)
  emit('theme-changed', value)
}, { immediate: true })
</script>
<template>
  <label class="theme-selector">Theme
    <select v-model="selected" aria-label="Theme"><option value="light">Light</option><option value="dark">Dark</option><option value="cupcake">Cupcake experiment</option><option value="synthwave">Synthwave experiment</option></select>
  </label>
  <div v-if="showPreviews" class="row" aria-label="Theme previews">
    <button v-for="theme in (['light','dark','cupcake','synthwave'] as const)" :key="theme" :aria-pressed="selected === theme" @click="selected = theme">{{ theme }}</button>
  </div>
</template>

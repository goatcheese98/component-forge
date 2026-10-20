<script setup lang="ts">
import { computed, onMounted, ref, watch, useId } from 'vue'
import type { ButtonTestState, ComponentPreset } from '../../lib/types'
import { copyToClipboard, generateCSSCode, generateCSSFromState, generateTailwindClasses } from '../../lib/utils'
import { cloneState, defaultButtonState, initialButtonState, parsePresets, presets, serializePresets, MAX_PRESETS } from '../../lib/button-state'
import EffectsTab from './tabs/EffectsTab.vue'
import TransformTab from './tabs/TransformTab.vue'
import StyleTab from './tabs/StyleTab.vue'
import LayoutTab from './tabs/LayoutTab.vue'

const props = withDefaults(defineProps<{ buttonText?: string; initialState?: Partial<ButtonTestState> }>(), { buttonText: 'Save changes' })
const emit = defineEmits<{ 'state-changed': [state: ButtonTestState]; 'preset-loaded': [preset: ComponentPreset] }>()
const uid = useId()
const state = ref(initialButtonState(props.initialState))
const label = ref(props.buttonText)
const activeTab = ref('Style')
const tabs = { Style: StyleTab, Effects: EffectsTab, Transform: TransformTab, Layout: LayoutTab }
const selected = ref('neutral')
const demo = ref('default')
const states = ['default', 'hover', 'focus', 'disabled', 'loading']
const customs = ref<ComponentPreset[]>([])
const notice = ref('')
const copyStatus = ref('')
const copying = ref(false)
const activations = ref(0)
const exportMode = ref('CSS')
const code = computed(() => exportMode.value === 'CSS' ? generateCSSCode(state.value) : generateTailwindClasses(state.value))
const style = computed(() => generateCSSFromState(state.value))
const dialog = ref<HTMLDialogElement>()
const saveTrigger = ref<HTMLButtonElement>()
const name = ref('')
const saveError = ref('')
const duplicate = computed(() => customs.value.find(p => p.name.toLowerCase() === name.value.trim().toLowerCase()))
const deleting = ref<ComponentPreset[]>([])
const canSave = computed(() => name.value.trim().length >= 1 && name.value.trim().length <= 40)

function load(preset: ComponentPreset): void {
  state.value = cloneState(preset.config)
  label.value = preset.label ?? props.buttonText
  selected.value = preset.id
  emit('preset-loaded', preset)
}
function reset(): void {
  state.value = cloneState(defaultButtonState)
  label.value = props.buttonText
  selected.value = 'neutral'
  demo.value = 'default'
  activations.value = 0
  notice.value = 'Reset to LUM / Neutral.'
}
function persist(next: ComponentPreset[]): boolean {
  let raw: string
  try { raw = serializePresets(next) }
  catch {
    notice.value = next.length > MAX_PRESETS
      ? '100 presets saved. Delete another preset, then retry Undo delete.'
      : 'Preset changes could not be validated. Nothing was saved; check your configuration and retry.'
    return false
  }
  try {
    localStorage.setItem('button-presets', raw)
    customs.value = next
    return true
  } catch {
    notice.value = 'Storage unavailable. Your lab still works; changes were not saved. Retry when storage is available.'
    return false
  }
}
function save(replace = false): void {
  if (!canSave.value) { saveError.value = 'Use 1–40 characters after trimming.'; return }
  if (duplicate.value && !replace) { saveError.value = 'Name already exists. Replace it or choose a new name.'; return }
  if (!replace && customs.value.length >= MAX_PRESETS) { saveError.value = '100 presets saved. Delete one before adding another.'; return }
  const preset: ComponentPreset = { id: replace && duplicate.value ? duplicate.value.id : `custom-${crypto.randomUUID()}`, name: name.value.trim(), description: 'Custom user-created preset', label: label.value, config: cloneState(state.value) }
  const next = replace ? customs.value.map(p => p.id === preset.id ? preset : p) : [...customs.value, preset]
  if (persist(next)) {
    selected.value = preset.id
    notice.value = `Saved ${preset.name}.`
    dialog.value?.close()
  } else saveError.value = notice.value + ' Preset was not saved; retry or cancel.'
}
function remove(preset: ComponentPreset): void {
  if (persist(customs.value.filter(p => p.id !== preset.id))) {
    deleting.value.push(preset)
    notice.value = `Deleted ${preset.name}. Undo next restores ${deleting.value[0]!.name}.`
  }
}
function undo(): void {
  const pending = deleting.value[0]
  if (pending && persist([...customs.value, pending])) {
    deleting.value.shift()
    notice.value = `Restored ${pending.name}.` + (deleting.value.length ? ` Undo next restores ${deleting.value[0]!.name}.` : '')
  }
}
function openSave(): void { name.value = ''; saveError.value = ''; dialog.value?.showModal() }
async function copy(): Promise<void> {
  if (copying.value) return
  copying.value = true
  copyStatus.value = ''
  const snapshot = code.value
  try { await copyToClipboard(snapshot); copyStatus.value = snapshot === code.value ? 'Copied.' : 'Copied the previous configuration. Copy again for your latest changes.' }
  catch { copyStatus.value = 'Copy unavailable. Select the code below, or retry.' }
  finally { copying.value = false }
}
watch(state, value => { selected.value = ''; copyStatus.value = ''; emit('state-changed', cloneState(value)) }, { deep: true, flush: 'sync' })
watch(label, () => { selected.value = '' }, { flush: 'sync' })
watch(() => props.buttonText, value => { label.value = value })
watch(exportMode, () => { copyStatus.value = '' })
onMounted(() => {
  try { const raw = localStorage.getItem('button-presets'); if (raw) customs.value = parsePresets(raw) }
  catch { notice.value = 'Saved presets could not be read. The lab is ready with built-in presets.' }
})
</script>

<template>
  <section class="forge-lab" :aria-labelledby="`${uid}-lab-title`">
    <div class="intro">
      <h1 :id="`${uid}-lab-title`">Make it feel right.</h1>
      <p>Refine a button, inspect every state, then take the CSS with you.</p>
    </div>
    <div class="toolbar">
      <div class="row">
        <span class="muted">Preset</span>
        <button :aria-pressed="selected === 'neutral'" @click="load(presets[0]!)">LUM / Neutral</button>
        <details class="experiments">
          <summary>Explore effects</summary>
          <div class="experiment-list">
            <button v-for="preset in presets.slice(1)" :key="preset.id" :aria-pressed="selected === preset.id" @click="load(preset)">{{ preset.name }}</button>
          </div>
        </details>
      </div>
      <div class="row">
        <button @click="reset">Reset</button>
        <button ref="saveTrigger" @click="openSave">Save preset</button>
      </div>
    </div>
    <div v-if="customs.length" class="row custom-presets" aria-label="Custom presets">
      <div v-for="preset in customs" :key="preset.id" class="row">
        <button :aria-pressed="selected === preset.id" @click="load(preset)">{{ preset.name }}</button>
        <button :aria-label="`Delete preset ${preset.name}`" @click="remove(preset)">Delete</button>
      </div>
    </div>
    <p v-else class="empty-presets">No custom presets yet. Start with LUM / Neutral, then save your changes.</p>
    <p role="status" class="notice">{{ notice }} <button v-if="deleting.length" @click="undo">Undo delete</button></p>
    <div class="lab-grid">
      <section class="preview-section" aria-label="Button preview">
        <div class="preview">
          <p class="eyebrow">LIVE PREVIEW</p>
          <button class="custom-button" :style="style" :data-state="demo" :disabled="demo === 'disabled' || demo === 'loading'" :aria-busy="demo === 'loading'" :aria-describedby="`${uid}-preview-hint`" @click="activations++">{{ label || 'Button' }}<span v-if="demo === 'loading'" class="busy-mark" aria-hidden="true"></span></button>
          <p :id="`${uid}-preview-hint`">Try Tab, Enter and Space.</p>
        </div>
        <fieldset class="state-strip">
          <legend>States</legend>
          <label v-for="item in states" :key="item"><input v-model="demo" type="radio" :name="`${uid}-preview-state`" :value="item">{{ item }}</label>
        </fieldset>
        <p class="muted" role="status">{{ demo === 'loading' ? 'Loading demonstration. Activation is blocked.' : demo === 'disabled' ? 'Disabled demonstration. Activation is blocked.' : `Preview activated ${activations} times.` }}</p>
      </section>
      <section class="controls" aria-label="Button controls">
        <label class="field">Control group
          <select v-model="activeTab"><option v-for="(_, tab) in tabs" :key="tab">{{ tab }}</option></select>
        </label>
        <label class="field">Button label<input v-model="label" maxlength="80" :aria-describedby="`${uid}-label-hint`"></label>
        <p :id="`${uid}-label-hint`" class="muted">Up to 80 characters.</p>
        <component :is="tabs[activeTab as keyof typeof tabs]" v-model="state" />
        <p class="motion-note">Effects remain available for experiments. Reduced motion is respected in every preview.</p>
      </section>
      <section class="export" :aria-labelledby="`${uid}-export-title`">
        <div class="toolbar">
          <h2 :id="`${uid}-export-title`">Code export</h2>
          <div class="row"><label>Format <select v-model="exportMode"><option>CSS</option><option>Tailwind</option></select></label><button :disabled="copying" @click="copy">{{ copying ? 'Copying…' : `Copy ${exportMode}` }}</button></div>
        </div>
        <p v-if="exportMode === 'Tailwind'" class="muted">Tailwind 3 arbitrary properties. Keep the literal classes in scanned source; copy CSS for themed tokens, focus, hover and animation rules.</p>
        <p role="status">{{ copyStatus }}</p>
        <pre tabindex="0" aria-label="Generated code"><code>{{ code }}</code></pre>
      </section>
    </div>
    <dialog ref="dialog" :aria-labelledby="`${uid}-save-title`" @close="saveTrigger?.focus()">
      <form @submit.prevent="save()">
        <h2 :id="`${uid}-save-title`">Save preset</h2>
        <label class="field" :for="`${uid}-preset-name`">Preset name<input :id="`${uid}-preset-name`" v-model="name" autofocus maxlength="40" :aria-invalid="!!saveError" :aria-describedby="`${uid}-save-error`" @input="saveError = ''"></label>
        <p :id="`${uid}-save-error`" role="alert">{{ saveError }}</p>
        <p v-if="duplicate">Name already exists. Replace the saved preset or enter a new name.</p>
        <div class="row"><button type="button" @click="dialog?.close()">Cancel</button><button v-if="duplicate" type="button" @click="save(true)">Replace preset</button><button v-else type="submit">Save</button></div>
      </form>
    </dialog>
  </section>
</template>

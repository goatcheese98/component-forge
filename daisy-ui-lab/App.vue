<script setup lang="ts">
import { ref } from 'vue'
import ThemeSelector from '../src/components/ui/ThemeSelector.vue'
import ButtonTestingLab from '../src/components/testing/ButtonTestingLab.vue'
const section = ref('lab')
const input = ref('')
const submitted = ref(false)
const clicks = ref(0)
</script>
<template>
  <div class="forge-shell">
    <header class="site-header">
      <strong>Component Forge</strong>
      <nav class="row" aria-label="Main navigation">
        <button :aria-current="section === 'lab' ? 'page' : undefined" @click="section = 'lab'">Button lab</button>
        <button :aria-current="section === 'library' ? 'page' : undefined" @click="section = 'library'">Library</button>
        <ThemeSelector />
      </nav>
    </header>
    <main>
      <ButtonTestingLab v-show="section === 'lab'" />
      <section v-if="section === 'library'" class="library" aria-labelledby="library-title">
        <h1 id="library-title">Native components.</h1>
        <p>Vue button and input examples. Use Tab to explore, and Enter or Space to activate.</p>
        <section aria-labelledby="buttons-title"><h2 id="buttons-title">Buttons</h2>
          <div class="row"><button class="primary" @click="clicks++">Primary</button><button @click="clicks++">Secondary</button><button disabled>Disabled</button></div>
          <p role="status">Activated {{ clicks }} times.</p>
          <details><summary>Experimental effects</summary><div class="row"><button class="btn-apex-glow" @click="clicks++">Apex Glow</button><button class="hover:scale-105 transition-transform" @click="clicks++">Hover Scale</button><button class="animate-pulse" @click="clicks++">Pulsing</button></div></details>
        </section>
        <section aria-labelledby="input-title"><h2 id="input-title">Inputs</h2>
          <form @submit.prevent="submitted = true">
            <label class="field" for="example-input">Example label<input id="example-input" v-model="input" required maxlength="80" aria-describedby="input-help"></label>
            <p id="input-help">Required. Try entering a value and submitting.</p>
            <button class="primary">Try input</button>
            <p role="status">{{ submitted ? `Submitted: ${input}` : 'Ready for input.' }}</p>
          </form>
        </section>
        <section><h2>Card variants</h2><div class="surface">Standard Card</div><div class="surface card-tournament">Tournament Card</div></section>
      </section>
    </main>
  </div>
</template>

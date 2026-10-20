import vue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'dist-dev/**', 'work/**', 'node_modules/**'] },
  vue.configs['flat/essential'], vueTsConfigs.recommended,
  { rules: { 'vue/multi-word-component-names': 'off' } },
  // Tailwind's unchanged legacy config is loaded by its CommonJS-compatible loader.
  { files: ['tailwind.config.js'], rules: { '@typescript-eslint/no-require-imports': 'off' } }
)

<template>
  <div class="min-h-screen bg-base-100" data-theme="dark">
    <!-- Header -->
    <div class="navbar bg-base-200">
      <div class="navbar-start">
        <h1 class="text-xl font-bold">🧪 Component Forge Lab</h1>
      </div>
      <div class="navbar-end">
        <ThemeSelector />
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Welcome Section -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4">Welcome to Component Forge</h2>
          <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
            Your comprehensive Tailwind CSS and DaisyUI component design system with interactive testing laboratory.
          </p>
        </div>

        <!-- Navigation Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h3 class="card-title text-2xl">🎨 DaisyUI Library</h3>
              <p class="text-base-content/70">
                Production-ready components and templates built with DaisyUI and Tailwind CSS.
              </p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary" @click="activeSection = 'library'">
                  Explore Library
                </button>
              </div>
            </div>
          </div>

          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h3 class="card-title text-2xl">🧪 Testing Laboratory</h3>
              <p class="text-base-content/70">
                Interactive component testing toolkit with real-time preview and code generation.
              </p>
              <div class="card-actions justify-end">
                <button class="btn btn-secondary" @click="activeSection = 'lab'">
                  Enter Lab
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Sections -->
        <div class="transition-all duration-300">
          <!-- Library Section -->
          <div v-if="activeSection === 'library'" class="space-y-8">
            <div class="text-center mb-8">
              <h3 class="text-3xl font-bold mb-4">🎨 Component Library</h3>
              <p class="text-base-content/70">Browse our collection of production-ready components</p>
            </div>
            
            <!-- Basic Components Showcase -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Button Variations -->
              <div class="card bg-base-200">
                <div class="card-body">
                  <h4 class="card-title">Buttons</h4>
                  <div class="space-y-2">
                    <button class="btn btn-primary w-full">Primary</button>
                    <button class="btn btn-secondary w-full">Secondary</button>
                    <button class="btn btn-accent w-full">Accent</button>
                  </div>
                </div>
              </div>

              <!-- Enhanced Buttons -->
              <div class="card bg-base-200">
                <div class="card-body">
                  <h4 class="card-title">Enhanced Buttons</h4>
                  <div class="space-y-2">
                    <button class="btn btn-primary btn-apex-glow w-full">Apex Glow</button>
                    <button class="btn btn-secondary hover:scale-105 transition-transform w-full">Hover Scale</button>
                    <button class="btn btn-accent animate-pulse w-full">Pulsing</button>
                  </div>
                </div>
              </div>

              <!-- Cards -->
              <div class="card bg-base-200">
                <div class="card-body">
                  <h4 class="card-title">Card Variants</h4>
                  <div class="card bg-base-100 shadow-sm p-3">
                    <p class="text-sm">Standard Card</p>
                  </div>
                  <div class="card card-tournament p-3 mt-2">
                    <p class="text-sm">Tournament Card</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lab Section -->
          <div v-else-if="activeSection === 'lab'" class="space-y-8">
            <div class="text-center mb-8">
              <h3 class="text-3xl font-bold mb-4">🧪 Testing Laboratory</h3>
              <p class="text-base-content/70">Experiment with component styling and effects</p>
            </div>
            
            <ButtonTestingLab />
          </div>

          <!-- Default Landing -->
          <div v-else class="text-center py-12">
            <h3 class="text-2xl font-bold mb-4">Choose Your Path</h3>
            <p class="text-base-content/70 mb-8">
              Select a section above to start exploring Component Forge
            </p>
            <div class="flex gap-4 justify-center">
              <button class="btn btn-primary btn-lg" @click="activeSection = 'library'">
                📚 Browse Library
              </button>
              <button class="btn btn-secondary btn-lg" @click="activeSection = 'lab'">
                🔬 Test Components
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeSelector from '../src/components/ui/ThemeSelector.vue'
import ButtonTestingLab from '../src/components/testing/ButtonTestingLab.vue'

const activeSection = ref<'library' | 'lab' | null>(null)
</script>

<style scoped>
/* Additional custom styles can go here */
</style>
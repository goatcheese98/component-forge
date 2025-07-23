/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./daisy-ui-library/**/*.{vue,js,ts,jsx,tsx}",
    "./daisy-ui-lab/**/*.{vue,js,ts,jsx,tsx}",
    "./examples/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Custom extensions for Apex theming
      colors: {
        'apex-orange': '#ff6600',
        'apex-blue': '#00d4ff'
      },
      animation: {
        'apex-pulse': 'apex-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate'
      },
      keyframes: {
        'apex-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'glow-pulse': {
          'from': { 
            filter: 'brightness(1) saturate(1)' 
          },
          'to': { 
            filter: 'brightness(1.2) saturate(1.3)' 
          }
        }
      }
    }
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset"
    ]
  }
}
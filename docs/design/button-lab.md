# Component Forge · LUM button lab

Adopting candidate: https://app.paper.design/file/01M5B2XNKCZ9KN7762V6B8EYR4/p-1-0

Candidate v1, October 19, 2026, is **not user-approved**. Implementation follows the supplied exact JSX, computed styles and token readback (token hash `6fcc0995`), with its later explicit font/foreground correction. No local Paper or desktop Chrome was required. The source PNG was not attached; `screens/button-lab-v1.png` is deliberately absent. The screenshots below are cloud Chromium captures of this implementation, not the original Paper export or a claim of exact final parity.

Canonical references read through GitHub:

- `goatcheese98/lum-brain/src/styles/design-tokens.ts`, blob `e7e0c2362848c209914a5d9da2bcaa5657b663b8`.
- `src/styles/fonts.ts`, blob `d32cace0ed25de3f8e164b9b2d906ca6e782c0e9`.
- `src/dashboard-shell-css/primitives.ts`, blob `86324ebdaca47f0837b09c774e31a96f4d81b2d5`.
- `src/dashboard-shell-css/shell-chrome.ts`, blob `9678f3e1bf6d00e4f2701b355b8612b2a488574b`.

The canonical neutral palette, dark gold accent and themed `--on-acc` are preserved. Geist/Geist Mono are self-hosted with OFL attribution. Additions: 4px spacing rhythm, 44px control targets, named previews, and bounded storage validation. Cupcake/Synthwave and glow/gradient experiments remain opt-in.

Desktop uses 32px insets, 260px preview and a 360px control column with 32px inset/border. Below 1024px, controls follow the preview and precede export; below 768px, page inset and body type become 16px. Code scrolls within its own pre. A native select replaces drawn group tabs, retaining all four groups (including Transform); More style settings keeps the initial composition quiet. These are deliberate native-control adaptations of the candidate.

CSS export includes every computed configuration property, focus/hover rules, animation and reduced-motion rules, plus the required light/dark token definitions. Tailwind 3 export remains available as literal arbitrary properties; its in-product note identifies the companion CSS needed for theme/state/keyframes. Button labels render through Vue text interpolation. Custom presets include the edited label, safely recover from corrupt/denied storage and require an explicit replacement for duplicate names. Built-ins are never written or deleted.

Cloud screenshots (light/dark at every requested width):

- [1440 light](screens/button-lab-implemented-1440-light.png) · [1440 dark](screens/button-lab-implemented-1440-dark.png)
- [768 light](screens/button-lab-implemented-768-light.png) · [768 dark](screens/button-lab-implemented-768-dark.png)
- [320 light](screens/button-lab-implemented-320-light.png) · [320 dark](screens/button-lab-implemented-320-dark.png)

Review covered spacing, alignment, explicit foregrounds, mobile fit, focus, target sizes, state selection, and isolated code overflow. Screenshots supplement the interaction assertions documented in [verification](../verification.md).

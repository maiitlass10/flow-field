# Flow Field: Generative Art

Generative artwork made with plain JavaScript and the HTML Canvas API. No libraries.
Thousands of particles follow an invisible vector field built from Perlin noise. Their faint trails build up into a different painting every time.

**Live demo:** https://maiitlass10.github.io/flow-field/

## Features
- **Perlin noise from scratch** (`noise.js`): no external libraries
- **Seeded randomness**: every artwork has a seed and can be reproduced exactly (`index.html#7777`)
- **Random palettes and field parameters** for each seed
- **HiDPI rendering**: stays sharp on retina screens
- **Controls**: New (`N`), Pause (`Space`), Save PNG (`S`)

## How it works
1. For every point `(x, y)` on screen, `noise(x * scale, y * scale)` returns a smooth value.
2. That value becomes an **angle**, so the screen turns into a field of directions.
3. Each frame, every particle takes a small step in the direction under it and draws a short, almost transparent line.
4. Particles have a limited lifespan and then respawn at random, which keeps the whole canvas covered.

## Run it
Open `index.html` in a browser. No build step.

## Tech
JavaScript (ES6), HTML5 Canvas 2D, CSS

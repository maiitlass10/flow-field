// ------------------------------------------------------------
// Seeded random numbers + 2D Perlin noise, written from scratch.
// ------------------------------------------------------------

// Math.random() can't be "replayed". A seeded generator gives the
// same sequence for the same seed, so every artwork is reproducible.
// mulberry32: tiny, fast, good-enough PRNG. Returns numbers in [0, 1).
function createRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Perlin noise: like random(), but smooth. Nearby inputs give nearby
// outputs, which is what makes the flowing, organic curves possible.
function createNoise(random) {
  // A shuffled list of 0..255, doubled so we never index out of range.
  const p = new Uint8Array(512);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  // Smoothstep curve (6t^5 - 15t^4 + 10t^3): removes visible grid edges.
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;

  // Pick one of 4 diagonal gradient directions and dot it with (x, y).
  function grad(hash, x, y) {
    switch (hash & 3) {
      case 0: return  x + y;
      case 1: return -x + y;
      case 2: return  x - y;
      default: return -x - y;
    }
  }

  // Returns a value roughly in [-1, 1].
  return function noise2D(x, y) {
    // Which grid cell are we in?
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    // Where inside that cell (0..1)?
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = fade(xf);
    const v = fade(yf);

    // Hash the 4 corners of the cell.
    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];

    // Blend the 4 corner contributions together.
    const x1 = lerp(grad(aa, xf, yf),     grad(ba, xf - 1, yf),     u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v);
  };
}

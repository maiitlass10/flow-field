// ------------------------------------------------------------
// Flow Field: thousands of particles follow an invisible field of
// directions (made with Perlin noise) and leave trails behind.
// ------------------------------------------------------------

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Colour palettes: [background, ...line colours]
const PALETTES = [
  ["#0b0b10", "#f72585", "#b5179e", "#7209b7", "#4361ee", "#4cc9f0"],
  ["#10100e", "#e9c46a", "#f4a261", "#e76f51", "#2a9d8f"],
  ["#f4efe6", "#1d3557", "#457b9d", "#e63946", "#a8dadc"],
  ["#0d1b1e", "#7dcfb6", "#00b2ca", "#fbd1a2", "#f79256"],
  ["#111111", "#ffffff", "#bbbbbb", "#777777"],
  ["#fdf6ec", "#264653", "#2a9d8f", "#e9c46a", "#e76f51"],
];

const settings = {
  particleCount: 4000,
  speed: 1.2,
  lineWidth: 0.6,
  alpha: 0.12,      // low opacity: lines build up slowly into soft shapes
  minLife: 40,      // each particle lives a random number of frames,
  maxLife: 220,     // then respawns, so they don't all pile up in one place
  maxSteps: 900,    // stop after this many frames
};

let state = null;   // everything that changes between artworks
let paused = false;

// ---------- Setup ----------

function resize() {
  // Draw at the screen's real pixel density so lines stay sharp.
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function start(seed) {
  resize();
  const width = window.innerWidth;
  const height = window.innerHeight;

  const random = createRandom(seed);
  const noise = createNoise(random);

  const palette = PALETTES[Math.floor(random() * PALETTES.length)];
  const [background, ...colors] = palette;

  // These numbers shape the "personality" of each artwork.
  const noiseScale = 0.0012 + random() * 0.003; // smaller = wider, smoother curves
  const curl = 1 + random() * 3;                // how many turns the field makes

  const particles = [];
  for (let i = 0; i < settings.particleCount; i++) {
    const p = { color: colors[Math.floor(random() * colors.length)] };
    respawn(p, random, width, height);
    particles.push(p);
  }

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  state = { seed, width, height, random, noise, noiseScale, curl, particles, step: 0 };

  document.getElementById("seed").textContent = seed;
  history.replaceState(null, "", "#" + seed); // share a link to this exact artwork
}

// Put a particle somewhere random and give it a fresh lifespan.
function respawn(p, random, width, height) {
  p.x = random() * width;
  p.y = random() * height;
  p.life = settings.minLife + random() * (settings.maxLife - settings.minLife);
}

// ---------- The field ----------

// For any point on screen, return an angle (which way to move).
function angleAt(x, y) {
  const { noise, noiseScale, curl } = state;
  return noise(x * noiseScale, y * noiseScale) * Math.PI * 2 * curl;
}

// ---------- Drawing loop ----------

function frame() {
  if (!paused && state.step < settings.maxSteps) {
    const { particles, width, height, random } = state;
    ctx.lineWidth = settings.lineWidth;
    ctx.globalAlpha = settings.alpha;

    for (const p of particles) {
      const angle = angleAt(p.x, p.y);
      const nx = p.x + Math.cos(angle) * settings.speed;
      const ny = p.y + Math.sin(angle) * settings.speed;

      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      p.x = nx;
      p.y = ny;

      // Too old, or left the screen? Respawn somewhere random.
      p.life--;
      if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        respawn(p, random, width, height);
      }
    }

    ctx.globalAlpha = 1;
    state.step++;
  }
  requestAnimationFrame(frame); // ~60 times per second
}

// ---------- Controls ----------

const newSeed = () => Math.floor(Math.random() * 1e9);

function togglePause() {
  paused = !paused;
  document.getElementById("btn-pause").textContent = paused ? "Play" : "Pause";
}

function savePNG() {
  const link = document.createElement("a");
  link.download = `flow-field-${state.seed}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

document.getElementById("btn-new").onclick = () => start(newSeed());
document.getElementById("btn-pause").onclick = togglePause;
document.getElementById("btn-save").onclick = savePNG;

window.addEventListener("keydown", (e) => {
  if (e.key === "n" || e.key === "N") start(newSeed());
  if (e.key === "s" || e.key === "S") savePNG();
  if (e.code === "Space") { e.preventDefault(); togglePause(); }
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => start(state.seed), 200);
});

// Use the seed from the URL (e.g. index.html#12345) if there is one.
const fromUrl = parseInt(location.hash.slice(1), 10);
start(Number.isFinite(fromUrl) ? fromUrl : newSeed());
requestAnimationFrame(frame);

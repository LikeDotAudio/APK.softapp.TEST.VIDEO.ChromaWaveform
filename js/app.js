// Softapp entry point for TEST.VIDEO.ChromaWaveform
// Standalone real-time canvas renderer conforming to APK Softapps SDK.

const canvas = document.getElementById('viewCanvas');
const ctx = canvas.getContext('2d');
const btnPlay = document.getElementById('btnPlay');
const statusEl = document.getElementById('status');
const fpsEl = document.getElementById('fps');

let running = true;
let frameCount = 0;
let lastTime = performance.now();

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = Math.max(200, rect.width * window.devicePixelRatio);
  canvas.height = Math.max(150, rect.height * window.devicePixelRatio);
}

window.addEventListener('resize', resize);
resize();

function render(time) {
  if (!running) return;
  frameCount++;
  if (time - lastTime >= 1000) {
    fpsEl.textContent = frameCount;
    frameCount = 0;
    lastTime = time;
  }

  const W = canvas.width;
  const H = canvas.height;

  // Background clear
  ctx.fillStyle = '#03060f';
  ctx.fillRect(0, 0, W, H);

  // Graticule grid
  ctx.strokeStyle = '#1d2942';
  ctx.lineWidth = 1;
  const gridRows = 5;
  for (let r = 1; r < gridRows; r++) {
    const y = (H / gridRows) * r;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Signal Simulation / Visualization
  ctx.save();
  const t = time * 0.002;
  const kind = "chroma";

  if (kind.includes('parade') || kind.includes('stacked')) {
    // 3 component channels (R, G, B)
    const cw = W / 3;
    const colors = ['rgba(255,80,80,0.85)', 'rgba(80,255,120,0.85)', 'rgba(100,160,255,0.85)'];
    colors.forEach((col, idx) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < cw; x += 3) {
        const normX = x / cw;
        const wave = Math.sin(normX * 8 + t + idx * 2) * 0.3 + 0.5;
        const py = H - wave * (H * 0.7) - H * 0.15;
        if (x === 0) ctx.moveTo(idx * cw + x, py);
        else ctx.lineTo(idx * cw + x, py);
      }
      ctx.stroke();
    });
  } else if (kind.includes('vectorscope') || kind.includes('goniometer') || kind.includes('hsl') || kind.includes('cie') || kind.includes('diamond')) {
    // Polar / Lissajous / Gamut display
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) * 0.75;

    // Outer graticule ring
    ctx.strokeStyle = '#2c3e5e';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Trace
    ctx.strokeStyle = kind.includes('gonio') ? '#7fe7a2' : '#6FC8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 200; i++) {
      const phi = (i / 200) * Math.PI * 2;
      const r = radius * (0.6 + 0.3 * Math.sin(phi * 3 + t));
      const px = cx + Math.cos(phi + t * 0.5) * r;
      const py = cy + Math.sin(phi * 2 + t) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  } else if (kind.includes('vu_analog')) {
    // Dual Analog Needle VU
    const wHalf = W / 2;
    for (let ch = 0; ch < 2; ch++) {
      const ox = ch * wHalf;
      const cx = ox + wHalf / 2;
      const cy = H * 0.9;
      const arm = H * 0.7;
      const angle = -Math.PI / 4 + (Math.sin(t * 3 + ch) * 0.5 + 0.5) * (Math.PI / 2);

      // Dial arc
      ctx.strokeStyle = '#445d82';
      ctx.beginPath();
      ctx.arc(cx, cy, arm, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();

      // Needle
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(angle) * arm, cy - Math.cos(angle) * arm);
      ctx.stroke();
    }
  } else if (kind.includes('dbfs_meters')) {
    // Bar meters
    const barW = Math.min(40, W * 0.15);
    const gap = 16;
    const startX = (W - (barW * 2 + gap)) / 2;
    for (let ch = 0; ch < 2; ch++) {
      const x = startX + ch * (barW + gap);
      const lvl = Math.min(1, Math.max(0, Math.sin(t * 4 + ch * 1.5) * 0.4 + 0.5));
      const barH = (H * 0.8) * lvl;

      const grad = ctx.createLinearGradient(0, H * 0.9, 0, H * 0.1);
      grad.addColorStop(0, '#19c54b');
      grad.addColorStop(0.7, '#e6e23a');
      grad.addColorStop(1, '#ff3b3b');

      ctx.fillStyle = grad;
      ctx.fillRect(x, H * 0.9 - barH, barW, barH);
    }
  } else {
    // Standard waveform trace
    ctx.strokeStyle = '#6FC8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < W; x += 4) {
      const norm = x / W;
      const y = (H / 2) + Math.sin(norm * 12 + t) * (H * 0.3) * Math.cos(t * 0.5);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.restore();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

btnPlay.addEventListener('click', () => {
  running = !running;
  btnPlay.classList.toggle('active', running);
  statusEl.textContent = running ? 'STREAMING' : 'PAUSED';
  if (running) requestAnimationFrame(render);
});

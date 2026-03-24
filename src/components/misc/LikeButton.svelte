<script lang="ts">
  import { onMount } from 'svelte';

  const API = 'https://twikoo.leehenry.top/likes/';

  let count = $state(0);
  let liked = $state(false);
  let loading = $state(true);
  let animating = $state(false);

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const storageKey = `liked:${path}`;

  // ── Physics canvas ───────────────────────────────────────────────────
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let rafId = 0;
  let loopRunning = false;
  let frameCount = 0;
  let heartColor = 'rgb(180,100,160)'; // fallback; overwritten in onMount
  let heartPath2D: Path2D;

  // Same SVG path as the button icon (24×24 viewBox)
  const HEART_SVG =
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

  let cW = 280;           // set dynamically in onMount
  const H = 80;
  const MAX = 80;
  const GRAVITY  = 0.1;
  const FRICTION = 0;  // applied to vx and vr each frame

  interface P {
    x: number; y: number;
    vx: number; vy: number;
    r: number;            // collision radius & draw scale
    rot: number;          // current rotation (radians)
    vr: number;           // angular velocity
  }
  let particles: P[] = [];

  function spawn() {
    if (particles.length >= MAX) return;
    const r = 6 + Math.random() * 6;           // 6–12 px
    particles.push({
      x:   cW / 2 + (Math.random() - 0.5) * cW * 0.4, // ±20% width from center
      y:   -r,
      vx:  (Math.random() - 0.5) * 1.0,
      vy:  0,
      r,
      rot: (Math.random() - 0.5) * Math.PI,
      vr:  (Math.random() - 0.5) * 0.12,
    });
    if (!loopRunning) { loopRunning = true; frameCount = 0; step(); }
  }

  function collide() {
    for (let i = 0; i < particles.length - 1; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const min = a.r + b.r;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0.001) {
          const d  = Math.sqrt(d2);
          const nx = dx / d, ny = dy / d;
          const push = (min - d) / 2;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
          const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rel > 0) {
            const imp = rel * 0.25;   // soft collision, low restitution
            a.vx -= imp * nx; a.vy -= imp * ny;
            b.vx += imp * nx; b.vy += imp * ny;
            // gentle spin nudge on collision
            a.vr += imp * 0.15 * (Math.random() - 0.5);
            b.vr -= imp * 0.15 * (Math.random() - 0.5);
          }
        }
      }
    }
  }

  function drawOne(p: P) {
    if (!ctx) return;
    const sc = p.r / 12;   // SVG is 24px wide → center offset = 12
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(sc, sc);
    ctx.translate(-12, -12);
    ctx.fillStyle   = heartColor;
    ctx.globalAlpha = 0.72;
    ctx.fill(heartPath2D);
    ctx.restore();
  }

  function step() {
    if (!ctx) { loopRunning = false; return; }
    frameCount++;
    if (frameCount > 800) { loopRunning = false; return; }

    ctx.clearRect(0, 0, cW, H);

    let moving = false;
    for (const p of particles) {
      // linear
      p.vy += GRAVITY;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vx *= FRICTION;
      // angular
      p.vr *= FRICTION;
      p.rot += p.vr;

      // floor
      if (p.y + p.r > H) {
        p.y   = H - p.r;
        p.vy *= -0.8;
        p.vx *= 0.75;
        p.vr *= 0.6;
      }
      // walls
      if (p.x - p.r < 0)  { p.x = p.r;      p.vx =  Math.abs(p.vx) * 0.2; p.vr *= 0.5; }
      if (p.x + p.r > cW) { p.x = cW - p.r; p.vx = -Math.abs(p.vx) * 0.2; p.vr *= 0.5; }

      // keep loop alive while in air OR has meaningful velocity
      if (p.y + p.r < H - 0.5 || Math.abs(p.vx) > 0.05 || Math.abs(p.vy) > 0.05 || Math.abs(p.vr) > 0.02) moving = true;
    }

    collide();
    for (const p of particles) drawOne(p);

    if (moving) {
      rafId = requestAnimationFrame(step);
    } else {
      loopRunning = false;
    }
  }

  // ── API ──────────────────────────────────────────────────────────────
  async function fetchCount() {
    try {
      const r    = await fetch(`${API}?path=${encodeURIComponent(path)}`);
      const data = await r.json();
      count = data.count ?? 0;
      const n = Math.min(count, MAX);
      let i = 0;
      const iv = setInterval(() => {
        if (i++ >= n) { clearInterval(iv); return; }
        spawn();
      }, 130);
    } catch {}
    liked   = !!localStorage.getItem(storageKey);
    loading = false;
  }

  async function handleLike() {
    if (liked || loading) return;
    animating = true;
    setTimeout(() => { animating = false; }, 500);
    spawn();
    try {
      const r    = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ path }),
      });
      const data = await r.json();
      count = data.count;
      if (data.ok !== false) {
        liked = true;
        localStorage.setItem(storageKey, '1');
      }
    } catch {}
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    heartPath2D = new Path2D(HEART_SVG);

    // Match canvas buffer width to its rendered width
    cW = canvas.getBoundingClientRect().width || 280;
    canvas.width  = cW;
    canvas.height = H;

    // Resolve --primary to an rgb() value the canvas understands
    canvas.style.color = 'var(--primary)';
    heartColor = getComputedStyle(canvas).color;
    canvas.style.color = '';

    fetchCount();
    return () => cancelAnimationFrame(rafId);
  });
</script>

<div id="like-button" class="like-wrapper">
  <canvas bind:this={canvas} class="hearts-canvas"></canvas>
  <button
    class="like-btn"
    class:liked
    class:animating
    onclick={handleLike}
    disabled={liked || loading}
    aria-label="为这篇文章点赞"
  >
    <svg viewBox="0 0 24 24" class="like-icon" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <span class="like-count">{loading ? '·' : count}</span>
  </button>
</div>

<style>
  .like-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80px;
    padding: 0.5rem 0;
  }

  .hearts-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    pointer-events: none;
  }

  .like-btn {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 1.1rem;
    border: 1px solid var(--btn-card-bg-active);
    background: color-mix(in srgb, var(--card-bg) 50%, transparent);
    color: var(--btn-content);
    border-radius: 0;
    cursor: pointer;
    font-size: 0.9rem;
    opacity: 0.7;
    transition: border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
    user-select: none;
  }

  .like-btn:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
    opacity: 1;
  }

  .like-btn.liked {
    border-color: var(--primary);
    color: var(--primary);
    opacity: 1;
    cursor: default;
  }

  .like-btn:disabled:not(.liked) {
    cursor: default;
  }

  .like-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .like-btn.animating .like-icon {
    transform: scale(1.5);
  }

  .like-count {
    min-width: 1.5ch;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
</style>

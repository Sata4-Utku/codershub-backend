// Anidox — paylasilan "poster" cizim motoru: her anime/manga icin
// canvas uzerinde aninda uretilen ozgun kapak illustrasyonu (harici gorsel yok)

function kvSeededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function kvHexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(v, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function kvMixColor(c1, c2, t) {
  const a = kvHexToRgb(c1), b = kvHexToRgb(c2);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function kvSeedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h || 1;
}

const KV_POSTER_SHAPES = {
  sword: { type: 'stroke', d: 'M4 20L15 9M15 9l2.5-2.5a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L18 12M15 9l3 3M6 18l2 2M4.5 19.5l1-1' },
  moon: { type: 'fill', d: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z' },
  flame: { type: 'fill', d: 'M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 2 2 2c-1-2 0-4 2-4.5C11.5 8 11 10 12 11c0-3 0-6 0-9z' },
  star: { type: 'fill', d: 'M12 2l2.6 6.6 7 .5-5.4 4.5 1.8 6.9L12 16.9 5.9 20.5l1.9-6.9L2.4 9.1l7-.5z' },
  mask: { type: 'fill', d: 'M4 8c2-2 5-3 8-3s6 1 8 3c0 6-3 11-8 12-5-1-8-6-8-12z' },
  flower: { type: 'petals' }
};

/**
 * Bir canvas uzerine, verilen seed'e gore sabit ama ozgun bir "poster" cizer.
 * Canvas arka plani seffaftir; altindaki CSS gradyani gorunur kalir.
 */
function kvDrawPoster(canvas, seedInput, icon, accentHex) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = rect.width, h = rect.height;
  const seed = typeof seedInput === 'string' ? kvSeedFromString(seedInput) : Number(seedInput) || 1;
  const rand = kvSeededRandom(seed);
  const accent = accentHex || '#e81c33';

  ctx.clearRect(0, 0, w, h);

  // yumusak ust parlama
  const gx = rand() > 0.5 ? w * 0.28 : w * 0.72;
  const gy = h * 0.2;
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.6);
  glow.addColorStop(0, 'rgba(255,255,255,0.22)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // ince isik izleri
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = w * 0.03;
  const rayCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < rayCount; i++) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate((rand() - 0.5) * 0.9 - Math.PI / 2.3 + i * 0.42);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, h * 1.4);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // ince tane dokusu
  for (let i = 0; i < 16; i++) {
    ctx.globalAlpha = 0.04 + rand() * 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, 1 + rand() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // buyuk amblem
  const shape = KV_POSTER_SHAPES[icon] || KV_POSTER_SHAPES.star;
  const size = Math.min(w, h) * 0.5;
  ctx.save();
  ctx.translate(w / 2, h * 0.46);
  ctx.shadowColor = accent;
  ctx.shadowBlur = size * 0.35;

  if (shape.type === 'petals') {
    const petals = 5;
    const pr = size * 0.16;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + rand() * 0.2;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -size * 0.24);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 0.6, pr, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, 0, pr * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.scale(size / 24, size / 24);
    ctx.translate(-12, -12);
    const path = new Path2D(shape.d);
    if (shape.type === 'stroke') {
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill(path);
    }
  }
  ctx.restore();
}

/** Basit tek-path filigran cizimleri icin (ör. manga sayfa desenleri) d dizesi dondurur. */
function kvIconPathD(icon) {
  const shape = KV_POSTER_SHAPES[icon];
  return (shape && shape.d) || KV_POSTER_SHAPES.star.d;
}

/** Bir konteyner icindeki tum .kv-card-canvas elemanlarini cizer. */
function kvRenderPosters(container) {
  container.querySelectorAll('.kv-card-canvas').forEach((canvas) => {
    kvDrawPoster(canvas, canvas.dataset.seed, canvas.dataset.icon, canvas.dataset.accent);
  });
}

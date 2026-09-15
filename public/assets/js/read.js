let KV_CURRENT_MANGA = null;
let KV_CURRENT_CHAPTER_INDEX = 0;
let KV_CURRENT_PAGE = 1;
let KV_READ_MARKED = false;

const KV_SFX = ['...', '!!', 'VOOM', 'TAK', 'Zzz', '??', 'DUM', '~'];

const KV_PANEL_TEMPLATES = [
  [{ x: 0, y: 0, w: 1, h: 0.55 }, { x: 0, y: 0.57, w: 0.48, h: 0.43 }, { x: 0.52, y: 0.57, w: 0.48, h: 0.43 }],
  [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.52, y: 0, w: 0.48, h: 0.5 }, { x: 0, y: 0.52, w: 1, h: 0.48 }],
  [{ x: 0, y: 0, w: 1, h: 0.34 }, { x: 0, y: 0.36, w: 1, h: 0.3 }, { x: 0, y: 0.68, w: 1, h: 0.32 }],
  [{ x: 0, y: 0, w: 0.62, h: 1 }, { x: 0.64, y: 0, w: 0.36, h: 0.48 }, { x: 0.64, y: 0.5, w: 0.36, h: 0.5 }],
  [{ x: 0, y: 0, w: 0.34, h: 1 }, { x: 0.36, y: 0, w: 0.64, h: 0.46 }, { x: 0.36, y: 0.48, w: 0.64, h: 0.52 }],
  [{ x: 0, y: 0, w: 1, h: 0.48 }, { x: 0, y: 0.5, w: 1, h: 0.5 }]
];

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

function drawMangaPage(canvas, seed, gradient, icon) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height;

  const rand = kvSeededRandom(seed * 7919 + 13);
  ctx.fillStyle = '#0b0b12';
  ctx.fillRect(0, 0, w, h);

  const template = KV_PANEL_TEMPLATES[Math.floor(rand() * KV_PANEL_TEMPLATES.length)];
  const gutter = 6;

  template.forEach((p, i) => {
    const px = p.x * w + gutter / 2;
    const py = p.y * h + gutter / 2;
    const pw = p.w * w - gutter;
    const ph = p.h * h - gutter;

    const t = 0.25 + rand() * 0.5;
    const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
    grad.addColorStop(0, kvMixColor(gradient[0], '#0b0b12', 0.15));
    grad.addColorStop(1, kvMixColor(gradient[1], '#0b0b12', i % 2 === 0 ? 0.1 : 0.35));
    ctx.fillStyle = grad;
    ctx.fillRect(px, py, pw, ph);

    // hareket cizgileri
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    const lineCount = 5 + Math.floor(rand() * 6);
    for (let j = 0; j < lineCount; j++) {
      const angle = rand() * Math.PI * 2;
      const cx = px + pw * rand();
      const cy = py + ph * rand();
      const len = 20 + rand() * 60;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }

    // basit siluet (kafa + govde)
    if (rand() > 0.35) {
      const scx = px + pw * (0.3 + rand() * 0.4);
      const scy = py + ph * (0.35 + rand() * 0.25);
      const headR = Math.min(pw, ph) * (0.08 + rand() * 0.05);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.arc(scx, scy, headR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(scx - headR * 1.3, scy + headR * 3.4);
      ctx.quadraticCurveTo(scx, scy + headR * 0.9, scx + headR * 1.3, scy + headR * 3.4);
      ctx.fill();
    }

    // ikon filigran
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.translate(px + pw - Math.min(pw, ph) * 0.22, py + ph - Math.min(pw, ph) * 0.22);
    ctx.scale(Math.min(pw, ph) / 90, Math.min(pw, ph) / 90);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke(new Path2D(KV_ICON_PATHS[icon] || KV_ICON_PATHS.star));
    ctx.restore();

    ctx.restore();

    // panel cercevesi (gutter)
    ctx.strokeStyle = '#0b0b12';
    ctx.lineWidth = gutter;
    ctx.strokeRect(px, py, pw, ph);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

    // konusma balonu (bazen)
    if (rand() > 0.5) {
      const bw = Math.min(pw * 0.42, 96);
      const bh = 30;
      const bx = px + pw * 0.08 + rand() * (pw - bw - pw * 0.16);
      const by = py + ph * 0.1 + rand() * (ph * 0.2);
      ctx.fillStyle = 'rgba(10,10,16,0.85)';
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.2;
      kvRoundRect(ctx, bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(KV_SFX[Math.floor(rand() * KV_SFX.length)], bx + bw / 2, by + bh / 2 + 1);
    }
  });

  // sayfa numarasi
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Anidox', w - 10, h - 10);
}

function kvRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const KV_ICON_PATHS = {
  sword: 'M4 20L15 9M15 9l2.5-2.5a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L18 12M15 9l3 3M6 18l2 2M4.5 19.5l1-1',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  flower: 'M12 3.5c1.8 0 3 1.6 3 3.4 0-1.8 1.6-3 3.4-3s3 1.6 3 3.4-1.6 3-3.4 3c1.8 0 3 1.6 3 3.4s-1.6 3-3.4 3c0-1.8-1.6-3-3.4-3',
  flame: 'M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 2 2 2c-1-2 0-4 2-4.5C11.5 8 11 10 12 11c0-3 0-6 0-9z',
  star: 'M12 2l2.6 6.6 7 .5-5.4 4.5 1.8 6.9L12 16.9 5.9 20.5l1.9-6.9L2.4 9.1l7-.5z',
  mask: 'M4 8c2-2 5-3 8-3s6 1 8 3c0 6-3 11-8 12-5-1-8-6-8-12z'
};

async function kvInitReader() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) return;

  let manga;
  try {
    manga = (await kvApi.getManga(slug)).manga;
  } catch (e) {
    document.getElementById('kv-detail-info').innerHTML = '<p>Manga bulunamadi.</p>';
    return;
  }
  KV_CURRENT_MANGA = manga;

  let favIds = [];
  let readSet = new Set();
  if (KV_USER) {
    try {
      const p = await kvApi.profile();
      favIds = p.user.favorites.manga;
      p.user.readHistory.filter((h) => h.mangaId === manga.id).forEach((h) => readSet.add(h.chapterId));
    } catch (e) {}
  }
  window.KV_READ_SET = readSet;

  document.title = manga.title + ' — Anidox';
  const [c1, c2] = manga.gradient;
  document.getElementById('kv-detail-banner').style.background = `linear-gradient(120deg, ${c1}, ${c2})`;
  const cover = document.getElementById('kv-detail-cover');
  cover.style.background = `linear-gradient(150deg, ${c1}, ${c2})`;
  cover.innerHTML = kvIcon(manga.icon, 90);

  const isFav = favIds.includes(manga.id);
  document.getElementById('kv-detail-info').innerHTML = `
    <div class="kv-detail-meta">
      <span class="kv-chip">${manga.year}</span>
      <span class="kv-chip">${manga.status}</span>
      <span class="kv-chip">${manga.author}</span>
      <span class="kv-rating-badge">${kvIcon('star', 16)} ${manga.rating}</span>
    </div>
    <h1>${manga.title}</h1>
    <div class="kv-detail-meta">
      ${manga.genres.map((g) => `<span class="kv-chip">${g}</span>`).join('')}
    </div>
    <p class="kv-detail-syn">${manga.synopsis}</p>
    <div class="kv-detail-actions">
      <button class="kv-btn kv-btn-ghost" id="kv-detail-fav" data-fav="${isFav}">
        ${kvIcon('heart', 16)} ${isFav ? 'Favoride' : 'Favorilere Ekle'}
      </button>
    </div>
  `;

  document.getElementById('kv-detail-fav').addEventListener('click', async (e) => {
    if (!KV_USER) { window.location.href = '/giris.html'; return; }
    try {
      const res = await kvApi.toggleFavorite('manga', manga.id);
      const btn = e.currentTarget;
      btn.innerHTML = kvIcon('heart', 16) + (res.added ? ' Favoride' : ' Favorilere Ekle');
      kvToast(res.added ? 'Favorilere eklendi.' : 'Favorilerden cikarildi.', 'success');
    } catch (err) { kvToast(err.message, 'error'); }
  });

  renderChapterSelect(manga);
  selectChapter(0);

  document.getElementById('kv-page-prev').addEventListener('click', () => changePage(-1));
  document.getElementById('kv-page-next').addEventListener('click', () => changePage(1));
  window.addEventListener('resize', () => renderCurrentPage());
}

function renderChapterSelect(manga) {
  const wrap = document.getElementById('kv-chapter-select');
  wrap.innerHTML = manga.chapters.map((ch, idx) =>
    `<button class="kv-chip-filter ${idx === 0 ? 'active' : ''}" data-idx="${idx}">Bolum ${ch.number}${window.KV_READ_SET?.has(ch.id) ? ' ✓' : ''}</button>`
  ).join('');
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.kv-chip-filter');
    if (!btn) return;
    wrap.querySelectorAll('.kv-chip-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectChapter(Number(btn.dataset.idx));
  });
}

function selectChapter(idx) {
  KV_CURRENT_CHAPTER_INDEX = idx;
  KV_CURRENT_PAGE = 1;
  KV_READ_MARKED = false;
  const manga = KV_CURRENT_MANGA;
  const ch = manga.chapters[idx];
  document.getElementById('kv-chapter-title').textContent = `Bolum ${ch.number} — ${ch.title}`;
  renderCurrentPage();
}

function renderCurrentPage() {
  const manga = KV_CURRENT_MANGA;
  const ch = manga.chapters[KV_CURRENT_CHAPTER_INDEX];
  const canvas = document.getElementById('kv-manga-canvas');
  const seed = manga.id.length + ch.number * 97 + KV_CURRENT_PAGE * 13;
  drawMangaPage(canvas, seed, manga.gradient, manga.icon);
  document.getElementById('kv-page-indicator').textContent = `${KV_CURRENT_PAGE} / ${ch.pages}`;

  const page = document.getElementById('kv-manga-page');
  page.style.animation = 'none';
  requestAnimationFrame(() => { page.style.animation = ''; });
}

async function changePage(dir) {
  const manga = KV_CURRENT_MANGA;
  const ch = manga.chapters[KV_CURRENT_CHAPTER_INDEX];
  const next = KV_CURRENT_PAGE + dir;

  if (next < 1) {
    if (KV_CURRENT_CHAPTER_INDEX > 0) {
      const wrap = document.getElementById('kv-chapter-select');
      wrap.children[KV_CURRENT_CHAPTER_INDEX - 1]?.click();
      KV_CURRENT_PAGE = manga.chapters[KV_CURRENT_CHAPTER_INDEX].pages;
      renderCurrentPage();
    }
    return;
  }
  if (next > ch.pages) {
    if (KV_USER && !KV_READ_MARKED) {
      KV_READ_MARKED = true;
      try {
        await kvApi.markRead(manga.id, ch.id);
        window.KV_READ_SET?.add(ch.id);
        kvToast(`"${ch.title}" okundu olarak isaretlendi.`, 'success');
        renderChapterSelect(manga);
        document.querySelectorAll('#kv-chapter-select .kv-chip-filter')[KV_CURRENT_CHAPTER_INDEX]?.classList.add('active');
      } catch (e) {}
    }
    if (KV_CURRENT_CHAPTER_INDEX < manga.chapters.length - 1) {
      const wrap = document.getElementById('kv-chapter-select');
      wrap.children[KV_CURRENT_CHAPTER_INDEX + 1]?.click();
    }
    return;
  }

  KV_CURRENT_PAGE = next;
  renderCurrentPage();

  if (next === ch.pages && KV_USER && !KV_READ_MARKED) {
    KV_READ_MARKED = true;
    try {
      await kvApi.markRead(manga.id, ch.id);
      window.KV_READ_SET?.add(ch.id);
      kvToast(`"${ch.title}" okundu olarak isaretlendi.`, 'success');
    } catch (e) {}
  }
}

document.addEventListener('kv-layout-ready', kvInitReader);

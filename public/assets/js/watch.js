let KV_CURRENT_ANIME = null;
let KV_CURRENT_EP_INDEX = 0;
let KV_PLAYING = false;
let KV_ELAPSED = 0;
let KV_DEMO_LENGTH = 20; // saniye - gercek zamanda oynatim suresi
let KV_TICK_HANDLE = null;
let KV_CANVAS_HANDLE = null;
let KV_WATCHED_MARKED = false;

function kvFormatTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function kvParseDurationSeconds(label) {
  const n = parseInt(label, 10);
  return (isNaN(n) ? 24 : n) * 60;
}

async function kvInitWatch() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    document.getElementById('kv-detail-info').innerHTML = '<p>Anime bulunamadi.</p>';
    return;
  }

  let anime;
  try {
    anime = (await kvApi.getAnime(slug)).anime;
  } catch (e) {
    document.getElementById('kv-detail-info').innerHTML = '<p>Anime bulunamadi.</p>';
    return;
  }
  KV_CURRENT_ANIME = anime;

  let favIds = [];
  let watchedSet = new Set();
  if (KV_USER) {
    try {
      const p = await kvApi.profile();
      favIds = p.user.favorites.anime;
      p.user.watchHistory.filter((h) => h.animeId === anime.id).forEach((h) => watchedSet.add(h.episodeId));
    } catch (e) {}
  }

  document.title = anime.title + ' — Kuroverse';

  const [c1, c2] = anime.gradient;
  document.getElementById('kv-detail-banner').style.background = `linear-gradient(120deg, ${c1}, ${c2})`;
  const cover = document.getElementById('kv-detail-cover');
  cover.style.background = `linear-gradient(150deg, ${c1}, ${c2})`;
  cover.innerHTML = kvIcon(anime.icon, 90);

  const isFav = favIds.includes(anime.id);
  document.getElementById('kv-detail-info').innerHTML = `
    <div class="kv-detail-meta">
      <span class="kv-chip">${anime.year}</span>
      <span class="kv-chip">${anime.status}</span>
      <span class="kv-chip">${anime.studio}</span>
      <span class="kv-rating-badge">${kvIcon('star', 16)} ${anime.rating}</span>
    </div>
    <h1>${anime.title}</h1>
    <div class="kv-detail-meta">
      ${anime.genres.map((g) => `<span class="kv-chip">${g}</span>`).join('')}
    </div>
    <p class="kv-detail-syn">${anime.synopsis}</p>
    <div class="kv-detail-actions">
      <button class="kv-btn kv-btn-primary" id="kv-play-first">${kvIcon('play', 16)} Izlemeye Basla</button>
      <button class="kv-btn kv-btn-ghost ${isFav ? 'kv-fav-active' : ''}" id="kv-detail-fav" data-fav="${isFav}">
        ${kvIcon('heart', 16)} ${isFav ? 'Favoride' : 'Favorilere Ekle'}
      </button>
    </div>
  `;

  document.getElementById('kv-detail-fav').addEventListener('click', async (e) => {
    if (!KV_USER) { window.location.href = '/giris.html'; return; }
    try {
      const res = await kvApi.toggleFavorite('anime', anime.id);
      const btn = e.currentTarget;
      btn.dataset.fav = res.added;
      btn.innerHTML = kvIcon('heart', 16) + (res.added ? ' Favoride' : ' Favorilere Ekle');
      kvToast(res.added ? 'Favorilere eklendi.' : 'Favorilerden cikarildi.', 'success');
    } catch (err) { kvToast(err.message, 'error'); }
  });

  document.getElementById('kv-ep-count-title').textContent = `Bolumler (${anime.episodes.length})`;
  renderEpisodeList(anime, watchedSet);

  document.getElementById('kv-play-first').addEventListener('click', () => selectEpisode(0, watchedSet));

  selectEpisode(0, watchedSet, false);

  document.getElementById('kv-player-toggle').addEventListener('click', togglePlay);
  document.getElementById('kv-player-toggle-2').addEventListener('click', togglePlay);
  document.getElementById('kv-progress-track').addEventListener('click', seekClick);

  initPlayerCanvas();
}

function renderEpisodeList(anime, watchedSet) {
  const list = document.getElementById('kv-ep-list');
  list.innerHTML = anime.episodes.map((ep, idx) => `
    <div class="kv-ep-item kv-reveal ${watchedSet.has(ep.id) ? 'watched' : ''}" data-idx="${idx}">
      <div class="kv-ep-num">${watchedSet.has(ep.id) ? kvIcon('star', 15) : ep.number}</div>
      <div class="kv-ep-title">${ep.title}</div>
      <div class="kv-ep-duration">${ep.duration}</div>
    </div>
  `).join('');
  kvObserveNewReveals(list);

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.kv-ep-item');
    if (!item) return;
    selectEpisode(Number(item.dataset.idx), watchedSet);
  });
}

function selectEpisode(idx, watchedSet, autoplay = true) {
  const anime = KV_CURRENT_ANIME;
  const ep = anime.episodes[idx];
  if (!ep) return;
  KV_CURRENT_EP_INDEX = idx;
  KV_ELAPSED = 0;
  KV_WATCHED_MARKED = watchedSet.has(ep.id);
  KV_PLAYING = false;
  clearInterval(KV_TICK_HANDLE);

  document.getElementById('kv-player-ep-label').textContent = `Bolum ${ep.number} — ${ep.title}`;
  document.getElementById('kv-progress-fill').style.width = '0%';
  document.getElementById('kv-player-time').textContent = `00:00 / ${kvFormatTime(kvParseDurationSeconds(ep.duration))}`;
  document.getElementById('kv-player-toggle').classList.remove('hidden');
  document.getElementById('kv-player').classList.remove('paused');

  document.querySelectorAll('.kv-ep-item').forEach((el) => el.classList.toggle('active', Number(el.dataset.idx) === idx));

  document.getElementById('kv-player').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (autoplay) togglePlay();
}

function togglePlay() {
  KV_PLAYING = !KV_PLAYING;
  const player = document.getElementById('kv-player');
  const centerBtn = document.getElementById('kv-player-toggle');
  player.classList.toggle('paused', !KV_PLAYING);

  if (KV_PLAYING) {
    centerBtn.innerHTML = '<svg class="kv-icon" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
    document.getElementById('kv-player-toggle-2').innerHTML = kvIcon('pause', 16);
    KV_TICK_HANDLE = setInterval(tickPlayback, 250);
  } else {
    centerBtn.innerHTML = kvIcon('play', 30);
    document.getElementById('kv-player-toggle-2').innerHTML = kvIcon('play', 16);
    clearInterval(KV_TICK_HANDLE);
  }
}

async function tickPlayback() {
  const anime = KV_CURRENT_ANIME;
  const ep = anime.episodes[KV_CURRENT_EP_INDEX];
  const nominal = kvParseDurationSeconds(ep.duration);

  KV_ELAPSED += 0.25;
  const fraction = Math.min(1, KV_ELAPSED / KV_DEMO_LENGTH);
  const displaySec = fraction * nominal;

  document.getElementById('kv-progress-fill').style.width = (fraction * 100) + '%';
  document.getElementById('kv-player-time').textContent = `${kvFormatTime(displaySec)} / ${kvFormatTime(nominal)}`;

  if (fraction >= 0.92 && !KV_WATCHED_MARKED && KV_USER) {
    KV_WATCHED_MARKED = true;
    try {
      await kvApi.markWatched(anime.id, ep.id);
      const item = document.querySelector(`.kv-ep-item[data-idx="${KV_CURRENT_EP_INDEX}"]`);
      item?.classList.add('watched');
      const num = item?.querySelector('.kv-ep-num');
      if (num) num.innerHTML = kvIcon('star', 15);
      kvToast(`"${ep.title}" izlendi olarak isaretlendi.`, 'success');
    } catch (e) {}
  }

  if (fraction >= 1) {
    clearInterval(KV_TICK_HANDLE);
    KV_PLAYING = false;
    document.getElementById('kv-player').classList.remove('paused');
    document.getElementById('kv-player-toggle').innerHTML = kvIcon('play', 30);
    document.getElementById('kv-player-toggle-2').innerHTML = kvIcon('play', 16);

    if (KV_CURRENT_EP_INDEX < anime.episodes.length - 1) {
      setTimeout(() => {
        const watchedSet = new Set(
          Array.from(document.querySelectorAll('.kv-ep-item.watched')).map((el) => anime.episodes[Number(el.dataset.idx)].id)
        );
        selectEpisode(KV_CURRENT_EP_INDEX + 1, watchedSet);
      }, 900);
    }
  }
}

function seekClick(e) {
  const track = e.currentTarget;
  const rect = track.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  KV_ELAPSED = fraction * KV_DEMO_LENGTH;
  document.getElementById('kv-progress-fill').style.width = (fraction * 100) + '%';
}

function initPlayerCanvas() {
  const canvas = document.getElementById('kv-player-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    const anime = KV_CURRENT_ANIME;
    const [c1, c2] = anime ? anime.gradient : ['#7c3aed', '#ec4899'];
    t += KV_PLAYING ? 0.012 : 0.002;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 4; i++) {
      const rx = w / 2 + Math.sin(t * (1 + i * 0.4) + i) * w * 0.3;
      const ry = h / 2 + Math.cos(t * (0.8 + i * 0.3) + i) * h * 0.3;
      const r = Math.min(w, h) * (0.18 + i * 0.05);
      const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, r);
      rg.addColorStop(0, '#ffffff');
      rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    KV_CANVAS_HANDLE = requestAnimationFrame(draw);
  }
  draw();
}

document.addEventListener('kv-layout-ready', kvInitWatch);

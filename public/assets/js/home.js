const KV_TICKER_MESSAGES = [
  'Ay-Kagan az once "Neon Ronin" 3. bolumu izledi',
  'Sakura92 "Moonlit Alchemist" 2. bolumu okudu',
  'ShadowFox "Kagerou Requiem" serisini favoriledi',
  'YukiChan 7 gunluk izleme serisine ulasti',
  'RoninX "Ashfall Samurai" son bolume ulasti',
  'Hanabi "Static Heart" icin 9.5 puan verdi'
];

async function kvInitHome() {
  let anime = [], manga = [];
  try {
    const [animeRes, mangaRes] = await Promise.all([kvApi.listAnime(), kvApi.listManga()]);
    anime = animeRes.anime; manga = mangaRes.manga;
  } catch (e) {
    kvToast('Veriler yuklenirken hata olustu.', 'error');
  }

  const totalEp = anime.reduce((s, a) => s + a.episodes.length, 0);
  const genreSet = new Set([...anime, ...manga].flatMap((x) => x.genres));
  kvAnimateNumber('stat-anime', anime.length);
  kvAnimateNumber('stat-manga', manga.length);
  kvAnimateNumber('stat-ep', totalEp);
  kvAnimateNumber('stat-genre', genreSet.size);

  let favIds = { anime: [], manga: [] };
  if (KV_USER) {
    try { favIds = (await kvApi.profile()).user.favorites; } catch (e) {}
  }

  const trendAnime = document.getElementById('kv-trend-anime');
  trendAnime.innerHTML = anime.slice(0, 4).map((a) => kvAnimeCardHTML(a, favIds.anime)).join('');
  kvBindCardEvents(trendAnime);
  kvObserveNewReveals(trendAnime);
  kvCardInAnim(trendAnime);

  const trendManga = document.getElementById('kv-trend-manga');
  trendManga.innerHTML = manga.slice(0, 4).map((m) => kvMangaCardHTML(m, favIds.manga)).join('');
  kvBindCardEvents(trendManga);
  kvObserveNewReveals(trendManga);
  kvCardInAnim(trendManga);

  kvRenderHeroBanner(anime);
  kvRenderMoodPicker(anime, manga);
  kvRenderTicker();
  kvRenderFeatures();
}

function kvRenderHeroBanner(anime) {
  if (!anime.length) return;
  const featured = [...anime].sort((a, b) => b.rating - a.rating)[0];
  const [c1, c2] = featured.gradient;
  const backdrop = document.getElementById('kv-hero-backdrop');
  if (backdrop) backdrop.style.background = `linear-gradient(150deg, ${c1}, ${c2})`;
  const canvas = document.getElementById('kv-hero-canvas');
  if (canvas) kvDrawPoster(canvas, featured.id, featured.icon, c1);
}

function kvAnimateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const tick = () => {
    cur = Math.min(target, cur + step);
    el.textContent = cur;
    if (cur < target) requestAnimationFrame(tick);
  };
  tick();
}

function kvRenderTicker() {
  const ticker = document.getElementById('kv-ticker');
  if (!ticker) return;
  const items = [...KV_TICKER_MESSAGES, ...KV_TICKER_MESSAGES]
    .map((msg) => `<div class="kv-ticker-item">${kvIcon('bolt', 15)}<span>${msg}</span></div>`)
    .join('');
  ticker.innerHTML = items;
}

function kvRenderFeatures() {
  const grid = document.getElementById('kv-features');
  if (!grid) return;
  const features = [
    { icon: 'shield', title: 'Guvenli Hesap Sistemi', desc: 'Sifreleri sifrelenmis sekilde saklayan, JWT tabanli oturum yonetimi.' },
    { icon: 'fire', title: 'Izleme/Okuma Serisi', desc: 'Her gun giris yaptikca artan seri sayacinla motivasyonunu koru.' },
    { icon: 'trophy', title: 'Rozet Sistemi', desc: 'Izledikce ve okudukca Bronz, Gumus, Altin ve Efsane rozetleri kazan.' },
    { icon: 'bolt', title: 'Ruh Haline Gore Oneri', desc: 'Anlik ruh haline gore sana ozel anime/manga onerisi al.' },
    { icon: 'shield', title: 'Admin Kontrol Paneli', desc: 'Icerik, bolum ve kullanici yonetimi tek panelde toplandi.' },
    { icon: 'star', title: 'Akici Animasyonlar', desc: 'Kayan yildiz alani, parlayan orbler ve mikro etkilesimlerle canli arayuz.' }
  ];
  grid.innerHTML = features.map((f) => `
    <div class="kv-feature kv-reveal">
      <div class="kv-feature-icon">${kvIcon(f.icon, 24)}</div>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>
  `).join('');
  kvObserveNewReveals(grid);
}

document.addEventListener('kv-layout-ready', kvInitHome);

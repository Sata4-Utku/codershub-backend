async function kvInitProfile() {
  if (!KV_USER) {
    window.location.href = '/giris.html';
    return;
  }

  const [profileData, animeData, mangaData] = await Promise.all([
    kvApi.profile(),
    kvApi.listAnime(),
    kvApi.listManga()
  ]);
  const { user, badges } = profileData;
  const animeMap = new Map(animeData.anime.map((a) => [a.id, a]));
  const mangaMap = new Map(mangaData.manga.map((m) => [m.id, m]));
  const earnedIds = new Set(badges.map((b) => b.id));

  const root = document.getElementById('kv-profile-root');
  root.innerHTML = `
    <div class="kv-profile-head kv-reveal kv-visible">
      <div class="kv-profile-avatar">${kvIcon(user.avatar, 38)}</div>
      <div>
        <h1>${user.username} ${user.role === 'admin' ? `<span class="kv-role-pill admin" style="margin-left:8px;">Admin</span>` : ''}</h1>
        <p>${user.email} · Katilim: ${new Date(user.joinedAt).toLocaleDateString('tr-TR')}</p>
      </div>
    </div>

    <div class="kv-panel kv-reveal kv-visible" style="margin-bottom:26px;">
      <div class="kv-flex" style="justify-content:space-between; flex-wrap:wrap; gap:20px;">
        <div class="kv-streak-box">
          <span class="kv-streak-flame">${kvIcon('flame', 30)}</span>
          <div>
            <strong>${user.streak.count} gunluk seri</strong>
            <span>Her gun giris yaparak serini koru</span>
          </div>
        </div>
        <div class="kv-badge-row" id="kv-badge-row"></div>
      </div>
    </div>

    <div class="kv-tabs" id="kv-profile-tabs">
      <div class="kv-tab active" data-tab="favAnime">Favori Anime</div>
      <div class="kv-tab" data-tab="favManga">Favori Manga</div>
      <div class="kv-tab" data-tab="watch">Izleme Gecmisi</div>
      <div class="kv-tab" data-tab="read">Okuma Gecmisi</div>
    </div>
    <div id="kv-profile-tab-content"></div>
  `;

  document.getElementById('kv-badge-row').innerHTML = KV_ALL_BADGES.map((b) => `
    <div class="kv-badge ${earnedIds.has(b.id) ? '' : 'locked'}" title="${b.min} icerik tamamla">
      ${kvIcon(b.icon, 16)}<span>${b.label}</span>
    </div>
  `).join('');

  const tabs = document.getElementById('kv-profile-tabs');
  const content = document.getElementById('kv-profile-tab-content');

  function renderTab(tab) {
    if (tab === 'favAnime') {
      const items = user.favorites.anime.map((id) => animeMap.get(id)).filter(Boolean);
      content.innerHTML = items.length
        ? `<div class="kv-grid">${items.map((a) => kvAnimeCardHTML(a, user.favorites.anime)).join('')}</div>`
        : kvEmptyBlock('Henuz favori anime yok.');
    } else if (tab === 'favManga') {
      const items = user.favorites.manga.map((id) => mangaMap.get(id)).filter(Boolean);
      content.innerHTML = items.length
        ? `<div class="kv-grid">${items.map((m) => kvMangaCardHTML(m, user.favorites.manga)).join('')}</div>`
        : kvEmptyBlock('Henuz favori manga yok.');
    } else if (tab === 'watch') {
      const items = [...user.watchHistory].reverse();
      content.innerHTML = items.length
        ? `<div class="kv-ep-list">${items.map((h) => {
            const anime = animeMap.get(h.animeId);
            const ep = anime?.episodes.find((e) => e.id === h.episodeId);
            return `<div class="kv-ep-item watched"><div class="kv-ep-num">${kvIcon('play', 15)}</div><div class="kv-ep-title">${anime?.title || '—'} · ${ep?.title || ''}</div><div class="kv-ep-duration">${new Date(h.watchedAt).toLocaleDateString('tr-TR')}</div></div>`;
          }).join('')}</div>`
        : kvEmptyBlock('Henuz izleme gecmisi yok.');
    } else if (tab === 'read') {
      const items = [...user.readHistory].reverse();
      content.innerHTML = items.length
        ? `<div class="kv-ep-list">${items.map((h) => {
            const manga = mangaMap.get(h.mangaId);
            const ch = manga?.chapters.find((c) => c.id === h.chapterId);
            return `<div class="kv-ep-item watched"><div class="kv-ep-num">${kvIcon('book', 15)}</div><div class="kv-ep-title">${manga?.title || '—'} · ${ch?.title || ''}</div><div class="kv-ep-duration">${new Date(h.readAt).toLocaleDateString('tr-TR')}</div></div>`;
          }).join('')}</div>`
        : kvEmptyBlock('Henuz okuma gecmisi yok.');
    }
    const grid = content.querySelector('.kv-grid');
    if (grid) { kvBindCardEvents(grid); kvCardInAnim(grid); }
  }

  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.kv-tab');
    if (!tab) return;
    tabs.querySelectorAll('.kv-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    renderTab(tab.dataset.tab);
  });

  renderTab('favAnime');
}

function kvEmptyBlock(msg) {
  return `<div class="kv-empty">${kvIcon('star', 40)}<p>${msg}</p></div>`;
}

document.addEventListener('kv-layout-ready', kvInitProfile);

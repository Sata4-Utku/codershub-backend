let KV_ADMIN_ANIME_EDIT_ID = null;
let KV_ADMIN_MANGA_EDIT_ID = null;
let KV_ADMIN_ANIME_CACHE = [];
let KV_ADMIN_MANGA_CACHE = [];

async function kvInitAdmin() {
  if (!KV_USER || KV_USER.role !== 'admin') {
    kvToast('Bu sayfaya erisim yetkin yok.', 'error');
    window.location.href = '/index.html';
    return;
  }

  const sideButtons = document.querySelectorAll('.kv-admin-side button');
  sideButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sideButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      kvRenderAdminSection(btn.dataset.section);
    });
  });

  bindAnimeModal();
  bindMangaModal();
  kvRenderAdminSection('dashboard');
}

async function kvRenderAdminSection(section) {
  const content = document.getElementById('kv-admin-content');
  content.innerHTML = `<div class="kv-skel" style="height:200px;border-radius:14px;"></div>`;

  if (section === 'dashboard') {
    const stats = await kvApi.adminStats();
    content.innerHTML = `
      <div class="kv-admin-stats-grid">
        ${kvStatCard(stats.totalUsers, 'Kullanici')}
        ${kvStatCard(stats.totalAdmins, 'Admin')}
        ${kvStatCard(stats.totalAnime, 'Anime')}
        ${kvStatCard(stats.totalManga, 'Manga')}
        ${kvStatCard(stats.totalEpisodes, 'Bolum (Anime)')}
        ${kvStatCard(stats.totalChapters, 'Bolum (Manga)')}
        ${kvStatCard(stats.totalWatch, 'Toplam Izleme')}
        ${kvStatCard(stats.totalRead, 'Toplam Okuma')}
      </div>
      <div class="kv-panel">
        <h3 style="margin-top:0;">Hosgeldin, ${KV_USER.username}</h3>
        <p style="color:var(--text-2);">Soldaki menuden anime, manga ve kullanici yonetimine gecebilirsin. Yeni icerik eklemek, bolum/chapter yonetmek ve kullanici rollerini degistirmek tamamen bu panelden yapilir.</p>
      </div>
    `;
  } else if (section === 'anime') {
    const res = await kvApi.listAnime();
    KV_ADMIN_ANIME_CACHE = res.anime;
    content.innerHTML = renderAnimeManager(res.anime);
    bindAnimeManagerEvents();
  } else if (section === 'manga') {
    const res = await kvApi.listManga();
    KV_ADMIN_MANGA_CACHE = res.manga;
    content.innerHTML = renderMangaManager(res.manga);
    bindMangaManagerEvents();
  } else if (section === 'users') {
    const res = await kvApi.adminUsers();
    content.innerHTML = renderUsersManager(res.users);
    bindUsersManagerEvents();
  }
}

function kvStatCard(value, label) {
  return `<div class="kv-stat-card"><strong>${value}</strong><span>${label}</span></div>`;
}

/* ---------------- Anime Yonetimi ---------------- */

function renderAnimeManager(list) {
  return `
    <div class="kv-flex" style="justify-content:space-between; margin-bottom:16px;">
      <h3 style="margin:0;">Anime Listesi (${list.length})</h3>
      <button class="kv-btn kv-btn-primary kv-btn-sm" id="kv-add-anime-btn">${kvIcon('plus', 16)} Yeni Anime</button>
    </div>
    <div class="kv-table-wrap">
      <table class="kv-table">
        <thead><tr><th>Baslik</th><th>Yil</th><th>Durum</th><th>Puan</th><th>Bolum</th><th></th></tr></thead>
        <tbody>
          ${list.map((a) => `
            <tr>
              <td>${a.title}</td>
              <td>${a.year}</td>
              <td>${a.status}</td>
              <td>${a.rating}</td>
              <td>${a.episodes.length}</td>
              <td class="kv-flex kv-gap-8">
                <button class="kv-btn kv-btn-ghost kv-btn-sm" data-edit-anime="${a.id}">Duzenle</button>
                <button class="kv-btn kv-btn-danger kv-btn-sm" data-delete-anime="${a.id}">${kvIcon('trash', 14)}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindAnimeManagerEvents() {
  document.getElementById('kv-add-anime-btn')?.addEventListener('click', () => openAnimeModal(null));
  document.querySelectorAll('[data-edit-anime]').forEach((btn) =>
    btn.addEventListener('click', () => openAnimeModal(btn.dataset.editAnime))
  );
  document.querySelectorAll('[data-delete-anime]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Bu animeyi silmek istedigine emin misin?')) return;
      try {
        await kvApi.adminDeleteAnime(btn.dataset.deleteAnime);
        kvToast('Anime silindi.', 'success');
        kvRenderAdminSection('anime');
      } catch (e) { kvToast(e.message, 'error'); }
    })
  );
}

function openAnimeModal(id) {
  KV_ADMIN_ANIME_EDIT_ID = id;
  const backdrop = document.getElementById('kv-anime-modal-backdrop');
  const form = document.getElementById('kv-anime-form');
  const epManager = document.getElementById('kv-anime-episode-manager');
  form.reset();

  if (id) {
    const anime = KV_ADMIN_ANIME_CACHE.find((a) => a.id === id);
    document.getElementById('kv-anime-modal-title').textContent = 'Anime Duzenle';
    form.title.value = anime.title;
    form.year.value = anime.year;
    form.rating.value = anime.rating;
    form.status.value = anime.status;
    form.studio.value = anime.studio;
    form.genres.value = anime.genres.join(', ');
    form.icon.value = anime.icon;
    form.gradient1.value = anime.gradient[0];
    form.gradient2.value = anime.gradient[1];
    form.synopsis.value = anime.synopsis;
    epManager.classList.remove('kv-hidden');
    renderEpisodeManagerList(anime);
  } else {
    document.getElementById('kv-anime-modal-title').textContent = 'Yeni Anime';
    epManager.classList.add('kv-hidden');
  }
  backdrop.classList.add('open');
}

function renderEpisodeManagerList(anime) {
  const wrap = document.getElementById('kv-anime-episode-list');
  wrap.innerHTML = anime.episodes.map((ep) => `
    <div class="kv-ep-item">
      <div class="kv-ep-num">${ep.number}</div>
      <div class="kv-ep-title">${ep.title}</div>
      <div class="kv-ep-duration">${ep.duration}</div>
      <button class="kv-btn kv-btn-danger kv-btn-sm" data-del-ep="${ep.id}">${kvIcon('trash', 13)}</button>
    </div>
  `).join('') || '<p style="color:var(--text-2);font-size:0.85rem;">Henuz bolum eklenmedi.</p>';

  wrap.querySelectorAll('[data-del-ep]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const res = await kvApi.adminDeleteEpisode(anime.id, btn.dataset.delEp);
      const updated = res.anime;
      const idx = KV_ADMIN_ANIME_CACHE.findIndex((a) => a.id === anime.id);
      KV_ADMIN_ANIME_CACHE[idx] = updated;
      renderEpisodeManagerList(updated);
      kvToast('Bolum silindi.', 'success');
    })
  );
}

function bindAnimeModal() {
  document.getElementById('kv-anime-modal-close').addEventListener('click', () => {
    document.getElementById('kv-anime-modal-backdrop').classList.remove('open');
  });
  document.getElementById('kv-anime-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'kv-anime-modal-backdrop') e.currentTarget.classList.remove('open');
  });

  document.getElementById('kv-anime-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.title.value.trim(),
      year: form.year.value,
      rating: form.rating.value,
      status: form.status.value,
      studio: form.studio.value,
      genres: form.genres.value,
      icon: form.icon.value,
      gradient: [form.gradient1.value, form.gradient2.value],
      synopsis: form.synopsis.value
    };
    try {
      if (KV_ADMIN_ANIME_EDIT_ID) {
        await kvApi.adminUpdateAnime(KV_ADMIN_ANIME_EDIT_ID, payload);
        kvToast('Anime guncellendi.', 'success');
      } else {
        const res = await kvApi.adminCreateAnime(payload);
        kvToast('Anime eklendi. Simdi bolum ekleyebilirsin.', 'success');
        KV_ADMIN_ANIME_EDIT_ID = res.anime.id;
        KV_ADMIN_ANIME_CACHE.unshift(res.anime);
        document.getElementById('kv-anime-modal-title').textContent = 'Anime Duzenle';
        document.getElementById('kv-anime-episode-manager').classList.remove('kv-hidden');
        renderEpisodeManagerList(res.anime);
        return;
      }
      document.getElementById('kv-anime-modal-backdrop').classList.remove('open');
      kvRenderAdminSection('anime');
    } catch (err) { kvToast(err.message, 'error'); }
  });

  document.getElementById('kv-episode-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!KV_ADMIN_ANIME_EDIT_ID) return;
    const form = e.target;
    try {
      const res = await kvApi.adminAddEpisode(KV_ADMIN_ANIME_EDIT_ID, {
        title: form.title.value.trim(),
        duration: form.duration.value.trim() || '24 dk'
      });
      form.reset();
      const idx = KV_ADMIN_ANIME_CACHE.findIndex((a) => a.id === KV_ADMIN_ANIME_EDIT_ID);
      KV_ADMIN_ANIME_CACHE[idx] = res.anime;
      renderEpisodeManagerList(res.anime);
      kvToast('Bolum eklendi.', 'success');
    } catch (err) { kvToast(err.message, 'error'); }
  });
}

/* ---------------- Manga Yonetimi ---------------- */

function renderMangaManager(list) {
  return `
    <div class="kv-flex" style="justify-content:space-between; margin-bottom:16px;">
      <h3 style="margin:0;">Manga Listesi (${list.length})</h3>
      <button class="kv-btn kv-btn-primary kv-btn-sm" id="kv-add-manga-btn">${kvIcon('plus', 16)} Yeni Manga</button>
    </div>
    <div class="kv-table-wrap">
      <table class="kv-table">
        <thead><tr><th>Baslik</th><th>Yil</th><th>Durum</th><th>Puan</th><th>Bolum</th><th></th></tr></thead>
        <tbody>
          ${list.map((m) => `
            <tr>
              <td>${m.title}</td>
              <td>${m.year}</td>
              <td>${m.status}</td>
              <td>${m.rating}</td>
              <td>${m.chapters.length}</td>
              <td class="kv-flex kv-gap-8">
                <button class="kv-btn kv-btn-ghost kv-btn-sm" data-edit-manga="${m.id}">Duzenle</button>
                <button class="kv-btn kv-btn-danger kv-btn-sm" data-delete-manga="${m.id}">${kvIcon('trash', 14)}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindMangaManagerEvents() {
  document.getElementById('kv-add-manga-btn')?.addEventListener('click', () => openMangaModal(null));
  document.querySelectorAll('[data-edit-manga]').forEach((btn) =>
    btn.addEventListener('click', () => openMangaModal(btn.dataset.editManga))
  );
  document.querySelectorAll('[data-delete-manga]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Bu mangayi silmek istedigine emin misin?')) return;
      try {
        await kvApi.adminDeleteManga(btn.dataset.deleteManga);
        kvToast('Manga silindi.', 'success');
        kvRenderAdminSection('manga');
      } catch (e) { kvToast(e.message, 'error'); }
    })
  );
}

function openMangaModal(id) {
  KV_ADMIN_MANGA_EDIT_ID = id;
  const backdrop = document.getElementById('kv-manga-modal-backdrop');
  const form = document.getElementById('kv-manga-form');
  const chManager = document.getElementById('kv-manga-chapter-manager');
  form.reset();

  if (id) {
    const manga = KV_ADMIN_MANGA_CACHE.find((m) => m.id === id);
    document.getElementById('kv-manga-modal-title').textContent = 'Manga Duzenle';
    form.title.value = manga.title;
    form.year.value = manga.year;
    form.rating.value = manga.rating;
    form.status.value = manga.status;
    form.author.value = manga.author;
    form.genres.value = manga.genres.join(', ');
    form.icon.value = manga.icon;
    form.gradient1.value = manga.gradient[0];
    form.gradient2.value = manga.gradient[1];
    form.synopsis.value = manga.synopsis;
    chManager.classList.remove('kv-hidden');
    renderChapterManagerList(manga);
  } else {
    document.getElementById('kv-manga-modal-title').textContent = 'Yeni Manga';
    chManager.classList.add('kv-hidden');
  }
  backdrop.classList.add('open');
}

function renderChapterManagerList(manga) {
  const wrap = document.getElementById('kv-manga-chapter-list');
  wrap.innerHTML = manga.chapters.map((ch) => `
    <div class="kv-ep-item">
      <div class="kv-ep-num">${ch.number}</div>
      <div class="kv-ep-title">${ch.title}</div>
      <div class="kv-ep-duration">${ch.pages} sayfa</div>
      <button class="kv-btn kv-btn-danger kv-btn-sm" data-del-ch="${ch.id}">${kvIcon('trash', 13)}</button>
    </div>
  `).join('') || '<p style="color:var(--text-2);font-size:0.85rem;">Henuz bolum eklenmedi.</p>';

  wrap.querySelectorAll('[data-del-ch]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const res = await kvApi.adminDeleteChapter(manga.id, btn.dataset.delCh);
      const updated = res.manga;
      const idx = KV_ADMIN_MANGA_CACHE.findIndex((m) => m.id === manga.id);
      KV_ADMIN_MANGA_CACHE[idx] = updated;
      renderChapterManagerList(updated);
      kvToast('Bolum silindi.', 'success');
    })
  );
}

function bindMangaModal() {
  document.getElementById('kv-manga-modal-close').addEventListener('click', () => {
    document.getElementById('kv-manga-modal-backdrop').classList.remove('open');
  });
  document.getElementById('kv-manga-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'kv-manga-modal-backdrop') e.currentTarget.classList.remove('open');
  });

  document.getElementById('kv-manga-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.title.value.trim(),
      year: form.year.value,
      rating: form.rating.value,
      status: form.status.value,
      author: form.author.value,
      genres: form.genres.value,
      icon: form.icon.value,
      gradient: [form.gradient1.value, form.gradient2.value],
      synopsis: form.synopsis.value
    };
    try {
      if (KV_ADMIN_MANGA_EDIT_ID) {
        await kvApi.adminUpdateManga(KV_ADMIN_MANGA_EDIT_ID, payload);
        kvToast('Manga guncellendi.', 'success');
      } else {
        const res = await kvApi.adminCreateManga(payload);
        kvToast('Manga eklendi. Simdi bolum ekleyebilirsin.', 'success');
        KV_ADMIN_MANGA_EDIT_ID = res.manga.id;
        KV_ADMIN_MANGA_CACHE.unshift(res.manga);
        document.getElementById('kv-manga-modal-title').textContent = 'Manga Duzenle';
        document.getElementById('kv-manga-chapter-manager').classList.remove('kv-hidden');
        renderChapterManagerList(res.manga);
        return;
      }
      document.getElementById('kv-manga-modal-backdrop').classList.remove('open');
      kvRenderAdminSection('manga');
    } catch (err) { kvToast(err.message, 'error'); }
  });

  document.getElementById('kv-chapter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!KV_ADMIN_MANGA_EDIT_ID) return;
    const form = e.target;
    try {
      const res = await kvApi.adminAddChapter(KV_ADMIN_MANGA_EDIT_ID, {
        title: form.title.value.trim(),
        pages: form.pages.value || 18
      });
      form.reset();
      const idx = KV_ADMIN_MANGA_CACHE.findIndex((m) => m.id === KV_ADMIN_MANGA_EDIT_ID);
      KV_ADMIN_MANGA_CACHE[idx] = res.manga;
      renderChapterManagerList(res.manga);
      kvToast('Bolum eklendi.', 'success');
    } catch (err) { kvToast(err.message, 'error'); }
  });
}

/* ---------------- Kullanici Yonetimi ---------------- */

function renderUsersManager(users) {
  return `
    <h3 style="margin-top:0;">Kullanicilar (${users.length})</h3>
    <div class="kv-table-wrap">
      <table class="kv-table">
        <thead><tr><th>Kullanici</th><th>E-posta</th><th>Rol</th><th>Seri</th><th>Katilim</th><th></th></tr></thead>
        <tbody>
          ${users.map((u) => `
            <tr>
              <td>${u.username}</td>
              <td>${u.email}</td>
              <td><span class="kv-role-pill ${u.role}">${u.role === 'admin' ? 'Admin' : 'Uye'}</span></td>
              <td>${u.streak.count} gun</td>
              <td>${new Date(u.joinedAt).toLocaleDateString('tr-TR')}</td>
              <td class="kv-flex kv-gap-8">
                ${u.id === KV_USER.id
                  ? '<span style="color:var(--text-2);font-size:0.78rem;">Sen</span>'
                  : `<button class="kv-btn kv-btn-ghost kv-btn-sm" data-toggle-role="${u.id}" data-role="${u.role}">${u.role === 'admin' ? 'Adminligi Kaldir' : 'Admin Yap'}</button>
                     <button class="kv-btn kv-btn-danger kv-btn-sm" data-delete-user="${u.id}">${kvIcon('trash', 13)}</button>`
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindUsersManagerEvents() {
  document.querySelectorAll('[data-toggle-role]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const newRole = btn.dataset.role === 'admin' ? 'user' : 'admin';
      try {
        await kvApi.adminSetRole(btn.dataset.toggleRole, newRole);
        kvToast('Kullanici rolu guncellendi.', 'success');
        kvRenderAdminSection('users');
      } catch (e) { kvToast(e.message, 'error'); }
    })
  );
  document.querySelectorAll('[data-delete-user]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Bu kullaniciyi silmek istedigine emin misin?')) return;
      try {
        await kvApi.adminDeleteUser(btn.dataset.deleteUser);
        kvToast('Kullanici silindi.', 'success');
        kvRenderAdminSection('users');
      } catch (e) { kvToast(e.message, 'error'); }
    })
  );
}

document.addEventListener('kv-layout-ready', kvInitAdmin);

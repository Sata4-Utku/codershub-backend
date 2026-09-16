// Anidox — anime/manga kart bileşenleri (orijinal SVG-tabanli kapak gorselleri)

function kvGradientStyle(gradient) {
  const [a, b] = gradient && gradient.length === 2 ? gradient : ['#7c3aed', '#ec4899'];
  return `background: linear-gradient(150deg, ${a}, ${b});`;
}

function kvAnimeCardHTML(anime, favIds = []) {
  const isFav = favIds.includes(anime.id);
  return `
    <article class="kv-card kv-reveal" data-href="/izle.html?slug=${anime.slug}">
      <div class="kv-card-cover" style="${kvGradientStyle(anime.gradient)}">
        <canvas class="kv-card-canvas" data-seed="${anime.id}" data-icon="${anime.icon}" data-accent="${anime.gradient[0]}"></canvas>
        <span class="kv-card-rating">${kvIcon('star', 13)} ${anime.rating}</span>
        <button class="kv-card-fav ${isFav ? 'active' : ''}" data-fav-type="anime" data-fav-id="${anime.id}" title="Favorilere ekle">${kvIcon('heart', 16)}</button>
      </div>
      <div class="kv-card-body">
        <p class="kv-card-title">${anime.title}</p>
        <span class="kv-chip">${anime.genres[0] || ''}</span>
      </div>
    </article>
  `;
}

function kvMangaCardHTML(manga, favIds = []) {
  const isFav = favIds.includes(manga.id);
  return `
    <article class="kv-card kv-reveal" data-href="/oku.html?slug=${manga.slug}">
      <div class="kv-card-cover" style="${kvGradientStyle(manga.gradient)}">
        <canvas class="kv-card-canvas" data-seed="${manga.id}" data-icon="${manga.icon}" data-accent="${manga.gradient[0]}"></canvas>
        <span class="kv-card-rating">${kvIcon('star', 13)} ${manga.rating}</span>
        <button class="kv-card-fav ${isFav ? 'active' : ''}" data-fav-type="manga" data-fav-id="${manga.id}" title="Favorilere ekle">${kvIcon('heart', 16)}</button>
      </div>
      <div class="kv-card-body">
        <p class="kv-card-title">${manga.title}</p>
        <span class="kv-chip">${manga.genres[0] || ''}</span>
      </div>
    </article>
  `;
}

function kvSkeletonCards(n = 8) {
  return Array.from({ length: n }, () => `
    <div class="kv-card kv-skel" style="opacity:1;transform:none;">
      <div class="kv-skel-card"></div>
      <div class="kv-card-body">
        <div class="kv-skel" style="height:14px;border-radius:6px;margin-bottom:8px;"></div>
        <div class="kv-skel" style="height:10px;width:60%;border-radius:6px;"></div>
      </div>
    </div>
  `).join('');
}

function kvBindCardEvents(container) {
  container.addEventListener('click', async (e) => {
    const favBtn = e.target.closest('.kv-card-fav');
    if (favBtn) {
      e.stopPropagation();
      if (!KV_USER) {
        kvToast('Favorilere eklemek icin giris yapmalisin.', 'error');
        window.location.href = '/giris.html';
        return;
      }
      const type = favBtn.dataset.favType;
      const id = favBtn.dataset.favId;
      try {
        const res = await kvApi.toggleFavorite(type, id);
        favBtn.classList.toggle('active', res.added);
        kvToast(res.added ? 'Favorilere eklendi.' : 'Favorilerden cikarildi.', 'success');
      } catch (err) {
        kvToast(err.message, 'error');
      }
      return;
    }
    const card = e.target.closest('.kv-card[data-href]');
    if (card) {
      window.location.href = card.dataset.href;
    }
  });
}

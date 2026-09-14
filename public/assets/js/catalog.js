// Kuroverse — katalog (anime.html / manga.html) ortak mantigi
// window.KV_CATALOG_TYPE 'anime' veya 'manga' olarak sayfa icinde tanimlanir

async function kvInitCatalog() {
  const type = window.KV_CATALOG_TYPE;
  const isAnime = type === 'anime';
  const grid = document.getElementById('kv-catalog-grid');
  const chipsWrap = document.getElementById('kv-genre-chips');
  const searchInput = document.getElementById('kv-catalog-search');
  const emptyState = document.getElementById('kv-catalog-empty');
  const countLabel = document.getElementById('kv-catalog-count');

  grid.innerHTML = kvSkeletonCards(8);

  let items = [];
  try {
    const res = isAnime ? await kvApi.listAnime() : await kvApi.listManga();
    items = isAnime ? res.anime : res.manga;
  } catch (e) {
    kvToast('Icerikler yuklenemedi.', 'error');
  }

  let favIds = [];
  if (KV_USER) {
    try {
      const p = await kvApi.profile();
      favIds = isAnime ? p.user.favorites.anime : p.user.favorites.manga;
    } catch (e) {}
  }

  const genres = [...new Set(items.flatMap((i) => i.genres))].sort();
  let activeGenre = null;

  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search') || '';
  if (searchInput) searchInput.value = initialSearch;

  chipsWrap.innerHTML =
    `<button class="kv-chip-filter active" data-genre="">Tumu</button>` +
    genres.map((g) => `<button class="kv-chip-filter" data-genre="${g}">${g}</button>`).join('');

  function render() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    let filtered = items;
    if (activeGenre) filtered = filtered.filter((i) => i.genres.includes(activeGenre));
    if (q) filtered = filtered.filter((i) => i.title.toLowerCase().includes(q));

    countLabel.textContent = `${filtered.length} sonuc`;
    emptyState.classList.toggle('kv-hidden', filtered.length > 0);
    grid.classList.toggle('kv-hidden', filtered.length === 0);

    grid.innerHTML = filtered
      .map((i) => (isAnime ? kvAnimeCardHTML(i, favIds) : kvMangaCardHTML(i, favIds)))
      .join('');
    kvBindCardEvents(grid);
    kvCardInAnim(grid);
  }

  chipsWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.kv-chip-filter');
    if (!chip) return;
    chipsWrap.querySelectorAll('.kv-chip-filter').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeGenre = chip.dataset.genre || null;
    render();
  });

  searchInput?.addEventListener('input', () => render());

  render();
}

document.addEventListener('kv-layout-ready', kvInitCatalog);

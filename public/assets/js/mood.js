// Kuroverse — ozgun ozellik: ruh haline gore anime/manga onerisi
const KV_MOODS = [
  { key: 'epik', emoji: '⚔️', label: 'Epik', genres: ['Aksiyon', 'Fantastik', 'Mecha'] },
  { key: 'romantik', emoji: '🌸', label: 'Romantik', genres: ['Romantik', 'Slice of Life', 'Drama'] },
  { key: 'gizemli', emoji: '🌙', label: 'Gizemli', genres: ['Gizem', 'Doganustu'] },
  { key: 'nostalji', emoji: '📖', label: 'Nostaljik', genres: ['Tarihi', 'Dram'] },
  { key: 'gelecekci', emoji: '⚡', label: 'Futuristik', genres: ['Bilim Kurgu', 'Siber Punk'] },
  { key: 'eglenceli', emoji: '🎭', label: 'Eglenceli', genres: ['Komedi', 'Macera'] }
];

function kvRenderMoodPicker(anime, manga) {
  const grid = document.getElementById('kv-mood-grid');
  if (!grid) return;
  grid.innerHTML = KV_MOODS.map(
    (m) => `<button class="kv-mood-btn" data-mood="${m.key}"><span class="kv-mood-emoji">${m.emoji}</span><span>${m.label}</span></button>`
  ).join('');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.kv-mood-btn');
    if (!btn) return;
    grid.querySelectorAll('.kv-mood-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const mood = KV_MOODS.find((m) => m.key === btn.dataset.mood);
    const pool = [...anime.map((a) => ({ ...a, kind: 'anime' })), ...manga.map((m2) => ({ ...m2, kind: 'manga' }))].filter((x) =>
      x.genres.some((g) => mood.genres.includes(g))
    );
    const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    const result = document.getElementById('kv-mood-result');
    if (!pick) {
      result.innerHTML = `<p style="color:var(--text-2)">Bu ruh haline uygun bir sey bulamadik, baska bir ruh hali dene.</p>`;
      return;
    }
    const href = pick.kind === 'anime' ? `/izle.html?slug=${pick.slug}` : `/oku.html?slug=${pick.slug}`;
    result.innerHTML = `
      <div class="kv-flex kv-gap-14" style="align-items:center;">
        <div style="width:64px;height:64px;border-radius:14px;display:grid;place-items:center;${kvGradientStyle(pick.gradient)}">
          ${kvIcon(pick.icon, 30)}
        </div>
        <div style="flex:1;">
          <p style="margin:0;font-weight:800;">${pick.title}</p>
          <p style="margin:2px 0 0;color:var(--text-2);font-size:0.85rem;">${pick.kind === 'anime' ? 'Anime' : 'Manga'} · ${pick.genres.join(', ')}</p>
        </div>
        <a href="${href}" class="kv-btn kv-btn-primary kv-btn-sm">Hemen Basla</a>
      </div>
    `;
  });
}

async function kvInitKesfet() {
  let anime = [], manga = [];
  try {
    const [a, m] = await Promise.all([kvApi.listAnime(), kvApi.listManga()]);
    anime = a.anime; manga = m.manga;
  } catch (e) {}

  kvRenderMoodPicker(anime, manga);

  document.getElementById('kv-badge-showcase').innerHTML = KV_ALL_BADGES.map((b) => `
    <div class="kv-badge" title="${b.min} icerik tamamla">${kvIcon(b.icon, 16)}<span>${b.label} (${b.min}+)</span></div>
  `).join('');

  try {
    const res = await kvApi.leaderboard();
    const body = document.getElementById('kv-leaderboard-body');
    if (!res.leaderboard.length) {
      body.innerHTML = `<tr><td colspan="4" style="color:var(--text-2);">Henuz aktivite yok. Ilk sen ol!</td></tr>`;
    } else {
      body.innerHTML = res.leaderboard.map((u, i) => `
        <tr>
          <td>${i + 1}</td>
          <td class="kv-flex kv-gap-8">${kvIcon(u.avatar, 16)} ${u.username} ${u.role === 'admin' ? '<span class="kv-role-pill admin">Admin</span>' : ''}</td>
          <td>${u.streak} gun</td>
          <td>${u.totalActivity}</td>
        </tr>
      `).join('');
    }
  } catch (e) {}
}

document.addEventListener('kv-layout-ready', kvInitKesfet);

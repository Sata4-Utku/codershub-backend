// Anidox — ortak navbar / footer / auth durumu

let KV_USER = null;

async function kvLoadUser() {
  try {
    const data = await kvApi.me();
    KV_USER = data.user;
  } catch (e) {
    KV_USER = null;
  }
  return KV_USER;
}

function kvNavLink(href, icon, label) {
  const path = location.pathname === '/' ? '/index.html' : location.pathname;
  const active = path === href ? ' active' : '';
  return `<a href="${href}" class="${active.trim()}">${kvIcon(icon, 17)}<span>${label}</span></a>`;
}

function kvRenderNavbar() {
  const mount = document.getElementById('kv-navbar');
  if (!mount) return;

  const links = [
    kvNavLink('/index.html', 'star', 'Anasayfa'),
    kvNavLink('/anime.html', 'tv', 'Anime'),
    kvNavLink('/manga.html', 'book', 'Manga'),
    kvNavLink('/kesfet.html', 'bolt', 'Kesfet'),
    KV_USER ? kvNavLink('/profil.html', 'user', 'Profilim') : '',
    KV_USER && KV_USER.role === 'admin' ? kvNavLink('/admin.html', 'shield', 'Admin Paneli') : ''
  ].join('');

  const authArea = KV_USER
    ? `<button class="kv-btn kv-btn-ghost kv-btn-sm" id="kv-logout-btn">${kvIcon('logout', 16)}<span>Cikis</span></button>`
    : `
      <a href="/giris.html" class="kv-btn kv-btn-ghost kv-btn-sm">Giris Yap</a>
      <a href="/kayit.html" class="kv-btn kv-btn-primary kv-btn-sm">Uye Ol</a>
    `;

  mount.innerHTML = `
    <nav class="kv-nav">
      <div class="kv-nav-inner">
        <a href="/index.html" class="kv-logo">
          <span class="kv-logo-mark">${kvLogoMark(20)}</span>
          Anidox
        </a>
        <div class="kv-nav-links" id="kv-nav-links">${links}</div>
        <div class="kv-nav-actions">
          <button class="kv-icon-btn" id="kv-search-btn" title="Ara">${kvIcon('search', 18)}</button>
          ${authArea}
          <button class="kv-icon-btn kv-menu-toggle" id="kv-menu-toggle" title="Menu">${kvIcon('menu', 18)}</button>
        </div>
      </div>
      <div id="kv-search-panel" class="kv-hidden" style="border-top:1px solid var(--border); padding: 14px 20px;">
        <div class="kv-search-wrap" style="max-width:1240px;margin:0 auto;">
          ${kvIcon('search', 18)}
          <input type="text" class="kv-input" id="kv-global-search" placeholder="Anime veya manga ara..." />
        </div>
      </div>
    </nav>
  `;

  document.getElementById('kv-menu-toggle')?.addEventListener('click', () => {
    document.getElementById('kv-nav-links').classList.toggle('open');
  });

  document.getElementById('kv-search-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('kv-search-panel');
    panel.classList.toggle('kv-hidden');
    if (!panel.classList.contains('kv-hidden')) {
      document.getElementById('kv-global-search').focus();
    }
  });

  document.getElementById('kv-global-search')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      window.location.href = '/anime.html?search=' + encodeURIComponent(e.target.value.trim());
    }
  });

  document.getElementById('kv-logout-btn')?.addEventListener('click', async () => {
    await kvApi.logout();
    window.location.href = '/index.html';
  });
}

function kvRenderFooter() {
  const mount = document.getElementById('kv-footer');
  if (!mount) return;
  const year = new Date().getFullYear();
  mount.innerHTML = `
    <footer class="kv-footer">
      <div class="kv-container">
        <div class="kv-footer-grid">
          <div>
            <div class="kv-logo" style="margin-bottom:14px;">
              <span class="kv-logo-mark">${kvLogoMark(20)}</span>Anidox
            </div>
            <p>Koyu temali, tamamen ozgun kurgusal anime ve manga evreni. Izle, oku, seviye atla.</p>
            <div class="kv-social-row" style="margin-top:14px;">
              <span class="kv-icon-btn">${kvIcon('star', 16)}</span>
              <span class="kv-icon-btn">${kvIcon('flame', 16)}</span>
              <span class="kv-icon-btn">${kvIcon('moon', 16)}</span>
            </div>
          </div>
          <div>
            <h4>Kesfet</h4>
            <div class="kv-footer-links">
              <a href="/anime.html">Tum Animeler</a>
              <a href="/manga.html">Tum Mangalar</a>
              <a href="/kesfet.html">Ozgun Ozellikler</a>
            </div>
          </div>
          <div>
            <h4>Hesap</h4>
            <div class="kv-footer-links">
              <a href="/giris.html">Giris Yap</a>
              <a href="/kayit.html">Uye Ol</a>
              <a href="/profil.html">Profilim</a>
            </div>
          </div>
          <div>
            <h4>Kurumsal</h4>
            <div class="kv-footer-links">
              <a href="/telif-hakki.html">Telif Hakki</a>
              <a href="/hakkinda.html">Hakkinda</a>
            </div>
          </div>
        </div>
        <div class="kv-copyright-note">
          <strong>Icerik bildirimi:</strong> Anidox uzerindeki tum anime, manga, karakter ve gorsel ogeler
          bu proje icin ozel olarak uretilmis kurgusal ve ozgun iceriklerdir. Gercek studyo, yayinevi veya
          yazarlarla hicbir bagi yoktur; hicbir ucuncu taraf telifli materyal kullanilmamistir.
        </div>
        <div class="kv-footer-bottom">
          <span>&copy; ${year} <strong>Anidox</strong>. Tum haklari saklidir.</span>
          <span>Ozgun tasarim ve gelistirme: Anidox Ekibi</span>
        </div>
      </div>
    </footer>
  `;
}

async function kvInitLayout() {
  await kvLoadUser();
  kvRenderNavbar();
  kvRenderFooter();
  kvInitScrollReveal();
  document.dispatchEvent(new CustomEvent('kv-layout-ready'));
}

document.addEventListener('DOMContentLoaded', kvInitLayout);

// Kuroverse - orijinal, elle cizilmis cizgisel ikon seti (harici gorsel/telifli varlik kullanilmaz)
const KV_ICONS = {
  sword: '<path d="M4 20L15 9M15 9l2.5-2.5a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L18 12M15 9l3 3M6 18l2 2M4.5 19.5l1-1"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  flower: '<circle cx="12" cy="12" r="2.4"/><path d="M12 3.5c1.8 0 3 1.6 3 3.4 0-1.8 1.6-3 3.4-3s3 1.6 3 3.4-1.6 3-3.4 3c1.8 0 3 1.6 3 3.4s-1.6 3-3.4 3c0-1.8-1.6-3-3.4-3 1.8 0 3 1.6 3 3.4s-1.6 3-3.4 3-3-1.6-3-3.4c0 1.8-1.6 3-3.4 3s-3-1.6-3-3.4 1.6-3 3.4-3c-1.8 0-3-1.6-3-3.4s1.6-3 3.4-3c0 1.8 1.6 3 3.4 3-1.8 0-3-1.6-3-3.4s1.6-3 3.4-3z" opacity="0"/>',
  flame: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 2 2 2c-1-2 0-4 2-4.5C11.5 8 11 10 12 11c0-3 0-6 0-9z"/>',
  star: '<path d="M12 2l2.6 6.6 7 .5-5.4 4.5 1.8 6.9L12 16.9 5.9 20.5l1.9-6.9L2.4 9.1l7-.5z"/>',
  mask: '<path d="M4 8c2-2 5-3 8-3s6 1 8 3c0 6-3 11-8 12-5-1-8-6-8-12z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path d="M9 15c1.5 1 4.5 1 6 0"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  heart: '<path d="M12 20s-7-4.4-9.3-9C1.1 7.6 3 4.5 6.3 4.5c2 0 3.4 1.2 4.2 2.4C11.3 5.7 12.7 4.5 14.7 4.5 18 4.5 20 7.6 18.3 11 16 15.6 12 20 12 20z"/>',
  fire: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 2 2 2c-1-2 0-4 2-4.5C11.5 8 11 10 12 11c0-3 0-6 0-9z"/>',
  trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4"/><path d="M10 14h4v3h-4zM8 20h8M10.5 17h3v3h-3z"/>',
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
  chevronRight: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  logout: '<path d="M15 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M11 16l4-4-4-4M15 12H4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>'
};

function kvIcon(name, size = 22) {
  const body = KV_ICONS[name] || KV_ICONS.star;
  return `<svg class="kv-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

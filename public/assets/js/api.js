const KV_API = '/api';

async function kvFetch(path, options = {}) {
  const res = await fetch(KV_API + path, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options
  });
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Bir hata olustu.');
    err.status = res.status;
    throw err;
  }
  return data;
}

const kvApi = {
  me: () => kvFetch('/auth/me'),
  login: (identifier, password) =>
    kvFetch('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  register: (username, email, password) =>
    kvFetch('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
  logout: () => kvFetch('/auth/logout', { method: 'POST' }),

  listAnime: (params = {}) => kvFetch('/anime?' + new URLSearchParams(params)),
  getAnime: (slug) => kvFetch('/anime/' + slug),
  listManga: (params = {}) => kvFetch('/manga?' + new URLSearchParams(params)),
  getManga: (slug) => kvFetch('/manga/' + slug),

  profile: () => kvFetch('/user/profile'),
  toggleFavorite: (type, id) => kvFetch(`/user/favorites/${type}/${id}`, { method: 'POST' }),
  markWatched: (animeId, episodeId) => kvFetch(`/user/watch/${animeId}/${episodeId}`, { method: 'POST' }),
  markRead: (mangaId, chapterId) => kvFetch(`/user/read/${mangaId}/${chapterId}`, { method: 'POST' }),

  adminStats: () => kvFetch('/admin/stats'),
  adminUsers: () => kvFetch('/admin/users'),
  adminSetRole: (id, role) => kvFetch(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  adminDeleteUser: (id) => kvFetch(`/admin/users/${id}`, { method: 'DELETE' }),

  adminCreateAnime: (payload) => kvFetch('/admin/anime', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateAnime: (id, payload) => kvFetch(`/admin/anime/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteAnime: (id) => kvFetch(`/admin/anime/${id}`, { method: 'DELETE' }),
  adminAddEpisode: (id, payload) => kvFetch(`/admin/anime/${id}/episodes`, { method: 'POST', body: JSON.stringify(payload) }),
  adminDeleteEpisode: (id, epId) => kvFetch(`/admin/anime/${id}/episodes/${epId}`, { method: 'DELETE' }),

  adminCreateManga: (payload) => kvFetch('/admin/manga', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateManga: (id, payload) => kvFetch(`/admin/manga/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteManga: (id) => kvFetch(`/admin/manga/${id}`, { method: 'DELETE' }),
  adminAddChapter: (id, payload) => kvFetch(`/admin/manga/${id}/chapters`, { method: 'POST', body: JSON.stringify(payload) }),
  adminDeleteChapter: (id, chId) => kvFetch(`/admin/manga/${id}/chapters/${chId}`, { method: 'DELETE' }),

  leaderboard: () => kvFetch('/leaderboard')
};

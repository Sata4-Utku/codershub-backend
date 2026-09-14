const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { sanitizeUser } = require('../utils/sanitize');

const router = express.Router();

router.use(requireAuth, requireAdmin);

function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// --- Istatistikler ---
router.get('/stats', (req, res) => {
  const db = readDB();
  const totalWatch = db.users.reduce((sum, u) => sum + u.watchHistory.length, 0);
  const totalRead = db.users.reduce((sum, u) => sum + u.readHistory.length, 0);
  res.json({
    totalUsers: db.users.length,
    totalAdmins: db.users.filter((u) => u.role === 'admin').length,
    totalAnime: db.anime.length,
    totalManga: db.manga.length,
    totalEpisodes: db.anime.reduce((s, a) => s + a.episodes.length, 0),
    totalChapters: db.manga.reduce((s, m) => s + m.chapters.length, 0),
    totalWatch,
    totalRead
  });
});

// --- Kullanicilar ---
router.get('/users', (req, res) => {
  const db = readDB();
  res.json({ users: db.users.map(sanitizeUser) });
});

router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body || {};
  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Gecersiz rol.' });
  }
  const db = readDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Kullanici bulunamadi.' });
  if (user.id === req.user.id && role === 'user') {
    return res.status(400).json({ error: 'Kendi admin yetkinizi kaldiramazsiniz.' });
  }
  user.role = role;
  writeDB(db);
  res.json({ user: sanitizeUser(user) });
});

router.delete('/users/:id', (req, res) => {
  const db = readDB();
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Kendi hesabinizi silemezsiniz.' });
  }
  const before = db.users.length;
  db.users = db.users.filter((u) => u.id !== req.params.id);
  if (db.users.length === before) return res.status(404).json({ error: 'Kullanici bulunamadi.' });
  writeDB(db);
  res.json({ ok: true });
});

// --- Anime CRUD ---
router.post('/anime', (req, res) => {
  const body = req.body || {};
  if (!body.title) return res.status(400).json({ error: 'Baslik zorunludur.' });
  const db = readDB();
  const anime = {
    id: 'an-' + crypto.randomBytes(6).toString('hex'),
    title: body.title,
    slug: slugify(body.title) + '-' + Date.now().toString(36),
    genres: Array.isArray(body.genres) ? body.genres : String(body.genres || '').split(',').map((s) => s.trim()).filter(Boolean),
    year: Number(body.year) || new Date().getFullYear(),
    status: body.status || 'Devam Ediyor',
    rating: Number(body.rating) || 0,
    studio: body.studio || 'Bilinmiyor',
    icon: body.icon || 'star',
    gradient: Array.isArray(body.gradient) && body.gradient.length === 2 ? body.gradient : ['#7c3aed', '#ec4899'],
    synopsis: body.synopsis || '',
    episodes: []
  };
  db.anime.unshift(anime);
  writeDB(db);
  res.status(201).json({ anime });
});

router.put('/anime/:id', (req, res) => {
  const db = readDB();
  const anime = db.anime.find((a) => a.id === req.params.id);
  if (!anime) return res.status(404).json({ error: 'Anime bulunamadi.' });
  const body = req.body || {};
  Object.assign(anime, {
    title: body.title ?? anime.title,
    genres: body.genres ?? anime.genres,
    year: body.year ? Number(body.year) : anime.year,
    status: body.status ?? anime.status,
    rating: body.rating !== undefined ? Number(body.rating) : anime.rating,
    studio: body.studio ?? anime.studio,
    icon: body.icon ?? anime.icon,
    gradient: body.gradient ?? anime.gradient,
    synopsis: body.synopsis ?? anime.synopsis
  });
  writeDB(db);
  res.json({ anime });
});

router.delete('/anime/:id', (req, res) => {
  const db = readDB();
  const before = db.anime.length;
  db.anime = db.anime.filter((a) => a.id !== req.params.id);
  if (db.anime.length === before) return res.status(404).json({ error: 'Anime bulunamadi.' });
  writeDB(db);
  res.json({ ok: true });
});

router.post('/anime/:id/episodes', (req, res) => {
  const db = readDB();
  const anime = db.anime.find((a) => a.id === req.params.id);
  if (!anime) return res.status(404).json({ error: 'Anime bulunamadi.' });
  const { title, duration } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Bolum basligi zorunludur.' });
  const episode = {
    id: anime.id + '-ep-' + (anime.episodes.length + 1) + '-' + crypto.randomBytes(3).toString('hex'),
    number: anime.episodes.length + 1,
    title,
    duration: duration || '24 dk'
  };
  anime.episodes.push(episode);
  writeDB(db);
  res.status(201).json({ anime });
});

router.delete('/anime/:id/episodes/:episodeId', (req, res) => {
  const db = readDB();
  const anime = db.anime.find((a) => a.id === req.params.id);
  if (!anime) return res.status(404).json({ error: 'Anime bulunamadi.' });
  anime.episodes = anime.episodes.filter((e) => e.id !== req.params.episodeId);
  writeDB(db);
  res.json({ anime });
});

// --- Manga CRUD ---
router.post('/manga', (req, res) => {
  const body = req.body || {};
  if (!body.title) return res.status(400).json({ error: 'Baslik zorunludur.' });
  const db = readDB();
  const manga = {
    id: 'mg-' + crypto.randomBytes(6).toString('hex'),
    title: body.title,
    slug: slugify(body.title) + '-' + Date.now().toString(36),
    genres: Array.isArray(body.genres) ? body.genres : String(body.genres || '').split(',').map((s) => s.trim()).filter(Boolean),
    year: Number(body.year) || new Date().getFullYear(),
    status: body.status || 'Devam Ediyor',
    rating: Number(body.rating) || 0,
    author: body.author || 'Bilinmiyor',
    icon: body.icon || 'star',
    gradient: Array.isArray(body.gradient) && body.gradient.length === 2 ? body.gradient : ['#38bdf8', '#a855f7'],
    synopsis: body.synopsis || '',
    chapters: []
  };
  db.manga.unshift(manga);
  writeDB(db);
  res.status(201).json({ manga });
});

router.put('/manga/:id', (req, res) => {
  const db = readDB();
  const manga = db.manga.find((m) => m.id === req.params.id);
  if (!manga) return res.status(404).json({ error: 'Manga bulunamadi.' });
  const body = req.body || {};
  Object.assign(manga, {
    title: body.title ?? manga.title,
    genres: body.genres ?? manga.genres,
    year: body.year ? Number(body.year) : manga.year,
    status: body.status ?? manga.status,
    rating: body.rating !== undefined ? Number(body.rating) : manga.rating,
    author: body.author ?? manga.author,
    icon: body.icon ?? manga.icon,
    gradient: body.gradient ?? manga.gradient,
    synopsis: body.synopsis ?? manga.synopsis
  });
  writeDB(db);
  res.json({ manga });
});

router.delete('/manga/:id', (req, res) => {
  const db = readDB();
  const before = db.manga.length;
  db.manga = db.manga.filter((m) => m.id !== req.params.id);
  if (db.manga.length === before) return res.status(404).json({ error: 'Manga bulunamadi.' });
  writeDB(db);
  res.json({ ok: true });
});

router.post('/manga/:id/chapters', (req, res) => {
  const db = readDB();
  const manga = db.manga.find((m) => m.id === req.params.id);
  if (!manga) return res.status(404).json({ error: 'Manga bulunamadi.' });
  const { title, pages } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Bolum basligi zorunludur.' });
  const chapter = {
    id: manga.id + '-ch-' + (manga.chapters.length + 1) + '-' + crypto.randomBytes(3).toString('hex'),
    number: manga.chapters.length + 1,
    title,
    pages: Number(pages) || 18
  };
  manga.chapters.push(chapter);
  writeDB(db);
  res.status(201).json({ manga });
});

router.delete('/manga/:id/chapters/:chapterId', (req, res) => {
  const db = readDB();
  const manga = db.manga.find((m) => m.id === req.params.id);
  if (!manga) return res.status(404).json({ error: 'Manga bulunamadi.' });
  manga.chapters = manga.chapters.filter((c) => c.id !== req.params.chapterId);
  writeDB(db);
  res.json({ manga });
});

module.exports = router;

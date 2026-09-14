const express = require('express');
const { readDB, writeDB } = require('../db');
const { requireAuth } = require('../middleware/auth.middleware');
const { sanitizeUser } = require('../utils/sanitize');
const { computeBadges } = require('../utils/badges');

const router = express.Router();

router.use(requireAuth);

function findUser(db, id) {
  return db.users.find((u) => u.id === id);
}

router.get('/profile', (req, res) => {
  const db = readDB();
  const user = findUser(db, req.user.id);
  const badges = computeBadges(user);
  res.json({ user: sanitizeUser(user), badges });
});

router.post('/favorites/:type/:id', (req, res) => {
  const { type, id } = req.params;
  if (type !== 'anime' && type !== 'manga') {
    return res.status(400).json({ error: 'Gecersiz tur.' });
  }
  const db = readDB();
  const user = findUser(db, req.user.id);
  const list = user.favorites[type];
  const idx = list.indexOf(id);
  let added;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.push(id);
    added = true;
  }
  writeDB(db);
  res.json({ favorites: user.favorites, added });
});

router.post('/watch/:animeId/:episodeId', (req, res) => {
  const { animeId, episodeId } = req.params;
  const db = readDB();
  const user = findUser(db, req.user.id);
  const already = user.watchHistory.some(
    (h) => h.animeId === animeId && h.episodeId === episodeId
  );
  if (!already) {
    user.watchHistory.push({ animeId, episodeId, watchedAt: new Date().toISOString() });
    writeDB(db);
  }
  res.json({ watchHistory: user.watchHistory, badges: computeBadges(user) });
});

router.post('/read/:mangaId/:chapterId', (req, res) => {
  const { mangaId, chapterId } = req.params;
  const db = readDB();
  const user = findUser(db, req.user.id);
  const already = user.readHistory.some(
    (h) => h.mangaId === mangaId && h.chapterId === chapterId
  );
  if (!already) {
    user.readHistory.push({ mangaId, chapterId, readAt: new Date().toISOString() });
    writeDB(db);
  }
  res.json({ readHistory: user.readHistory, badges: computeBadges(user) });
});

module.exports = router;

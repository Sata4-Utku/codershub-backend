const express = require('express');
const { readDB } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = readDB();
  const { genre, search } = req.query;
  let results = db.anime;

  if (genre) {
    results = results.filter((a) =>
      a.genres.some((g) => g.toLowerCase() === String(genre).toLowerCase())
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter((a) => a.title.toLowerCase().includes(q));
  }

  res.json({ anime: results });
});

router.get('/:slug', (req, res) => {
  const db = readDB();
  const anime = db.anime.find((a) => a.slug === req.params.slug || a.id === req.params.slug);
  if (!anime) return res.status(404).json({ error: 'Anime bulunamadi.' });
  res.json({ anime });
});

module.exports = router;

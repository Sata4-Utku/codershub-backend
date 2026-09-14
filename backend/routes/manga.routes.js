const express = require('express');
const { readDB } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = readDB();
  const { genre, search } = req.query;
  let results = db.manga;

  if (genre) {
    results = results.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === String(genre).toLowerCase())
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter((m) => m.title.toLowerCase().includes(q));
  }

  res.json({ manga: results });
});

router.get('/:slug', (req, res) => {
  const db = readDB();
  const manga = db.manga.find((m) => m.slug === req.params.slug || m.id === req.params.slug);
  if (!manga) return res.status(404).json({ error: 'Manga bulunamadi.' });
  res.json({ manga });
});

module.exports = router;

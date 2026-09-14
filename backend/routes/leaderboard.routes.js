const express = require('express');
const { readDB } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = readDB();
  const leaderboard = db.users
    .map((u) => ({
      username: u.username,
      avatar: u.avatar,
      role: u.role,
      streak: u.streak.count,
      totalActivity: u.watchHistory.length + u.readHistory.length
    }))
    .sort((a, b) => b.totalActivity - a.totalActivity || b.streak - a.streak)
    .slice(0, 10);
  res.json({ leaderboard });
});

module.exports = router;

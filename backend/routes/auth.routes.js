const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db');
const { signToken } = require('../utils/token');
const { sanitizeUser } = require('../utils/sanitize');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const COOKIE_NAME = 'kuroverse_token';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const AVATAR_ICONS = ['sword', 'moon', 'flower', 'flame', 'star', 'mask'];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Kullanici adi, e-posta ve sifre zorunludur.' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Kullanici adi en az 3 karakter olmalidir.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Gecerli bir e-posta adresi girin.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Sifre en az 6 karakter olmalidir.' });
  }

  const db = readDB();
  const usernameTaken = db.users.some(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  const emailTaken = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (usernameTaken) {
    return res.status(409).json({ error: 'Bu kullanici adi zaten alinmis.' });
  }
  if (emailTaken) {
    return res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: 'u-' + crypto.randomBytes(8).toString('hex'),
    username: username.trim(),
    email: email.trim(),
    passwordHash,
    role: 'user',
    avatar: AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)],
    joinedAt: new Date().toISOString(),
    favorites: { anime: [], manga: [] },
    watchHistory: [],
    readHistory: [],
    streak: { count: 0, lastActiveDate: null },
    badges: []
  };

  db.users.push(newUser);
  writeDB(db);

  const token = signToken({ id: newUser.id, role: newUser.role });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.status(201).json({ user: sanitizeUser(newUser) });
});

router.post('/login', (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Kullanici adi/e-posta ve sifre zorunludur.' });
  }

  const db = readDB();
  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === identifier.trim().toLowerCase() ||
      u.email.toLowerCase() === identifier.trim().toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Kullanici adi/e-posta veya sifre hatali.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (user.streak.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    user.streak.count = user.streak.lastActiveDate === yesterday ? user.streak.count + 1 : 1;
    user.streak.lastActiveDate = today;
    writeDB(db);
  }

  const token = signToken({ id: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.json({ user: sanitizeUser(user) });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = router;

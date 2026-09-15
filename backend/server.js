require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { readDB, writeDB } = require('./db');
const authRoutes = require('./routes/auth.routes');
const animeRoutes = require('./routes/anime.routes');
const mangaRoutes = require('./routes/manga.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();
const PORT = process.env.PORT || 3000;

function ensureAdminSeed() {
  const db = readDB();
  const hasAdmin = db.users.some((u) => u.role === 'admin');
  if (hasAdmin) return;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@anidox.dev';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const admin = {
    id: 'u-' + crypto.randomBytes(8).toString('hex'),
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'admin',
    avatar: 'mask',
    joinedAt: new Date().toISOString(),
    favorites: { anime: [], manga: [] },
    watchHistory: [],
    readHistory: [],
    streak: { count: 0, lastActiveDate: null },
    badges: []
  };
  db.users.push(admin);
  writeDB(db);
  console.log(`[Anidox] Admin hesabi olusturuldu -> kullanici adi: "${username}", sifre: "${password}"`);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Anidox API' }));

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Bulunamadi.' });
});

ensureAdminSeed();

app.listen(PORT, () => {
  console.log(`[Anidox] Sunucu http://localhost:${PORT} adresinde calisiyor.`);
});

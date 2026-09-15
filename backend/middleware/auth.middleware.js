const { verifyToken } = require('../utils/token');
const { readDB } = require('../db');

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.anidox_token;
  if (!token) {
    return res.status(401).json({ error: 'Oturum bulunamadi. Lutfen giris yapin.' });
  }
  try {
    const payload = verifyToken(token);
    const db = readDB();
    const user = db.users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Kullanici bulunamadi.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Oturum gecersiz veya suresi dolmus.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bu islem icin admin yetkisi gerekiyor.' });
  }
  next();
}

function attachUserIfPresent(req, res, next) {
  const token = req.cookies && req.cookies.anidox_token;
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const db = readDB();
    const user = db.users.find((u) => u.id === payload.id);
    if (user) req.user = user;
  } catch (err) {
    // yoksay
  }
  next();
}

module.exports = { requireAuth, requireAdmin, attachUserIfPresent };

const BADGE_DEFS = [
  { id: 'first-step', label: 'Ilk Adim', min: 1, icon: 'star' },
  { id: 'bronze-otaku', label: 'Bronz Otaku', min: 5, icon: 'flame' },
  { id: 'silver-otaku', label: 'Gumus Otaku', min: 15, icon: 'moon' },
  { id: 'gold-otaku', label: 'Altin Otaku', min: 30, icon: 'mask' },
  { id: 'legend', label: 'Efsane', min: 50, icon: 'sword' }
];

function computeBadges(user) {
  const total = (user.watchHistory?.length || 0) + (user.readHistory?.length || 0);
  return BADGE_DEFS.filter((b) => total >= b.min).map((b) => ({ id: b.id, label: b.label, icon: b.icon }));
}

module.exports = { BADGE_DEFS, computeBadges };

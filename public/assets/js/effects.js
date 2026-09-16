// Anidox — animasyon ve gorsel efekt yardimcilari

function kvInitBackground() {
  const bg = document.createElement('div');
  bg.className = 'kv-bg';
  bg.innerHTML = '<canvas id="kv-stars"></canvas>';
  document.body.prepend(bg);

  ['o1', 'o2'].forEach((c) => {
    const orb = document.createElement('div');
    orb.className = 'kv-orb ' + c;
    document.body.prepend(orb);
  });

  kvStarfield(document.getElementById('kv-stars'));
}

function kvStarfield(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, embers;
  const palette = ['#ff5555', '#e81c33'];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 22000);
    embers = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      speed: Math.random() * 0.22 + 0.05,
      drift: (Math.random() - 0.5) * 0.2,
      twinkle: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of embers) {
      s.twinkle += 0.02;
      const alpha = 0.12 + Math.sin(s.twinkle) * 0.14;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      // yukselen kor efekti
      s.y -= s.speed;
      s.x += s.drift;
      if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

function kvInitCardTilt() {
  let activeCard = null;

  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest ? e.target.closest('.kv-card') : null;
    if (card !== activeCard) {
      if (activeCard) { activeCard.style.transform = ''; activeCard.style.transition = ''; }
      if (card) card.style.transition = 'box-shadow 0.35s var(--ease), border-color .3s';
      activeCard = card;
    }
    if (!card || window.innerWidth < 700) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-6px) scale(1.015)`;
  });

  document.addEventListener('pointerleave', (e) => {
    const card = e.target.closest ? e.target.closest('.kv-card') : null;
    if (card) {
      card.style.transition = 'transform 0.4s var(--ease), box-shadow 0.35s var(--ease), border-color .3s';
      card.style.transform = '';
    }
  }, true);
}

function kvInitParallax() {
  const orbs = () => document.querySelectorAll('.kv-orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs().forEach((orb, i) => {
      const speed = 0.05 + i * 0.03;
      orb.style.marginTop = (y * speed).toFixed(1) + 'px';
    });
  }, { passive: true });
}

function kvInitPageLoader() {
  const bar = document.createElement('div');
  bar.className = 'kv-loadbar';
  document.body.appendChild(bar);
  requestAnimationFrame(() => {
    bar.style.width = '70%';
  });
  window.addEventListener('load', () => {
    bar.style.width = '100%';
    setTimeout(() => bar.remove(), 400);
  });
  setTimeout(() => { bar.style.width = '100%'; setTimeout(() => bar.remove(), 400); }, 1200);
}

function kvInitScrollReveal() {
  const els = document.querySelectorAll('.kv-reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('kv-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

function kvObserveNewReveals(container) {
  const els = container.querySelectorAll('.kv-reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('kv-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

function kvInitRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.kv-btn, .kv-icon-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'kv-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 620);
  });
}

function kvInitNavScroll() {
  const nav = document.querySelector('.kv-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function kvToast(message, type = 'success') {
  let wrap = document.querySelector('.kv-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'kv-toast-wrap';
    document.body.appendChild(wrap);
  }
  const toast = document.createElement('div');
  toast.className = 'kv-toast ' + type;
  const icon = type === 'success' ? 'star' : type === 'error' ? 'close' : 'bolt';
  toast.innerHTML = kvIcon(icon, 18) + '<span>' + message + '</span>';
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

function kvCardInAnim(container) {
  const cards = container.querySelectorAll('.kv-card');
  cards.forEach((card, i) => {
    // kv-visible burada dogrudan verilir: kart kv-reveal tasisa da tasimasa da,
    // IntersectionObserver'in ayrica cagrilmasini beklemeden goruntulenir.
    setTimeout(() => {
      card.classList.add('kv-in');
      card.classList.add('kv-visible');
      const canvas = card.querySelector('.kv-card-canvas');
      if (canvas && typeof kvDrawPoster === 'function') {
        kvDrawPoster(canvas, canvas.dataset.seed, canvas.dataset.icon, canvas.dataset.accent);
      }
    }, i * 60);
  });
}

// Giris animasyonu bitince CSS animasyonunu birakiyoruz ki
// hover-tilt icin sonradan verilen inline transform gecerli olabilsin
// (aktif bir CSS animasyonu inline transform'dan daha yuksek onceliklidir).
document.addEventListener('animationend', (e) => {
  if (e.animationName === 'kv-card-in') {
    e.target.style.animation = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  kvInitBackground();
  kvInitRipple();
  kvInitNavScroll();
  kvInitCardTilt();
  kvInitParallax();
  kvInitPageLoader();
});

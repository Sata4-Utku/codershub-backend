// Kuroverse — animasyon ve gorsel efekt yardimcilari

function kvInitBackground() {
  const bg = document.createElement('div');
  bg.className = 'kv-bg';
  bg.innerHTML = '<canvas id="kv-stars"></canvas>';
  document.body.prepend(bg);

  ['o1', 'o2', 'o3'].forEach((c) => {
    const orb = document.createElement('div');
    orb.className = 'kv-orb ' + c;
    document.body.prepend(orb);
  });

  const glow = document.createElement('div');
  glow.className = 'kv-cursor-glow';
  document.body.appendChild(glow);
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  kvStarfield(document.getElementById('kv-stars'));
}

function kvStarfield(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.15 + 0.03,
      twinkle: Math.random() * Math.PI * 2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    for (const s of stars) {
      s.twinkle += 0.02;
      const alpha = 0.35 + Math.sin(s.twinkle) * 0.35;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y += s.speed;
      if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
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
    setTimeout(() => card.classList.add('kv-in'), i * 60);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  kvInitBackground();
  kvInitRipple();
  kvInitNavScroll();
});

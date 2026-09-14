function kvShowFormError(msg) {
  const el = document.getElementById('kv-form-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}
function kvHideFormError() {
  const el = document.getElementById('kv-form-error');
  if (!el) return;
  el.classList.remove('show');
}

async function kvInitLoginPage() {
  if (KV_USER) { window.location.href = '/profil.html'; return; }
  const form = document.getElementById('kv-login-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    kvHideFormError();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const identifier = form.identifier.value.trim();
      const password = form.password.value;
      await kvApi.login(identifier, password);
      kvToast('Hos geldin! Giris basarili.', 'success');
      setTimeout(() => (window.location.href = '/profil.html'), 500);
    } catch (err) {
      kvShowFormError(err.message);
      btn.disabled = false;
    }
  });
}

async function kvInitRegisterPage() {
  if (KV_USER) { window.location.href = '/profil.html'; return; }
  const form = document.getElementById('kv-register-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    kvHideFormError();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const username = form.username.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const confirm = form.confirm.value;
      if (password !== confirm) throw new Error('Sifreler eslesmiyor.');
      await kvApi.register(username, email, password);
      kvToast('Hesabin olusturuldu! Kuroverse\'e hos geldin.', 'success');
      setTimeout(() => (window.location.href = '/profil.html'), 500);
    } catch (err) {
      kvShowFormError(err.message);
      btn.disabled = false;
    }
  });
}

document.addEventListener('kv-layout-ready', () => {
  kvInitLoginPage();
  kvInitRegisterPage();
});

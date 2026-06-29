/* ============================================================
   NOVA — auth.js
   Login · Register · Forgot password · Profile page logic.
   Pure frontend demo validation + LocalStorage session.
   ============================================================ */
'use strict';

class AuthUI {
  static init() {
    AuthUI.bindPasswordToggles();
    AuthUI.bindLogin();
    AuthUI.bindRegister();
    AuthUI.bindForgot();
    AuthUI.bindProfile();
  }

  /* ---------- helpers ---------- */
  static setInvalid(input, invalid) {
    const field = input.closest('.field');
    field?.classList.toggle('invalid', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    return !invalid;
  }

  static validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  static bindPasswordToggles() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-toggle-password]');
      if (!btn) return;
      const input = document.getElementById(btn.dataset.togglePassword);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.querySelector('use')?.setAttribute('href', show ? '#i-eye-off' : '#i-eye');
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  /* ---------- LOGIN ---------- */
  static bindLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('#loginEmail');
      const pass = form.querySelector('#loginPassword');
      const remember = form.querySelector('#rememberMe')?.checked;

      const okEmail = AuthUI.setInvalid(email, !AuthUI.validEmail(email.value.trim()));
      const okPass = AuthUI.setInvalid(pass, pass.value.length < 6);
      if (!okEmail || !okPass) {
        Toast.error('Check your details', 'Please fix the highlighted fields.');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = `${icon('refresh')} Signing in…`;

      setTimeout(() => {
        Session.login(email.value.trim(), remember);
        Toast.success('Welcome back!', 'Redirecting to your workspace…');
        setTimeout(() => (window.location.href = 'index.html'), 800);
      }, 900);
    });

    document.querySelectorAll('[data-social]').forEach((b) =>
      b.addEventListener('click', () => {
        Toast.info(`Continue with ${b.dataset.social}`, 'Social sign-in is a UI demo.');
      })
    );
  }

  /* ---------- REGISTER ---------- */
  static bindRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    /* avatar preview */
    const fileInput = document.getElementById('avatarInput');
    const circle = document.getElementById('avatarCircle');
    circle?.addEventListener('click', () => fileInput.click());
    circle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    fileInput?.addEventListener('change', () => {
      const f = fileInput.files?.[0];
      if (!f || !f.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        circle.innerHTML = `<img src="${reader.result}" alt="Profile photo preview">`;
        Toast.success('Photo added', f.name);
      };
      reader.readAsDataURL(f);
    });

    /* password strength meter */
    const pw = document.getElementById('regPassword');
    const meter = document.getElementById('pwStrength');
    const hint = document.getElementById('pwHint');
    const LABELS = ['Too short', 'Weak', 'Okay', 'Good', 'Strong 💪'];
    pw?.addEventListener('input', () => {
      const v = pw.value;
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      meter.className = `pw-strength s${s}`;
      hint.textContent = v ? LABELS[s] : 'Use 8+ chars with a mix of letters, numbers & symbols';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#regName');
      const username = form.querySelector('#regUsername');
      const email = form.querySelector('#regEmail');
      const confirm = form.querySelector('#regConfirm');
      const terms = form.querySelector('#regTerms');

      let ok = true;
      ok = AuthUI.setInvalid(name, name.value.trim().length < 2) && ok;
      ok = AuthUI.setInvalid(username, !/^[a-z0-9_]{3,20}$/i.test(username.value.trim())) && ok;
      ok = AuthUI.setInvalid(email, !AuthUI.validEmail(email.value.trim())) && ok;
      ok = AuthUI.setInvalid(pw, pw.value.length < 8) && ok;
      ok = AuthUI.setInvalid(confirm, confirm.value !== pw.value || !confirm.value) && ok;

      if (!terms.checked) {
        Toast.warning('Almost there', 'Please accept the Terms of Service.');
        ok = false;
      }
      if (!ok) return;

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = `${icon('refresh')} Creating account…`;

      setTimeout(() => {
        Session.update({
          name: name.value.trim(),
          username: username.value.trim().toLowerCase(),
          email: email.value.trim(),
        });
        Session.login(email.value.trim(), true);
        Toast.success('Account created 🎉', 'Welcome to NOVA!');
        setTimeout(() => (window.location.href = 'index.html'), 900);
      }, 1100);
    });
  }

  /* ---------- FORGOT PASSWORD ---------- */
  static bindForgot() {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('#forgotEmail');
      if (!AuthUI.setInvalid(email, !AuthUI.validEmail(email.value.trim()))) {
        Toast.error('Invalid email', 'Enter the address you signed up with.');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = `${icon('refresh')} Sending…`;

      setTimeout(() => {
        form.classList.add('hidden');
        document.getElementById('forgotSuccess').classList.remove('hidden');
        document.getElementById('sentTo').textContent = email.value.trim();
        Toast.success('Reset link sent', 'Check your inbox 📬');
      }, 1000);
    });
  }

  /* ---------- PROFILE ---------- */
  static bindProfile() {
    const page = document.getElementById('profilePage');
    if (!page) return;

    const me = Session.user();
    document.getElementById('profileName').textContent = me.name;
    document.getElementById('profileHandle').textContent = `@${me.username}`;
    document.getElementById('profileBio').textContent = me.bio;
    document.getElementById('profileAvatar').innerHTML = Util.avatar(me.name, { size: 'xl' }).replace('class="avatar', 'class="avatar');

    /* status selector */
    const savedStatus = me.status || 'online';
    document.querySelectorAll('.status-option').forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.status === savedStatus);
      btn.setAttribute('aria-pressed', String(btn.dataset.status === savedStatus));
      btn.addEventListener('click', () => {
        document.querySelectorAll('.status-option').forEach((b) => {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        Session.update({ status: btn.dataset.status });
        const ring = document.querySelector('.profile-avatar-xl .status-ring');
        const COLORS = { online: 'var(--success)', away: 'var(--warning)', dnd: 'var(--danger)', offline: 'var(--text-3)' };
        if (ring) ring.style.background = COLORS[btn.dataset.status];
        Toast.success('Status updated', btn.querySelector('span:nth-child(2)').textContent.trim());
      });
    });

    /* edit profile modal */
    const form = document.getElementById('editProfileForm');
    if (form) {
      form.querySelector('#editName').value = me.name;
      form.querySelector('#editUsername').value = me.username;
      form.querySelector('#editBio').value = me.bio;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('#editName').value.trim() || me.name;
        const username = form.querySelector('#editUsername').value.trim() || me.username;
        const bio = form.querySelector('#editBio').value.trim();
        Session.update({ name, username, bio });
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileHandle').textContent = `@${username}`;
        document.getElementById('profileBio').textContent = bio;
        document.getElementById('profileAvatar').innerHTML = Util.avatar(name, { size: 'xl' });
        Modals.close(document.getElementById('modalEditProfile'));
        Toast.success('Profile saved', 'Your changes are live.');
      });
    }

    /* settings switches */
    const prefs = Store.get('prefs', { notif: true, sounds: true, dnd: false, read: true });
    document.querySelectorAll('[data-pref]').forEach((sw) => {
      sw.checked = !!prefs[sw.dataset.pref];
      sw.addEventListener('change', () => {
        prefs[sw.dataset.pref] = sw.checked;
        Store.set('prefs', prefs);
        Toast.info('Preference saved', `${sw.dataset.label || sw.dataset.pref} ${sw.checked ? 'enabled' : 'disabled'}`);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', AuthUI.init);

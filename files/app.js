/* ============================================================
   NOVA — app.js
   Shared core: storage, session, UI primitives (toasts, modals,
   dropdowns, lightbox), avatar rendering, time helpers.
   Loaded on every page AFTER icons.js / theme.js.
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   Storage — thin namespaced LocalStorage wrapper
   ------------------------------------------------------------ */
class Store {
  static PREFIX = 'nova.';

  static get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(Store.PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(Store.PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn('[Store] write failed:', err);
    }
  }

  static remove(key) {
    localStorage.removeItem(Store.PREFIX + key);
  }
}

/* ------------------------------------------------------------
   Session — demo auth state
   ------------------------------------------------------------ */
class Session {
  static DEFAULT_USER = {
    id: 'u-me',
    name: 'Alex Carter',
    username: 'alexcarter',
    email: 'alex.carter@nova.app',
    role: 'Product Designer',
    bio: 'Designing delightful collaboration experiences. Coffee-fuelled pixel pusher. Previously @Linear, @Figma.',
    status: 'online',
    statusText: 'Building in public 🚀',
  };

  static user() {
    return { ...Session.DEFAULT_USER, ...(Store.get('user') || {}) };
  }

  static update(patch) {
    Store.set('user', { ...Session.user(), ...patch });
  }

  static login(email, remember) {
    Store.set('session', { email, remember: !!remember, at: Date.now() });
  }

  static logout() {
    Store.remove('session');
  }

  static isAuthed() {
    return !!Store.get('session');
  }
}

/* ------------------------------------------------------------
   Utilities
   ------------------------------------------------------------ */
const Util = {
  /** Escape user-generated text before injecting into HTML. */
  esc(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  initials(name = '?') {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  },

  /** Deterministic palette index for a username. */
  hue(name = '') {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 8;
  },

  /** Build an avatar element HTML string. */
  avatar(name, { size = '', presence = '', extra = '' } = {}) {
    const cls = ['avatar', size ? `avatar-${size}` : '', extra].filter(Boolean).join(' ');
    const dot = presence ? `<span class="presence ${presence}" aria-hidden="true"></span>` : '';
    return `<span class="${cls}" data-c="${Util.hue(name)}" aria-hidden="true">${Util.esc(Util.initials(name))}${dot}</span>`;
  },

  timeHM(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  },

  relTime(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'yesterday' : `${d}d ago`;
  },

  dayLabel(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yest = new Date(today);
    yest.setDate(today.getDate() - 1);
    const same = (a, b) => a.toDateString() === b.toDateString();
    if (same(d, today)) return 'Today';
    if (same(d, yest)) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  },

  uid() {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  },

  debounce(fn, ms = 200) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  },

  clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  },
};

/* ------------------------------------------------------------
   Toast notifications
   ------------------------------------------------------------ */
class Toast {
  static ICONS = { success: 'check', error: 'alert', warning: 'alert', info: 'info' };

  static stack() {
    let el = document.querySelector('.toast-stack');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast-stack';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    return el;
  }

  static show(type, title, message = '', life = 4200) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.style.setProperty('--toast-life', `${life / 1000}s`);
    el.innerHTML = `
      <span class="toast-icon">${icon(Toast.ICONS[type] || 'info')}</span>
      <div class="toast-body">
        <strong>${Util.esc(title)}</strong>
        ${message ? `<p>${Util.esc(message)}</p>` : ''}
      </div>
      <button class="toast-close" aria-label="Dismiss notification">${icon('x', 'ic-sm')}</button>`;
    Toast.stack().appendChild(el);

    const dismiss = () => {
      if (el.classList.contains('leaving')) return;
      el.classList.add('leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    el.querySelector('.toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, life);
    // Keep the stack tidy
    const items = Toast.stack().children;
    if (items.length > 4) items[0].remove();
    return el;
  }

  static success(t, m) { return Toast.show('success', t, m); }
  static error(t, m) { return Toast.show('error', t, m); }
  static warning(t, m) { return Toast.show('warning', t, m); }
  static info(t, m) { return Toast.show('info', t, m); }
}

/* ------------------------------------------------------------
   Modal manager  (data-modal-open="id" / data-modal-close)
   ------------------------------------------------------------ */
class Modals {
  static init() {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-modal-open]');
      if (opener) {
        Modals.open(opener.dataset.modalOpen);
        return;
      }
      const closer = e.target.closest('[data-modal-close]');
      if (closer) {
        Modals.close(closer.closest('.modal-overlay'));
        return;
      }
      // Click on overlay backdrop
      if (e.target.classList.contains('modal-overlay')) Modals.close(e.target);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open, .lightbox.open').forEach((m) => Modals.close(m));
      }
    });
  }

  static open(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    const focusable = m.querySelector('input, textarea, button:not([data-modal-close])');
    setTimeout(() => focusable?.focus(), 120);
  }

  static close(m) {
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
  }
}

/* ------------------------------------------------------------
   Dropdown manager  (.dropdown > [data-dropdown] + .dropdown-menu)
   ------------------------------------------------------------ */
class Dropdowns {
  static init() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-dropdown]');
      if (trigger) {
        const dd = trigger.closest('.dropdown');
        const wasOpen = dd.classList.contains('open');
        Dropdowns.closeAll();
        if (!wasOpen) {
          dd.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
        e.stopPropagation();
        return;
      }
      // Keep menus open when clicking inputs inside them
      if (e.target.closest('.dropdown-menu') && e.target.closest('input, .input')) return;
      Dropdowns.closeAll();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Dropdowns.closeAll();
    });
  }

  static closeAll() {
    document.querySelectorAll('.dropdown.open').forEach((d) => {
      d.classList.remove('open');
      d.querySelector('[data-dropdown]')?.setAttribute('aria-expanded', 'false');
    });
  }
}

/* ------------------------------------------------------------
   Lightbox (image preview)
   ------------------------------------------------------------ */
class Lightbox {
  static el = null;

  static ensure() {
    if (Lightbox.el) return Lightbox.el;
    const el = document.createElement('div');
    el.className = 'lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <button class="lightbox-close" aria-label="Close preview">${icon('x', 'ic-lg')}</button>
      <img src="" alt="Image preview">
      <span class="lightbox-caption"></span>`;
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.closest('.lightbox-close')) Lightbox.close();
    });
    document.body.appendChild(el);
    Lightbox.el = el;
    return el;
  }

  static open(src, caption = '') {
    const el = Lightbox.ensure();
    el.querySelector('img').src = src;
    el.querySelector('.lightbox-caption').textContent = caption;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
  }

  static close() {
    Lightbox.el?.classList.remove('open');
    Lightbox.el?.setAttribute('aria-hidden', 'true');
  }
}

/* ------------------------------------------------------------
   Global delegated behaviours
   ------------------------------------------------------------ */
class App {
  static init() {
    Modals.init();
    Dropdowns.init();

    document.addEventListener('click', (e) => {
      // Image preview triggers
      const zoom = e.target.closest('[data-lightbox]');
      if (zoom) {
        const img = zoom.tagName === 'IMG' ? zoom : zoom.querySelector('img');
        if (img) Lightbox.open(img.src, zoom.dataset.caption || img.alt || '');
      }

      // Logout
      if (e.target.closest('[data-action="logout"]')) {
        Session.logout();
        Toast.info('Signed out', 'See you soon 👋');
        setTimeout(() => (window.location.href = 'login.html'), 700);
      }

      // Generic "demo only" actions
      const demo = e.target.closest('[data-demo]');
      if (demo) Toast.info(demo.dataset.demo || 'Demo', 'This action is part of the UI demo.');
    });

    // Render current-user placeholders
    document.querySelectorAll('[data-me="name"]').forEach((n) => (n.textContent = Session.user().name));
    document.querySelectorAll('[data-me="avatar"]').forEach((n) => {
      n.innerHTML = Util.avatar(Session.user().name, {
        size: n.dataset.size || '',
        presence: n.dataset.presence ?? 'online',
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', App.init);

/* Expose for other modules */
window.Store = Store;
window.Session = Session;
window.Util = Util;
window.Toast = Toast;
window.Modals = Modals;
window.Dropdowns = Dropdowns;
window.Lightbox = Lightbox;

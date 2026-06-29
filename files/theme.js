/* ============================================================
   NOVA — Theme Manager
   Dark / Light mode with LocalStorage persistence.
   Loaded in <head> (before paint) to prevent theme flashing.
   ============================================================ */
'use strict';

class ThemeManager {
  static KEY = 'nova.theme';

  constructor() {
    this.theme = this.load();
    this.apply(this.theme, false);
    document.addEventListener('DOMContentLoaded', () => this.bind());
  }

  load() {
    const saved = localStorage.getItem(ThemeManager.KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  apply(theme, animate = true) {
    this.theme = theme;
    const root = document.documentElement;
    if (animate) {
      root.classList.add('theme-anim');
      window.clearTimeout(this._t);
      this._t = window.setTimeout(() => root.classList.remove('theme-anim'), 450);
    }
    root.setAttribute('data-theme', theme);
    localStorage.setItem(ThemeManager.KEY, theme);
    this.syncToggles();
  }

  toggle() {
    this.apply(this.theme === 'dark' ? 'light' : 'dark');
  }

  /** Update every theme toggle button on the page (icon + aria state). */
  syncToggles() {
    document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
      const use = btn.querySelector('use');
      if (use) use.setAttribute('href', this.theme === 'dark' ? '#i-sun' : '#i-moon');
      btn.setAttribute('aria-pressed', String(this.theme === 'light'));
      btn.setAttribute('aria-label', this.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = this.theme === 'dark' ? 'Light mode' : 'Dark mode';
    });
  }

  bind() {
    this.syncToggles();
    // Event delegation — works for toggles rendered later as well.
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-theme"]')) this.toggle();
    });
  }
}

window.Theme = new ThemeManager();

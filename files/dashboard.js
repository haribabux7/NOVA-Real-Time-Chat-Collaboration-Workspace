/* ============================================================
   NOVA — dashboard.js
   Admin analytics: animated counters, bar/donut/h-bar charts,
   user table with search + filter, drag & drop uploads.
   ============================================================ */
'use strict';

class Dashboard {
  static DATA = {
    stats: [
      { id: 'users', label: 'Total Users', value: 12847, icon: 'users', v: 'v1', trend: +12.4 },
      { id: 'active', label: 'Active Users', value: 3291, icon: 'activity', v: 'v2', trend: +8.1 },
      { id: 'messages', label: 'Total Messages', value: 1842903, icon: 'message', v: 'v3', trend: +23.7 },
      { id: 'teams', label: 'Teams Created', value: 486, icon: 'grid', v: 'v4', trend: +4.9 },
      { id: 'files', label: 'Files Shared', value: 58112, icon: 'folder', v: 'v5', trend: -2.3 },
    ],
    week: [
      { d: 'Mon', v: 18420 }, { d: 'Tue', v: 23110 }, { d: 'Wed', v: 27860 },
      { d: 'Thu', v: 21540 }, { d: 'Fri', v: 30240 }, { d: 'Sat', v: 12080 }, { d: 'Sun', v: 9410 },
    ],
    channels: [
      { name: '#general', v: 8420 }, { name: '#engineering', v: 6310 },
      { name: '#design-system', v: 4980 }, { name: '#launch-day', v: 3840 }, { name: '#random', v: 2210 },
    ],
    users: [
      { name: 'Maya Patel', email: 'maya@nova.app', role: 'Admin', team: 'Engineering', msgs: 4821, status: 'online' },
      { name: 'Leo Fischer', email: 'leo@nova.app', role: 'Member', team: 'Engineering', msgs: 3914, status: 'online' },
      { name: 'Sofia Reyes', email: 'sofia@nova.app', role: 'Manager', team: 'Product', msgs: 3422, status: 'away' },
      { name: 'Alex Carter', email: 'alex.carter@nova.app', role: 'Member', team: 'Design', msgs: 3119, status: 'online' },
      { name: 'Daniel Brooks', email: 'daniel@nova.app', role: 'Member', team: 'Engineering', msgs: 2876, status: 'dnd' },
      { name: 'Inès Laurent', email: 'ines@nova.app', role: 'Moderator', team: 'Research', msgs: 2540, status: 'online' },
      { name: 'Kenji Watanabe', email: 'kenji@nova.app', role: 'Member', team: 'Platform', msgs: 1987, status: 'offline' },
      { name: 'Zara Ahmed', email: 'zara@nova.app', role: 'Member', team: 'QA', msgs: 1763, status: 'online' },
    ],
  };

  constructor() {
    this.renderStats();
    this.renderBarChart();
    this.renderChannelBars();
    this.renderUserTable();
    this.bindTableControls();
    this.bindUpload();
    this.bindNav();
  }

  /* ---------- number formatting + count-up ---------- */
  static fmt(n) {
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return n.toLocaleString();
    return String(n);
  }

  countUp(el, target, ms = 1300) {
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Dashboard.fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- stat cards ---------- */
  renderStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    grid.innerHTML = Dashboard.DATA.stats.map((s, i) => `
      <article class="stat-card" style="animation-delay:${i * 70}ms">
        <span class="stat-icon ${s.v}">${icon(s.icon, 'ic-lg')}</span>
        <div class="stat-value" data-count="${s.value}">0</div>
        <div class="stat-label">${s.label}</div>
        <span class="stat-trend ${s.trend >= 0 ? 'up' : 'down'}">
          ${icon('trending')} ${s.trend >= 0 ? '+' : ''}${s.trend}% this week
        </span>
      </article>`).join('');
    grid.querySelectorAll('[data-count]').forEach((el) => this.countUp(el, +el.dataset.count));
  }

  /* ---------- messages-per-day bar chart ---------- */
  renderBarChart() {
    const wrap = document.getElementById('barChart');
    if (!wrap) return;
    const max = Math.max(...Dashboard.DATA.week.map((x) => x.v));
    wrap.innerHTML = Dashboard.DATA.week.map((x) => `
      <div class="bar-col">
        <div class="bar-track">
          <div class="bar-fill" data-h="${Math.round((x.v / max) * 100)}" role="img"
            aria-label="${x.d}: ${x.v.toLocaleString()} messages">
            <span class="bar-tip">${x.v.toLocaleString()}</span>
          </div>
        </div>
        <span class="bar-label">${x.d}</span>
      </div>`).join('');
    requestAnimationFrame(() =>
      setTimeout(() => wrap.querySelectorAll('.bar-fill').forEach((b, i) =>
        setTimeout(() => (b.style.height = `${b.dataset.h}%`), i * 80)), 150));
  }

  /* ---------- most active channels ---------- */
  renderChannelBars() {
    const wrap = document.getElementById('channelBars');
    if (!wrap) return;
    const max = Math.max(...Dashboard.DATA.channels.map((x) => x.v));
    wrap.innerHTML = Dashboard.DATA.channels.map((x, i) => `
      <div class="h-bar-row">
        <div class="h-bar-top"><strong>${x.name}</strong><span class="text-2">${x.v.toLocaleString()}</span></div>
        <div class="h-bar-track">
          <div class="h-bar-fill c${i + 1}" data-w="${Math.round((x.v / max) * 100)}"></div>
        </div>
      </div>`).join('');
    setTimeout(() => wrap.querySelectorAll('.h-bar-fill').forEach((b, i) =>
      setTimeout(() => (b.style.width = `${b.dataset.w}%`), i * 110)), 250);
  }

  /* ---------- user table ---------- */
  renderUserTable(query = '', status = 'all') {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    const q = query.trim().toLowerCase();
    const rows = Dashboard.DATA.users.filter((u) =>
      (status === 'all' || u.status === status) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.team.toLowerCase().includes(q)));

    tbody.innerHTML = rows.length
      ? rows.map((u) => `
        <tr>
          <td><div class="cell-user">
            ${Util.avatar(u.name, { size: 'sm' })}
            <div><strong>${Util.esc(u.name)}</strong><span class="u-mail">${Util.esc(u.email)}</span></div>
          </div></td>
          <td>${Util.esc(u.role)}</td>
          <td>${Util.esc(u.team)}</td>
          <td><strong>${u.msgs.toLocaleString()}</strong></td>
          <td><span class="status-pill ${u.status}">${u.status}</span></td>
          <td>
            <div class="dropdown">
              <button class="icon-btn" data-dropdown aria-haspopup="true" aria-expanded="false" aria-label="Actions for ${Util.esc(u.name)}">${icon('more-v')}</button>
              <div class="dropdown-menu">
                <button class="dropdown-item" data-demo="Opening ${Util.esc(u.name)}'s profile">${icon('user')} View profile</button>
                <button class="dropdown-item" data-demo="Messaging ${Util.esc(u.name)}">${icon('message')} Send message</button>
                <div class="dropdown-sep"></div>
                <button class="dropdown-item danger" data-demo="Suspend is a demo action">${icon('shield')} Suspend user</button>
              </div>
            </div>
          </td>
        </tr>`).join('')
      : `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-2)">No users match your filters</td></tr>`;
  }

  bindTableControls() {
    const search = document.getElementById('userSearch');
    const filter = document.getElementById('statusFilter');
    const rerun = Util.debounce(() => this.renderUserTable(search?.value || '', filter?.value || 'all'), 140);
    search?.addEventListener('input', rerun);
    filter?.addEventListener('change', rerun);
  }

  /* ---------- drag & drop upload ---------- */
  bindUpload() {
    const dz = document.getElementById('dropzone');
    const input = document.getElementById('dzInput');
    const list = document.getElementById('uploadList');
    if (!dz) return;

    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, prevent));
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, () => dz.classList.add('dragover')));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove('dragover')));

    dz.addEventListener('drop', (e) => this.queueFiles([...e.dataTransfer.files], list));
    dz.addEventListener('click', () => input.click());
    dz.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', () => {
      this.queueFiles([...input.files], list);
      input.value = '';
    });
  }

  queueFiles(files, list) {
    if (!files.length) return;
    files.slice(0, 5).forEach((f) => this.simulateUpload(f, list));
    Toast.info('Uploading…', `${files.length} file${files.length > 1 ? 's' : ''} queued`);
  }

  simulateUpload(file, list) {
    const kind = /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name) ? 'img'
      : /\.pdf$/i.test(file.name) ? 'pdf'
      : /\.(zip|rar|7z)$/i.test(file.name) ? 'zip' : 'doc';
    const size = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const row = document.createElement('div');
    row.className = 'upload-row';
    row.innerHTML = `
      <span class="file-thumb ${kind}">${icon(kind === 'img' ? 'image' : kind === 'zip' ? 'folder' : 'file-text')}</span>
      <div class="up-meta">
        <div class="up-top"><span class="truncate">${Util.esc(file.name)}</span><span>${size}</span></div>
        <div class="progress"><div class="progress-fill"></div></div>
      </div>
      <button class="icon-btn" aria-label="Remove ${Util.esc(file.name)}">${icon('x', 'ic-sm')}</button>`;
    list.prepend(row);
    row.querySelector('.icon-btn').addEventListener('click', () => {
      row.remove();
      Toast.info('File removed', file.name);
    });

    const fill = row.querySelector('.progress-fill');
    let p = 0;
    const timer = setInterval(() => {
      p = Math.min(100, p + 6 + Math.random() * 16);
      fill.style.width = `${p}%`;
      if (p >= 100) {
        clearInterval(timer);
        fill.classList.add('done');
        row.querySelector('.up-top span:last-child').textContent = `${size} · Done ✓`;
        Toast.success('Upload complete', file.name);
      }
    }, 220);
  }

  /* ---------- mobile nav ---------- */
  bindNav() {
    const shell = document.getElementById('dashShell');
    const backdrop = document.getElementById('backdrop');
    document.getElementById('dashMenuBtn')?.addEventListener('click', () => {
      shell.classList.add('mobile-nav-open');
      backdrop.classList.add('show');
    });
    backdrop?.addEventListener('click', () => {
      shell.classList.remove('mobile-nav-open');
      backdrop.classList.remove('show');
    });
    document.querySelectorAll('.dash-nav-item[data-section]').forEach((b) =>
      b.addEventListener('click', () => {
        document.querySelectorAll('.dash-nav-item').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        document.getElementById(b.dataset.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        shell.classList.remove('mobile-nav-open');
        backdrop.classList.remove('show');
      }));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashShell')) window.Dash = new Dashboard();
});

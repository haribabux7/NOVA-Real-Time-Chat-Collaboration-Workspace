/* ============================================================
   NOVA — chat.js
   Chat experience: channels, DMs, messages, composer, emoji
   picker, reactions, replies, editing, typing simulation,
   notifications, search, panel toggles. Persists to LocalStorage.
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   Demo image generator — gradient SVG data URIs (zero assets,
   fully offline, crisp at any size).
   ------------------------------------------------------------ */
const DemoImg = (() => {
  const PALETTES = [
    ['#6366f1', '#a855f7'],
    ['#0ea5e9', '#22d3ee'],
    ['#10b981', '#84cc16'],
    ['#f59e0b', '#f97316'],
    ['#ec4899', '#8b5cf6'],
    ['#14b8a6', '#6366f1'],
  ];
  return (label, idx = 0, w = 640, h = 400) => {
    const [a, b] = PALETTES[idx % PALETTES.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
      <circle cx="${w * 0.82}" cy="${h * 0.2}" r="${h * 0.34}" fill="rgba(255,255,255,0.14)"/>
      <circle cx="${w * 0.12}" cy="${h * 0.85}" r="${h * 0.42}" fill="rgba(255,255,255,0.1)"/>
      <circle cx="${w * 0.45}" cy="${h * 0.5}" r="${h * 0.12}" fill="rgba(255,255,255,0.12)"/>
      <text x="50%" y="52%" text-anchor="middle" fill="rgba(255,255,255,0.92)"
        font-family="Arial, sans-serif" font-weight="bold" font-size="${Math.round(h * 0.085)}"
        letter-spacing="2">${label}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };
})();

/* ------------------------------------------------------------
   Seed data
   ------------------------------------------------------------ */
const ChatSeed = (() => {
  const now = Date.now();
  const H = 3600e3;
  const D = 86400e3;

  const users = {
    'u-me': { name: 'Alex Carter', role: 'Product Designer', status: 'online' },
    'u-maya': { name: 'Maya Patel', role: 'Engineering Lead', status: 'online', badge: 'admin' },
    'u-leo': { name: 'Leo Fischer', role: 'Frontend Engineer', status: 'online' },
    'u-sofia': { name: 'Sofia Reyes', role: 'Product Manager', status: 'away' },
    'u-dan': { name: 'Daniel Brooks', role: 'Backend Engineer', status: 'dnd' },
    'u-ines': { name: 'Inès Laurent', role: 'UX Researcher', status: 'online', badge: 'mod' },
    'u-kenji': { name: 'Kenji Watanabe', role: 'DevOps Engineer', status: 'offline' },
    'u-zara': { name: 'Zara Ahmed', role: 'QA Engineer', status: 'online' },
  };

  const channels = [
    {
      id: 'ch-general', type: 'channel', name: 'general', icon: 'hash',
      desc: 'Company-wide announcements and watercooler chat', members: 48, unread: 0,
      messages: [
        { id: 'm1', uid: 'u-maya', ts: now - 2 * D - 5 * H, text: 'Welcome everyone to the new <strong>NOVA</strong> workspace! 🎉 We migrated all history from the old tool — check pinned messages for the onboarding guide.' , pinned: true, reactions: [{ e: '🎉', n: 12, me: true }, { e: '🚀', n: 7 }] },
        { id: 'm2', uid: 'u-leo', ts: now - 2 * D - 4.6 * H, text: 'This UI is so much faster. Great pick @Maya!' , reactions: [{ e: '💯', n: 4 }] },
        { id: 'm3', uid: 'u-me', ts: now - 2 * D - 4.4 * H, text: 'Loving the dark theme already 😄' },
        { id: 'm4', uid: 'u-sofia', ts: now - D - 7 * H, text: 'Reminder: All-hands tomorrow at 10:00 AM. Agenda is in the calendar invite — we will demo the Q3 roadmap.' , reactions: [{ e: '👍', n: 9, me: true }] },
        { id: 'm5', uid: 'u-ines', ts: now - D - 3 * H, text: 'Sharing the latest brand photography for the website refresh ✨', image: { label: 'BRAND SHOOT 01', idx: 4, caption: 'Brand photography — website refresh' } },
        { id: 'm6', uid: 'u-dan', ts: now - 5 * H, text: 'Heads up — API maintenance window tonight <code>23:00–23:30 UTC</code>. Expect ~2 min of read-only mode.' },
        { id: 'm7', uid: 'u-me', ts: now - 4.7 * H, text: 'Thanks for the heads up! I will pause the sync jobs.', reply: { author: 'Daniel Brooks', text: 'Heads up — API maintenance window tonight…' }, status: 'read' },
        { id: 'm8', uid: 'u-zara', ts: now - 2 * H, text: 'Regression suite is green across all browsers ✅ Release candidate is good to go.', reactions: [{ e: '✅', n: 6, me: true }, { e: '🙌', n: 3 }] },
      ],
    },
    {
      id: 'ch-design', type: 'channel', name: 'design-system', icon: 'hash',
      desc: 'Tokens, components & Figma library updates', members: 14, unread: 3,
      messages: [
        { id: 'd1', uid: 'u-ines', ts: now - D - 6 * H, text: 'New elevation tokens are live in the library. Shadows now scale with surface depth — see the spec 👇', pinned: true },
        { id: 'd2', uid: 'u-ines', ts: now - D - 5.9 * H, file: { name: 'elevation-tokens-spec.fig', size: '4.2 MB', kind: 'fig' } },
        { id: 'd3', uid: 'u-me', ts: now - D - 5 * H, text: 'These look fantastic. Migrating the dashboard cards today.', status: 'read', reactions: [{ e: '❤️', n: 2 }] },
        { id: 'd4', uid: 'u-leo', ts: now - 7 * H, text: 'Should the <code>Button</code> ghost variant keep the 1px border on hover, or go borderless like Slack?' },
        { id: 'd5', uid: 'u-me', ts: now - 6.8 * H, text: 'Borderless + subtle bg tint. Matches our "quiet until needed" principle.', reply: { author: 'Leo Fischer', text: 'Should the Button ghost variant keep the 1px border…' }, status: 'read' },
        { id: 'd6', uid: 'u-ines', ts: now - 3 * H, text: 'Moodboard for the marketing refresh 🎨', image: { label: 'MOODBOARD V2', idx: 0, caption: 'Marketing refresh moodboard' }, reactions: [{ e: '🔥', n: 5, me: true }] },
      ],
    },
    {
      id: 'ch-eng', type: 'channel', name: 'engineering', icon: 'hash',
      desc: 'Builds, deploys & technical discussion', members: 22, unread: 0,
      messages: [
        { id: 'e1', uid: 'u-kenji', ts: now - D - 2 * H, text: 'CI pipeline now caches <code>node_modules</code> between runs — builds dropped from 8m to 2m 40s ⚡' , reactions: [{ e: '⚡', n: 11, me: true }, { e: '🙏', n: 4 }], pinned: true },
        { id: 'e2', uid: 'u-dan', ts: now - D - 1 * H, text: 'Postgres upgrade to 16 is scheduled for Saturday. Zero-downtime via logical replication.' },
        { id: 'e3', uid: 'u-leo', ts: now - 8 * H, text: 'PR #482 is up — virtualised message list, 60fps scroll with 50k messages. Reviews welcome!' },
        { id: 'e4', uid: 'u-me', ts: now - 7.5 * H, text: 'On it. The scroll perf in the demo video looks unreal 👀', status: 'delivered' },
        { id: 'e5', uid: 'u-leo', ts: now - 7.4 * H, file: { name: 'perf-benchmarks-q3.pdf', size: '1.8 MB', kind: 'pdf' } },
      ],
    },
    {
      id: 'ch-launch', type: 'channel', name: 'launch-day', icon: 'zap',
      desc: 'War room for the v3.0 public launch 🚀', members: 9, unread: 12,
      messages: [
        { id: 'l1', uid: 'u-sofia', ts: now - 4 * H, text: 'T-minus 3 days. Final checklist is pinned — everyone owns a row.', pinned: true, reactions: [{ e: '🚀', n: 8, me: true }] },
        { id: 'l2', uid: 'u-sofia', ts: now - 3.9 * H, file: { name: 'launch-checklist-v3.xlsx', size: '92 KB', kind: 'doc' } },
        { id: 'l3', uid: 'u-maya', ts: now - 2 * H, text: 'Status page, on-call rotation, and rollback plan are all locked in. We are GO from infra. 🟢' },
        { id: 'l4', uid: 'u-ines', ts: now - 1.5 * H, text: 'Launch-day social assets, fresh out of the oven:', image: { label: 'LAUNCH KEY ART', idx: 3, caption: 'v3.0 launch key art' }, reactions: [{ e: '😍', n: 6 }, { e: '🎨', n: 3, me: true }] },
      ],
    },
    {
      id: 'dm-maya', type: 'dm', uid: 'u-maya', unread: 2,
      messages: [
        { id: 'dm1', uid: 'u-maya', ts: now - D - 30 * 60e3, text: 'Hey Alex! Got 15 min tomorrow to review the activation funnel designs?' },
        { id: 'dm2', uid: 'u-me', ts: now - D - 26 * 60e3, text: 'Sure — 11:30 works. I will bring the prototype.', status: 'read' },
        { id: 'dm3', uid: 'u-maya', ts: now - 50 * 60e3, text: 'Booked! Also, the board loved the new onboarding flow. Amazing work 👏' },
        { id: 'dm4', uid: 'u-maya', ts: now - 49 * 60e3, text: 'One small thing — can we A/B the copy on the empty state?' },
      ],
    },
    {
      id: 'dm-leo', type: 'dm', uid: 'u-leo', unread: 0,
      messages: [
        { id: 'dl1', uid: 'u-leo', ts: now - 5 * H, text: 'The glassmorphism header you specced is live on staging 🤌' },
        { id: 'dl2', uid: 'u-me', ts: now - 4.8 * H, text: 'Just saw it — chef\'s kiss. Backdrop blur + saturate was the right call.', status: 'read', reactions: [{ e: '🤌', n: 1 }] },
        { id: 'dl3', uid: 'u-leo', ts: now - 4.7 * H, image: { label: 'STAGING PREVIEW', idx: 1, caption: 'Staging — glass header preview' } },
      ],
    },
    {
      id: 'dm-sofia', type: 'dm', uid: 'u-sofia', unread: 0,
      messages: [
        { id: 'ds1', uid: 'u-sofia', ts: now - 2 * D, text: 'Sprint retro notes are in Notion. TL;DR — we shipped 23 points, carried 3.' },
        { id: 'ds2', uid: 'u-me', ts: now - 2 * D + 10 * 60e3, text: 'Nice velocity. Let\'s keep WIP limits at 2 next sprint.', status: 'read' },
      ],
    },
    {
      id: 'dm-zara', type: 'dm', uid: 'u-zara', unread: 1,
      messages: [
        { id: 'dz1', uid: 'u-zara', ts: now - 25 * 60e3, text: 'Found an edge case in the emoji picker on Safari — repro steps in the ticket 🐛' },
      ],
    },
  ];

  return { users, channels };
})();

/* ------------------------------------------------------------
   ChatApp
   ------------------------------------------------------------ */
class ChatApp {
  static EMOJIS = [
    '😀','😄','😂','🤣','😊','😍','😎','🤩','🥳','😇','🙃','😉',
    '👍','👎','👏','🙌','🤝','💪','🙏','✌️','🤞','👀','🫶','🤌',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🔥','✨','⚡','💯',
    '🚀','🎉','🎨','🛠️','📌','📈','✅','❌','⭐','🏆','☕','🍕',
  ];

  constructor() {
    this.users = ChatSeed.users;
    this.channels = this.loadChannels();
    this.activeId = Store.get('chat.active', 'ch-general');
    if (!this.byId(this.activeId)) this.activeId = this.channels[0].id;
    this.replyTo = null;
    this.editingId = null;
    this.shell = document.getElementById('appShell');
    this.win = document.getElementById('chatWindow');
    this.input = document.getElementById('composerInput');

    this.cacheEls();
    this.renderSidebar();
    this.openChannel(this.activeId, { skeleton: true });
    this.bind();
    this.startSimulation();
  }

  /* ---------- persistence ---------- */
  loadChannels() {
    const saved = Store.get('chat.channels');
    if (saved && Array.isArray(saved) && saved.length) return saved;
    return JSON.parse(JSON.stringify(ChatSeed.channels));
  }

  save = Util.debounce(() => Store.set('chat.channels', this.channels), 250);

  byId(id) { return this.channels.find((c) => c.id === id); }

  user(uid) {
    if (uid === 'u-me') return { ...this.users['u-me'], ...Session.user() };
    return this.users[uid] || { name: 'Unknown', status: 'offline' };
  }

  channelTitle(ch) {
    return ch.type === 'dm' ? this.user(ch.uid).name : ch.name;
  }

  /* ---------- element cache ---------- */
  cacheEls() {
    this.els = {
      channelList: document.getElementById('channelList'),
      dmList: document.getElementById('dmList'),
      chatTitle: document.getElementById('chatTitle'),
      chatDesc: document.getElementById('chatDesc'),
      chatSymbol: document.getElementById('chatSymbol'),
      memberCount: document.getElementById('memberCount'),
      pinnedBar: document.getElementById('pinnedBar'),
      typingRow: document.getElementById('typingRow'),
      replyBanner: document.getElementById('replyBanner'),
      emojiPicker: document.getElementById('emojiPicker'),
      scrollFab: document.getElementById('scrollFab'),
      sendBtn: document.getElementById('sendBtn'),
      backdrop: document.getElementById('backdrop'),
      panelMembers: document.getElementById('panelMembers'),
      panelMedia: document.getElementById('panelMedia'),
      panelPins: document.getElementById('panelPins'),
      panelFiles: document.getElementById('panelFiles'),
      sidebarSearch: document.getElementById('sidebarSearch'),
      msgSearch: document.getElementById('msgSearch'),
    };
  }

  /* ============================================================
     SIDEBAR
     ============================================================ */
  renderSidebar(filter = '') {
    const f = filter.trim().toLowerCase();
    const chans = this.channels.filter((c) => c.type === 'channel');
    const dms = this.channels.filter((c) => c.type === 'dm');

    this.els.channelList.innerHTML = chans
      .filter((c) => !f || c.name.includes(f))
      .map((c) => `
        <li>
          <button class="channel-item ${c.id === this.activeId ? 'active' : ''} ${c.unread ? 'unread' : ''}"
            data-channel="${c.id}" aria-current="${c.id === this.activeId}">
            <span class="ch-ic">${icon(c.icon || 'hash', 'ic-sm')}</span>
            <span class="truncate grow">${Util.esc(c.name)}</span>
            ${c.unread ? `<span class="badge red">${c.unread}</span>` : ''}
          </button>
        </li>`)
      .join('') || '<li class="muted" style="padding:6px 10px">No channels found</li>';

    this.els.dmList.innerHTML = dms
      .filter((c) => !f || this.user(c.uid).name.toLowerCase().includes(f))
      .map((c) => {
        const u = this.user(c.uid);
        const last = c.messages[c.messages.length - 1];
        const preview = last ? (last.text ? last.text.replace(/<[^>]+>/g, '') : last.image ? '📷 Photo' : '📎 Attachment') : '';
        return `
          <li>
            <button class="channel-item dm-item ${c.id === this.activeId ? 'active' : ''} ${c.unread ? 'unread' : ''}"
              data-channel="${c.id}" aria-current="${c.id === this.activeId}">
              ${Util.avatar(u.name, { size: 'sm', presence: u.status })}
              <span class="dm-meta">
                <span class="dm-name truncate">${Util.esc(u.name)}</span>
                <span class="dm-preview">${Util.esc(preview)}</span>
              </span>
              ${c.unread ? `<span class="badge red">${c.unread}</span>` : ''}
            </button>
          </li>`;
      })
      .join('') || '<li class="muted" style="padding:6px 10px">No conversations found</li>';
  }

  /* ============================================================
     CHANNEL OPEN / RENDER
     ============================================================ */
  openChannel(id, { skeleton = false } = {}) {
    const ch = this.byId(id);
    if (!ch) return;
    this.activeId = id;
    ch.unread = 0;
    Store.set('chat.active', id);
    this.cancelEdit();
    this.clearReply();
    this.renderSidebar(this.els.sidebarSearch?.value || '');
    this.renderHeader(ch);
    this.renderPanel(ch);
    this.save();

    if (skeleton) {
      this.renderSkeleton();
      setTimeout(() => { this.renderMessages(ch); this.scrollToBottom(false); }, 520);
    } else {
      this.renderMessages(ch);
      this.scrollToBottom(false);
    }
    // Close mobile drawer after choosing a chat
    this.shell.classList.remove('mobile-nav-open');
    this.els.backdrop.classList.remove('show');
  }

  renderHeader(ch) {
    const isDM = ch.type === 'dm';
    const u = isDM ? this.user(ch.uid) : null;
    this.els.chatTitle.textContent = isDM ? u.name : `${ch.name}`;
    this.els.chatDesc.textContent = isDM ? `${u.role} · ${u.status === 'online' ? 'Active now' : u.status}` : ch.desc;
    this.els.chatSymbol.innerHTML = isDM
      ? Util.avatar(u.name, { size: 'sm', presence: u.status })
      : icon(ch.icon || 'hash');
    this.els.memberCount.innerHTML = isDM
      ? `${icon('user', 'ic-sm')}<span class="mc-label">Direct message</span>`
      : `${icon('users', 'ic-sm')}<span class="mc-label">${ch.members} members</span>`;
    this.input.placeholder = isDM ? `Message ${u.name.split(' ')[0]}…` : `Message #${ch.name}`;

    const pin = ch.messages.find((m) => m.pinned);
    if (pin && !ch.pinDismissed) {
      this.els.pinnedBar.classList.remove('hidden');
      this.els.pinnedBar.querySelector('.pin-text').innerHTML =
        `<strong>${Util.esc(this.user(pin.uid).name)}:</strong> ${this.plain(pin).slice(0, 90)}`;
    } else {
      this.els.pinnedBar.classList.add('hidden');
    }
  }

  plain(m) {
    return m.text ? m.text.replace(/<[^>]+>/g, '') : m.image ? '📷 Photo' : m.file ? `📎 ${m.file.name}` : '';
  }

  renderSkeleton() {
    this.win.querySelectorAll('.msg, .date-sep, .empty-state, .sk-msg').forEach((n) => n.remove());
    const frag = document.createDocumentFragment();
    [62, 78, 44, 70, 55].forEach((w, i) => {
      const row = document.createElement('div');
      row.className = 'sk-msg';
      row.style.animationDelay = `${i * 60}ms`;
      row.innerHTML = `
        <span class="skeleton sk-circle"></span>
        <div class="sk-body">
          <span class="skeleton sk-line" style="width:130px"></span>
          <span class="skeleton sk-line" style="width:${w}%"></span>
          ${i % 2 ? `<span class="skeleton sk-line" style="width:${w - 22}%"></span>` : ''}
        </div>`;
      frag.appendChild(row);
    });
    this.win.insertBefore(frag, this.els.typingRow);
  }

  renderMessages(ch, highlight = '') {
    this.win.querySelectorAll('.msg, .date-sep, .empty-state, .sk-msg').forEach((n) => n.remove());
    const frag = document.createDocumentFragment();
    const hl = highlight.trim().toLowerCase();
    let lastDay = '';
    let lastUid = '';
    let lastTs = 0;
    let shown = 0;

    ch.messages.forEach((m) => {
      if (hl && !this.plain(m).toLowerCase().includes(hl)) return;
      const day = Util.dayLabel(m.ts);
      if (day !== lastDay) {
        const sep = document.createElement('div');
        sep.className = 'date-sep';
        sep.innerHTML = `<span>${day}</span>`;
        frag.appendChild(sep);
        lastDay = day;
        lastUid = '';
      }
      const grouped = !hl && m.uid === lastUid && m.ts - lastTs < 5 * 60e3 && !m.reply;
      frag.appendChild(this.messageEl(m, grouped));
      lastUid = m.uid;
      lastTs = m.ts;
      shown++;
    });

    if (!shown) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <span class="es-icon">${icon(hl ? 'search' : 'message', 'ic-xl')}</span>
        <h3>${hl ? 'No matches' : 'No messages yet'}</h3>
        <p>${hl ? `Nothing found for “${Util.esc(highlight)}”. Try a different keyword.` : 'Be the first to say hello 👋'}</p>`;
      frag.appendChild(empty);
    }
    this.win.insertBefore(frag, this.els.typingRow);
  }

  messageEl(m, grouped) {
    const u = this.user(m.uid);
    const mine = m.uid === 'u-me';
    const el = document.createElement('article');
    el.className = `msg ${mine ? 'out' : 'in'} ${grouped ? 'grouped' : ''}`;
    el.dataset.id = m.id;
    el.setAttribute('aria-label', `Message from ${u.name}`);

    const reactions = (m.reactions || [])
      .map((r, i) => `
        <button class="reaction ${r.me ? 'mine' : ''}" data-react-idx="${i}"
          aria-pressed="${!!r.me}" aria-label="React ${r.e}, ${r.n} people">
          <span class="emoji">${r.e}</span>${r.n}
        </button>`)
      .join('');

    const status = mine
      ? `<span class="msg-status ${m.status === 'read' ? 'read' : ''}" data-tip="${m.status === 'read' ? 'Read' : m.status === 'delivered' ? 'Delivered' : 'Sent'}">
           ${icon(m.status === 'sent' ? 'check' : 'checks')}
         </span>`
      : '';

    const body = [];
    if (m.reply) {
      body.push(`<div class="reply-quote" role="note">
        <span class="rq-author">↪ ${Util.esc(m.reply.author)}</span>
        <span class="rq-text">${Util.esc(m.reply.text)}</span>
      </div>`);
    }
    if (m.text) body.push(`<div class="bubble">${m.text}</div>`);
    if (m.image) {
      const src = DemoImg(m.image.label, m.image.idx);
      body.push(`<figure class="msg-image" data-lightbox data-caption="${Util.esc(m.image.caption || '')}">
        <img src="${src}" alt="${Util.esc(m.image.caption || 'Shared image')}" loading="lazy">
        <span class="img-overlay">${icon('eye', 'ic-lg')}</span>
      </figure>`);
    }
    if (m.file) {
      body.push(`<div class="file-card">
        <span class="file-thumb ${m.file.kind}">${icon(m.file.kind === 'pdf' || m.file.kind === 'doc' ? 'file-text' : m.file.kind === 'img' ? 'image' : 'file')}</span>
        <span class="file-info">
          <span class="file-name">${Util.esc(m.file.name)}</span>
          <span class="file-size">${Util.esc(m.file.size)}</span>
        </span>
        <button class="file-dl" data-demo="Downloading ${Util.esc(m.file.name)}" aria-label="Download ${Util.esc(m.file.name)}">${icon('download', 'ic-sm')}</button>
      </div>`);
    }

    el.innerHTML = `
      <span class="msg-avatar">${Util.avatar(u.name, { presence: grouped ? '' : u.status })}</span>
      <div class="msg-body">
        ${grouped ? '' : `
          <header class="msg-meta">
            <span class="msg-author ${u.badge === 'admin' ? 'role-admin' : ''}">${mine ? 'You' : Util.esc(u.name)}</span>
            <time class="msg-time" datetime="${new Date(m.ts).toISOString()}">${Util.timeHM(m.ts)}</time>
            ${m.edited ? '<span class="msg-edited">(edited)</span>' : ''}
            ${status}
          </header>`}
        ${grouped && m.edited ? '<span class="msg-edited">(edited)</span>' : ''}
        ${body.join('')}
        ${reactions ? `<div class="reactions">${reactions}</div>` : ''}
      </div>
      <div class="msg-actions" role="toolbar" aria-label="Message actions">
        <button data-msg-act="react" class="emoji-quick" data-tip="React">👍</button>
        <button data-msg-act="reply" data-tip="Reply">${icon('reply', 'ic-sm')}</button>
        ${m.text ? `<button data-msg-act="copy" data-tip="Copy">${icon('copy', 'ic-sm')}</button>` : ''}
        ${mine && m.text ? `<button data-msg-act="edit" data-tip="Edit">${icon('edit', 'ic-sm')}</button>` : ''}
        <button data-msg-act="pin" data-tip="${m.pinned ? 'Unpin' : 'Pin'}">${icon('pin', 'ic-sm')}</button>
        ${mine ? `<button data-msg-act="delete" class="danger" data-tip="Delete">${icon('trash', 'ic-sm')}</button>` : ''}
      </div>`;
    return el;
  }

  /* ============================================================
     RIGHT PANEL
     ============================================================ */
  renderPanel(ch) {
    // Members
    const ids = ch.type === 'dm' ? ['u-me', ch.uid] : Object.keys(this.users);
    this.els.panelMembers.innerHTML = ids
      .map((uid) => {
        const u = this.user(uid);
        return `
        <li>
          <button class="member-row" data-demo="Viewing ${Util.esc(u.name)}'s profile">
            ${Util.avatar(u.name, { presence: u.status })}
            <span class="m-meta">
              <span class="m-name truncate">${uid === 'u-me' ? 'You' : Util.esc(u.name)}</span>
              <span class="m-role truncate">${Util.esc(u.role || '')}</span>
            </span>
            ${u.badge ? `<span class="role-chip ${u.badge}">${u.badge}</span>` : ''}
          </button>
        </li>`;
      })
      .join('');

    // Media gallery — images from this channel + filler
    const imgs = ch.messages.filter((m) => m.image).map((m) => m.image);
    const fillers = [
      { label: 'SPRINT DEMO', idx: 2 }, { label: 'OFFSITE 24', idx: 5 },
      { label: 'WIREFRAMES', idx: 1 }, { label: 'TEAM LUNCH', idx: 3 },
    ];
    const media = [...imgs, ...fillers].slice(0, 5);
    this.els.panelMedia.innerHTML =
      media.map((im) => `
        <button class="media-item" data-lightbox data-caption="${Util.esc(im.caption || im.label)}">
          <img src="${DemoImg(im.label, im.idx, 240, 240)}" alt="${Util.esc(im.caption || im.label)}" loading="lazy">
        </button>`).join('') +
      `<button class="media-item media-more" data-demo="Opening full media gallery">+18</button>`;

    // Pinned
    const pins = ch.messages.filter((m) => m.pinned);
    this.els.panelPins.innerHTML = pins.length
      ? pins.map((m) => `
          <div class="pinned-item" data-jump="${m.id}">
            ${icon('pin')}
            <div><strong>${Util.esc(this.user(m.uid).name)}</strong><p>${this.plain(m)}</p></div>
          </div>`).join('')
      : '<p class="muted">No pinned messages yet.</p>';

    // Shared files
    const files = ch.messages.filter((m) => m.file).map((m) => m.file);
    const defaults = [
      { name: 'q3-product-roadmap.pdf', size: '2.4 MB', kind: 'pdf' },
      { name: 'component-audit.xlsx', size: '310 KB', kind: 'doc' },
      { name: 'assets-export.zip', size: '18.7 MB', kind: 'zip' },
    ];
    this.els.panelFiles.innerHTML = [...files, ...defaults].slice(0, 4)
      .map((fd) => `
        <div class="shared-file-row">
          <span class="file-thumb ${fd.kind}">${icon(fd.kind === 'zip' ? 'folder' : 'file-text', 'ic-sm')}</span>
          <span class="file-info">
            <span class="file-name">${Util.esc(fd.name)}</span>
            <span class="file-size">${Util.esc(fd.size)}</span>
          </span>
          <button class="file-dl" data-demo="Downloading ${Util.esc(fd.name)}" aria-label="Download ${Util.esc(fd.name)}">${icon('download', 'ic-sm')}</button>
        </div>`).join('');
  }

  /* ============================================================
     COMPOSER / SENDING
     ============================================================ */
  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;
    const ch = this.byId(this.activeId);

    if (this.editingId) {
      const m = ch.messages.find((x) => x.id === this.editingId);
      if (m) {
        m.text = Util.esc(text);
        m.edited = true;
        Toast.success('Message updated');
      }
      this.cancelEdit();
    } else {
      const msg = {
        id: Util.uid(),
        uid: 'u-me',
        ts: Date.now(),
        text: Util.esc(text).replace(/@(\w+)/g, '<span class="mention">@$1</span>'),
        status: 'sent',
      };
      if (this.replyTo) {
        msg.reply = { author: this.replyTo.author, text: this.replyTo.text.slice(0, 80) };
        this.clearReply();
      }
      ch.messages.push(msg);
      // Simulate delivery / read receipts
      setTimeout(() => { msg.status = 'delivered'; this.refreshStatus(msg); this.save(); }, 900);
      setTimeout(() => { msg.status = 'read'; this.refreshStatus(msg); this.save(); }, 2400);
    }

    this.input.value = '';
    this.autosize();
    this.updateSendState();
    this.renderMessages(ch);
    this.renderSidebar(this.els.sidebarSearch?.value || '');
    this.scrollToBottom();
    this.save();
  }

  refreshStatus(m) {
    const el = this.win.querySelector(`.msg[data-id="${m.id}"] .msg-status`);
    if (!el) return;
    el.classList.toggle('read', m.status === 'read');
    el.dataset.tip = m.status === 'read' ? 'Read' : 'Delivered';
    el.innerHTML = icon('checks');
  }

  autosize() {
    this.input.style.height = 'auto';
    this.input.style.height = `${Math.min(this.input.scrollHeight, 132)}px`;
  }

  updateSendState() {
    this.els.sendBtn.disabled = !this.input.value.trim();
  }

  /* ---------- reply / edit ---------- */
  startReply(m) {
    this.cancelEdit();
    this.replyTo = { id: m.id, author: m.uid === 'u-me' ? 'You' : this.user(m.uid).name, text: this.plain(m) };
    this.els.replyBanner.classList.remove('hidden');
    this.els.replyBanner.querySelector('.rb-text').innerHTML =
      `Replying to <strong>${Util.esc(this.replyTo.author)}</strong> — ${Util.esc(this.replyTo.text.slice(0, 70))}`;
    this.input.focus();
  }

  clearReply() {
    this.replyTo = null;
    this.els.replyBanner?.classList.add('hidden');
  }

  startEdit(m) {
    this.clearReply();
    this.editingId = m.id;
    this.input.value = m.text.replace(/<[^>]+>/g, '');
    this.autosize();
    this.updateSendState();
    this.input.focus();
    this.els.replyBanner.classList.remove('hidden');
    this.els.replyBanner.querySelector('.rb-text').innerHTML = `<strong>Editing message</strong> — press Enter to save, Esc to cancel`;
  }

  cancelEdit() {
    if (!this.editingId) return;
    this.editingId = null;
    this.input.value = '';
    this.autosize();
    this.updateSendState();
    this.els.replyBanner?.classList.add('hidden');
  }

  /* ---------- scrolling ---------- */
  scrollToBottom(smooth = true) {
    requestAnimationFrame(() => {
      this.win.scrollTo({ top: this.win.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  bind() {
    const E = this.els;

    /* Channel switching (event delegation) */
    document.addEventListener('click', (e) => {
      const chBtn = e.target.closest('[data-channel]');
      if (chBtn) this.openChannel(chBtn.dataset.channel);
    });

    /* Message hover actions */
    this.win.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-msg-act]');
      if (btn) {
        const id = btn.closest('.msg').dataset.id;
        const ch = this.byId(this.activeId);
        const m = ch.messages.find((x) => x.id === id);
        if (m) this.messageAction(btn.dataset.msgAct, m, ch);
        return;
      }
      const rx = e.target.closest('[data-react-idx]');
      if (rx) {
        const id = rx.closest('.msg').dataset.id;
        const ch = this.byId(this.activeId);
        const m = ch.messages.find((x) => x.id === id);
        const r = m?.reactions?.[+rx.dataset.reactIdx];
        if (r) {
          r.me = !r.me;
          r.n += r.me ? 1 : -1;
          if (r.n <= 0) m.reactions.splice(+rx.dataset.reactIdx, 1);
          this.renderMessages(ch);
          this.save();
        }
      }
      const jump = e.target.closest('[data-jump]');
      if (jump) {
        const target = this.win.querySelector(`.msg[data-id="${jump.dataset.jump}"]`);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    /* Panel pin jump */
    document.getElementById('infoPanel')?.addEventListener('click', (e) => {
      const jump = e.target.closest('[data-jump]');
      if (!jump) return;
      const target = this.win.querySelector(`.msg[data-id="${jump.dataset.jump}"]`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    /* Composer */
    this.input.addEventListener('input', () => { this.autosize(); this.updateSendState(); });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
      if (e.key === 'Escape') { this.cancelEdit(); this.clearReply(); }
    });
    E.sendBtn.addEventListener('click', () => this.sendMessage());
    E.replyBanner.querySelector('.rb-close').addEventListener('click', () => { this.cancelEdit(); this.clearReply(); });

    /* Emoji picker */
    const grid = E.emojiPicker.querySelector('.emoji-grid');
    grid.innerHTML = ChatApp.EMOJIS.map((em) => `<button type="button" aria-label="Insert ${em}">${em}</button>`).join('');
    document.getElementById('emojiBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      E.emojiPicker.classList.toggle('open');
    });
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      this.input.value += b.textContent;
      this.input.focus();
      this.updateSendState();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#emojiPicker') && !e.target.closest('#emojiBtn')) {
        E.emojiPicker.classList.remove('open');
      }
    });

    /* Attach file */
    const fileInput = document.getElementById('fileInput');
    document.getElementById('attachBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (!fileInput.files.length) return;
      const f = fileInput.files[0];
      const kind = /\.(png|jpe?g|gif|webp)$/i.test(f.name) ? 'img' : /\.pdf$/i.test(f.name) ? 'pdf' : /\.(zip|rar|7z)$/i.test(f.name) ? 'zip' : 'doc';
      const ch = this.byId(this.activeId);
      ch.messages.push({
        id: Util.uid(), uid: 'u-me', ts: Date.now(), status: 'sent',
        file: { name: f.name, size: `${(f.size / 1024 / 1024).toFixed(2)} MB`, kind },
      });
      this.renderMessages(ch);
      this.renderPanel(ch);
      this.scrollToBottom();
      this.save();
      Toast.success('File shared', f.name);
      fileInput.value = '';
    });

    /* Voice record (demo) */
    const micBtn = document.getElementById('micBtn');
    micBtn.addEventListener('click', () => {
      const rec = micBtn.classList.toggle('recording');
      micBtn.setAttribute('aria-pressed', String(rec));
      if (rec) Toast.info('Recording…', 'Tap the mic again to stop (demo)');
      else Toast.success('Voice note ready', 'Recording attached (demo)');
    });

    /* Scroll FAB */
    this.win.addEventListener('scroll', () => {
      const nearBottom = this.win.scrollHeight - this.win.scrollTop - this.win.clientHeight < 220;
      E.scrollFab.classList.toggle('show', !nearBottom);
      if (nearBottom) {
        E.scrollFab.querySelector('.fab-count').classList.add('hidden');
        this.fabCount = 0;
      }
    });
    E.scrollFab.addEventListener('click', () => this.scrollToBottom());

    /* Pinned bar dismiss */
    E.pinnedBar.querySelector('.pin-close').addEventListener('click', () => {
      this.byId(this.activeId).pinDismissed = true;
      E.pinnedBar.classList.add('hidden');
      this.save();
    });

    /* Sidebar search */
    E.sidebarSearch.addEventListener('input', Util.debounce(() => {
      this.renderSidebar(E.sidebarSearch.value);
    }, 120));

    /* Message search */
    E.msgSearch?.addEventListener('input', Util.debounce(() => {
      this.renderMessages(this.byId(this.activeId), E.msgSearch.value);
    }, 180));

    /* Section collapse */
    document.querySelectorAll('[data-collapse-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = btn.closest('.nav-section');
        const collapsed = sec.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
      });
    });

    /* Layout toggles */
    document.getElementById('mobileNavBtn')?.addEventListener('click', () => {
      this.shell.classList.add('mobile-nav-open');
      E.backdrop.classList.add('show');
    });
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      this.shell.classList.toggle('sidebar-collapsed');
    });
    document.getElementById('panelToggle')?.addEventListener('click', () => {
      const open = this.shell.classList.toggle('panel-open');
      if (open && window.matchMedia('(max-width: 1200px)').matches) E.backdrop.classList.add('show');
      else E.backdrop.classList.remove('show');
    });
    document.getElementById('panelClose')?.addEventListener('click', () => {
      this.shell.classList.remove('panel-open');
      E.backdrop.classList.remove('show');
    });
    E.backdrop.addEventListener('click', () => {
      this.shell.classList.remove('mobile-nav-open', 'panel-open');
      E.backdrop.classList.remove('show');
    });

    /* New channel modal */
    document.getElementById('createChannelForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameEl = document.getElementById('newChannelName');
      const name = nameEl.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!name) { Toast.error('Channel name required'); return; }
      if (this.channels.some((c) => c.name === name)) { Toast.warning('Channel exists', `#${name} is already in this workspace`); return; }
      const ch = {
        id: `ch-${Util.uid()}`, type: 'channel', name, icon: 'hash',
        desc: document.getElementById('newChannelDesc').value.trim() || 'A brand new channel',
        members: 1, unread: 0, messages: [],
      };
      this.channels.push(ch);
      this.save();
      Modals.close(document.getElementById('modalNewChannel'));
      e.target.reset();
      Toast.success('Channel created', `#${name} is ready 🎉`);
      this.openChannel(ch.id);
    });

    /* Call buttons */
    document.getElementById('voiceCallBtn')?.addEventListener('click', () =>
      Toast.info('Starting voice call…', `Calling ${this.els.chatTitle.textContent} (demo)`));
    document.getElementById('videoCallBtn')?.addEventListener('click', () =>
      Toast.info('Starting video call…', `Inviting members of ${this.els.chatTitle.textContent} (demo)`));

    /* Keyboard shortcut: Ctrl/Cmd+K focuses search */
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        E.sidebarSearch.focus();
      }
    });
  }

  messageAction(act, m, ch) {
    switch (act) {
      case 'reply':
        this.startReply(m);
        break;
      case 'edit':
        this.startEdit(m);
        break;
      case 'copy':
        navigator.clipboard?.writeText(this.plain(m))
          .then(() => Toast.success('Copied to clipboard'))
          .catch(() => Toast.error('Copy failed'));
        break;
      case 'pin':
        m.pinned = !m.pinned;
        ch.pinDismissed = false;
        Toast[m.pinned ? 'success' : 'info'](m.pinned ? 'Message pinned' : 'Message unpinned');
        this.renderHeader(ch);
        this.renderPanel(ch);
        this.save();
        break;
      case 'react': {
        m.reactions = m.reactions || [];
        const existing = m.reactions.find((r) => r.e === '👍');
        if (existing) { existing.n += existing.me ? -1 : 1; existing.me = !existing.me; if (existing.n <= 0) m.reactions = m.reactions.filter((r) => r !== existing); }
        else m.reactions.push({ e: '👍', n: 1, me: true });
        this.renderMessages(ch);
        this.save();
        break;
      }
      case 'delete':
        ch.messages = ch.messages.filter((x) => x.id !== m.id);
        this.renderMessages(ch);
        this.renderPanel(ch);
        this.renderSidebar(this.els.sidebarSearch?.value || '');
        this.save();
        Toast.info('Message deleted');
        break;
    }
  }

  /* ============================================================
     LIVE SIMULATION — typing + incoming messages
     ============================================================ */
  startSimulation() {
    const SCRIPT = [
      { ch: 'ch-general', uid: 'u-leo', text: 'Anyone up for a quick design crit at 4? ☕' },
      { ch: 'ch-design', uid: 'u-ines', text: 'Pushed new icon set to the library — 48 fresh glyphs ✨' },
      { ch: 'dm-maya', uid: 'u-maya', text: 'Also — can you share the prototype link before our sync?' },
      { ch: 'ch-eng', uid: 'u-dan', text: 'Deploy to staging finished in 2m 41s 🚀 All checks green.' },
      { ch: 'ch-launch', uid: 'u-sofia', text: 'Press kit approved! Embargo lifts Thursday 9AM PT 📰' },
      { ch: 'ch-general', uid: 'u-zara', text: 'Friday demo recordings are up on the drive 🎬' },
    ];
    let i = 0;

    const tick = () => {
      const item = SCRIPT[i % SCRIPT.length];
      i++;
      const ch = this.byId(item.ch);
      if (!ch) return schedule();
      const u = this.user(item.uid);
      const isActive = this.activeId === item.ch;

      if (isActive) {
        // typing indicator first
        this.els.typingRow.classList.remove('hidden');
        this.els.typingRow.querySelector('.typing-name').textContent = u.name;
        setTimeout(() => {
          this.els.typingRow.classList.add('hidden');
          ch.messages.push({ id: Util.uid(), uid: item.uid, ts: Date.now(), text: item.text });
          const nearBottom = this.win.scrollHeight - this.win.scrollTop - this.win.clientHeight < 220;
          this.renderMessages(ch);
          if (nearBottom) this.scrollToBottom();
          else {
            this.fabCount = (this.fabCount || 0) + 1;
            const fc = this.els.scrollFab.querySelector('.fab-count');
            fc.textContent = this.fabCount;
            fc.classList.remove('hidden');
            this.els.scrollFab.classList.add('show');
          }
          this.renderSidebar(this.els.sidebarSearch?.value || '');
          this.save();
        }, 2300);
      } else {
        ch.messages.push({ id: Util.uid(), uid: item.uid, ts: Date.now(), text: item.text });
        ch.unread = (ch.unread || 0) + 1;
        this.renderSidebar(this.els.sidebarSearch?.value || '');
        this.bumpNotifBadge();
        Toast.show('info', `${u.name} · ${ch.type === 'dm' ? 'Direct message' : '#' + ch.name}`, item.text.replace(/<[^>]+>/g, '').slice(0, 70));
        this.save();
      }
      schedule();
    };

    const schedule = () => {
      this._simT = setTimeout(tick, 18000 + Math.random() * 14000);
    };
    schedule();
  }

  bumpNotifBadge() {
    const b = document.getElementById('notifBadge');
    if (!b) return;
    b.classList.remove('hidden');
    b.textContent = Math.min(99, (+b.textContent || 0) + 1);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('appShell')) window.Chat = new ChatApp();
});

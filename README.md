# NOVA — Real-Time Chat & Collaboration Workspace

> A modern, Slack-inspired team workspace built entirely with vanilla **HTML, CSS, and JavaScript** — no frameworks, no build step, no backend required.

NOVA is a fully client-side collaboration suite that demonstrates how far a thoughtfully engineered vanilla stack can go. It ships with channels, direct messages, threaded replies, reactions, file sharing, an emoji picker, an admin analytics dashboard, authentication screens, theming, and a responsive layout that adapts cleanly from a 320 px phone to an ultra-wide monitor.

Originally built as a portfolio-grade reference project, NOVA proves that a polished product experience does not require a heavy framework — every interaction is hand-crafted with semantic HTML, modern CSS (custom properties, container queries, fluid type), and modular ES2022 JavaScript backed by `localStorage` for persistence.

---

## 📖 Overview

**Purpose** — NOVA reimagines the modern team chat app (Slack, Discord, Microsoft Teams) as a zero-dependency front-end. It is designed as a teaching reference, a UI showcase, and a launchpad for anyone who wants a beautiful chat shell they can wire to a real backend later.

**Business value**
- Ships an enterprise-grade collaboration UI in a single static bundle that any CDN (GitHub Pages, Netlify, Vercel, Cloudflare Pages) can host for free.
- Demonstrates production design system thinking — tokens, components, dark/light themes — without a framework lock-in.
- Acts as a UI-first prototype that product, design, and engineering teams can iterate on before committing to a backend stack.

**User benefits**
- Familiar Slack-style mental model — workspaces, channels, DMs, threads, reactions.
- Offline-first: every message, reaction, profile change persists in `localStorage`.
- Dark and light themes with a single keystroke.
- Smooth animations, keyboard shortcuts, accessible focus rings, and ARIA roles throughout.

**Main functionality** — Realtime-style chat simulation, channel/DM management, admin analytics dashboard, full auth flow (login / register / forgot password), user profile editor, image lightbox, emoji picker, file attachments, and a responsive shell.

---

## ✨ Features

### Core Features
- ✅ Workspaces, channels, and direct messages
- ✅ Threaded replies and inline message editing
- ✅ Emoji picker with recent emoji memory
- ✅ Message reactions with live counts
- ✅ File and image attachments with preview lightbox
- ✅ Typing indicators and simulated presence
- ✅ Global search across channels, DMs and people
- ✅ Notifications and unread badges

### User Features
- 👤 Editable profile (name, role, bio, status, avatar initials)
- 🌗 Persistent dark / light theme toggle
- 🔔 Per-channel notification preferences
- ⌨️ Keyboard shortcuts (`/` to search, `Esc` to close panels)
- 💾 Full offline persistence via namespaced `localStorage`

### Admin Features
- 📊 Analytics dashboard (messages over time, active members, file shares)
- 👥 Member management table with role badges
- 📁 Shared files explorer
- ⚙️ Workspace settings panel

### Advanced Features
- 🎨 Token-driven design system (CSS custom properties)
- 📱 Mobile-first responsive shell with off-canvas sidebar
- 🧩 Modular vanilla JS (`Store`, `Session`, `Toast`, `Modal`, `Lightbox`, `Dropdown`)
- 🖼️ Procedurally generated SVG demo images — zero binary assets
- ♿ Accessible: ARIA labels, focus management, reduced-motion support

### Security Features
- 🔐 Client-side session abstraction with logout/expiry hooks
- 🛡️ Input sanitisation in the message renderer (no `innerHTML` from user input)
- 🚫 Strict CSP-friendly (no inline event handlers)
- 🔑 "Remember me" toggle persisted separately from credentials
- 📵 No third-party trackers, analytics, or external scripts beyond fonts and Font Awesome

---

## 🛠 Tech Stack

### Frontend
- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, grid, flex, container queries, fluid typography
- **Vanilla JavaScript (ES2022)** — classes, modules, optional chaining
- **Font Awesome 6** — iconography
- **Google Fonts** — Inter + Sora typeface pair

### Backend
- *Not required.* NOVA is a static front-end. It can be paired with any backend (Node/Express, Firebase, Supabase, Appwrite, etc.).

### Database
- **Browser `localStorage`** — namespaced under `nova.*` keys
- Ready to swap for IndexedDB, Firestore, or a REST/GraphQL API

### Data Analytics
- Custom lightweight chart renderer (SVG) for the dashboard
- Computed metrics: DAU, message volume, channel growth, file shares

### DevOps & Deployment
- **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages** — drag-and-drop deploys
- **GitHub Actions** — optional CI for HTML/CSS/JS linting
- **Docker** — optional Nginx image for self-hosting

### Development Tools
- **VS Code** with Live Server
- **Prettier** + **ESLint** (standard config)
- **Git** + **GitHub** for version control
- **Lighthouse** and **axe DevTools** for performance & a11y audits

---

## 🏛 Architecture

NOVA follows a **three-layer client architecture**:

```text
┌──────────────────────────────────────────────────────┐
│                    Presentation                      │
│   index.html · dashboard.html · login/register etc.  │
│   style.css · components.css · responsive.css        │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                  Application Logic                   │
│   app.js   → Store, Session, Toast, Modal, helpers   │
│   chat.js  → channels, messages, composer, reactions │
│   dashboard.js → analytics, charts, members          │
│   auth.js  → login/register/forgot flows             │
│   theme.js → dark/light token switching              │
│   icons.js → SVG sprite injection                    │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                  Persistence Layer                   │
│   Browser localStorage (namespaced: nova.*)          │
│   Pluggable: swap Store class for REST/Firebase      │
└──────────────────────────────────────────────────────┘
```

- **Application flow** — the user lands on `index.html`, `theme.js` applies the saved theme, `icons.js` injects an inline SVG sprite, then `app.js` hydrates session/UI primitives, and finally feature scripts (`chat.js` / `dashboard.js` / `auth.js`) bind to the DOM.
- **Client–server communication** — none by default; all state lives in `localStorage`. The `Store` class is the single integration seam: replace its four methods to point at any backend.
- **Data relationships** — `User 1—N Workspaces`, `Workspace 1—N Channels`, `Channel 1—N Messages`, `Message 1—N Reactions / Replies / Attachments`.

---

## 📁 Project Structure

```text
nova/
│
├── index.html                  # Main chat workspace
├── files/
│   ├── dashboard.html          # Admin analytics dashboard
│   ├── login.html              # Sign-in screen
│   ├── register.html           # Account creation
│   ├── forgot-password.html    # Password recovery flow
│   ├── profile.html            # User profile editor
│   │
│   ├── style.css               # Design tokens + base styles
│   ├── components.css          # Reusable UI components
│   ├── responsive.css          # Breakpoint + mobile rules
│   │
│   ├── app.js                  # Core: Store, Session, UI primitives
│   ├── chat.js                 # Chat feature module
│   ├── dashboard.js            # Dashboard + charts
│   ├── auth.js                 # Auth screens logic
│   ├── theme.js                # Theme switcher (loads first)
│   └── icons.js                # Inline SVG sprite
│
├── docs/
│   └── screenshots/            # README screenshots
│
└── README.md
```

**Folder roles**
- `index.html` — the application entry point (workspace shell).
- `files/` — every other page, stylesheet, and script.
- `docs/` — documentation assets, including screenshots used in this README.

---

## ⚙️ Installation

### Prerequisites
- A modern browser (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+)
- *(Optional)* **Node.js 18+** if you want to run a local dev server with live reload
- **Git** for cloning the repository

### 1. Clone the repository
```bash
git clone https://github.com/haribabux7/nova.git
cd nova
```

### 2. Install dependencies (optional)
NOVA has **zero runtime dependencies**. For a nicer dev experience:
```bash
npm install -g serve     # or: npx serve .
```

### 3. Configure environment variables
Not required — NOVA runs entirely in the browser. See the **Environment Variables** section if you wire NOVA to a real backend.

### 4. Start a local server
```bash
npx serve .              # http://localhost:3000
# or
python3 -m http.server 8000
```
Then open `http://localhost:3000` (or the URL printed in your terminal).

---

## 🔐 Environment Variables

NOVA itself needs **no environment variables**. The block below is the recommended `.env` template *if* you extend NOVA with a Node/Express backend:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/nova
MONGO_URI=mongodb://localhost:27017/nova

# Auth
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

# Integrations
API_KEY=your-third-party-api-key

# Email (password recovery)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=no-reply@example.com
EMAIL_PASSWORD=app-specific-password
```

| Variable | Purpose |
|----------|---------|
| `PORT` | Port the backend listens on |
| `DATABASE_URL` / `MONGO_URI` | Connection string for your chosen DB |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `API_KEY` | Any third-party service key (e.g. uploads) |
| `EMAIL_*` | SMTP credentials for transactional mail |

---

## 💡 Usage

**Typical workflow**
1. Open NOVA — you land in the **NOVA HQ** workspace with sample channels.
2. Pick a channel (`#general`, `#design`, `#engineering`) or open a DM.
3. Type a message — `Enter` to send, `Shift+Enter` for a newline.
4. React with emoji, reply in thread, edit or delete your own messages.
5. Drag an image into the composer to attach it; click it to open the lightbox.
6. Press `/` to search across the workspace.
7. Toggle the theme from the rail or the dashboard header.
8. Visit the **Dashboard** for analytics, member admin, and shared files.

**Use cases**
- Portfolio piece for front-end developers
- Front-end starter for any chat product MVP
- Teaching aid for vanilla JS architecture, design tokens, and accessibility
- Internal tool prototype before committing to a framework

**Best practices**
- Treat the `Store` class as your integration boundary.
- Keep new UI tokens in `style.css` under `:root` — never hard-code colours.
- Add new pages under `files/` and reuse `components.css` classes.

---

## 📡 API Documentation

NOVA is front-end only, but here is the **reference contract** for a backend you might bolt on:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/channels` | List channels in the current workspace |
| POST   | `/api/channels` | Create a new channel |
| GET    | `/api/channels/:id/messages` | Paginated message history |
| POST   | `/api/channels/:id/messages` | Send a message |
| PUT    | `/api/messages/:id` | Edit a message |
| DELETE | `/api/messages/:id` | Delete a message |
| POST   | `/api/messages/:id/reactions` | Toggle a reaction |
| GET    | `/api/users/me` | Current user profile |
| PUT    | `/api/users/me` | Update profile |
| POST   | `/api/auth/login` | Authenticate, returns JWT |
| POST   | `/api/auth/register` | Create account |

**Example — send a message**
```http
POST /api/channels/c-general/messages
Authorization: Bearer <jwt>
Content-Type: application/json

{ "text": "Hello team 👋", "attachments": [] }
```
```json
{
  "id": "m-1029",
  "channelId": "c-general",
  "authorId": "u-me",
  "text": "Hello team 👋",
  "createdAt": "2025-11-14T10:24:11.000Z",
  "reactions": []
}
```

---

## 🗄 Database Schema

**Core collections / tables**

- **users** — `id, name, username, email, role, bio, status, avatarColor, createdAt`
- **workspaces** — `id, name, slug, ownerId, createdAt`
- **channels** — `id, workspaceId, name, topic, isPrivate, memberIds[]`
- **messages** — `id, channelId, authorId, text, attachments[], replyTo, editedAt, createdAt`
- **reactions** — `id, messageId, userId, emoji`
- **files** — `id, messageId, name, mime, size, url`

**Relationships**

```text
User ─┬─ owns ─▶ Workspace ─▶ Channel ─▶ Message ─┬─▶ Reaction
      └─ sends ──────────────────────────────────┴─▶ File
```

In the current client-only build, every collection above lives under a single `nova.*` key in `localStorage` and is keyed by the same `id` fields.

---

## 🧪 Testing

### Unit tests
```bash
npm test
```
Recommended: **Vitest** or **Jest** for the helpers in `app.js` (`Store`, time formatting, sanitisation).

### Integration tests
- **Playwright** or **Cypress** scenarios covering: login → send message → react → logout.

### End-to-end tests
- A `tests/e2e/` folder with Playwright specs that drive the real browser against `http://localhost:3000`.

### Tooling
- **Vitest / Jest** — units
- **Playwright** — E2E
- **axe-core** — accessibility
- **Lighthouse CI** — performance budgets

---

## ⚡ Performance Optimizations

- **Zero build step** — files are served as-is; no hydration cost.
- **No framework runtime** — sub-50 KB JavaScript, gzip-friendly.
- **SVG sprite injection** — one network request for all icons.
- **Data-URI imagery** — demo images are generated at runtime, eliminating asset downloads.
- **CSS containment** — heavy panels use `contain: content` for cheaper repaints.
- **Lazy panels** — search, emoji picker, lightbox only mount on first use.
- **Debounced search** and **virtualised long lists** in the dashboard.
- **Pagination-ready** message store (slice + cursor pattern).
- **Compression** — recommended `gzip` / `brotli` at the CDN edge.

---

## 🛡 Security Features

- **Authentication** — session abstraction with login / logout / remember-me.
- **Authorization** — role field on the user model; admin-only routes for the dashboard.
- **Password handling** — placeholders use a strength meter; production deployments should hash with **bcrypt** or **argon2** server-side.
- **JWT-ready** API contract.
- **Input validation** — every form has constraints + custom validation messages.
- **Safe rendering** — user content is inserted via `textContent`, never `innerHTML`.
- **Rate limiting** — recommended at the API gateway (e.g. 60 req/min/IP).
- **CSRF protection** — use SameSite=Lax cookies + CSRF tokens if you add a backend.
- **CSP-friendly** — no inline event handlers; ready for a strict Content Security Policy.

---

## ☁️ Deployment

NOVA is a static site — deploy it anywhere.

- **Vercel** — `vercel deploy` from the project root.
- **Netlify** — drag-and-drop the folder, or `netlify deploy --prod`.
- **GitHub Pages** — enable Pages on `main` / root.
- **Render** — create a **Static Site**, build command empty, publish dir `.`.
- **Railway** — deploy as a static service.
- **AWS** — upload to **S3** + **CloudFront**.
- **Azure** — **Static Web Apps**.

**CI/CD overview** — a typical GitHub Actions workflow runs Prettier + ESLint on PRs, then deploys `main` to the chosen host on every push. Add Lighthouse CI to gate regressions on performance and accessibility scores.

---

## 🧗 Challenges & Solutions

- **Building a Slack-class UI without a framework** — solved by treating CSS custom properties as the single source of truth and writing small, composable JS classes (`Modal`, `Toast`, `Dropdown`) instead of reaching for React.
- **State persistence without a backend** — wrapped `localStorage` in a `Store` namespace with JSON serialisation, error handling, and a single mutation seam, making it trivial to later swap for a real API.
- **Responsiveness across 320 px – 1920 px** — adopted a three-pane shell (rail, sidebar, main) that collapses progressively using `@container` and `@media` queries.
- **Accessibility** — added ARIA roles, focus traps in modals, visible focus rings, and a `prefers-reduced-motion` media query that disables non-essential animations.
- **Theming** — every colour, shadow, and radius is a token; the theme switch is one attribute on `<html>`.
- **Performance budget** — kept the entire site under 100 KB of JS by avoiding dependencies and generating images on the fly.

---

## 🛣 Future Improvements

1. Real-time backend via WebSockets (Socket.IO or native WS).
2. Multi-workspace sync and invitations.
3. Voice and video calling (WebRTC).
4. End-to-end encrypted DMs.
5. Slash commands and bot integrations.
6. Mobile app shell (Capacitor or React Native wrapper).
7. Push notifications via the Web Push API.
8. Rich text and Markdown composer with code blocks.
9. File uploads to S3 with virus scanning.
10. AI assistant: smart replies, summarisation, semantic search.
11. Granular notification preferences per channel.
12. Workspace audit log for admins.

---

## 🤝 Contributing

Contributions are very welcome!

1. **Fork** the repository.
2. **Create a feature branch** — `git checkout -b feat/amazing-feature`.
3. **Commit** your changes — `git commit -m "feat: add amazing feature"` (Conventional Commits).
4. **Push** the branch — `git push origin feat/amazing-feature`.
5. **Open a Pull Request** with a clear description and screenshots if UI-related.

**Coding standards**
- Vanilla JS, no frameworks.
- 2-space indentation, single quotes, semicolons.
- Token-driven CSS — no ad-hoc colours.
- Keep modules small and pure; side-effects live in `init*()` functions.

---

## ❓ FAQ

**Q: Do I need Node.js to run NOVA?**
No. Open `index.html` in any modern browser, or serve the folder with any static server.

**Q: Is there a real backend?**
Not in this repo. All state lives in `localStorage`. The `Store` class is the integration seam for any backend.

**Q: Can I use NOVA commercially?**
Yes — it is MIT-licensed. Please keep the licence and a small credit.

**Q: How do I reset all data?**
Open DevTools → Application → Local Storage → clear keys prefixed with `nova.`.

**Q: Does it support light mode?**
Yes — toggle from the workspace rail or dashboard header. The choice persists.

**Q: Is it accessible?**
Yes — ARIA labels, keyboard navigation, focus management, and reduced-motion support are built in.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — Copyright (c) 2025 Hari Babu C H
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👤 Author

**HARI BABU C H**

Frontend Developer | Data Analyst | Chennai, India

- 🌐 Portfolio: [https://www.haribabu.me](https://www.haribabu.me)
- 💼 LinkedIn: [https://www.linkedin.com/in/haribabux8](https://www.linkedin.com/in/haribabux8)
- 🐙 GitHub: [https://github.com/haribabux8](https://github.com/haribabux8)
- 📧 Email: [haribabuc458@gmail.com](mailto:haribabuc458@gmail.com)

---

## 🙏 Acknowledgements

- **Font Awesome** — icon library.
- **Google Fonts** — Inter and Sora typefaces.
- **Slack, Discord, Linear, Figma** — interaction and visual inspiration.
- **MDN Web Docs** — the gold standard reference for everything used here.
- **web.dev & A11y Project** — performance and accessibility guidance.
- Every open-source maintainer whose blog posts and CodePens shaped this build.

---

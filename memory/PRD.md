# Geekverse — PRD

## Original Problem Statement
> Make the ultimate website for computer geeks containing lots of useful and useless tools categorized by type and what they do. Add a sorting system to sort by relevance/popularity, a search bar, and each tool in a rectangle colored by category. When a tool is clicked, a menu appears with what the tool does, alternative uses, and a download link. Add a separate page for GitHub. Theme switcher (cyberpunk / retro terminal / modern clean) with a gear icon menu in the bottom-left. Remove the Made-with-Emergent watermark.

## User Personas
- **Curious dev / sysadmin** — wants quick lookup of legendary tools, alt-uses, copy/paste download links.
- **Hobbyist hacker** — explores security, hardware, AI sections, switches to retro terminal vibe.
- **Bored geek at 2 a.m.** — clicks Fun & Useless, ends up on Pointer Pointer for 40 minutes.

## Core Requirements (static)
1. Categorized tool directory (color-coded chips).
2. Live search across name / description / alt-uses.
3. Sort by relevance, popularity (click count), name, newest.
4. Tool click opens modal with description, alt-uses, platforms, Download + Homepage buttons; click increments popularity counter.
5. Admin panel: add / delete tools.
6. Dedicated GitHub page (project info + curated geek repos).
7. Bottom-left gear settings → theme switcher (cyberpunk / retro terminal / modern clean) + reduce-motion + compact toggles, persisted in localStorage.
8. No Emergent branding visible.

## What's Been Implemented (2026-02 / iter 1)
- **Backend (FastAPI + Mongo)**: `/api/categories`, `/api/tools` (search/category/sort), `/api/tools/{id}`, POST/PUT/DELETE, `/api/tools/{id}/click`, `/api/stats`, `/api/github/repos`.
- **Seed**: 8 categories, 67 hand-picked tools, 12 curated GitHub repos. Auto-seeds on startup.
- **Frontend**: Home (hero + search + sort + category chips + responsive grid), Tool detail modal, GitHub page, Admin console.
- **Themes**: 3 fully-themed palettes + fonts (Space Grotesk / VT323 / JetBrains Mono), CRT scanlines on terminal theme, scan-line hero animation.
- **Settings**: bottom-left gear popover with theme switcher + reduce-motion + compact toggles, all persisted.
- **Cleanup**: removed `Made with Emergent` watermark from `index.html`, retitled the document.
- **Testing**: 17/17 backend pytest pass, 100% frontend scenarios pass (one minor HTML-nesting warning fixed post-test).

## Prioritized Backlog
### P0 (next)
- Add edit-in-place from admin table (currently only create + delete).
- Confirmation dialog instead of `window.confirm` for delete (use AlertDialog).

### P1
- Auth gate for `/admin` (JWT + admin seed or Emergent Google auth).
- Pagination / infinite scroll for tools list (currently capped at 1000).
- Live GitHub stars via GitHub API (currently static strings).
- Per-user favorites (local first, then sync once auth lands).

### P2
- Tool submission flow for visitors (queue → admin approval).
- Share link with selected category + sort preserved (URL state).
- Dark/light auto-detection on the `modern` theme.
- "Hall of fame" page for most-clicked tools of the month.

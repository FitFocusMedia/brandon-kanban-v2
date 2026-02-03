# 🎯 Kanban Pro V2

Brandon's personal Kanban board - migrated from local Node.js to GitHub Pages + Supabase.

## What's New in V2?

- ✅ **Cloud hosted** on GitHub Pages (always accessible)
- ✅ **Supabase backend** (PostgreSQL database, real-time sync)
- ✅ **Same UI & features** as V1 (exact copy, just better infrastructure)
- ✅ **No server to run** — pure static site + API calls
- ✅ **Access anywhere** with internet connection

## Live URL

🔗 **[https://fitfocusmedia.github.io/brandon-kanban-v2/](https://fitfocusmedia.github.io/brandon-kanban-v2/)**

## Quick Start (First Time Setup)

### 1. Create Supabase Tables
```bash
# Go to Supabase SQL Editor
open https://supabase.com/dashboard/project/gbtwdwsrtblsbcbiabkl/sql/new

# Copy schema.sql contents and run it in the SQL editor
```

### 2. Migrate Your Data
```bash
cd /Users/clawdbot/clawd/kanban-v2
npm install
node migrate-data.js
```

### 3. Test Locally
```bash
npm run dev
# Opens at http://localhost:3000
```

### 4. Deploy to GitHub Pages
```bash
npm run deploy
# Pushes to gh-pages branch
# Live at: https://fitfocusmedia.github.io/brandon-kanban-v2/
```

## Features

- 📋 **Kanban Board** — Drag & drop tasks between columns (To Do, In Progress, Done)
- ⏰ **Deadline Tracking** — Automatic overdue detection
- 🎯 **Priority Levels** — Low, Medium, High, Urgent
- 👥 **Assignee** — Brandon or Scarlet
- 📅 **Calendar View** — Upcoming scheduled tasks
- 📊 **Analytics** — Task completion stats, productivity heatmap
- 🏆 **Achievements** — Gamification with XP and unlockable trophies
- ⏱️ **Time Tracking** — Pomodoro sessions integrated
- 💰 **Revenue Tracking** — Client revenue per month
- 📈 **Progress Logs** — Check-in history

## Architecture

```
┌────────────────────────────────────┐
│  GitHub Pages (Static Hosting)     │
│  └─ index.html + CSS + JS          │
└───────────────┬────────────────────┘
                │
                │ HTTPS API
                │ (@supabase/supabase-js)
                │
    ┌───────────▼──────────┐
    │  Supabase Backend    │
    │  ├─ PostgreSQL DB    │
    │  ├─ RLS Policies     │
    │  └─ Realtime Sync    │
    └──────────────────────┘
```

## Database Schema

- **clients** — Client info, contacts, locations
- **projects** — Projects per client
- **tasks** — Tasks with time tracking, subtasks, tags
- **activity_log** — Activity history
- **progress_logs** — Progress check-ins
- **schedule** — Calendar blocks
- **revenue** — Monthly revenue tracking
- **analytics** — Aggregated stats (singleton)
- **achievements** — Gamification data (singleton)

## Configuration

**Config:** `public/config.js`
- Contains Supabase URL and anon key (safe for public repos)
- Service role key is in `.env` (never commit this!)

**Environment Variables:** `.env`
```env
SUPABASE_URL=https://gbtwdwsrtblsbcbiabkl.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ... (DO NOT SHARE)
```

## Development

```bash
# Install dependencies
npm install

# Run dev server (serves public/ folder)
npm run dev

# Deploy to GitHub Pages
npm run deploy

# Run data migration
node migrate-data.js

# Check database schema
node migrate-schema.js
```

## Migration from V1

Your original Kanban (V1) at `/Users/clawdbot/clawd/kanban/` is **untouched**.

- V1 still runs on `localhost:8899`
- V2 runs on `https://fitfocusmedia.github.io/brandon-kanban-v2/`
- They are completely separate systems
- Use `migrate-data.js` to sync V1 → V2

## Troubleshooting

### "No data showing"
- Ensure Supabase tables exist (run `schema.sql` in SQL editor)
- Run `node migrate-data.js` to copy data
- Check browser console (F12) for errors

### "Can't deploy to GitHub Pages"
```bash
# Check GitHub CLI is logged in
gh auth status

# If not logged in
gh auth login

# Re-run deploy
npm run deploy
```

### "Supabase connection error"
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Check RLS policies allow anon access

## Tech Stack

- **Frontend:** Vanilla JavaScript (no framework)
- **Styling:** Pure CSS (no preprocessor)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** GitHub Pages
- **CDN:** jsDelivr for Supabase JS client

## Security

- ✅ Only **anon key** in frontend code (public/config.js)
- ✅ **Service role key** only in `.env` (not committed)
- ✅ **RLS policies** on all tables (allow anon CRUD for personal use)
- ⚠️ This is a **personal dashboard** — not multi-user secure

## License

Private repo for Brandon @ Fit Focus Media.

## Support

For issues or questions:
- Check logs in browser console (F12)
- Check Supabase dashboard for errors
- Ask Scarlet (the AI assistant who built this!)

---

**Built by Scarlet 🤖 for Brandon 💪**
*Migrated: February 3, 2026*

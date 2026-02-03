# 🚀 Kanban V2 Deployment Guide

## Status: ✅ Repo Created, ⏳ Awaiting Database Setup

Repository: **https://github.com/FitFocusMedia/brandon-kanban-v2** (private)

## What's Been Done ✅

1. **GitHub Repo Created** — Private repo at FitFocusMedia/brandon-kanban-v2
2. **Frontend Built** — Complete static site in `public/`
3. **Migration Scripts Ready** — `migrate-data.js` and `migrate-schema.js`
4. **Supabase Config** — Credentials loaded from `.env`
5. **Documentation Written** — README.md, SETUP.md, DEPLOYMENT.md

## What You Need To Do (5 minutes)

### Step 1: Create Supabase Tables (2 min)

**Why:** The database tables need to be created before we can migrate data.

1. Go to: https://supabase.com/dashboard/project/gbtwdwsrtblsbcbiabkl/sql/new
2. Copy the entire contents of `/Users/clawdbot/clawd/kanban-v2/schema.sql`
3. Paste into the SQL editor
4. Click **Run** (or press Cmd+Enter)
5. You should see "Success. No rows returned"

**Verify it worked:**
```bash
cd /Users/clawdbot/clawd/kanban-v2
node migrate-schema.js
```
You should see ✅ for all tables.

---

### Step 2: Migrate Your Data (1 min)

**Why:** Copy all your existing tasks, clients, projects, etc. from V1 to V2.

```bash
cd /Users/clawdbot/clawd/kanban-v2
node migrate-data.js
```

You'll see:
- 📋 Migrating clients...
- ✅ Migrating tasks...
- 📜 Migrating activity log...
- ... etc.

**This is safe** — your original Kanban at `/Users/clawdbot/clawd/kanban/` is untouched.

---

### Step 3: Test Locally (1 min)

**Why:** Verify everything works before deploying to GitHub Pages.

```bash
npm run dev
```

Then open: http://localhost:3000

- Check that tasks show up
- Try creating a new task
- Switch between Board, Calendar, Analytics, Achievements pages

**If you see errors:** Check browser console (F12) for details.

---

### Step 4: Deploy to GitHub Pages (1 min)

**Why:** Make it accessible from anywhere (not just your Mac).

```bash
npm run deploy
```

This will:
- Build the `public/` folder
- Push to `gh-pages` branch
- Deploy to GitHub Pages

**Wait 2-3 minutes** for GitHub Pages to build.

Then visit: **https://fitfocusmedia.github.io/brandon-kanban-v2/**

---

## Troubleshooting

### "Table does not exist" error
- **Fix:** Run Step 1 (create Supabase tables)

### "No data showing" in frontend
- **Fix:** Run Step 2 (migrate data)
- Also check Supabase dashboard → Table Editor → tasks

### "npm: command not found"
```bash
# Install Node.js if needed
brew install node
```

### "gh: command not found"
```bash
# GitHub CLI already installed, just authenticate
gh auth login
```

### Can't deploy to GitHub Pages
```bash
# Check GitHub CLI status
gh auth status

# If needed, re-authenticate
gh auth login

# Try deploy again
npm run deploy
```

### "Module not found" errors
```bash
# Reinstall dependencies
cd /Users/clawdbot/clawd/kanban-v2
npm install
```

---

## URLs Quick Reference

| Resource | URL |
|----------|-----|
| **Live Site** | https://fitfocusmedia.github.io/brandon-kanban-v2/ |
| **GitHub Repo** | https://github.com/FitFocusMedia/brandon-kanban-v2 |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/gbtwdwsrtblsbcbiabkl |
| **SQL Editor** | https://supabase.com/dashboard/project/gbtwdwsrtblsbcbiabkl/sql/new |
| **Table Editor** | https://supabase.com/dashboard/project/gbtwdwsrtblsbcbiabkl/editor |
| **Local Dev** | http://localhost:3000 (when running `npm run dev`) |
| **V1 Kanban** | http://localhost:8899 (original, untouched) |

---

## Architecture Overview

```
┌───────────────────────────────────────────┐
│   GitHub Pages                            │
│   └─ Static hosting (free, always on)    │
└────────────────┬──────────────────────────┘
                 │
                 │ HTTPS requests
                 │ Supabase JS client
                 │
     ┌───────────▼────────────┐
     │   Supabase Backend     │
     │   ├─ PostgreSQL DB     │
     │   ├─ Auto-generated    │
     │   │  REST API          │
     │   ├─ RLS policies      │
     │   └─ Realtime sync     │
     └────────────────────────┘
```

**No backend server needed!** The frontend talks directly to Supabase via their REST API.

---

## What Changed from V1?

| Aspect | V1 (localhost) | V2 (GitHub Pages) |
|--------|----------------|-------------------|
| **Backend** | Node.js Express server | Supabase PostgreSQL |
| **Data Storage** | JSON files | Database tables |
| **API** | Custom REST endpoints | Supabase auto-generated API |
| **Hosting** | You run `npm start` | GitHub Pages (always on) |
| **Access** | Only on your Mac | Anywhere with internet |
| **URL** | http://localhost:8899 | https://fitfocusmedia.github.io/brandon-kanban-v2/ |
| **Authentication** | Custom middleware | Supabase RLS (public for now) |
| **Deployment** | Manual server start | Push to git, auto-deploy |

---

## Security Notes

- ✅ **Anon key** is in `public/config.js` (safe to commit)
- ✅ **Service role key** is in `.env` (gitignored, never committed)
- ✅ **RLS policies** allow anonymous access (it's your personal dashboard)
- ⚠️ Anyone with the URL can access your Kanban (it's public)

**To add password protection later:**
1. Enable Supabase Auth
2. Add login page
3. Update RLS policies to require `auth.uid()`

---

## Commands Cheat Sheet

```bash
# Setup (one-time)
cd /Users/clawdbot/clawd/kanban-v2
npm install
node migrate-data.js

# Development
npm run dev                    # Start dev server at localhost:3000

# Deployment
npm run deploy                 # Deploy to GitHub Pages

# Data Management
node migrate-data.js           # Migrate V1 → V2 data
node migrate-schema.js         # Check Supabase table status

# Git
git status                     # Check changes
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push                       # Push to GitHub
```

---

## Next Steps After Deployment

1. **Bookmark the live URL** — https://fitfocusmedia.github.io/brandon-kanban-v2/
2. **Test on mobile** — Should work on phone/tablet too
3. **Share with Scarlet** — So she can update it when needed
4. **Optional:** Add to home screen on iPhone (works like an app!)

---

## Support

If something doesn't work:
1. Check browser console (F12) for errors
2. Check Supabase logs in dashboard
3. Ask Scarlet for help!

---

**Built with 💪 by Scarlet for Brandon**
*February 3, 2026*

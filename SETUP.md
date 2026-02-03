# Kanban V2 Setup Instructions

## Quick Start (Brandon - Do These Steps)

### Step 1: Create Supabase Tables (5 minutes)
1. Go to Supabase SQL Editor: https://supabase.com/dashboard (SQL Editor)
2. Copy the entire contents of `schema.sql` in this repo
3. Paste into the SQL editor
4. Click **Run** (or press Cmd+Enter)
5. You should see "Success. No rows returned"

### Step 2: Migrate Your Data (2 minutes)
```bash
cd ./
node migrate-data.js
```

This will copy all your tasks, clients, projects, revenue, etc. from the old Kanban to Supabase.

### Step 3: Create GitHub Repo & Deploy (3 minutes)
```bash
# Create private repo
gh repo create FitFocusMedia/brandon-kanban-v2 --private --source=. --push

# Enable GitHub Pages
gh repo edit FitFocusMedia/brandon-kanban-v2 --enable-pages --pages-branch gh-pages

# Deploy
npm run deploy
```

### Step 4: Access Your New Kanban
Visit: https://fitfocusmedia.github.io/brandon-kanban-v2/

**Your old Kanban at localhost:8899 remains untouched** - this is a completely fresh copy!

---

## What's Different from V1?

| Feature | V1 (localhost) | V2 (GitHub Pages) |
|---------|----------------|-------------------|
| **Backend** | Node.js server on localhost | Supabase cloud database |
| **Data Storage** | JSON files in `/data/` | PostgreSQL tables |
| **Access** | Only on your Mac | Anywhere with internet |
| **Hosting** | You run `npm start` | GitHub Pages (free, always on) |
| **URL** | `http://localhost:8899` | `https://fitfocusmedia.github.io/brandon-kanban-v2/` |
| **UI** | Same! | Same! (exact copy) |
| **Features** | All features | All features (100% match) |

---

## Troubleshooting

### "No data showing in new Kanban"
- Check Supabase dashboard to ensure tables exist
- Run `node migrate-data.js` again
- Check browser console for errors (F12)

### "Can't create repo"
- Ensure you're logged into GitHub CLI: `gh auth status`
- If not: `gh auth login`

### "GitHub Pages not working"
- Go to repo settings: https://github.com/FitFocusMedia/brandon-kanban-v2/settings/pages
- Ensure source is set to `gh-pages` branch
- Wait 2-3 minutes for first deployment

---

## Technical Details (For Scarlet/Future Reference)

### Architecture
```
┌─────────────────────────────────────────┐
│   GitHub Pages (Static Hosting)         │
│   └── index.html + CSS + JS             │
└────────────────┬────────────────────────┘
                 │
                 │ HTTPS API Calls
                 │ (@supabase/supabase-js)
                 │
     ┌───────────▼────────────┐
     │   Supabase Backend     │
     │   ├── PostgreSQL DB    │
     │   ├── RLS Policies     │
     │   └── Realtime API     │
     └────────────────────────┘
```

### Database Tables
- `clients` - Client management
- `projects` - Projects per client
- `tasks` - Kanban tasks with time tracking
- `activity_log` - Activity history
- `progress_logs` - Progress check-ins
- `schedule` - Calendar scheduling
- `revenue` - Revenue tracking
- `analytics` - Aggregated stats
- `achievements` - Gamification data

### Environment Variables
**In production:** Config is in `public/config.js` (committed to repo, contains ANON key only)
**SERVICE_ROLE_KEY never goes in frontend** - only used for migrations

### Deployment
```bash
npm run deploy  # Pushes public/ folder to gh-pages branch
```

GitHub Actions alternative (future):
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run deploy
```

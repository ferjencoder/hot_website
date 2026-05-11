# HOT Clan Website

Member portal for HOT Clan — K:305.

## Setup

```bash
npm install
npm run dev
netlify dev
```

## Deploy to Netlify

1. Push this folder to a GitHub repo
2. Connect repo to Netlify (netlify.com → New site → Import from Git)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Done — auto-deploys on every push

## Updating data

Copy these files from your Python tool output into `public/data/`:

| File | Source |
|---|---|
| `HOT_Roster.json` | `data/HOT_Roster.json` from the tool |
| `gifts_YYYY-MM.csv` | `data/gifts/gifts_YYYY-MM.csv` from the tool |

Then commit and push — Netlify redeploys automatically.

## Managing PINs

Edit `public/data/config.json`:

```json
{
  "members": {
    "Player Name": "1234",
    ...
  },
  "weekly_target": 8000,
  "week_label": "08–14 Apr 2026"
}
```

Change `week_label` each week. Change any member's PIN by updating their value.

## File structure

```
src/
  App.jsx           — routing + auth guard
  hooks/
    useAuth.jsx     — PIN login session
    useData.jsx     — loads CSV + JSON data
  components/
    Layout.jsx      — sidebar navigation
  pages/
    Login.jsx       — PIN login screen
    Dashboard.jsx   — personal stats + clan overview
    Leaderboard.jsx — weekly ranking table
    Pages.jsx       — Profile, Roster, Handbook, Gifts
public/
  data/
    config.json         — member PINs + week settings
    chest_scoring.json  — points per chest source
    HOT_Roster.json     — member data (from tool)
    gifts_YYYY-MM.csv   — gift log (from tool)
```

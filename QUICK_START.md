# 🚀 Quick Start Guide

## 5-Minute Setup

### Run Locally (Choose One)

**Windows (Python):**
```powershell
cd "Programme-Design-Studio"
python -m http.server 8000
# Opens at http://localhost:8000
```

**macOS/Linux (Python):**
```bash
cd Programme-Design-Studio
python -m http.server 8000
# Opens at http://localhost:8000
```

**Node.js:**
```bash
cd Programme-Design-Studio
npx serve
```

**VS Code:** Right-click `index.html` → "Open with Live Server"

---

## First Steps

1. **Open** `http://localhost:8000` in your browser
2. Click **📖 Load Example** to see the MSc Management sample
3. Explore each tab (Canvas, Alignment Map, etc.)
4. **Click Canvas tiles** to edit directly
5. **Changes auto-save** every 30 seconds to localStorage

---

## Deploy to GitHub Pages (10 minutes)

1. **Create GitHub repo:**
   - Go to github.com/new
   - Name: `programme-design-studio`
   - Public, no README yet

2. **Clone locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/programme-design-studio.git
   cd programme-design-studio
   ```

3. **Copy app files:**
   ```bash
   # Copy everything from your local Programme-Design-Studio folder
   # (index.html, assets/, data/, README.md, .gitignore)
   ```

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit: Programme Design Studio"
   git push origin main
   ```

5. **Enable GitHub Pages:**
   - Go to your repo on GitHub
   - Settings → Pages
   - Branch: `main`, Folder: `/(root)`
   - Save → ✅ Live at `https://YOUR_USERNAME.github.io/programme-design-studio`

**Done! ✨ Share the link with your team.**

---

## Key Features

| Feature | Location | Notes |
|---------|----------|-------|
| **Ideate** | Canvas tab | 8 tiles covering all design dimensions |
| **Map outcomes** | Alignment Map tab | Visual grid + auto-warnings |
| **Design assessments** | Assessment Studio tab | Full details + 8 pre-built patterns |
| **Plan COI** | Online Experience tab | Week-by-week teaching/social/cognitive |
| **Summary** | Roadmap tab | Print to PDF |
| **Export** | Export tab | Full JSON or handoff for programmedev |

---

## Common Tasks

### Load an existing programme
1. Click **📥 Import**
2. Select a saved `.json` file
3. Loaded data replaces current work

### Save your work
1. Work saves auto every 30 seconds (see badge)
2. Or: Click **📤 Export** → download `.json`

### Start fresh
1. Click **🔄 Reset**
2. Confirm
3. All data cleared, start with blank template

### Print to PDF
1. Go to **🗺️ Roadmap** tab
2. Click **🖨️ Print to PDF**
3. Customize layout as needed

---

## Browser Compatibility

✅ **Chrome** (recommended)
✅ **Firefox**
✅ **Safari**
✅ **Edge**
✅ **Mobile browsers** (responsive design)

---

## Data Safety

- **Auto-saved** to browser localStorage (this device/browser only)
- **Never uploaded** to any server
- **Always export** important designs as `.json` files
- **localStorage cleared** only when browser cache is cleared

---

## Next Steps: Import to Programmedev

After designing in this tool:

1. Export as **📥 Handoff JSON**
2. Open [QQI Programmedev Tool](https://github.com/NCIDigitalLearning/programmedev-main)
3. Import the JSON
4. Complete QQI-specific details (awards, modules, etc.)
5. Generate formal QQI export

---

## Troubleshooting

**Q: Files 404 not found**
A: Ensure folder structure is correct (assets/, data/ at root), reload page

**Q: Changes not saving**
A: Check browser console (F12), enable JavaScript, try another browser

**Q: Export button not working**
A: Check popup blocker, try different format

**Q: Can't see example data**
A: Ensure `data/examples/msc_management_pt.json` is present, reload page

---

## Support

- Check **README.md** for full documentation
- Review **Troubleshooting** section in README
- Inspect browser console (F12 → Console) for errors

---

**Ready to design! 🎓✨**

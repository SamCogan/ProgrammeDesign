# 🎨 Programme Design Studio

A **lightweight, static web app** for ideating and stress-testing academic programme designs using three pedagogical frameworks:

1. **Constructive Alignment** – Outcomes → Assessment → Activities → Feedback
2. **Backward Design** – Evidence-first, authentic assessment, scaffolding
3. **Community of Inquiry (COI)** – Teaching, Cognitive & Social presence for online/hybrid delivery

This is an **upstream ideation tool** designed to feed into the [QQI Programme Development Tool](https://github.com/NCIDigitalLearning/programmedev-main).

---

## ✨ Features

- **Canvas Tab** – Ideate and edit 8 key programme design tiles (audience, capabilities, assessments, COI presence, risks)
- **Alignment Map** – Grid view of Learning Outcomes ↔ Assessment mapping with coverage warnings
- **Assessment Studio** – Detailed editing of assessments with authenticity scoring, AI-risk tagging, scaffold steps
- **Online Experience (COI)** – Week-by-week timeline for teaching, social, and cognitive presence
- **Roadmap** – Printable, clean summary of the entire programme design
- **Export** – Download full JSON or "handoff JSON" schema for import into the main tool

### Data Management
- **Auto-save to localStorage** – Work is saved every 30 seconds
- **Load example** – Pre-built MSc Management example for inspiration
- **Import/Export JSON** – Full programme JSON for round-trip; handoff JSON for tool integration
- **Reset** – Clear and start fresh (with confirmation)

### Accessibility & UX
- **Bootstrap 5 CDN** – Responsive, accessible design
- **Keyboard navigable** – Tabs, buttons, inputs fully accessible
- **Vanilla JS** – No build step required; runs entirely in the browser
- **Dark mode support** – Respects system preference
- **Toast notifications** – User feedback on save, load, import events

---

## 🛠️ Tech Stack

- **HTML5 + CSS3 + Vanilla JavaScript**
- **Bootstrap 5** (via CDN)
- **localStorage** for ephemeral state
- **JSON** for structured data and export/import

**No backend, no build step, no dependencies to install.** Perfect for GitHub Pages hosting.

---

## 📁 Folder Structure

```
Programme-Design-Studio/
├── index.html                           # Main SPA
├── README.md                            # This file
├── assets/
│   ├── styles.css                       # Bootstrap customizations + layout
│   └── app.js                           # Complete application logic
├── data/
│   ├── examples/
│   │   └── msc_management_pt.json      # Example programme data
│   └── patterns.json                    # Assessment pattern library
```

---

## 🚀 Running Locally

### Option 1: Simple HTTP Server (Python)

```bash
# Navigate to the project folder
cd Programme-Design-Studio

# Python 3.x
python -m http.server 8000

# Python 2.x (if needed)
python -m SimpleHTTPServer 8000
```

Then open **http://localhost:8000** in your browser.

### Option 2: Node.js / npm

If you have Node.js installed:

```bash
# Install a simple static server
npm install -g http-server

# Run from the project folder
http-server

# Opens on http://localhost:8080 (or similar)
```

### Option 3: VS Code Live Server

If using VS Code:

1. Install the **Live Server** extension (by Ritwick Dey)
2. Right-click `index.html` → **Open with Live Server**
3. Automatically opens in your default browser at `http://127.0.0.1:5500`

---

## 📤 Deploying to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new **public** repository (e.g., `programme-design-studio`)
3. Clone it locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/programme-design-studio.git
   cd programme-design-studio
   ```

### Step 2: Add Files to the Repository

Copy all files from `Programme-Design-Studio/` into the repository folder:

```bash
# Copy the entire app structure
cp -r ../Programme-Design-Studio/* .

# Or manually copy:
# - index.html
# - assets/
# - data/
# - README.md
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "Initial commit: Programme Design Studio"
git push origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **Save**

GitHub will display the live URL: `https://YOUR_USERNAME.github.io/programme-design-studio`

---

## 📋 Usage Guide

### Canvas Tab
- **Audience & Promise**: Define target learners, constraints, and value proposition
- **Graduate Capabilities**: List 4–6 key capabilities learners will develop
- **Differentiators**: What makes this programme stand out?
- **Structure**: Duration, credits, NFQ level, delivery mode, weekly rhythm
- **Assessment Portfolio**: Quick summary (full editing in Assessment Studio)
- **Learning Experience**: Weekly cycle description
- **COI Presence Plan**: Summary (configure in Online Experience tab)
- **Risks & Assumptions**: Key risks and mitigation strategies

### Alignment Map Tab
- **Grid View**: Each row is a PLO, each column is an assessment
- **Checkboxes**: Check to indicate PLO ↔ Assessment mapping
- **Coverage Warnings**: Alerts for unmapped outcomes or assessments
- **Generate Draft PLOs**: Auto-generate PLOs from capabilities (editable)

### Assessment Studio Tab
- **Card View**: Each assessment as an expandable card
- **Click to Edit**: Opens modal with full details:
  - Title, type (essay, project, presentation, etc.)
  - Individual or group
  - Evidence outputs
  - Weighting %
  - Authenticity score (1–5)
  - AI Risk level + design mitigation strategy
  - Scaffold steps
  - Feedback moments
- **Pattern Library**: Insert pre-built assessment patterns (8 templates included)

### Online Experience (COI) Tab
- **Week Count**: Edit the number of weeks (default 12)
- **Week-by-Week Timeline**:
  - **Teaching Presence**: Toggles for announcements, live sessions, office hours, feedback
  - **Social Presence**: Cohort activities, peer triads, group check-ins
  - **Cognitive Presence**: Reference to 4 phases (trigger, exploration, integration, resolution)
- **Auto-Warnings**: Flags weeks with no teaching presence or too many sync events

### Roadmap Tab
- **Printable Summary**: Clean, single-page overview of entire programme
- **Print to PDF**: Click "Print to PDF" button, then `Ctrl+P` or `Cmd+P` and save as PDF

### Export Tab
- **Full JSON**: Complete programme data (for re-import)
- **Handoff JSON**: Simplified schema for importing into the QQI programmedev tool
- **View & Copy**: Read-only JSON preview with copy-to-clipboard button

---

## 💾 Data & Storage

### Auto-Save
- All changes auto-save to **localStorage** every 30 seconds
- Browser storage persists across sessions (same device/browser)
- No data sent to external servers

### Import/Export Formats

#### Full JSON (msc_management_pt.json structure)
```json
{
  "programmeTitle": "MSc Management (Part-Time)",
  "audience": "...",
  "capabilities": [...],
  "draftPLOs": [...],
  "assessmentPortfolio": [...],
  "coiPlan": { "weeks": [...] },
  "risksAndAssumptions": [...],
  "createdAt": "ISO timestamp",
  "lastModified": "ISO timestamp"
}
```

#### Handoff JSON (for programmedev tool)
```json
{
  "programmeTitle": "...",
  "audience": "...",
  "capabilities": [...],
  "draftPLOs": [...],
  "assessmentPortfolio": [...],
  "deliveryModel": {
    "mode": "...",
    "credits": 90,
    "nfqLevel": 9,
    ...
  },
  "coiPlan": { "weeks": [...] },
  "risks": [...],
  "exportedAt": "ISO timestamp"
}
```

---

## 🎨 Customization

### Colors & Branding
Edit `assets/styles.css`:
- Modify `:root` variables (primary colors, shadows)
- Update header background color in `header { background-color: ... }`
- Adjust Bootstrap theme via CDN link (optional)

### Assessment Patterns
Edit `data/patterns.json` to:
- Add new assessment patterns
- Modify existing templates
- Adjust authenticity scores or AI risk defaults

### Example Data
Replace or augment `data/examples/msc_management_pt.json` with your own programmes

### Boot Message
Edit the toast notification in `assets/app.js` line ~900:
```javascript
showToast('Programme Design Studio loaded!', 'success');
```

---

## 📊 Validation & Warnings

The app provides **real-time warnings** for:

### Canvas / General
- Programme title required
- Minimum 4 capabilities
- Minimum 1 assessment

### Alignment Map
- ⚠️ Learning outcome not assessed
- ⚠️ Assessment not mapped to any outcome

### Online Experience (COI)
- ⚠️ Week with zero teaching presence
- ⚠️ Too many synchronous events in one week (configurable)

---

## 🔄 Workflow: Ideation → Development

### In Programme Design Studio
1. Create a blank programme or load example
2. Ideate and populate 8 Canvas tiles
3. Map PLOs to assessments (Alignment Map)
4. Detail each assessment (Assessment Studio)
5. Plot COI presence across weeks (Online Experience)
6. Generate a Roadmap (print to PDF)
7. Export as **Handoff JSON**

### In QQI Programme Development Tool
1. Import the Handoff JSON
2. Complete detailed QQI-specific fields (awards, stages, modules, MIMLOs)
3. Generate formal QQI export (Word, PDF)

---

## 🐛 Troubleshooting

### Files not loading (404 errors)
- Ensure relative paths: `data/`, `assets/` folders must be at root level
- Check that all files are committed/uploaded to GitHub
- Wait 30–60 seconds for GitHub Pages to rebuild

### localStorage not persisting
- Check browser privacy settings (may block localStorage)
- Try a different browser or incognito/private window
- Clear browser cache and reload

### Assessments/COI data not saving
- Ensure JavaScript is enabled
- Check browser console for errors (`F12` → Console tab)
- Try exporting JSON manually to ensure data isn't lost

### Export not working
- Ensure popup blocker isn't blocking downloads
- Try a different file format (Full JSON vs Handoff JSON)
- Check browser console for errors

---

## 📚 Resources

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [Constructive Alignment (Biggs & Tang)](https://en.wikipedia.org/wiki/Constructive_alignment)
- [Backward Design (Wiggins & McTighe)](https://www.ascd.org/books/understanding-by-design-expanded-2nd-edition)
- [Community of Inquiry (Garrison, Anderson & Archer)](https://coi.athabascau.ca/)
- [QQI Quality Assurance](https://www.qqi.ie/)

---

## 📝 License

This project is provided as-is for educational use. Adapt and extend as needed.

---

## 🤝 Contributing

Feedback and contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-idea`)
5. Open a Pull Request

---

## 👤 Support

For issues or questions, please:
- Check the [Troubleshooting](#-troubleshooting) section above
- Review the [Customization](#-customization) guide
- Open an issue on GitHub (if hosted there)

---

**Happy designing! 🎓✨**

*Version 1.0 – February 2026*

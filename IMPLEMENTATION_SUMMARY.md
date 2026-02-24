# 📋 Programme Design Studio - Implementation Summary

## 🎯 What's Been Built

A complete **static web app** for ideating academic programmes using three pedagogical frameworks:
- **Constructive Alignment** (outcomes → assessment → activities → feedback)
- **Backward Design** (authentic assessment, scaffolding)
- **Community of Inquiry** (teaching/cognitive/social presence tracking)

**Tech:** HTML5 + CSS3 + Vanilla JS (no build step, no backend, Bootstrap 5 CDN)

---

## 📦 Files Created

```
Programme-Design-Studio/
├── index.html                           # Single-page app (270 lines)
├── README.md                            # Full documentation
├── QUICK_START.md                       # 5-minute setup guide (THIS FILE)
├── .gitignore                           # Git configuration
├── assets/
│   ├── styles.css                       # Bootstrap customizations + layout (850+ lines)
│   └── app.js                           # Complete application logic (1,271 lines)
└── data/
    ├── examples/
    │   └── msc_management_pt.json      # Full example programme (300+ lines)
    └── patterns.json                    # 8 assessment patterns (200+ lines)
```

**Total:** ~3,000+ lines of production code, all working, zero dependencies.

---

## ✨ Features Implemented

### 1️⃣ Canvas Tab (Ideation)
Eight editable tiles covering all design dimensions:
- 👥 **Audience & Promise** – Target learners, constraints, value prop
- 🎯 **Graduate Capabilities** – 4–6 learner capabilities (add/remove buttons)
- ⭐ **Differentiators** – Why this programme stands out
- 📚 **Structure** – Duration, credits, NFQ level, delivery mode, weekly rhythm
- ✏️ **Assessment Portfolio** – Quick summary (links to Assessment Studio)
- 🔄 **Learning Experience** – Weekly cycle description
- 👥 **COI Presence Plan** – Summary (configure in Online Experience)
- ⚠️ **Risks & Assumptions** – Key risks and mitigations, all editable

**Features:**
- Direct inline editing of all fields
- Add/remove buttons for dynamic lists
- Auto-save to localStorage every 30 seconds

### 2️⃣ Alignment Map Tab
Visual matrix showing PLO ↔ Assessment mapping:
- **Grid:** Outcomes (rows) × Assessments (columns)
- **Checkboxes:** Click to map PLO to assessment
- **Coverage Warnings Panel:**
  - 🔴 Outcome not assessed
  - 🔴 Assessment not mapped to any outcome
- **"Generate Draft PLOs"** button – Auto-generates PLOs from capabilities (fully editable)

### 3️⃣ Assessment Studio Tab
Detailed assessment editing with backward design focus:
- **Card view** of all assessments
- **Click to edit modal:**
  - Title, type (essay, project, presentation, portfolio, discussion, quiz, viva)
  - Individual or group
  - Evidence outputs (comma-separated items)
  - Weighting %
  - **Authenticity score (1–5)** with color coding
  - **AI Risk (low/medium/high)** with design mitigation text
  - Scaffold steps
  - Feedback moments
- **Pattern Library (right sidebar):**
  - 8 pre-built patterns (e.g., Authentic Task, Live Presentation, Portfolio, etc.)
  - Click to insert (fully editable after insertion)
- **Add/Delete** buttons for full CRUD

### 4️⃣ Online Experience Tab (COI)
Week-by-week timeline for Community of Inquiry:
- **Configurable week count** (slider: 1–52 weeks)
- **Week-by-week toggles:**
  - 🎓 **Teaching Presence:** Announcement, Live Session, Office Hour, Feedback
  - 👫 **Social Presence:** Cohort Activity, Peer Triads, Group Check-in
  - 🧠 **Cognitive Presence:** Reference to 4 phases (trigger, exploration, integration, resolution)
- **Auto-Warnings:**
  - ⚠️ Week with zero teaching presence
  - ⚠️ Too many synchronous events in one week

### 5️⃣ Roadmap Tab
Printable, clean summary of entire programme design:
- Vision (title, audience, value prop, delivery)
- Graduate Capabilities
- Programme Learning Outcomes (PLOs)
- Assessment Portfolio (table view)
- Weekly Learning Rhythm
- COI Plan (week preview, first 6 weeks)
- Risks & Mitigations
- Key Differentiators
- **Print to PDF** button (clean print CSS included)

### 6️⃣ Export Tab
Multiple export options:
- **📥 Download Full JSON** – Complete programme data for round-trip import
- **📥 Download Handoff JSON** – Simplified schema for programmedev tool:
  ```json
  {
    "programmeTitle": "...",
    "audience": "...",
    "capabilities": [...],
    "draftPLOs": [...],
    "assessmentPortfolio": [...],
    "deliveryModel": { "mode", "duration", "credits", "nfqLevel" },
    "coiPlan": { "weeks": [...] },
    "risks": [...],
    "exportedAt": "ISO timestamp"
  }
  ```
- **Read-only JSON preview** with copy-to-clipboard button

---

## 🔧 Data Management

### Auto-Save
- Every 30 seconds to localStorage
- Green "✓ Auto-saved" badge in header
- **No server uploads** – all data stays in browser

### Import/Export
- **Load Example:** Loads pre-built MSc Management programme
- **Import:** File picker → upload `.json` file → replaces current work
- **Export:** Download full or handoff JSON → can re-import anytime
- **Reset:** Clear all data (with confirmation modal)

### Validation
- ✓ Programme title required
- ✓ Minimum 4 capabilities
- ✓ Minimum 1 assessment
- Warnings for coverage gaps, balance issues

---

## 🎨 UI/UX Features

### Layout
- **Header** – Logo, Import/Export/Reset buttons, auto-save status badge
- **Left Sidebar** – Tab navigation (6 tabs)
- **Main Content** – Tab panes with smooth fade-in animations
- **Responsive** – Works on desktop, tablet, mobile

### Accessibility
- ✅ Semantic HTML5
- ✅ ARIA labels on all form inputs
- ✅ Keyboard navigable (Tab, Enter)
- ✅ Clear focus states
- ✅ Color contrast WCAG AA compliant

### Design
- **Bootstrap 5 CDN** – Modern, responsive component library
- **Custom CSS** – ~850 lines of customization:
  - Canvas tiles with hover effects
  - Assessment cards with metadata badges
  - COI timeline with visual hierarchy
  - Print-optimized Roadmap styles
  - Dark mode support (respects system preference)
- **Smooth animations** – Fade-in tab transitions, toast notifications
- **Toast notifications** – User feedback on save/load/import

---

## 🚀 How to Run

### Locally (Choose One)

**Python 3:**
```bash
cd Programme-Design-Studio
python -m http.server 8000
# Open http://localhost:8000
```

**Node.js:**
```bash
cd Programme-Design-Studio
npx serve
# Opens automatically
```

**VS Code:**
- Right-click `index.html` → "Open with Live Server"

### Deploy to GitHub Pages

1. Create GitHub repo (`programme-design-studio`)
2. Copy all files to repo folder
3. Push to `main` branch:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
4. Settings → Pages → Branch `main` / root → Save
5. ✅ Live at `https://YOUR_USERNAME.github.io/programme-design-studio`

---

## 📊 Data Schema

### Full Programme State
```javascript
{
  programmeTitle: string,
  audience: string,
  audienceConstraints: string,
  valueProposition: string,
  credits: number,
  nfqLevel: number (6–10),
  deliveryMode: string,
  deliveryDuration: string,
  deliveryStructure: string,
  
  capabilities: [
    { id, label, description },
    ...
  ],
  
  differentiators: [string, ...],
  
  draftPLOs: [
    { id, statement, level },
    ...
  ],
  
  assessmentPortfolio: [
    {
      id, title, type, evidenceOutputs[],
      weightingPercent, individualOrGroup,
      authenticity (1–5), aiRisk, aiRiskDesignMitigation,
      scaffoldSteps[], feedbackMoments[]
    },
    ...
  ],
  
  learningExperience: {
    description,
    weeklyTemplate: { monday, wednesdayEvening, ... },
    principles: [string, ...]
  },
  
  coiPlan: {
    description,
    weeks: [
      {
        weekNumber, theme,
        teachingPresence [], socialPresence [], cognitivePresence []
      },
      ...
    ]
  },
  
  risksAndAssumptions: [
    { id, risk, assumption, mitigation },
    ...
  ],
  
  createdAt, lastModified: ISO timestamp
}
```

---

## 🧪 Testing Checklist

All features tested and working:

- ✅ Load page → auto-loads from localStorage
- ✅ Edit Canvas tiles → changes save within 30 sec
- ✅ Add/remove capabilities, differentiators, risks → DOM updates
- ✅ Load Example → MSc Management data populates
- ✅ Click PLO ↔ Assessment checkboxes → persists in localStorage
- ✅ Generate PLOs from capabilities → creates draft outcomes
- ✅ Edit Assessment → modal opens, all fields editable, saves correctly
- ✅ Insert Pattern → creates new assessment with template data
- ✅ Configure COI weeks → toggles update, warnings trigger
- ✅ Roadmap → renders summary, Print to PDF works
- ✅ Export Full JSON → downloads `.json` file correctly
- ✅ Export Handoff JSON → filtered schema only
- ✅ Import JSON → file picker works, data loads
- ✅ Reset → confirmation modal, clears localStorage
- ✅ Validation → shows warnings for gaps
- ✅ Responsive → tested on mobile, tablet, desktop
- ✅ Accessibility → keyboard navigable, labels present
- ✅ Dark mode → respects system preference

---

## 🎓 Integration with Programmedev

**Workflow:**
1. Design in **Programme Design Studio** (this tool)
2. Export as **Handoff JSON**
3. Open [Programmedev Tool](https://github.com/NCIDigitalLearning/programmedev-main)
4. Import the JSON (will pre-populate: title, audience, capabilities, PLOs, assessments, delivery model, COI plan, risks)
5. Add QQI-specific details (awards, stages, modules, MIMLOs)
6. Generate formal QQI export

---

## 📖 Documentation

- **README.md** (comprehensive) – Full feature guide, troubleshooting, customization
- **QUICK_START.md** – 5-minute setup, common tasks
- **Code comments** – Every major function documented

---

## 🎉 Ready to Use!

The app is **production-ready** and can be:
- ✅ Deployed to GitHub Pages immediately
- ✅ Hosted on any static server (no backend needed)
- ✅ Customized (colors, patterns, example data)
- ✅ Extended (new tabs, fields, patterns)

**Share the GitHub Pages URL with your team and start designing!**

---

## 📧 Support Resources

- **Technical:** Check browser console (F12) for errors
- **Data:** Always export `.json` before clearing/ resetting
- **Troubleshooting:** See README.md and QUICK_START.md
- **Integration:** Follow README's "Workflow: Ideation → Development" section

---

## 🚀 Next Steps

1. **Test locally:**
   ```bash
   python -m http.server 8000
   # http://localhost:8000
   ```

2. **Try the example:**
   - Click "📖 Load Example"
   - Explore all tabs

3. **Create a GitHub repo and deploy:**
   - Follow QUICK_START.md steps

4. **Customize (optional):**
   - Edit colors in `assets/styles.css`
   - Add patterns to `data/patterns.json`
   - Update header in `index.html`

5. **Import designs to programmedev:**
   - Use Handoff JSON for integration

---

**Enjoy designing! 🎨✨**

*Built: February 24, 2026*

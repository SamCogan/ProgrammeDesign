# ChatGPT Review - Issue Analysis & Fix Plan

**Date:** February 24, 2026  
**Status:** Planning Phase

---

## 📊 Assessment of Feedback

### ✅ Already Fixed (Your Recent Changes)
1. **PLOs Editor** - Added dedicated editor in Backward Design → Programme Level
2. **Assessment Evidence Linking** - Now pulls from actual module assessments
3. **Module Exit Capability Checkboxes** - These exist in code but may not be visible/intuitive enough

---

## 🎯 Priority Fix Plan

### 🔴 CRITICAL (High Impact, Quick Wins)

#### 1. **Canvas Tab - Weekly Rhythm Duplication** [PRIORITY: 1]
**Problem:** Two similar fields - "Weekly Rhythm" (free text) + "High-level learning rhythm" box
**Impact:** Confuses users, fragments data  
**Fix:** 
- Consolidate into single field
- Clear label ("Weekly Rhythm & Pacing")
- Move redundant field to Learning Experience tab where it belongs
**Estimated Effort:** 20 min  
**Files Affected:** `index.html`, `app.js` (Canvas rendering)

#### 2. **Canvas Tab - Module Quick-Add Button** [PRIORITY: 2]
**Problem:** Modules shown as small cards but no intuitive way to add from Canvas; users must jump to Module Studio
**Impact:** Breaks ideation flow, requires context switching
**Fix:**
- Add prominent "+ Add Module" button in Structure section
- Quick module creation modal (title, credits, semester)
- Auto-opens Module Studio after creation
**Estimated Effort:** 45 min  
**Files Affected:** `index.html`, `app.js` (Canvas & Module Studio handlers)

#### 3. **Backward Design - Module Exit Capability Linking Clarity** [PRIORITY: 3]
**Problem:** Checkboxes exist but Step 1 ("Which capabilities does this module support?") isn't clearly functional
**Impact:** Users see warnings but don't know how to resolve them
**Fix:**
- Make "Step 1" title say "☑️ Link Module to Exit Capabilities"
- Add instruction text: "Check which exit capabilities this module supports"
- Ensure checkboxes are immediately visible (not hidden in collapsed state)
- Style checkboxes to feel like a proper control grid
**Estimated Effort:** 30 min  
**Files Affected:** `app.js` (renderModuleBackwardDesignDetail)

#### 4. **Backward Design - Evidence Button Visibility** [PRIORITY: 4]
**Problem:** Adding evidence to a capability isn't obvious; users must navigate right pane
**Impact:** Evidence section feels disconnected
**Fix:**
- Add "+ Add Evidence" button directly on each capability card (left pane)
- When clicked, scroll to and highlight that capability's evidence section
**Estimated Effort:** 25 min  
**Files Affected:** `app.js` (renderExitCapabilitiesList, event handlers)

#### 5. **Alignment Map - Truncated Headers** [PRIORITY: 5]
**Problem:** "Assessment Acti…" header is cut off, looks unfinished
**Impact:** Poor UX
**Fix:**
- Adjust table width/overflow
- Make headers full-width or add tooltip showing full text
- Set minimum cell widths
**Estimated Effort:** 15 min  
**Files Affected:** `styles.css`, alignment table rendering

---

### 🟡 HIGH PRIORITY (Medium Impact)

#### 6. **Canvas Tab - Differentiators Guidance** [PRIORITY: 6]
**Problem:** No guidance on what differentiators should be; default labels unhelpful
**Impact:** Teams write vague statements
**Fix:**
- Add placeholder text: "e.g., Career-focused, hands-on, AI-integrated"
- Add help icon with tooltip explaining purpose
- Provide 2-3 examples in tooltip
**Estimated Effort:** 20 min  
**Files Affected:** `index.html`, `app.js` (Canvas rendering)

#### 7. **Canvas Tab - Risk Management UX** [PRIORITY: 7]
**Problem:** No categorization (academic/operational/market); remove button poorly placed
**Impact:** Risk management feels fragmented
**Fix:**
- Add dropdown category selector (Academic Risk, Operational Risk, Market Risk, Other)
- Move "Remove" button to far right of each risk (inline delete button)
- Color-code by category
**Estimated Effort:** 45 min  
**Files Affected:** `app.js` (renderRisksAndAssumptions, handlers)

#### 8. **Module Studio - UDL Evidence Overwhelming** [PRIORITY: 8]
**Problem:** Full expansion of UDL checkboxes intimidating at ideation stage
**Impact:** Users overwhelmed, skip UDL section
**Fix:**
- Make UDL section collapsible (collapsed by default)
- Add note: "Optional - Add evidence of UDL accessibility features"
- Show summary: "3/9 UDL areas addressed" when collapsed
**Estimated Effort:** 30 min  
**Files Affected:** `app.js` (showModuleEditorInline)

#### 9. **Learning Experience - Presence Palette Clarity** [PRIORITY: 9]
**Problem:** Unclear if checkboxes apply to all modules or just make options "available"
**Impact:** Confusion about scope
**Fix:**
- Add header text: "Select teaching presence elements to employ in this programme. Use these in weekly planning."
- Style as "palette" (less like requirements, more like tools)
- Move to Learning Experience tab where applicable
**Estimated Effort:** 20 min  
**Files Affected:** `app.js` (renderLearningExperience)

#### 10. **Learning Experience - Cognitive Presence Grouping** [PRIORITY: 10]
**Problem:** Four phases of inquiry cycle appear scattered (Trigger, Integration far from Exploration, Resolution)
**Impact:** Pedagogical model not visually reinforced
**Fix:**
- Regroup in order: Trigger → Exploration → Integration → Resolution
- Add visual arc or connector showing inquiry cycle flow
- Keep 2-column layout but ensure order is left→right, top→bottom
**Estimated Effort:** 25 min  
**Files Affected:** `app.js` (renderLearningExperience inquiry cycle section)

---

### 🟠 MEDIUM PRIORITY (Desirable, Moderate Impact)

#### 11. **Roadmap Export - Include Risks & Assumptions** [PRIORITY: 11]
**Problem:** Printable roadmap missing risks & assumptions and UDL considerations
**Impact:** Incomplete picture for reviewers
**Fix:**
- Add section to printable roadmap: "Risk & Assumption Mitigation"
- Add "UDL Accessibility Approach" section summarizing module-level evidence
**Estimated Effort:** 30 min  
**Files Affected:** `app.js` (renderRoadmapSummary)

#### 12. **Module Studio - MLO to PLO Linking** [PRIORITY: 12]
**Problem:** Module Learning Outcomes not linked back to Programme PLOs; no clear alignment
**Impact:** Can't verify alignment; siloed outcomes
**Fix:**
- Add optional "Maps to PLO" dropdown for each MLO
- Show PLO text when selected
- Carry through to Alignment Map
**Estimated Effort:** 60 min  
**Files Affected:** `app.js` (module outcomes, alignment table)

#### 13. **Export Documentation** [PRIORITY: 13]
**Problem:** Two JSON export formats not well explained
**Impact:** Confusion about which to use
**Fix:**
- Add tooltip on Export tab explaining:
  - Full JSON: Contains all pedagogical data (UDL, risks, learning activities, etc.)
  - Handoff JSON: Minimal regulatory data for QQI (modules, outcomes, assessments)
- Show file sizes/preview
**Estimated Effort:** 25 min  
**Files Affected:** `index.html`, `app.js` (export section)

---

### 🔵 LOW PRIORITY (Nice-to-Have, Future)

#### 14. **Learning Experience - Weekly Timeline Planner** [PRIORITY: 14]
**Problem:** Only free-text weekly rhythm, no structured week-by-week planner
**Impact:** Hard to operationalize presence elements across semester
**Fix:**
- Create simple week-by-week grid (Weeks 1-12)
- Each cell shows presence elements active that week
- Drag-and-drop or checkboxes to assign presence
- **Note:** This is substantial feature work, maybe Phase 2
**Estimated Effort:** 2-3 hours  
**Files Affected:** New component in Learning Experience tab

#### 15. **Module Studio - Tooltip Suite** [PRIORITY: 15]
**Problem:** UDL Evidence, Outcome levels, AI Risk not explained inline
**Impact:** Users confused about what each concept means
**Fix:**
- Add info icons next to complex fields
- Tooltips explaining: "UDL Evidence = Show how this module addresses diverse learning needs"
- Add link to learning resources
- **Note:** Lower priority if documentation exists elsewhere
**Estimated Effort:** 45 min  
**Files Affected:** `app.js` (all inline help), `styles.css` (tooltip styling)

---

## 📋 Recommended Execution Order

### Phase 1 (Session 1) - Quick Wins ~3 hours
1. ✅ Backward Design - Module Exit Capability Clarity (Priority 3)
2. ✅ Canvas - Alignment Map Headers (Priority 5)
3. ✅ Canvas - Differentiators Guidance (Priority 6)
4. ✅ Canvas - Weekly Rhythm Consolidation (Priority 1)

### Phase 2 (Session 2) - Medium Complexity ~2.5 hours
5. ✅ Backward Design - Evidence Button Visibility (Priority 4)
6. ✅ Canvas - Risk Management UX (Priority 7)
7. ✅ Module Studio - UDL Evidence Collapsible (Priority 8)
8. ✅ Learning Experience - Presence Palette Clarity (Priority 9)

### Phase 3 (Session 3) - Feature Work ~2 hours
9. ✅ Canvas - Module Quick-Add Button (Priority 2)
10. ✅ Learning Experience - Cognitive Presence Grouping (Priority 10)
11. ✅ Roadmap - Include Risks & Assumptions (Priority 11)
12. ✅ Export - Documentation (Priority 13)

### Phase 4 (Future) - Advanced Features
- Module Studio - MLO to PLO Linking (Priority 12)
- Learning Experience - Weekly Timeline Planner (Priority 14)
- Module Studio - Tooltip Suite (Priority 15)

---

## 🎯 Impact Assessment

| Issue | Severity | Users | Effort | Recommended |
|-------|----------|-------|--------|-------------|
| Weekly Rhythm Duplication | High | All | 20 min | ✅ Phase 1 |
| Module Quick-Add | High | All | 45 min | ✅ Phase 2 |
| Exit Capability Linking Clarity | High | BD users | 30 min | ✅ Phase 1 |
| Evidence Button Visibility | Medium | BD users | 25 min | ✅ Phase 2 |
| Truncated Headers | Low | Map users | 15 min | ✅ Phase 1 |
| Differentiators Guidance | Medium | Canvas users | 20 min | ✅ Phase 1 |
| Risk Management UX | Medium | Canvas users | 45 min | ✅ Phase 2 |
| UDL Overwhelming | Medium | Module users | 30 min | ✅ Phase 2 |
| Presence Palette Clarity | Low | LE users | 20 min | ✅ Phase 2 |
| Cognitive Presence Grouping | Low | LE users | 25 min | ✅ Phase 3 |
| Roadmap Completeness | Medium | Export users | 30 min | ✅ Phase 3 |
| MLO to PLO Linking | High | Module users | 60 min | 🔶 Phase 4 |
| Export Documentation | Low | Export users | 25 min | ✅ Phase 3 |
| Weekly Planner | High | LE users | 2-3 hrs | 🔶 Phase 4 |
| Tooltip Suite | Low | All | 45 min | 🔶 Phase 4 |

---

## 💡 Overall Assessment

**Strengths Confirmed:**
- Backward design framework working well
- Exit capabilities ↔ Module linking conceptually sound
- AI risk thinking integrated naturally
- QQI export functional

**Quick Wins (Do First):**
- UX clarity issues (headers, labels, buttons) - HIGH IMPACT, LOW EFFORT
- Workflow visibility (evidence button, clear linking) - HIGH IMPACT, LOW EFFORT

**Strategic Improvements (Do Second):**
- Canvas consolidation (weekly rhythm)
- Module quick-add for better ideation flow
- Risk categorization for better management

**Advanced (Plan for Phase 2):**
- Weekly timeline planner
- MLO-PLO linking
- Comprehensive tooltip suite

---

## 🚀 Next Steps

1. **Confirm priorities** - Which issues matter most to your users?
2. **Phase 1 execution** - Start with quick wins (quick header/label fixes)
3. **User testing** - Get feedback on clarity improvements
4. **Iterate** - Phase 2 can depend on Phase 1 results


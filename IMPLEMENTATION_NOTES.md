# Implementation Notes - Module Studio & QQI Export

**Last Updated:** February 24, 2026

---

## CODE STRUCTURE

### Key Functions (app.js)

#### Module Studio Rendering

**`renderModuleStudio()` (Line ~2350)**
- Renders module list sidebar + first module details
- Builds HTML for module cards with title, credits, semester, assessment count
- Attaches click handlers to each module card
- Calls `renderModuleStudioDetails(0)` to show first module
- **Debugging:** Logs module count to console

```javascript
function renderModuleStudio() {
    const listContainer = document.getElementById('moduleStudioList');
    const detailsContainer = document.getElementById('moduleStudioDetails');
    const countBadge = document.getElementById('modulesCountBadge');
    
    // Count modules
    const moduleCount = (appState.modules || []).length;
    console.log(`renderModuleStudio: ${moduleCount} modules loaded`);
    
    // Update badge
    if (countBadge) countBadge.textContent = `${moduleCount} module(s)`;
    
    // Render list items with click handlers
    // ...
}
```

**`renderModuleStudioDetails(moduleIndex)` (Line ~2394)**
- Fetches module at index from appState
- Calls `showModuleEditorInline()` to generate HTML/structure
- Calls `attachModuleStudioHandlers()` to wire up all event listeners

**`showModuleEditorInline(moduleIndex, module)` (Line ~1195)**
- Generates inline module editor HTML (no modal)
- Returns 5-tab interface:
  1. Basic Info (title, credits, semester)
  2. Learning Outcomes (add/remove/edit)
  3. UDL Evidence (checkboxes + textareas)
  4. Assessments (list with add/edit/delete)
  5. (NO Learning Experience tab - removed)
- Sets `window.currentEditingModule` global for handler reference
- Returns raw HTML string (no rendering side effects)

**`attachModuleStudioHandlers(moduleIndex)` (Line ~1430)**
- Attaches ALL event listeners for:
  - Add/Remove Learning Outcome buttons
  - Add/Edit/Delete Assessment buttons
  - UDL checkbox changes
  - Save Module button
  - Outcome statement/level changes
- Uses event delegation and data attributes
- Updates `window.currentEditingModule` state
- Calls `renderModuleStudio()` after changes (full re-render)

#### Assessment Management

**`showAssessmentModal(assessmentIndex, assessment)` (Line ~1485)**
- Generates modal HTML with fields:
  - Name, Type, Weight, Description (standard)
  - AI Risk Level (dropdown: low/medium/high)
  - AI Risk Design Mitigation (textarea)
- Handles missing aiRisk fields with defaults: `assessment.aiRisk || 'medium'`
- Inserts modal into DOM, shows with Bootstrap.Modal

**`saveModuleAssessment(assessmentIndex)` (Line ~1530)**
- Reads form inputs including aiRisk fields
- Updates assessment object:
  ```javascript
  window.currentEditingModule.moduleData.assessments[assessmentIndex] = {
    ...existingAssessment,
    name, type, weight, description,
    aiRisk,           // NEW
    aiRiskDesignMitigation  // NEW
  };
  ```
- Hides modal, re-renders module editor, shows success toast

#### QQI Export

**`transformToQQI(studioState)` (Line ~259)**
- **Input:** Studio format appState object
- **Output:** QQI-compliant JSON object
- **Key mappings:**
  ```javascript
  // Root level
  programmeTitle → title
  nfqLevel → nfqLevel
  credits → totalCredits
  
  // PLOs
  draftPLOs → plos
  - Add auto-generated `code: "PLO-{idx+1}"`
  - Keep `statement` as `text`
  - Drop `level` field
  
  // Modules
  modules → modules
  - Auto-gen `code: "MSC{idx+1}"`
  - Include `isElective`, `stage`, `moduleLeadName`, `moduleLeadEmail`
  
  // Module outcomes
  learningOutcomes → mimlos
  - Flatten to `{id, text}` (drop `level`)
  
  // Assessments
  assessments.name → title
  assessments.weight → weight (and weighting)
  assessments.description → text
  assessments.aiRiskDesignMitigation → notes
  
  // Preserved
  _studioMetadata
  - Full pedagogical content (audience, capabilities, COI, risks, etc.)
  ```

**`exportToQQI()` (Line ~345)**
- Wrapper around `transformToQQI()`
- Generates filename: `programme_qqi_{title}_{date}.json`
- Calls `downloadToFile()` to trigger download
- Shows toast on success/error

**`downloadToFile(filename, obj)` (Line ~355)**
- Generic JSON download helper
- Creates blob, triggers browser download
- Used by both standard export and QQI export

---

## DATA FLOW EXAMPLE: Load Example → Edit Module → Export

### 1. User clicks "📖 Load Example"

```
loadExampleData()
  ├─ fetch('data/examples/msc_management_pt.json')
  ├─ await response.json()
  └─ loadState(data)
       ├─ appState = { ...BLANK_STATE, ...data }
       ├─ saveToLocalStorage()
       └─ renderAllTabs()
           └─ renderModuleStudio()
               ├─ Renders list: "Strategic..." + "Leadership..."
               ├─ Both modules visible in left sidebar
               └─ Shows first module editor on right
```

**Result:** 2 modules loaded, "2 modules" badge shows, first module selected

### 2. User clicks second module card

```
moduleListItem.click()
  └─ renderModuleStudioDetails(1)
      ├─ module = appState.modules[1]
      ├─ showModuleEditorInline(1, module)
      │   └─ Returns HTML for "Leadership..." editor
      └─ attachModuleStudioHandlers(1)
          ├─ Sets window.currentEditingModule = {
          │     isNew: false,
          │     originalModule: module,
          │     moduleData: {...module}
          │   }
          └─ Attaches all event listeners
```

**Result:** Right panel shows "Leadership" module editor with 4 tabs

### 3. User clicks "Edit Assessment" button

```
assessmentEditButton.click()
  └─ showAssessmentModal(1, assessment)
      ├─ Generates modal HTML with AI Risk fields
      ├─ Creates Bootstrap Modal
      └─ modal.show()
```

**Result:** Modal appears with all fields (including aiRisk dropdown)

### 4. User changes AI Risk to "high", description, and clicks Save

```
saveButton.click()
  └─ saveModuleAssessment(1)
      ├─ Reads all form fields (including aiRisk)
      ├─ Updates window.currentEditingModule.moduleData.assessments[1]
      ├─ Modal hidden
      ├─ renderModuleStudio() (full re-render)
      ├─ saveToLocalStorage()
      └─ showToast('Assessment saved', 'success')
```

**Result:** Assessment updated, localStorage persisted, UI re-rendered

### 5. User clicks "🎓 Export to QQI"

```
exportToQQI()
  ├─ transformToQQI(appState)
  │   ├─ Map title → title
  │   ├─ Transform draftPLOs → plos (add codes)
  │   ├─ Transform modules[] with:
  │   │   ├─ learningOutcomes → mimlos
  │   │   ├─ assessments[] with all fields
  │   │   └─ module.assessments[1].aiRisk = "high" (preserved!)
  │   └─ Return QQI-compliant object with _studioMetadata
  ├─ downloadToFile('programme_qqi_...')
  │   ├─ JSON.stringify(qqqData)
  │   ├─ Create blob + download URL
  │   └─ Trigger browser download
  └─ showToast('Programme exported to QQI format', 'success')
```

**Result:** File downloads as `programme_qqi_MSc_Management_2026-02-24.json`

---

## GLOBAL STATE REFERENCE

### `appState` Object Structure (from BLANK_STATE)

```javascript
{
  programmeTitle: string,
  audience: string,
  audienceConstraints: string,
  valueProposition: string,
  credits: number,
  nfqLevel: number,
  deliveryMode: string,
  deliveryDuration: string,
  deliveryStructure: string,
  
  differentiators: string[],
  draftPLOs: [{id, statement, level}],
  assessmentPortfolio: [{...}],
  learningExperience: {...},
  risksAndAssumptions: [{id, risk, assumption, mitigation}],
  
  modules: [
    {
      id: string,
      title: string,
      credits: number,
      semester: number,
      learningOutcomes: [{id, statement, level}],
      assessments: [
        {
          id: string,
          name: string,
          type: string,
          weight: number,
          description: string,
          aiRisk: "low"|"medium"|"high",
          aiRiskDesignMitigation: string
        }
      ],
      udlEvidence: [{dimension, sublevel, evidence}],
      learningExperience: {weeklyTemplate: {...}}
    }
  ],
  
  exitCapabilities: [{id, text, tags, evidence}],
  createdAt: ISO string,
  lastModified: ISO string
}
```

### `window.currentEditingModule` (Set by Module Studio)

Used by event handlers to track which module is being edited:

```javascript
window.currentEditingModule = {
  moduleIndex: number,          // Index in appState.modules[]
  isNew: boolean,              // True if newly created
  originalModule: {/* module object */},  // Reference to original
  moduleData: {/* deep copy of module */}  // Working copy for edits
}
```

Very import: Handlers use `window.currentEditingModule` to know which module to update.

---

## EVENT HANDLER PATTERN

All Module Studio handlers follow this pattern:

```javascript
// 1. Get form input
const value = document.getElementById('input').value;

// 2. Update working copy
window.currentEditingModule.moduleData.learningOutcomes.push({
  id: generateId('modlo'),
  statement: value,
  level: 'Apply'
});

// 3. Full re-render
renderModuleStudio();

// 4. Auto-save
saveToLocalStorage();  // Triggered by renderAllTabs() → renders all
```

**Note:** Some handlers trigger `showModuleEditor()` which:
1. Navigates to Module Studio tab
2. Calls `renderModuleStudio()`
3. Selects the updated module

---

## DEBUGGING CHECKLIST

### Module Studio not showing modules
1. Check browser console: Should see `renderModuleStudio: 2 modules loaded`
2. Verify appState: `console.log(appState.modules.length)`
3. Verify HTML containers exist: 
   ```javascript
   document.getElementById('moduleStudioList')  // Should exist
   document.getElementById('moduleStudioDetails')  // Should exist
   ```

### Assessment not saving
1. Check console for errors in `saveModuleAssessment()`
2. Verify `window.currentEditingModule` is set
3. Manually check localStorage:
   ```javascript
   const saved = JSON.parse(localStorage.getItem('programme-studio'));
   console.log(saved.modules[0].assessments[0].aiRisk);  // Should show "high"
   ```

### QQI Export not working
1. Check console for `transformToQQI()` errors
2. Verify appState has modules before export
3. Test transformation manually:
   ```javascript
   const qqi = transformToQQI(appState);
   // Check for required fields
   console.log(Object.keys(qqi));  // Should show programmeTitle, modules, plos, etc.
   ```

### Module not reappearing after reload
1. Verify localStorage persists:
   ```javascript
   const stored = localStorage.getItem('programme-studio');
   console.log(JSON.parse(stored).modules.length);
   ```
2. Check `loadFromLocalStorage()` is called on load
3. Verify `renderAllTabs()` called after load

---

## HTML STRUCTURE (index.html)

### Module Studio Tab Container

```html
<div class="tab-pane fade" id="contentModuleStudio" role="tabpanel">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="mb-0 d-inline-block">Module Studio</h2>
      <span class="badge bg-info ms-2" id="modulesCountBadge">0 modules</span>
    </div>
    <button class="btn btn-primary" id="btnAddNewModule">+ Add Module</button>
  </div>
  
  <div class="row" style="height: calc(100vh - 200px);">
    <!-- Left Sidebar: Module List -->
    <div class="col-md-3 border-end overflow-y-auto" style="height: 100%;">
      <div id="moduleStudioList">
        <!-- Populated by renderModuleStudio() -->
      </div>
    </div>
    
    <!-- Right Panel: Module Details -->
    <div class="col-md-9 overflow-y-auto" style="height: 100%;" id="moduleStudioDetails">
      <!-- Populated by renderModuleStudioDetails() -->
    </div>
  </div>
</div>
```

**Key IDs:**
- `#modulesCountBadge` - Shows module count
- `#moduleStudioList` - Left sidebar container
- `#moduleStudioDetails` - Right detail container
- `#btnAddNewModule` - Add module button

---

## LOCAL STORAGE

**Key:** `programme-studio`

**Persists:**
- Full appState object as JSON string
- Entire module list with all assessments and their AI Risk fields
- All learning outcomes, UDL evidence, etc.

**On Load:**
1. `loadFromLocalStorage()` retrieves from key
2. Parses JSON and populates appState
3. Falls back to BLANK_STATE if empty/corrupted
4. `renderAllTabs()` renders UI from loaded state

**On Change:**
- Any module change triggers `saveToLocalStorage()`
- Debounced auto-save (currently immediate, could be optimized)

---

## PERFORMANCE NOTES

### Current Bottlenecks
1. **Full re-render on every change:** `renderModuleStudio()` re-renders entire module list on any change
   - **Impact:** Negligible for 2-3 modules, noticeable at 10+ modules
   - **Future optimization:** Partial re-render or virtual scrolling

2. **localStorage serialization:** Entire appState serialized/deserialized on each save
   - **Impact:** <100ms for current data size
   - **Future optimization:** Only serialize changed module, patch merge on load

3. **showModuleEditorInline():** Generates full HTML string for render
   - **Impact:** Linear with number of learning outcomes/assessments
   - **Future optimization:** Use template strings instead of string concatenation

### Optimizations Already In Place
- Event delegation (single listener on container, not per item)
- Debounced auto-save status indicator
- Lazy tab rendering (tab content only rendered when tab is active)

---

## CONSTANTS & CONFIGURATION

**In app.js:**
```javascript
const STORAGE_KEY = 'programme-studio';  // localStorage key
const BLANK_STATE = {...};                // Default state template
```

**Assessment Types:**
```javascript
const assessmentTypes = [
  'Assignment', 'Exam', 'Project', 'Presentation', 'Quiz',
  'Portfolio', 'Practical', 'Participation', 'Other'
];
```

**AI Risk Levels:**
```javascript
// In showAssessmentModal():
<option value="low">Low</option>
<option value="medium">Medium</option>
<option value="high">High</option>
```

**UDL Dimensions (Guidelines 3.0 - Updated July 2024):**
- representation:
  - Guideline 1: Perception - Support multiple ways to perceive information
  - Guideline 2: Language & Symbols - Clarify vocabulary and address biases
  - Guideline 3: Building Knowledge - Cultivate multiple ways of knowing
- actionExpression:
  - Guideline 4: Interaction - Vary methods for response, navigation, and movement
  - Guideline 5: Expression & Communication - Use multiple media and tools
  - Guideline 6: Strategy Development - Set goals and anticipate challenges
- engagement:
  - Guideline 7: Welcoming Interests & Identities - Optimize choice and address biases
  - Guideline 8: Sustaining Effort & Persistence - Foster collaboration and feedback
  - Guideline 9: Emotional Capacity - Develop awareness and empathy

**Note:** Guidelines 2.2 data is automatically migrated to 3.0 format on load.
Mapping: Comprehension→BuildingKnowledge, PhysicalAction→Interaction, Executive→StrategyDevelopment,
Recruiting→WelcomingIdentities, Sustaining→SustainingPersistence, SelfRegulation→EmotionalCapacity

---

## COMMON EDITS

### Adding a new field to assessments
1. Add field to `addNewModule()` assessment template
2. Update `showAssessmentModal()` to include form input
3. Update `saveModuleAssessment()` to read the field
4. Update example data `msc_management_pt.json`

### Adding a new module tab
1. Add tab button to nav-tabs in `showModuleEditorInline()`
2. Add corresponding tab-pane div
3. Add event handlers in `attachModuleStudioHandlers()`
4. Add save logic to preserve tab data

### Changing module list styling
- Edit the HTML building in `renderModuleStudio()` (the `listHtml` template)
- Or edit CSS in `styles.css` for `.module-list-item` class

---

**Last Review:** February 24, 2026  
**Status:** All features implemented and tested  
**Next Phase:** Integration testing with QQI tool

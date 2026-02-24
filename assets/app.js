// ============================================
// Programme Design Studio - Main Application
// ============================================

// ===== CONSTANTS & CONFIG =====
const STORAGE_KEY = 'programmeDesignStudio';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// ===== CONSTANTS FOR BACKWARD DESIGN =====
const DEFAULT_CAPABILITY_TAGS = [
    'Strategic',
    'Leadership',
    'Analytics',
    'Operations',
    'Innovation',
    'Ethics',
    'Sustainability',
    'Digital'
];

const EVIDENCE_TYPES = [
    'Capstone Project',
    'Workplace Intervention',
    'Simulation',
    'Portfolio',
    'Consultancy Report',
    'Viva',
    'Case Study Analysis',
    'Research Dissertation'
];

const BLANK_STATE = {
    programmeTitle: 'New Programme',
    audience: 'Target audience and learners',
    audienceConstraints: 'Time, prerequisites, digital skills, etc.',
    valueProposition: 'What distinguishes this programme',
    credits: 60,
    nfqLevel: 8,
    deliveryMode: 'Blended (Synchronous + Asynchronous)',
    deliveryDuration: '12 months',
    deliveryStructure: 'Weekly learning cycle',
    differentiators: [
        'Key differentiator 1',
        'Key differentiator 2',
        'Key differentiator 3'
    ],
    draftPLOs: [
        { id: 'plo-1', statement: 'Learning outcome statement', level: 'Analyse' }
    ],
    assessmentPortfolio: [
        {
            id: 'assess-1',
            title: 'Assessment Activity',
            type: 'essay',
            evidenceOutputs: ['Deliverable 1'],
            weightingPercent: 100,
            individualOrGroup: 'individual',
            authenticity: 3,
            aiRisk: 'medium',
            aiRiskDesignMitigation: 'Mitigation strategy',
            scaffoldSteps: ['Step 1', 'Step 2', 'Step 3'],
            feedbackMoments: ['Formative', 'Summative']
        }
    ],
    learningExperience: {
        description: 'High-level learning rhythm',
        availablePresence: {
            teaching: [],
            social: [],
            cognitive: []
        },
        openText: ''
    },
    risksAndAssumptions: [
        {
            id: 'risk-1',
            category: 'Academic',
            risk: 'Risk statement',
            assumption: 'Related assumption',
            mitigation: 'Mitigation strategy'
        }
    ],
    modules: [
        {
            id: 'mod-1',
            title: 'Module 1',
            credits: 10,
            semester: 1,
            learningOutcomes: [
                { id: 'modlo-1', statement: 'Module learning outcome', level: 'Apply' }
            ],
            assessments: [],
            learningExperience: {
                description: '',
                weeklyRhythm: [],
                notes: ''
            },
            udlEvidence: []
        }
    ],
    exitCapabilities: [
        {
            id: 'exitcap-1',
            text: 'Lead strategic initiatives in complex, global business environments',
            tags: ['Strategic', 'Leadership'],
            evidence: []
        }
    ],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
};

// ===== STATE MANAGEMENT =====
let appState = { ...BLANK_STATE };
let assessmentPatterns = [];

/**
 * Load state from localStorage
 */
function loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            appState = JSON.parse(stored);
            console.log('Loaded from localStorage');
        } catch (e) {
            console.error('Failed to parse localStorage:', e);
            appState = { ...BLANK_STATE };
        }
    } else {
        appState = { ...BLANK_STATE };
    }
}

/**
 * Save state to localStorage
 */
function saveToLocalStorage() {
    appState.lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    showAutoSaveStatus();
}

/**
 * Load example data from JSON file
 */
async function loadExampleData() {
    try {
        const response = await fetch('data/examples/msc_management_pt.json');
        const data = await response.json();
        loadState(data);
        showToast('Example programme loaded successfully!', 'success');
    } catch (e) {
        console.error('Failed to load example:', e);
        showToast('Failed to load example data', 'danger');
    }
}

/**
 * Load patterns from JSON file
 */
async function loadPatterns() {
    try {
        const response = await fetch('data/patterns.json');
        const data = await response.json();
        assessmentPatterns = data.assessmentPatterns || [];
        renderPatternLibrary();
    } catch (e) {
        console.error('Failed to load patterns:', e);
    }
}

/**
 * Load entire state object
 */
function loadState(stateObj) {
    appState = { ...BLANK_STATE, ...stateObj };
    appState.lastModified = new Date().toISOString();
    saveToLocalStorage();
    renderAllTabs();
}

/**
 * Clear all and reset to blank
 */
function resetToBlank() {
    appState = { ...BLANK_STATE };
    localStorage.removeItem(STORAGE_KEY);
    renderAllTabs();
    showToast('Reset to blank template', 'info');
}

/**
 * Serialize current state to JSON
 */
function serializeState() {
    return JSON.stringify(appState, null, 2);
}

/**
 * Export as full JSON file
 */
function downloadFullJSON(filename = 'programme-design') {
    const json = serializeState();
    downloadJSON(filename, appState);
}

/**
 * Export as handoff JSON (subset for other tool)
 */
function downloadHandoffJSON(filename = 'programme-handoff') {
    const handoff = {
        programmeTitle: appState.programmeTitle,
        audience: appState.audience,
        exitCapabilities: appState.exitCapabilities || [],
        draftPLOs: appState.draftPLOs,
        assessmentPortfolio: appState.assessmentPortfolio,
        modules: (appState.modules || []).map(mod => ({
            id: mod.id,
            title: mod.title,
            credits: mod.credits,
            semester: mod.semester,
            supportsExitCapabilities: mod.supportsExitCapabilities || [],
            learningOutcomes: mod.learningOutcomes || [],
            assessmentEvidence: mod.assessmentEvidence || [],
            learningActivities: mod.learningActivities || [],
            learningExperience: mod.learningExperience || {}
        })),
        deliveryModel: {
            mode: appState.deliveryMode,
            duration: appState.deliveryDuration,
            structure: appState.deliveryStructure,
            credits: appState.credits,
            nfqLevel: appState.nfqLevel
        },
        learningExperience: appState.learningExperience,
        risks: appState.risksAndAssumptions,
        exportedAt: new Date().toISOString()
    };
    downloadJSON(filename, handoff);
}

/**
 * Transform studio format to QQI-compliant format
 * Maps pedagogical design to regulatory structure
 */
function transformToQQI(studioState) {
    if (!studioState.programmeTitle) {
        throw new Error('Programme title is required');
    }

    // Auto-generate programme ID
    const progId = studioState.id || generateId('prog');
    
    // Transform PLOs
    const plos = (studioState.draftPLOs || []).map((plo, idx) => ({
        id: plo.id,
        code: plo.code || `PLO-${idx + 1}`,
        text: plo.statement || plo.text || '',
        standardMappings: plo.standardMappings || []
    }));

    // Transform modules
    const modules = (studioState.modules || []).map((mod, modIdx) => {
        // Create MIMLO array from learningOutcomes
        const mimlos = (mod.learningOutcomes || []).map((lo, loIdx) => ({
            id: lo.id,
            text: lo.statement || lo.text || ''
        }));

        // Transform assessments
        const assessments = (mod.assessments || []).map((assess, assIdx) => ({
            id: assess.id,
            type: assess.type || 'assignment',
            title: assess.name || assess.title || '',
            weighting: assess.weight || 0,
            weight: assess.weight || 0,
            text: assess.description || '',
            mode: assess.mode || 'coursework',
            integrity: assess.integrity || {},
            mimloIds: [], // Will be linked in next phase if needed
            notes: assess.aiRiskDesignMitigation || assess.notes || '',
            indicativeWeek: assess.indicativeWeek || null
        }));

        return {
            id: mod.id,
            title: mod.title,
            code: mod.code || `${studioState.programmeTitle.slice(0, 3).toUpperCase()}${modIdx + 1}`.padEnd(6, '0'),
            credits: mod.credits || 10,
            isElective: mod.isElective || false,
            stage: mod.stage || Math.ceil(mod.semester / 2) || 1,
            semester: mod.semester || 1,
            moduleLeadName: mod.moduleLeadName || '',
            moduleLeadEmail: mod.moduleLeadEmail || '',
            mimlos: mimlos,
            assessments: assessments,
            effortHours: mod.effortHours || {},
            readingList: mod.readingList || []
        };
    });

    // Create QQI-compliant root object
    const qqqData = {
        schemaVersion: 1.0,
        id: progId,
        title: studioState.programmeTitle,
        awardType: studioState.awardType || 'MSc',
        awardTypeIsOther: studioState.awardTypeIsOther || false,
        nfqLevel: studioState.nfqLevel || 9,
        school: studioState.school || 'School of [Subject]',
        awardStandardIds: studioState.awardStandardIds || [],
        awardStandardNames: studioState.awardStandardNames || [],
        totalCredits: studioState.credits || 90,
        electiveDefinitions: studioState.electiveDefinitions || [],
        intakeMonths: studioState.intakeMonths || [],
        modules: modules,
        plos: plos,
        ploToMimlos: studioState.ploToMimlos || {},
        versions: studioState.versions || [],
        updatedAt: new Date().toISOString(),
        mode: studioState.mode || 'design',
        // Studio-specific extensions (preserved in export)
        _studioMetadata: {
            audience: studioState.audience,
            audienceConstraints: studioState.audienceConstraints,
            valueProposition: studioState.valueProposition,
            capabilities: studioState.capabilities || [],
            differentiators: studioState.differentiators || [],
            deliveryMode: studioState.deliveryMode,
            deliveryDuration: studioState.deliveryDuration,
            deliveryStructure: studioState.deliveryStructure,
            learningExperience: studioState.learningExperience,
            risksAndAssumptions: studioState.risksAndAssumptions || [],
            assessmentPortfolio: studioState.assessmentPortfolio || [],
            coiPlan: studioState.coiPlan
        }
    };

    return qqqData;
}

/**
 * Trigger QQI format download
 */
function exportToQQI() {
    try {
        const qqqData = transformToQQI(appState);
        const filename = `programme_qqi_${appState.programmeTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        downloadToFile(filename, qqqData);
        showToast('✅ Programme exported to QQI format', 'success');
    } catch (e) {
        console.error('QQI export error:', e);
        showToast(`❌ Export failed: ${e.message}`, 'danger');
    }
}

/**
 * Generic file download helper (no toast)
 */
function downloadToFile(filename, obj) {
    const json = JSON.stringify(obj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download JSON to file
 */
function downloadJSON(filename, obj) {
    const json = JSON.stringify(obj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded: ${filename}.json`, 'success');
}

/**
 * Import JSON from file
 */
function importJSON(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            loadState(data);
            showToast('Programme imported successfully!', 'success');
        } catch (err) {
            console.error('JSON parse error:', err);
            showToast('Invalid JSON file', 'danger');
        }
    };
    reader.readAsText(file);
}

// ===== VALIDATION =====
function validateState() {
    const errors = [];

    if (!appState.programmeTitle || appState.programmeTitle.trim() === '') {
        errors.push('Programme title is required');
    }

    if (!appState.exitCapabilities || appState.exitCapabilities.length < 1) {
        errors.push('At least 1 exit capability is required');
    }

    if (!appState.modules || appState.modules.length < 1) {
        errors.push('At least 1 module is required');
    }

    return errors;
}

// ===== UI HELPER FUNCTIONS =====
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast show" role="alert">
            <div class="toast-header">
                <strong class="me-auto">${type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ'}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastEl = document.getElementById(toastId);
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
    }, 4000);
}

function showAutoSaveStatus() {
    const status = document.getElementById('autoSaveStatus');
    status.textContent = '✓ Auto-saved';
    status.classList.remove('bg-warning');
    status.classList.add('bg-success');
    setTimeout(() => {
        status.textContent = 'Auto-saved';
    }, 2000);
}

function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EVENT DELEGATION =====
document.addEventListener('click', (e) => {
    // Canvas tile editing
    if (e.target.closest('.canvas-tile-content input')) {
        const tile = e.target.closest('[data-tile-id]');
        if (tile) {
            handleCanvasUpdate(tile);
        }
    }

    if (e.target.classList.contains('btn-add-diff')) {
        appState.differentiators.push('New differentiator');
        saveToLocalStorage();
        renderCanvasTile('differentiators');
    }

    if (e.target.classList.contains('btn-remove-diff')) {
        const idx = parseInt(e.target.dataset.index);
        appState.differentiators.splice(idx, 1);
        saveToLocalStorage();
        renderCanvasTile('differentiators');
    }

    // Assessments
    if (e.target.classList.contains('btn-edit-assessment')) {
        const assessId = e.target.dataset.id;
        showAssessmentModal(assessId);
    }

    if (e.target.classList.contains('btn-add-assessment')) {
        const newAssess = {
            id: generateId('assess'),
            title: 'New Assessment',
            type: 'project',
            evidenceOutputs: ['Deliverable'],
            weightingPercent: 0,
            individualOrGroup: 'individual',
            authenticity: 3,
            aiRisk: 'medium',
            aiRiskDesignMitigation: '',
            scaffoldSteps: [],
            feedbackMoments: []
        };
        appState.assessmentPortfolio.push(newAssess);
        saveToLocalStorage();
        renderAssessmentStudio();
    }

    if (e.target.classList.contains('btn-remove-assessment')) {
        const assessId = e.target.dataset.id;
        appState.assessmentPortfolio = appState.assessmentPortfolio.filter(a => a.id !== assessId);
        saveToLocalStorage();
        renderAssessmentStudio();
    }

    if (e.target.classList.contains('btn-insert-pattern')) {
        const patternId = e.target.dataset.id;
        insertPattern(patternId);
    }

    // Risks
    if (e.target.classList.contains('btn-add-risk')) {
        const newRisk = {
            id: generateId('risk'),
            category: 'Academic',
            risk: 'Risk statement',
            assumption: 'Assumption',
            mitigation: 'Mitigation'
        };
        appState.risksAndAssumptions.push(newRisk);
        saveToLocalStorage();
        renderCanvasTile('risks');
    }

    if (e.target.classList.contains('btn-remove-risk')) {
        const riskId = e.target.dataset.id;
        appState.risksAndAssumptions = appState.risksAndAssumptions.filter(r => r.id !== riskId);
        saveToLocalStorage();
        renderCanvasTile('risks');
    }

    // Modules Manager
    if (e.target.classList.contains('btn-manage-modules')) {
        showModulesManager();
    }

    // Quick Add Module
    if (e.target.classList.contains('btn-quick-add-module')) {
        showQuickAddModuleModal();
    }

    // Backward Design - Exit Capabilities
    if (e.target.classList.contains('btn-add-exit-capability')) {
        showAddExitCapabilityModal();
    }

    if (e.target.classList.contains('btn-edit-exit-capability')) {
        const capId = e.target.dataset.id;
        showEditExitCapabilityModal(capId);
    }

    if (e.target.classList.contains('btn-delete-exit-capability')) {
        const capId = e.target.dataset.id;
        deleteExitCapability(capId);
    }

    // Backward Design - PLOs (Programme Learning Outcomes)
    if (e.target.classList.contains('btn-add-plo')) {
        showAddPLOModal();
    }

    if (e.target.classList.contains('btn-edit-plo')) {
        const ploId = e.target.dataset.id;
        showEditPLOModal(ploId);
    }

    if (e.target.classList.contains('btn-delete-plo')) {
        const ploId = e.target.dataset.id;
        deletePLO(ploId);
    }

    // Backward Design - Evidence
    if (e.target.classList.contains('btn-add-evidence')) {
        const capId = e.target.dataset.capId;
        showAddEvidenceModal(capId);
    }

    if (e.target.classList.contains('btn-edit-evidence')) {
        const capId = e.target.dataset.capId;
        const evId = e.target.dataset.evId;
        showEditEvidenceModal(capId, evId);
    }

    if (e.target.classList.contains('btn-delete-evidence')) {
        const capId = e.target.dataset.capId;
        const evId = e.target.dataset.evId;
        deleteEvidence(capId, evId);
    }

    // Module selector (Phase 2b)
    if (e.target.classList.contains('module-selector')) {
        const moduleId = e.target.dataset.moduleId;
        document.querySelectorAll('.module-selector').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById('moduleDetailContent').innerHTML = renderModuleBackwardDesignDetail(moduleId);
    }

    // Module capability mapping (Phase 2b)
    if (e.target.classList.contains('module-capability-checkbox')) {
        const moduleId = e.target.dataset.moduleId;
        const capId = e.target.dataset.capId;
        const module = appState.modules.find(m => m.id === moduleId);
        if (module) {
            if (!module.supportsExitCapabilities) module.supportsExitCapabilities = [];
            if (e.target.checked) {
                if (!module.supportsExitCapabilities.includes(capId)) {
                    module.supportsExitCapabilities.push(capId);
                }
            } else {
                module.supportsExitCapabilities = module.supportsExitCapabilities.filter(id => id !== capId);
            }
            saveToLocalStorage();
            document.getElementById('moduleDetailContent').innerHTML = renderModuleBackwardDesignDetail(moduleId);
        }
    }

    // Module assessment evidence  (Phase 2b)
    if (e.target.classList.contains('btn-add-module-evidence')) {
        const moduleId = e.target.dataset.moduleId;
        window.currentModuleId = moduleId;
        window.currentEvidenceId = null;
        
        document.getElementById('assessmentEvidenceModalTitle').textContent = 'Add Assessment Evidence';
        document.getElementById('evidenceAssessmentLink').value = '';
        document.getElementById('evidenceDescription').value = '';
        document.getElementById('simulatedPerformance').value = '';
        document.getElementById('assessmentAiRisk').value = 'medium';
        document.getElementById('evidenceScaffold').value = '';
        
        // Populate assessment options
        populateAssessmentOptions(moduleId);
        
        const modal = new bootstrap.Modal(document.getElementById('assessmentEvidenceModal'));
        modal.show();
    }

    if (e.target.classList.contains('btn-edit-module-evidence')) {
        const moduleId = e.target.dataset.moduleId;
        const evId = e.target.dataset.evId;
        const module = appState.modules.find(m => m.id === moduleId);
        if (module) {
            const evidence = module.assessmentEvidence.find(e => e.id === evId);
            if (evidence) {
                window.currentModuleId = moduleId;
                window.currentEvidenceId = evId;
                
                document.getElementById('assessmentEvidenceModalTitle').textContent = 'Edit Assessment Evidence';
                document.getElementById('evidenceAssessmentLink').value = evidence.linkedAssessmentId || '';
                document.getElementById('evidenceDescription').value = evidence.description;
                document.getElementById('simulatedPerformance').value = evidence.simulatedPerformance;
                document.getElementById('assessmentAiRisk').value = evidence.aiRisk;
                document.getElementById('evidenceScaffold').value = (evidence.scaffoldSteps || []).join(', ');
                
                // Populate assessment options
                populateAssessmentOptions(moduleId);
                
                const modal = new bootstrap.Modal(document.getElementById('assessmentEvidenceModal'));
                modal.show();
            }
        }
    }

    if (e.target.classList.contains('btn-delete-module-evidence')) {
        const moduleId = e.target.dataset.moduleId;
        const evId = e.target.dataset.evId;
        if (confirm('Delete this assessment evidence?')) {
            const module = appState.modules.find(m => m.id === moduleId);
            if (module) {
                module.assessmentEvidence = (module.assessmentEvidence || []).filter(e => e.id !== evId);
                saveToLocalStorage();
                document.getElementById('moduleDetailContent').innerHTML = renderModuleBackwardDesignDetail(moduleId);
                showToast('Assessment evidence deleted', 'info');
            }
        }
    }

    // Module learning activities (Phase 2b)
    if (e.target.classList.contains('btn-add-module-activity')) {
        const moduleId = e.target.dataset.moduleId;
        const module = appState.modules.find(m => m.id === moduleId);
        if (module && module.assessmentEvidence && module.assessmentEvidence.length > 0) {
            window.currentModuleId = moduleId;
            window.currentActivityId = null;
            
            document.getElementById('learningActivityModalTitle').textContent = 'Add Learning Activity';
            document.getElementById('activityDescription').value = '';
            document.getElementById('activityTiming').value = '';
            
            // Populate evidence dropdown
            const select = document.getElementById('activityLinksToEvidence');
            select.innerHTML = '<option value="">-- Select Evidence Item --</option>' + 
                module.assessmentEvidence.map(ev => `<option value="${ev.id}">${escapeHtml(ev.description)}</option>`).join('');
            
            const modal = new bootstrap.Modal(document.getElementById('learningActivityModal'));
            modal.show();
        }
    }

    if (e.target.classList.contains('btn-edit-module-activity')) {
        const moduleId = e.target.dataset.moduleId;
        const actId = e.target.dataset.actId;
        const module = appState.modules.find(m => m.id === moduleId);
        if (module) {
            const activity = module.learningActivities.find(a => a.id === actId);
            if (activity) {
                window.currentModuleId = moduleId;
                window.currentActivityId = actId;
                
                document.getElementById('learningActivityModalTitle').textContent = 'Edit Learning Activity';
                document.getElementById('activityDescription').value = activity.description;
                document.getElementById('activityTiming').value = activity.timing || '';
                
                // Populate evidence dropdown
                const select = document.getElementById('activityLinksToEvidence');
                select.innerHTML = '<option value="">-- Select Evidence Item --</option>' + 
                    module.assessmentEvidence.map(ev => `<option value="${ev.id}" ${ev.id === activity.preparesForEvidenceId ? 'selected' : ''}>${escapeHtml(ev.description)}</option>`).join('');
                
                const modal = new bootstrap.Modal(document.getElementById('learningActivityModal'));
                modal.show();
            }
        }
    }

    if (e.target.classList.contains('btn-delete-module-activity')) {
        const moduleId = e.target.dataset.moduleId;
        const actId = e.target.dataset.actId;
        if (confirm('Delete this learning activity?')) {
            const module = appState.modules.find(m => m.id === moduleId);
            if (module) {
                module.learningActivities = (module.learningActivities || []).filter(a => a.id !== actId);
                saveToLocalStorage();
                document.getElementById('moduleDetailContent').innerHTML = renderModuleBackwardDesignDetail(moduleId);
                showToast('Learning activity deleted', 'info');
            }
        }
    }

    // COI toggles
    if (e.target.classList.contains('coi-toggle')) {
        handleCoiToggle(e.target);
    }
});

// Handle canvas tile text input changes
document.addEventListener('change', (e) => {
    const tile = e.target.closest('[data-tile-id]');
    if (tile) {
        handleCanvasUpdate(tile);
    }

    // Input for canvas fields
    if (e.target.name === 'differentiator' || e.target.name === 'plo-statement' || e.target.name === 'plo-level' ||
        e.target.name === 'riskStatement' || e.target.name === 'riskAssumption' || e.target.name === 'riskMitigation' || e.target.name === 'riskCategory') {
        handleCanvasFieldChange(e.target);
    }
});

document.addEventListener('input', (e) => {
    if (e.target.matches('.canvas-tile-content input, .canvas-tile-content textarea, .canvas-tile-content select')) {
        handleCanvasUpdate(e.target.closest('[data-tile-id]'));
    }
});

// ===== CANVAS TAB =====
function renderCanvas() {
    const container = document.getElementById('canvasTiles');
    container.innerHTML = '';

    const tiles = [
        { id: 'audience', title: '👥 Audience & Promise', render: renderCanvasTile },
        { id: 'exitCapabilitiesRef', title: '🎯 Exit Capabilities', render: renderCanvasTile },
        { id: 'differentiators', title: '⭐ Differentiators', render: renderCanvasTile },
        { id: 'structure', title: '📚 Structure', render: renderCanvasTile },
        { id: 'modules', title: '📦 Modules Manager', render: renderCanvasTile },
        { id: 'learningExp', title: '🔄 Learning Experience', render: renderCanvasTile },
        { id: 'risks', title: '⚠️ Risks & Assumptions', render: renderCanvasTile }
    ];

    tiles.forEach(tile => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        col.innerHTML = `<div class="canvas-tile" data-tile-id="${tile.id}">${tile.render(tile.id)}</div>`;
        container.appendChild(col);
    });
}

function renderCanvasTile(tileId) {
    switch (tileId) {
        case 'audience':
            return `
                <div class="canvas-tile-icon">👥</div>
                <div class="canvas-tile-title">Audience & Promise</div>
                <div class="canvas-tile-content">
                    <div class="mb-3">
                        <label class="form-label small">Who it's for:</label>
                        <textarea class="form-control form-control-sm" rows="2" placeholder="Target learners" data-field="audience">${appState.audience || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Constraints:</label>
                        <textarea class="form-control form-control-sm" rows="2" placeholder="Time, skills, access" data-field="audienceConstraints">${appState.audienceConstraints || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Value Proposition:</label>
                        <textarea class="form-control form-control-sm" rows="2" placeholder="What makes this programme unique" data-field="valueProposition">${appState.valueProposition || ''}</textarea>
                    </div>
                </div>
            `;

        case 'exitCapabilitiesRef':
            return `
                <div class="canvas-tile-icon">🎯</div>
                <div class="canvas-tile-title">Exit Capabilities</div>
                <div class="canvas-tile-content">
                    <p class="small text-muted mb-2">${appState.exitCapabilities?.length || 0} defined</p>
                    ${(appState.exitCapabilities || []).slice(0, 2).map(cap => `
                        <div class="small mb-2 pb-2 border-bottom">
                            <strong>${escapeHtml(cap.text.substring(0, 40))}${cap.text.length > 40 ? '...' : ''}</strong><br>
                            <span class="badge bg-info">${cap.tags?.length || 0} tags</span>
                        </div>
                    `).join('')}
                    ${appState.exitCapabilities && appState.exitCapabilities.length > 2 ? `<p class="small text-muted">+ ${appState.exitCapabilities.length - 2} more</p>` : ''}
                    <p class="text-center text-primary small mt-3">
                        <em>📋 <strong>Manage in Backward Design tab</strong></em>
                    </p>
                </div>
            `;

        case 'differentiators':
            return `
                <div class="canvas-tile-icon">⭐</div>
                <div class="canvas-tile-title">Differentiators</div>
                <div class="canvas-tile-content">
                    <p class="small text-muted mb-3">🎯 <strong>What makes this programme unique?</strong><br><span class="text-secondary">Examples: industry-focused, AI-integrated, experiential, global perspective</span></p>
                    ${appState.differentiators.map((diff, idx) => `
                        <div class="mb-2 input-group input-group-sm">
                            <input type="text" name="differentiator" class="form-control" placeholder="e.g., Hands-on, industry-led capstone" value="${escapeHtml(diff)}" data-index="${idx}">
                            <button class="btn btn-outline-danger btn-remove-diff" type="button" data-index="${idx}">✕</button>
                        </div>
                    `).join('')}
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2 btn-add-diff">+ Add</button>
                </div>
            `;

        case 'structure':
            return `
                <div class="canvas-tile-icon">📚</div>
                <div class="canvas-tile-title">Structure</div>
                <div class="canvas-tile-content">
                    <div class="mb-3">
                        <label class="form-label small">Duration:</label>
                        <input type="text" class="form-control form-control-sm" placeholder="e.g. 12 months" value="${escapeHtml(appState.deliveryDuration)}" data-field="deliveryDuration">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Credits:</label>
                        <input type="number" class="form-control form-control-sm" placeholder="60" value="${appState.credits}" data-field="credits">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">NFQ Level:</label>
                        <select class="form-select form-select-sm" data-field="nfqLevel">
                            ${[6, 7, 8, 9, 10].map(l => `<option value="${l}" ${appState.nfqLevel === l ? 'selected' : ''}>Level ${l}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Delivery Mode:</label>
                        <input type="text" class="form-control form-control-sm" placeholder="e.g. Hybrid" value="${escapeHtml(appState.deliveryMode)}" data-field="deliveryMode">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small">Weekly Rhythm:</label>
                        <textarea class="form-control form-control-sm" rows="3" placeholder="Learning rhythm" data-field="deliveryStructure">${escapeHtml(appState.deliveryStructure)}</textarea>
                    </div>
                </div>
            `;

        case 'modules':
            return `
                <div class="canvas-tile-icon">📦</div>
                <div class="canvas-tile-title">Modules Manager</div>
                <div class="canvas-tile-content">
                    <p class="small text-muted mb-2">${appState.modules?.length || 0} module(s)</p>
                    ${(appState.modules || []).slice(0, 3).map(mod => `
                        <div class="small mb-2 pb-2 border-bottom">
                            <strong>${escapeHtml(mod.title)}</strong><br>
                            <span class="badge bg-secondary">${mod.credits} credits</span>
                            <span class="badge bg-info">Sem ${mod.semester}</span>
                        </div>
                    `).join('')}
                    ${appState.modules && appState.modules.length > 3 ? `<p class="small text-muted">+ ${appState.modules.length - 3} more</p>` : ''}
                    <button type="button" class="btn btn-sm btn-success me-2 mt-2 btn-quick-add-module">+ Add Module</button>
                    <button type="button" class="btn btn-sm btn-primary mt-2 btn-manage-modules">📋 Manage</button>
                </div>
            `;

        case 'learningExp':
            return `
                <div class="canvas-tile-icon">🔄</div>
                <div class="canvas-tile-title">Learning Experience</div>
                <div class="canvas-tile-content">
                    <p class="small text-muted mb-2">Configure teaching presence, social presence, and cognitive presence in the Learning Experience tab.</p>
                    <p class="small text-muted">Use the presence palette to operationalize your programme's weekly rhythm.</p>
                </div>
            `;

        case 'risks':
            return `
                <div class="canvas-tile-icon">⚠️</div>
                <div class="canvas-tile-title">Risks & Assumptions</div>
                <div class="canvas-tile-content">
                    ${appState.risksAndAssumptions.map((risk) => {
                        const categoryColors = {
                            'Academic': 'bg-warning',
                            'Operational': 'bg-info',
                            'Market': 'bg-danger',
                            'Other': 'bg-secondary'
                        };
                        const borderColor = categoryColors[risk.category] || 'bg-secondary';
                        return `
                            <div class="mb-3 pb-3 border-bottom" style="border-left: 4px solid var(--bs-${borderColor === 'bg-warning' ? 'warning' : borderColor === 'bg-info' ? 'info' : borderColor === 'bg-danger' ? 'danger' : 'secondary'}-color); padding-left: 12px;">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <select name="riskCategory" class="form-select form-select-sm" style="width: 140px;" data-id="${risk.id}" data-field="category">
                                        <option value="Academic" ${risk.category === 'Academic' ? 'selected' : ''}>Academic Risk</option>
                                        <option value="Operational" ${risk.category === 'Operational' ? 'selected' : ''}>Operational Risk</option>
                                        <option value="Market" ${risk.category === 'Market' ? 'selected' : ''}>Market Risk</option>
                                        <option value="Other" ${risk.category === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                    <button type="button" class="btn btn-sm btn-outline-danger btn-remove-risk" data-id="${risk.id}">🗑️ Remove</button>
                                </div>
                                <input type="text" name="riskStatement" class="form-control form-control-sm mb-2" placeholder="Risk" value="${escapeHtml(risk.risk)}" data-id="${risk.id}" data-field="risk">
                                <input type="text" name="riskAssumption" class="form-control form-control-sm mb-2" placeholder="Assumption" value="${escapeHtml(risk.assumption)}" data-id="${risk.id}" data-field="assumption">
                                <textarea name="riskMitigation" class="form-control form-control-sm" rows="2" placeholder="Mitigation" data-id="${risk.id}" data-field="mitigation">${escapeHtml(risk.mitigation)}</textarea>
                            </div>
                        `;
                    }).join('')}
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2 btn-add-risk">+ Add Risk</button>
                </div>
            `;

        default:
            return '';
    }
}

function handleCanvasUpdate(tile) {
    if (!tile) return;
    const tileId = tile.dataset.tileId;

    if (tileId === 'audience') {
        appState.audience = tile.querySelector('[data-field="audience"]')?.value || '';
        appState.audienceConstraints = tile.querySelector('[data-field="audienceConstraints"]')?.value || '';
        appState.valueProposition = tile.querySelector('[data-field="valueProposition"]')?.value || '';
    } else if (tileId === 'structure') {
        appState.deliveryDuration = tile.querySelector('[data-field="deliveryDuration"]')?.value || '';
        appState.credits = parseInt(tile.querySelector('[data-field="credits"]')?.value) || 60;
        appState.nfqLevel = parseInt(tile.querySelector('[data-field="nfqLevel"]')?.value) || 8;
        appState.deliveryMode = tile.querySelector('[data-field="deliveryMode"]')?.value || '';
        appState.deliveryStructure = tile.querySelector('[data-field="deliveryStructure"]')?.value || '';
    } else if (tileId === 'learningExp') {
        appState.learningExperience.description = tile.querySelector('[data-field="learningExperienceDesc"]')?.value || '';
    }

    saveToLocalStorage();
}

function handleCanvasFieldChange(input) {
    const id = input.dataset.id;
    const field = input.dataset.field;
    const value = input.value;

    if (input.name === 'differentiator') {
        const idx = parseInt(input.dataset.index);
        appState.differentiators[idx] = value;
    } else if (input.name === 'riskStatement') {
        const risk = appState.risksAndAssumptions.find(r => r.id === id);
        if (risk) risk.risk = value;
    } else if (input.name === 'riskAssumption') {
        const risk = appState.risksAndAssumptions.find(r => r.id === id);
        if (risk) risk.assumption = value;
    } else if (input.name === 'riskMitigation') {
        const risk = appState.risksAndAssumptions.find(r => r.id === id);
        if (risk) risk.mitigation = value;
    } else if (input.name === 'riskCategory') {
        const risk = appState.risksAndAssumptions.find(r => r.id === id);
        if (risk) risk.category = value;
    }

    saveToLocalStorage();
}

// ===== ALIGNMENT MAP TAB =====
function renderAlignmentMap() {
    const container = document.getElementById('alignmentTable');
    if (!container) return;

    // Build table headers
    let html = '<thead><tr><th style="width: 30%;">Outcomes (PLOs)</th>';
    appState.assessmentPortfolio.forEach(a => {
        html += `<th style="width: ${Math.floor(70 / appState.assessmentPortfolio.length)}%; max-width: 200px; word-wrap: break-word;" title="${escapeHtml(a.title)}"><span style="font-size: 0.85rem;">${escapeHtml(a.title.length > 25 ? a.title.substring(0, 22) + '...' : a.title)}</span></th>`;
    });
    html += '</tr></thead><tbody>';

    // Build rows for each PLO
    appState.draftPLOs.forEach(plo => {
        html += `<tr>
            <td class="align-outcome"><small>${escapeHtml(plo.statement.substring(0, 100))}</small></td>`;
        appState.assessmentPortfolio.forEach(a => {
            const mapKey = `map-${plo.id}-${a.id}`;
            const isChecked = localStorage.getItem(mapKey) === 'true';
            html += `<td style="text-align: center;">
                <input type="checkbox" class="form-check-input alignment-check" 
                       data-plo="${plo.id}" data-assess="${a.id}" 
                       ${isChecked ? 'checked' : ''}>
            </td>`;
        });
        html += '</tr>';
    });

    html += '</tbody>';
    container.innerHTML = html;

    // Add event listeners for checkboxes
    container.querySelectorAll('.alignment-check').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const ploId = e.target.dataset.plo;
            const assessId = e.target.dataset.assess;
            const mapKey = `map-${ploId}-${assessId}`;
            localStorage.setItem(mapKey, e.target.checked);
            renderAlignmentWarnings();
        });
    });

    renderAlignmentWarnings();
}

function renderAlignmentWarnings() {
    const container = document.getElementById('alignmentWarnings');
    const warnings = [];

    // Check outcomes not assessed
    appState.draftPLOs.forEach(plo => {
        const isMapped = appState.assessmentPortfolio.some(a => 
            localStorage.getItem(`map-${plo.id}-${a.id}`) === 'true'
        );
        if (!isMapped) {
            warnings.push(`<div class="warning-item"><span class="warning-icon">⚠️</span><span><strong>Outcome not assessed:</strong> ${escapeHtml(plo.statement.substring(0, 60))}</span></div>`);
        }
    });

    // Check assessments not mapped
    appState.assessmentPortfolio.forEach(a => {
        const isMapped = appState.draftPLOs.some(plo => 
            localStorage.getItem(`map-${plo.id}-${a.id}`) === 'true'
        );
        if (!isMapped) {
            warnings.push(`<div class="warning-item"><span class="warning-icon">⚠️</span><span><strong>Assessment not mapped:</strong> ${escapeHtml(a.title.substring(0, 60))}</span></div>`);
        }
    });

    if (warnings.length === 0) {
        container.innerHTML = '<p class="text-muted small mb-0">✓ All outcomes and assessments are mapped</p>';
    } else {
        container.innerHTML = warnings.join('');
    }
}

function generatePLOsFromCapabilities() {
    if (!appState.exitCapabilities || appState.exitCapabilities.length === 0) {
        showToast('Add exit capabilities first in Backward Design tab', 'warning');
        return;
    }

    const newPLOs = appState.exitCapabilities.slice(0, 4).map(cap => ({
        id: generateId('plo'),
        statement: cap.text,
        level: 'Analyse'
    }));

    appState.draftPLOs = newPLOs;
    saveToLocalStorage();
    renderAlignmentMap();
    showToast(`Generated ${newPLOs.length} draft PLOs from exit capabilities`, 'success');
}

// ===== ASSESSMENT STUDIO TAB =====
function renderAssessmentStudio() {
    const container = document.getElementById('assessmentList');
    if (!container) return;

    if (appState.assessmentPortfolio.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No assessments yet. Click "Add Assessment" to create one.</div>';
        return;
    }

    let html = '';
    appState.assessmentPortfolio.forEach(assess => {
        const aiRiskColors = { low: '#198754', medium: '#ffc107', high: '#dc3545' };
        html += `
            <div class="assessment-card clickable" data-id="${assess.id}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="flex-grow-1">
                        <div class="assessment-title">${escapeHtml(assess.title)}</div>
                        <div class="assessment-meta">
                            <span class="assessment-meta-item">Type: ${assess.type}</span>
                            <span class="assessment-meta-item">Weighting: ${assess.weightingPercent}%</span>
                            <span class="assessment-meta-item">${assess.individualOrGroup}</span>
                            <span class="assessment-meta-item authenticity-${assess.authenticity}">Authenticity: ${assess.authenticity}/5</span>
                            <span class="assessment-meta-item" style="background-color: ${aiRiskColors[assess.aiRisk]};color: white;">AI Risk: ${assess.aiRisk}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-primary btn-edit-assessment" data-id="${assess.id}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger btn-remove-assessment" data-id="${assess.id}">Delete</button>
                </div>
            </div>
        `;
    });

    html += '<button class="btn btn-outline-primary mt-3 btn-add-assessment">+ Add Assessment</button>';
    container.innerHTML = html;

    // Add click handlers for cards
    container.querySelectorAll('.assessment-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) {
                showAssessmentModal(card.dataset.id);
            }
        });
    });
}

function showAssessmentModal(assessId) {
    const assess = appState.assessmentPortfolio.find(a => a.id === assessId);
    if (!assess) return;

    const modalTitle = document.getElementById('assessmentModalTitle');
    const modalBody = document.getElementById('assessmentModalBody');

    modalTitle.textContent = `Edit Assessment: ${assess.title}`;

    modalBody.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Assessment Title *</label>
            <input type="text" id="assTitle" class="form-control" value="${escapeHtml(assess.title)}">
        </div>

        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Type</label>
                <select id="assType" class="form-select">
                    <option value="essay" ${assess.type === 'essay' ? 'selected' : ''}>Essay / Written</option>
                    <option value="presentation" ${assess.type === 'presentation' ? 'selected' : ''}>Presentation</option>
                    <option value="project" ${assess.type === 'project' ? 'selected' : ''}>Project</option>
                    <option value="portfolio" ${assess.type === 'portfolio' ? 'selected' : ''}>Portfolio</option>
                    <option value="discussion" ${assess.type === 'discussion' ? 'selected' : ''}>Discussion</option>
                    <option value="quiz" ${assess.type === 'quiz' ? 'selected' : ''}>Quiz</option>
                    <option value="viva" ${assess.type === 'viva' ? 'selected' : ''}>Viva / Oral</option>
                </select>
            </div>

            <div class="col-md-6 mb-3">
                <label class="form-label">Individual or Group?</label>
                <select id="assIndGroup" class="form-select">
                    <option value="individual" ${assess.individualOrGroup === 'individual' ? 'selected' : ''}>Individual</option>
                    <option value="group" ${assess.individualOrGroup === 'group' ? 'selected' : ''}>Group</option>
                </select>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Evidence Outputs (comma-separated)</label>
            <textarea id="assEvidence" class="form-control" rows="2" placeholder="e.g. Written essay, Presentation slides">${(assess.evidenceOutputs || []).join(', ')}</textarea>
        </div>

        <div class="row">
            <div class="col-md-4 mb-3">
                <label class="form-label">Weighting %</label>
                <input type="number" id="assWeighting" class="form-control" value="${assess.weightingPercent}" min="0" max="100">
            </div>

            <div class="col-md-4 mb-3">
                <label class="form-label">Authenticity (1-5)</label>
                <input type="number" id="assAuthenticity" class="form-control" value="${assess.authenticity}" min="1" max="5">
            </div>

            <div class="col-md-4 mb-3">
                <label class="form-label">AI Risk</label>
                <select id="assAiRisk" class="form-select">
                    <option value="low" ${assess.aiRisk === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${assess.aiRisk === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${assess.aiRisk === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">AI Risk / Design Mitigation</label>
            <textarea id="assAiMitigation" class="form-control" rows="2" placeholder="e.g., Live viva, Turnitin check">${assess.aiRiskDesignMitigation || ''}</textarea>
        </div>

        <div class="mb-3">
            <label class="form-label">Scaffold Steps (comma-separated)</label>
            <textarea id="assScaffold" class="form-control" rows="3" placeholder="Step 1, Step 2, Step 3">${(assess.scaffoldSteps || []).join(', ')}</textarea>
        </div>

        <div class="mb-3">
            <label class="form-label">Feedback Moments (comma-separated)</label>
            <textarea id="assFeedback" class="form-control" rows="2" placeholder="Formative checkpoint, Summative">${(assess.feedbackMoments || []).join(', ')}</textarea>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('assessmentModal'));
    modal.show();

    document.getElementById('btnSaveAssessment').onclick = () => {
        assess.title = document.getElementById('assTitle').value;
        assess.type = document.getElementById('assType').value;
        assess.individualOrGroup = document.getElementById('assIndGroup').value;
        assess.evidenceOutputs = document.getElementById('assEvidence').value.split(',').map(s => s.trim()).filter(s => s);
        assess.weightingPercent = parseInt(document.getElementById('assWeighting').value) || 0;
        assess.authenticity = parseInt(document.getElementById('assAuthenticity').value) || 3;
        assess.aiRisk = document.getElementById('assAiRisk').value;
        assess.aiRiskDesignMitigation = document.getElementById('assAiMitigation').value;
        assess.scaffoldSteps = document.getElementById('assScaffold').value.split(',').map(s => s.trim()).filter(s => s);
        assess.feedbackMoments = document.getElementById('assFeedback').value.split(',').map(s => s.trim()).filter(s => s);

        saveToLocalStorage();
        renderAssessmentStudio();
        modal.hide();
        showToast('Assessment updated', 'success');
    };
}

function renderPatternLibrary() {
    const container = document.getElementById('patternLibrary');
    if (!container) return;

    if (assessmentPatterns.length === 0) {
        container.innerHTML = '<p class="text-muted">No patterns loaded</p>';
        return;
    }

    let html = '<p class="small mb-2"><strong>Click to insert pattern:</strong></p>';
    assessmentPatterns.forEach(pattern => {
        html += `<button class="btn btn-sm btn-outline-info w-100 text-start btn-insert-pattern mb-2" data-id="${pattern.id}" title="${pattern.description}">
            ${pattern.name}
        </button>`;
    });

    container.innerHTML = html;
}

function insertPattern(patternId) {
    const pattern = assessmentPatterns.find(p => p.id === patternId);
    if (!pattern) return;

    const newAssess = { ...pattern.template, id: generateId('assess') };
    appState.assessmentPortfolio.push(newAssess);
    saveToLocalStorage();
    renderAssessmentStudio();
    showToast(`Inserted pattern: ${pattern.name}`, 'success');
}

// ===== MODULE MANAGEMENT =====
/**
 * Show modules manager modal listing all modules
 */
function showModulesManager() {
    const modalBody = document.getElementById('modulesManagerBody');

    if (!appState.modules) {
        appState.modules = [];
    }

    let html = '<div class="modules-list">';

    if (appState.modules.length === 0) {
        html += '<div class="alert alert-info">No modules yet. Click "Add Module" to create one.</div>';
    } else {
        appState.modules.forEach(mod => {
            html += `
                <div class="module-card p-3 border rounded mb-2">
                    <div class="row align-items-start">
                        <div class="col-md-8">
                            <h6 class="mb-1">${escapeHtml(mod.title)}</h6>
                            <small class="text-muted d-block">
                                <strong>${mod.credits}</strong> credits | 
                                <strong>Semester ${mod.semester}</strong>
                            </small>
                            <small class="text-muted d-block mt-1">
                                Learning Outcomes: ${mod.learningOutcomes?.length || 0} | 
                                Assessments: ${mod.assessments?.length || 0}
                            </small>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-primary btn-edit-module" data-id="${mod.id}" title="Edit module">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete-module" data-id="${mod.id}" title="Delete module">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    modalBody.innerHTML = html;

    // Add event listeners
    modalBody.querySelectorAll('.btn-edit-module').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.target.dataset.id;
            showModuleEditor(moduleId);
        });
    });

    modalBody.querySelectorAll('.btn-delete-module').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.target.dataset.id;
            if (confirm('Delete this module? This cannot be undone.')) {
                deleteModule(moduleId);
                showModulesManager(); // Refresh list
            }
        });
    });

    const modal = new bootstrap.Modal(document.getElementById('modulesManagerModal'));
    modal.show();
}

/**
 * Show module editor modal for creating/editing a module
 */
function showModuleEditor(moduleId = null) {
    // Navigate to Module Studio instead of opening modal
    document.getElementById('tabModuleStudio').click();
    
    if (moduleId) {
        const moduleIndex = appState.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex >= 0) {
            renderModuleStudio();
            // Select the specific module after render
            setTimeout(() => {
                document.querySelector(`[data-mod-idx="${moduleIndex}"]`)?.click();
            }, 100);
        }
    } else {
        // For new modules, add new and navigate
        addNewModule();
        renderModuleStudio();
    }
}

/**
 * Generate module editor HTML for inline viewing
 */
function showModuleEditorInline(moduleIndex, module) {
    window.currentModuleStudioIndex = moduleIndex;
    window.currentEditingModule = {
        isNew: false,
        originalModule: module,
        moduleData: { ...module }
    };

    return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>${escapeHtml(module.title)}</h4>
                <button class="btn btn-success btn-sm btn-save-module-studio">💾 Save Module</button>
            </div>

            <ul class="nav nav-tabs mb-3" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#modStudioBasic" type="button" role="tab">
                        📋 Basic Info
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#modStudioOutcomes" type="button" role="tab">
                        🎯 Learning Outcomes
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#modStudioUDL" type="button" role="tab">
                        ♿ UDL Evidence
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#modStudioAssessments" type="button" role="tab">
                        📋 Assessments
                    </button>
                </li>
            </ul>

            <div class="tab-content">
                <!-- Basic Info Tab -->
                <div class="tab-pane fade show active" id="modStudioBasic" role="tabpanel">
                    <div class="mb-3">
                        <label class="form-label">Module Title *</label>
                        <input type="text" id="modTitle" class="form-control" value="${escapeHtml(module.title)}" placeholder="e.g., Project Management Essentials">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Credits</label>
                            <input type="number" id="modCredits" class="form-control" value="${module.credits}" min="1" max="60">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Semester</label>
                            <input type="number" id="modSemester" class="form-control" value="${module.semester}" min="1" max="4">
                        </div>
                    </div>
                </div>

                <!-- Learning Outcomes Tab -->
                <div class="tab-pane fade" id="modStudioOutcomes" role="tabpanel">
                    <button class="btn btn-sm btn-primary mb-3 btn-add-lo">+ Add Learning Outcome</button>
                    <div id="modOutcomesList">
                        ${(module.learningOutcomes || []).map((lo, idx) => `
                            <div class="card mb-2">
                                <div class="card-body p-2">
                                    <input type="text" class="form-control form-control-sm mb-2" data-lo-field="statement" value="${escapeHtml(lo.statement)}" placeholder="Learning outcome statement">
                                    <div class="d-flex gap-2">
                                        <select class="form-select form-select-sm" data-lo-field="level">
                                            <option value="Remember" ${lo.level === 'Remember' ? 'selected' : ''}>Remember</option>
                                            <option value="Understand" ${lo.level === 'Understand' ? 'selected' : ''}>Understand</option>
                                            <option value="Apply" ${lo.level === 'Apply' ? 'selected' : ''}>Apply</option>
                                            <option value="Analyze" ${lo.level === 'Analyze' ? 'selected' : ''}>Analyze</option>
                                            <option value="Evaluate" ${lo.level === 'Evaluate' ? 'selected' : ''}>Evaluate</option>
                                            <option value="Create" ${lo.level === 'Create' ? 'selected' : ''}>Create</option>
                                        </select>
                                        <button class="btn btn-xs btn-outline-danger btn-remove-lo" data-lo-idx="${idx}">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- UDL Evidence Tab -->
                <div class="tab-pane fade" id="modStudioUDL" role="tabpanel">
                    <div class="alert alert-info mb-4">
                        <small>
                            ♿ <strong>Optional:</strong> Add evidence of Universal Design for Learning (UDL) accessibility features. 
                            This helps ensure your module is accessible to diverse learners.
                        </small>
                    </div>
                    
                    <div id="udlSection">
                        <div class="d-flex align-items-center mb-3">
                            <button class="btn btn-sm btn-outline-secondary btn-toggle-udl-evidence" >
                                ▼ Hide UDL Evidence Details
                            </button>
                            <span class="ms-3 badge bg-light text-dark">📊 <span class="udl-evidence-summary-count">0</span>/9 UDL areas addressed</span>
                        </div>
                        
                        <div class="udl-evidence-details">
                            <div class="mb-4">
                                <div class="d-flex align-items-center mb-2 cursor-pointer btn-toggle-udl-dimension" data-dimension="representation">
                                    <span class="toggle-icon" style="cursor: pointer; min-width: 20px;">▼</span>
                                    <span style="cursor: pointer;">📊 Representation</span>
                                </div>
                                <div class="ms-2 udl-dimension-items" data-dimension="representation">
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="representation" value="Perception" id="rep-perception">
                                        <label class="form-check-label" for="rep-perception">Perception - Multiple modalities</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="representation-Perception" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="representation" value="Language" id="rep-language">
                                        <label class="form-check-label" for="rep-language">Language & Symbols - Clarify vocabulary</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="representation-Language" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="representation" value="Comprehension" id="rep-comprehension">
                                        <label class="form-check-label" for="rep-comprehension">Comprehension - Activate prior knowledge</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="representation-Comprehension" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="d-flex align-items-center mb-2 cursor-pointer btn-toggle-udl-dimension" data-dimension="actionExpression">
                                    <span class="toggle-icon" style="cursor: pointer; min-width: 20px;">▼</span>
                                    <span style="cursor: pointer;">🎯 Action & Expression</span>
                                </div>
                                <div class="ms-2 udl-dimension-items" data-dimension="actionExpression">
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="actionExpression" value="PhysicalAction" id="act-physical">
                                        <label class="form-check-label" for="act-physical">Physical Action - Multiple response methods</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="actionExpression-PhysicalAction" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="actionExpression" value="Expression" id="act-expression">
                                        <label class="form-check-label" for="act-expression">Expression & Communication - Multiple media</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="actionExpression-Expression" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="actionExpression" value="Executive" id="act-executive">
                                        <label class="form-check-label" for="act-executive">Executive Functions - Support planning</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="actionExpression-Executive" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="d-flex align-items-center mb-2 cursor-pointer btn-toggle-udl-dimension" data-dimension="engagement">
                                    <span class="toggle-icon" style="cursor: pointer; min-width: 20px;">▼</span>
                                    <span style="cursor: pointer;">💡 Engagement</span>
                                </div>
                                <div class="ms-2 udl-dimension-items" data-dimension="engagement">
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="engagement" value="Recruiting" id="eng-recruiting">
                                        <label class="form-check-label" for="eng-recruiting">Recruiting Attention - Emotional salience</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="engagement-Recruiting" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="engagement" value="Sustaining" id="eng-sustaining">
                                        <label class="form-check-label" for="eng-sustaining">Sustaining Effort - Optimize challenge</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="engagement-Sustaining" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <input type="checkbox" class="form-check-input udl-sublevel" data-udl-dim="engagement" value="SelfRegulation" id="eng-selfregulation">
                                        <label class="form-check-label" for="eng-selfregulation">Self-Regulation - Clear expectations</label>
                                        <textarea class="form-control form-control-sm mt-1 ms-3 udl-evidence" data-udl-sublevel="engagement-SelfRegulation" rows="2" placeholder="Evidence..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Assessments Tab -->
                <div class="tab-pane fade" id="modStudioAssessments" role="tabpanel">
                    <button class="btn btn-sm btn-primary mb-3 btn-add-studio-assessment">+ Add Assessment</button>
                    <div id="modStudioAssessmentsList">
                        ${module.assessments && module.assessments.length > 0 ? module.assessments.map((assess, idx) => `
                            <div class="card mb-2 border-light">
                                <div class="card-body py-2 px-3">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div style="flex: 1; font-size: 0.9rem;">
                                            <strong>${escapeHtml(assess.name || 'Untitled')}</strong><br>
                                            <small class="text-muted">Type: ${assess.type || '—'} | Weight: ${assess.weight || '—'}%</small><br>
                                            ${assess.description ? `<small>${escapeHtml(assess.description)}</small>` : ''}
                                        </div>
                                        <div>
                                            <button class="btn btn-xs btn-outline-primary me-1 btn-edit-studio-assessment" data-assess-idx="${idx}">✏️</button>
                                            <button class="btn btn-xs btn-outline-danger btn-delete-studio-assessment" data-assess-idx="${idx}">🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<div class="text-muted small"><em>No assessments yet</em></div>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event handlers for Module Studio
 */
function attachModuleStudioHandlers(moduleIndex) {
    const detailsContainer = document.getElementById('moduleStudioDetails');
    if (!detailsContainer) return;

    // Save module button
    detailsContainer.querySelector('.btn-save-module-studio')?.addEventListener('click', () => {
        saveModuleFromEditor();
        renderModuleStudio();
    });

    // Add learning outcome
    detailsContainer.querySelectorAll('.btn-add-lo').forEach(btn => {
        btn.addEventListener('click', () => {
            const newLO = { id: generateId('modlo'), statement: 'New learning outcome', level: 'Apply' };
            if (!window.currentEditingModule.moduleData.learningOutcomes) {
                window.currentEditingModule.moduleData.learningOutcomes = [];
            }
            window.currentEditingModule.moduleData.learningOutcomes.push(newLO);
            renderModuleStudioDetails(moduleIndex);
            attachModuleStudioHandlers(moduleIndex);
        });
    });

    // Remove learning outcome
    detailsContainer.querySelectorAll('.btn-remove-lo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const loIdx = parseInt(e.target.dataset.loIdx);
            window.currentEditingModule.moduleData.learningOutcomes.splice(loIdx, 1);
            renderModuleStudioDetails(moduleIndex);
            attachModuleStudioHandlers(moduleIndex);
        });
    });

    // Add assessment
    detailsContainer.querySelector('.btn-add-studio-assessment')?.addEventListener('click', () => {
        if (!window.currentEditingModule.moduleData.assessments) {
            window.currentEditingModule.moduleData.assessments = [];
        }
        const newAssessment = { id: generateId('assess'), name: 'New Assessment', type: 'Assignment', weight: 0, description: '' };
        window.currentEditingModule.moduleData.assessments.push(newAssessment);
        renderModuleStudioDetails(moduleIndex);
        attachModuleStudioHandlers(moduleIndex);
    });

    // Edit assessment
    detailsContainer.querySelectorAll('.btn-edit-studio-assessment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assessIdx = parseInt(e.target.dataset.assessIdx);
            const assessment = window.currentEditingModule.moduleData.assessments[assessIdx];
            if (assessment) {
                showAssessmentModal(assessIdx, assessment);
            }
        });
    });

    // Delete assessment
    detailsContainer.querySelectorAll('.btn-delete-studio-assessment').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const assessIdx = parseInt(e.target.dataset.assessIdx);
            if (confirm('Delete this assessment?')) {
                window.currentEditingModule.moduleData.assessments.splice(assessIdx, 1);
                renderModuleStudioDetails(moduleIndex);
                attachModuleStudioHandlers(moduleIndex);
            }
        });
    });

    // Populate UDL Evidence
    if (window.currentEditingModule.moduleData.udlEvidence && Array.isArray(window.currentEditingModule.moduleData.udlEvidence)) {
        window.currentEditingModule.moduleData.udlEvidence.forEach(item => {
            const checkbox = detailsContainer.querySelector(`.udl-sublevel[data-udl-dim="${item.dimension}"][value="${item.sublevel}"]`);
            const textarea = detailsContainer.querySelector(`[data-udl-sublevel="${item.dimension}-${item.sublevel}"]`);
            if (checkbox) checkbox.checked = true;
            if (textarea) textarea.value = item.evidence;
        });
    }

    // UDL Evidence main toggle button
    const udlToggleBtn = detailsContainer.querySelector('.btn-toggle-udl-evidence');
    if (udlToggleBtn) {
        udlToggleBtn.addEventListener('click', function() {
            const detailsSection = detailsContainer.querySelector('.udl-evidence-details');
            if (detailsSection) {
                detailsSection.classList.toggle('d-none');
                this.textContent = detailsSection.classList.contains('d-none') ? '▶️ Show UDL Evidence Details' : '▼ Hide UDL Evidence Details';
            }
        });
    }

    // UDL Dimension toggle buttons
    detailsContainer.querySelectorAll('.btn-toggle-udl-dimension').forEach(btn => {
        btn.addEventListener('click', function() {
            const dimension = this.dataset.dimension;
            const dimensionItems = detailsContainer.querySelector(`.udl-dimension-items[data-dimension="${dimension}"]`);
            if (dimensionItems) {
                const isHidden = dimensionItems.classList.contains('d-none');
                dimensionItems.classList.toggle('d-none');
                // Update button text
                const icon = this.querySelector('.toggle-icon');
                if (icon) {
                    icon.textContent = isHidden ? '▼' : '▶️';
                }
            }
        });
    });

    // UDL Evidence checkboxes
    detailsContainer.querySelectorAll('.udl-sublevel').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const dimension = this.dataset.udlDim;
            const sublevel = this.value;
            const evidence = detailsContainer.querySelector(`[data-udl-sublevel="${dimension}-${sublevel}"]`)?.value || '';
            
            // Update appState
            if (!window.currentEditingModule.moduleData.udlEvidence) {
                window.currentEditingModule.moduleData.udlEvidence = [];
            }
            
            if (this.checked) {
                // Add or update
                const existing = window.currentEditingModule.moduleData.udlEvidence.find(
                    item => item.dimension === dimension && item.sublevel === sublevel
                );
                if (!existing) {
                    window.currentEditingModule.moduleData.udlEvidence.push({
                        dimension,
                        sublevel,
                        evidence
                    });
                }
            } else {
                // Remove
                window.currentEditingModule.moduleData.udlEvidence = window.currentEditingModule.moduleData.udlEvidence.filter(
                    item => !(item.dimension === dimension && item.sublevel === sublevel)
                );
            }
            
            // Update summary count
            updateUDLEvidenceSummary(moduleIndex);
        });
    });

    // UDL Evidence textareas
    detailsContainer.querySelectorAll('[data-udl-sublevel]').forEach(textarea => {
        textarea.addEventListener('change', function() {
            const match = this.dataset.udlSublevel.match(/(.+)-(.+)/);
            if (match) {
                const dimension = match[1];
                const sublevel = match[2];
                const evidence = this.value;
                
                if (!window.currentEditingModule.moduleData.udlEvidence) {
                    window.currentEditingModule.moduleData.udlEvidence = [];
                }
                
                // Update or add
                let item = window.currentEditingModule.moduleData.udlEvidence.find(
                    it => it.dimension === dimension && it.sublevel === sublevel
                );
                if (item) {
                    item.evidence = evidence;
                } else if (evidence) {
                    // Only add if evidence is not empty
                    const checkbox = detailsContainer.querySelector(`.udl-sublevel[data-udl-dim="${dimension}"][value="${sublevel}"]`);
                    if (checkbox && checkbox.checked) {
                        window.currentEditingModule.moduleData.udlEvidence.push({
                            dimension,
                            sublevel,
                            evidence
                        });
                    }
                }
            }
        });
    });
}

/**
 * Update UDL Evidence summary count
 */
function updateUDLEvidenceSummary(moduleIndex) {
    const detailsContainer = document.getElementById('moduleStudioDetails');
    const summaryElement = detailsContainer?.querySelector('.udl-evidence-summary-count');
    
    if (summaryElement && window.currentEditingModule?.moduleData?.udlEvidence) {
        const count = window.currentEditingModule.moduleData.udlEvidence.filter(item => item.evidence).length;
        summaryElement.textContent = count;
    }
}

/**
 * Add a new module
 */
function addNewModule() {
    if (!appState.modules) {
        appState.modules = [];
    }

    const newModule = {
        id: generateId('mod'),
        title: 'New Module',
        credits: 10,
        semester: appState.modules.length + 1,
        learningOutcomes: [],
        assessments: [],
        learningExperience: {
            description: '',
            weeklyRhythm: [],
            notes: ''
        },
        udlEvidence: []
    };

    appState.modules.push(newModule);
    saveToLocalStorage();
    showToast('Module created. Click Edit to configure details.', 'success');
    showModuleEditor(newModule.id);
}

/**
 * Show quick-add module modal for Canvas ideation flow
 */
function showQuickAddModuleModal() {
    const html = `
        <div class="modal fade" id="quickAddModuleModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">➕ Create New Module</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Module Title *</label>
                            <input type="text" id="quickModuleTitle" class="form-control" placeholder="e.g., Data Structures" autofocus>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Credits</label>
                                    <input type="number" id="quickModuleCredits" class="form-control" value="10" min="1" max="60">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Semester</label>
                                    <input type="number" id="quickModuleSemester" class="form-control" value="${(appState.modules?.length || 0) + 1}" min="1" max="8">
                                </div>
                            </div>
                        </div>
                        <div class="alert alert-info small">
                            <strong>💡 Tip:</strong> Create the module here, then jump to Module Studio to add learning outcomes and assessments.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" id="saveQuickModule">Create & Edit</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let modalEl = document.getElementById('quickAddModuleModal');
    if (modalEl) modalEl.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    modalEl = document.getElementById('quickAddModuleModal');

    // Handle save
    document.getElementById('saveQuickModule').addEventListener('click', () => {
        const title = document.getElementById('quickModuleTitle').value.trim();
        const credits = parseInt(document.getElementById('quickModuleCredits').value) || 10;
        const semester = parseInt(document.getElementById('quickModuleSemester').value) || 1;

        if (!title) {
            showToast('Module title is required', 'warning');
            return;
        }

        if (!appState.modules) appState.modules = [];

        const newModule = {
            id: generateId('mod'),
            title,
            credits,
            semester,
            learningOutcomes: [],
            assessments: [],
            learningExperience: {
                description: '',
                weeklyRhythm: [],
                notes: ''
            },
            udlEvidence: []
        };

        appState.modules.push(newModule);
        saveToLocalStorage();
        showToast(`Module "${title}" created! Opening editor...`, 'success');
        
        // Close modal and show module editor
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal.hide();
        showModuleEditor(newModule.id);
        renderCanvasTile('modules');
    });

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * Show assessment editor modal for module
 */
function showAssessmentModal(assessmentIndex, assessment) {
    const assessmentTypes = ['Assignment', 'Exam', 'Project', 'Presentation', 'Quiz', 'Portfolio', 'Practical', 'Participation', 'Other'];
    
    const html = `
        <div class="modal fade" id="assessmentModuleModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Assessment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Assessment Name *</label>
                            <input type="text" id="assessName" class="form-control" value="${escapeHtml(assessment.name)}" placeholder="e.g., Final Project">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Assessment Type</label>
                            <select id="assessType" class="form-select">
                                ${assessmentTypes.map(type => `<option value="${type}" ${assessment.type === type ? 'selected' : ''}>${type}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Weight (%) *</label>
                            <input type="number" id="assessWeight" class="form-control" value="${assessment.weight || 0}" min="0" max="100">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea id="assessDesc" class="form-control" rows="3" placeholder="Assessment details...">${escapeHtml(assessment.description || '')}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">🤖 AI Risk Level</label>
                            <select id="assessAiRisk" class="form-select">
                                <option value="low" ${(assessment.aiRisk || 'medium') === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${(assessment.aiRisk || 'medium') === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${(assessment.aiRisk || 'medium') === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">🤖 AI Risk Design Mitigation</label>
                            <textarea id="assessAiMitigation" class="form-control" rows="3" placeholder="Describe how AI risks are mitigated in this assessment design...">${escapeHtml(assessment.aiRiskDesignMitigation || '')}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveModuleAssessment(${assessmentIndex})">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('assessmentModuleModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = new bootstrap.Modal(document.getElementById('assessmentModuleModal'));
    modal.show();
}

/**
 * Save module assessment
 */
function saveModuleAssessment(assessmentIndex) {
    const name = document.getElementById('assessName')?.value.trim();
    const type = document.getElementById('assessType')?.value;
    const weight = parseInt(document.getElementById('assessWeight')?.value) || 0;
    const description = document.getElementById('assessDesc')?.value.trim();
    const aiRisk = document.getElementById('assessAiRisk')?.value;
    const aiRiskDesignMitigation = document.getElementById('assessAiMitigation')?.value.trim();

    if (!name) {
        showToast('Assessment name is required', 'danger');
        return;
    }

    if (window.currentEditingModule?.moduleData?.assessments?.[assessmentIndex]) {
        window.currentEditingModule.moduleData.assessments[assessmentIndex] = {
            ...window.currentEditingModule.moduleData.assessments[assessmentIndex],
            name,
            type,
            weight,
            description,
            aiRisk,
            aiRiskDesignMitigation
        };
    }

    bootstrap.Modal.getInstance(document.getElementById('assessmentModuleModal'))?.hide();
    showModuleEditor(window.currentEditingModule.originalModule.id);
    showToast('Assessment saved', 'success');
}

/**
 * Delete a module
 */
function deleteModule(moduleId) {
    appState.modules = appState.modules.filter(m => m.id !== moduleId);
    saveToLocalStorage();
    renderCanvas();
    showToast('Module deleted', 'info');
}

/**
 * Save module from modal
 */
function saveModuleFromEditor() {
    const isNew = window.currentEditingModule?.isNew;
    const originalModule = window.currentEditingModule?.originalModule;

    // Collect form data
    const title = document.getElementById('modTitle')?.value || 'Untitled Module';
    const credits = parseInt(document.getElementById('modCredits')?.value) || 10;
    const semester = parseInt(document.getElementById('modSemester')?.value) || 1;

    // Collect learning outcomes
    const outcomesList = document.getElementById('modOutcomesList');
    const learningOutcomes = [];
    if (outcomesList) {
        const inputs = outcomesList.querySelectorAll('input[data-lo-field="statement"]');
        const selects = outcomesList.querySelectorAll('select[data-lo-field="level"]');
        inputs.forEach((input, idx) => {
            if (input.value.trim()) {
                learningOutcomes.push({
                    id: generateId('modlo'),
                    statement: input.value.trim(),
                    level: selects[idx]?.value || 'Apply'
                });
            }
        });
    }

    // Collect learning experience
    const learningExperience = {
        weeklyTemplate: {
            monday: document.querySelector('[data-le-field="monday"]')?.value || '',
            wednesdayEvening: document.querySelector('[data-le-field="wednesdayEvening"]')?.value || '',
            thursday: document.querySelector('[data-le-field="thursday"]')?.value || '',
            friday: document.querySelector('[data-le-field="friday"]')?.value || '',
            weekend: document.querySelector('[data-le-field="weekend"]')?.value || ''
        },
        cognitivePresence: originalModule.learningExperience?.cognitivePresence || []
    };

    // Collect UDL Evidence
    const udlEvidence = [];
    document.querySelectorAll('.udl-sublevel:checked').forEach(checkbox => {
        const dimension = checkbox.dataset.udlDim;
        const sublevel = checkbox.value;
        const evidenceKey = `${dimension}-${sublevel}`;
        const evidenceText = document.querySelector(`[data-udl-sublevel="${evidenceKey}"]`)?.value || '';
        if (evidenceText.trim()) {
            udlEvidence.push({
                dimension,
                sublevel,
                evidence: evidenceText.trim()
            });
        }
    });

    // Update or create module
    if (isNew) {
        const newModule = {
            id: originalModule.id,
            title,
            credits,
            semester,
            learningOutcomes,
            assessments: window.currentEditingModule.moduleData.assessments || [],
            learningExperience,
            udlEvidence
        };
        appState.modules.push(newModule);
    } else {
        const moduleToUpdate = appState.modules.find(m => m.id === originalModule.id);
        if (moduleToUpdate) {
            moduleToUpdate.title = title;
            moduleToUpdate.credits = credits;
            moduleToUpdate.semester = semester;
            moduleToUpdate.learningOutcomes = learningOutcomes;
            moduleToUpdate.assessments = window.currentEditingModule.moduleData.assessments || [];
            moduleToUpdate.learningExperience = learningExperience;
            moduleToUpdate.udlEvidence = udlEvidence;
        }
    }

    saveToLocalStorage();
    renderCanvas();
    bootstrap.Modal.getInstance(document.getElementById('moduleEditorModal')).hide();
    showToast(isNew ? 'Module created successfully!' : 'Module updated successfully!', 'success');
}

// ===== BACKWARD DESIGN TAB =====
function renderBackwardDesign() {
    const container = document.getElementById('contentBackwardDesign');
    if (!container) return;

    container.innerHTML = `
        <h2 class="mb-4">🎯 Backward Design: Graduate Performance & Evidence</h2>
        
        <ul class="nav nav-tabs mb-4" role="tablist" id="backwardDesignTabs">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="bdProgrammeTab" data-bs-toggle="tab" data-bs-target="#bdProgrammeContent" type="button" role="tab">
                    📊 Programme Level
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="bdModuleTab" data-bs-toggle="tab" data-bs-target="#bdModuleContent" type="button" role="tab">
                    📦 Module Level
                </button>
            </li>
        </ul>

        <div class="tab-content">
            <!-- PROGRAMME LEVEL -->
            <div class="tab-pane fade show active" id="bdProgrammeContent" role="tabpanel">
                ${renderProgrammeLevelBackwardDesign()}
            </div>

            <!-- MODULE LEVEL -->
            <div class="tab-pane fade" id="bdModuleContent" role="tabpanel">
                ${renderModuleLevelBackwardDesign()}
            </div>
        </div>

        <!-- Modals -->
        ${renderPLOModal()}
        ${renderAssessmentEvidenceModal()}
        ${renderLearningActivityModal()}
    `;

    // Add event listeners for score sliders
    container.querySelectorAll('.authenticity-slider, .transfer-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const labelId = e.target.dataset.labelId;
            if (labelId) document.getElementById(labelId).textContent = e.target.value + '/5';
        });
    });
}

function renderModuleLevelBackwardDesign() {
    if (!appState.modules || appState.modules.length === 0) {
        return '<div class="alert alert-info">📦 No modules defined yet. Create modules in Canvas first.</div>';
    }

    // Module selector
    const defaultModule = appState.modules[0];
    
    return `
        <div class="row">
            <div class="col-lg-3">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0">📦 Select Module</h6>
                    </div>
                    <div class="card-body">
                        <div id="moduleList" class="list-group">
                            ${appState.modules.map(mod => `
                                <button class="list-group-item list-group-item-action module-selector" data-module-id="${mod.id}" ${mod.id === defaultModule.id ? 'active' : ''}>
                                    <div class="fw-bold">${escapeHtml(mod.title)}</div>
                                    <small class="text-muted">${mod.credits} cr • Sem ${mod.semester}</small>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-9">
                <div id="moduleDetailContent">
                    ${renderModuleBackwardDesignDetail(defaultModule.id)}
                </div>
            </div>
        </div>

        <!-- Modals for module backward design -->
        ${renderAssessmentEvidenceModal()}
        ${renderLearningActivityModal()}
    `;
}

function renderModuleBackwardDesignDetail(moduleId) {
    const module = appState.modules.find(m => m.id === moduleId);
    if (!module) return '';

    // Initialize module properties if missing
    if (!module.supportsExitCapabilities) module.supportsExitCapabilities = [];
    if (!module.assessmentEvidence) module.assessmentEvidence = [];
    if (!module.learningActivities) module.learningActivities = [];

    return `
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">${escapeHtml(module.title)}</h5>
                <small>${module.credits} credits • Semester ${module.semester}</small>
            </div>
            <div class="card-body">
                <!-- STEP 1: MODULE CONTRIBUTION -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="text-primary">☑️ Step 1: Link Module to Exit Capabilities</h6>
                        <span class="badge bg-info">${module.supportsExitCapabilities?.length || 0} linked</span>
                    </div>
                    <p class="small text-muted mb-3"><strong>Instruction:</strong> Check which exit capabilities this module helps develop. This ensures alignment between module design and programme outcomes.</p>
                    
                    <div id="capabilityCheckboxes" class="bg-light p-3 rounded mb-3">
                        ${appState.exitCapabilities && appState.exitCapabilities.length > 0 ? `
                            ${appState.exitCapabilities.map(cap => `
                                <div class="form-check">
                                    <input class="form-check-input module-capability-checkbox" type="checkbox" id="mod-cap-${module.id}-${cap.id}" 
                                           data-module-id="${module.id}" data-cap-id="${cap.id}"
                                           ${(module.supportsExitCapabilities || []).includes(cap.id) ? 'checked' : ''}>
                                    <label class="form-check-label" for="mod-cap-${module.id}-${cap.id}">
                                        <strong>${escapeHtml(cap.text.substring(0, 60))}${cap.text.length > 60 ? '...' : ''}</strong>
                                        ${cap.tags && cap.tags.length > 0 ? `<br><small>${cap.tags.map(t => `<span class="badge bg-info">${t}</span>`).join(' ')}</small>` : ''}
                                    </label>
                                </div>
                            `).join('')}
                        ` : `<p class="text-muted small">No exit capabilities defined. Create them in Backward Design → Programme Level first.</p>`}
                    </div>
                </div>

                <!-- STEP 2: ASSESSMENT EVIDENCE (before activities) -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="text-success">📋 Step 2: Assessment Evidence</h6>
                        <span class="badge bg-success">${(module.assessmentEvidence || []).length}</span>
                    </div>
                    <p class="small text-muted mb-3">What must learners produce? Define BEFORE learning activities.</p>

                    <div class="mb-3">
                        ${(module.assessmentEvidence || []).length === 0 ? 
                            `<div class="alert alert-warning">⚠️ No assessment evidence defined for this module. Add evidence before creating learning activities.</div>` :
                            `<div id="evidenceList">
                                ${(module.assessmentEvidence || []).map(ev => `
                                    <div class="card card-sm mb-2 border-light">
                                        <div class="card-body py-2 px-3">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <small><strong>${escapeHtml(ev.description)}</strong></small><br>
                                                    <small class="text-muted">Real-world: ${escapeHtml(ev.simulatedPerformance)} | AI Risk: ${ev.aiRisk}</small>
                                                </div>
                                                <div>
                                                    <button class="btn btn-xs btn-outline-primary me-1 btn-edit-module-evidence" data-module-id="${module.id}" data-ev-id="${ev.id}">✏️</button>
                                                    <button class="btn btn-xs btn-outline-danger btn-delete-module-evidence" data-module-id="${module.id}" data-ev-id="${ev.id}">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>

                    <button class="btn btn-sm btn-success btn-add-module-evidence" data-module-id="${module.id}">
                        + Add Assessment Evidence
                    </button>
                </div>

                <!-- STEP 3: LEARNING ACTIVITIES (linked to evidence) -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="text-info">🎓 Step 3: Learning Activities</h6>
                        <span class="badge bg-info">${(module.learningActivities || []).length}</span>
                    </div>
                    <p class="small text-muted mb-3">What learning prepares for the evidence? (Only available after assessment evidence)</p>

                    ${(module.assessmentEvidence || []).length === 0 ? 
                        `<div class="alert alert-secondary">ℹ️ Add Assessment Evidence first, then define learning activities.</div>` :
                        `<div id="activitiesList">
                            ${(module.learningActivities || []).length === 0 ? 
                                `<p class="text-muted small">No learning activities defined yet.</p>` :
                                `${(module.learningActivities || []).map(act => `
                                    <div class="card card-sm mb-2 border-light">
                                        <div class="card-body py-2 px-3">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <small><strong>${escapeHtml(act.description)}</strong></small><br>
                                                    <small class="text-muted">Prepares for: ${act.preparesForEvidenceId ? 
                                                        escapeHtml((module.assessmentEvidence.find(e => e.id === act.preparesForEvidenceId)?.description || 'Unknown')) : 
                                                        'Not linked'}</small>
                                                </div>
                                                <div>
                                                    <button class="btn btn-xs btn-outline-primary me-1 btn-edit-module-activity" data-module-id="${module.id}" data-act-id="${act.id}">✏️</button>
                                                    <button class="btn btn-xs btn-outline-danger btn-delete-module-activity" data-module-id="${module.id}" data-act-id="${act.id}">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}`
                            }
                        </div>`
                    }

                    ${(module.assessmentEvidence || []).length > 0 ? `
                        <button class="btn btn-sm btn-info btn-add-module-activity" data-module-id="${module.id}" style="margin-top: 10px;">
                            + Add Learning Activity
                        </button>
                    ` : ''}
                </div>

                <!-- WARNINGS -->
                <div id="moduleWarnings" class="mt-4">
                    ${renderModuleBackwardDesignWarnings(module)}
                </div>
            </div>
        </div>
    `;
}

function renderModuleBackwardDesignWarnings(module) {
    const warnings = [];

    if (!module.supportsExitCapabilities || module.supportsExitCapabilities.length === 0) {
        warnings.push('<div class="alert alert-warning"><small>⚠️ Module is not linked to any exit capabilities</small></div>');
    }

    if (!module.assessmentEvidence || module.assessmentEvidence.length === 0) {
        warnings.push('<div class="alert alert-warning"><small>⚠️ No assessment evidence defined for this module</small></div>');
    }

    if (module.learningActivities) {
        module.learningActivities.forEach(act => {
            if (!act.preparesForEvidenceId) {
                warnings.push(`<div class="alert alert-warning"><small>⚠️ Activity "${escapeHtml(act.description.substring(0, 30))}" is not linked to assessment evidence</small></div>`);
            }
        });
    }

    return warnings.length > 0 ? warnings.join('') : '<div class="alert alert-success"><small>✓ Module backward design looks good</small></div>';
}

function renderPLOModal() {
    return `
        <div class="modal fade" id="ploModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="ploModalTitle">Add Programme Learning Outcome</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label"><strong>PLO Statement</strong></label>
                            <textarea class="form-control" id="ploStatement" rows="3" placeholder="e.g., Demonstrate knowledge of contemporary strategic management theories and their application"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>Bloom's Level</strong></label>
                            <select class="form-select" id="ploLevel">
                                <option value="Remember">Remember</option>
                                <option value="Understand">Understand</option>
                                <option value="Apply">Apply</option>
                                <option value="Analyse">Analyse</option>
                                <option value="Evaluate">Evaluate</option>
                                <option value="Create">Create</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="savePLO()">Save PLO</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAssessmentEvidenceModal() {
    return `
        <div class="modal fade" id="assessmentEvidenceModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="assessmentEvidenceModalTitle">Add Assessment Evidence</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label"><strong>Link to Module Assessment (Optional)</strong></label>
                            <select class="form-select" id="evidenceAssessmentLink">
                                <option value="">-- Manual Entry (No Assessment Link) --</option>
                            </select>
                            <small class="form-text text-muted">Select an assessment or leave blank to enter custom evidence</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>What must learners produce?</strong></label>
                            <textarea class="form-control" id="evidenceDescription" rows="2" placeholder="e.g., A 5000-word strategic analysis report"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>What real-world performance does this simulate?</strong></label>
                            <textarea class="form-control" id="simulatedPerformance" rows="2" placeholder="e.g., Consultant delivering recommendations to board"></textarea>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label"><strong>AI Vulnerability</strong></label>
                                <select class="form-select" id="assessmentAiRisk">
                                    <option value="low">🟢 Low</option>
                                    <option value="medium" selected>🟡 Medium</option>
                                    <option value="high">🔴 High</option>
                                </select>
                                <small class="form-text text-muted">Risk of AI-generated content displacing human thinking</small>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>Scaffold Steps (comma-separated)</strong></label>
                            <textarea class="form-control" id="evidenceScaffold" rows="2" placeholder="Outline → Draft → Peer Review → Final"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveModuleAssessmentEvidence()">Save Evidence</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLearningActivityModal() {
    return `
        <div class="modal fade" id="learningActivityModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="learningActivityModalTitle">Add Learning Activity</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label"><strong>Activity Description</strong></label>
                            <textarea class="form-control" id="activityDescription" rows="2" placeholder="e.g., Case study analysis workshop with peer feedback"></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>Links to which Assessment Evidence?</strong></label>
                            <select class="form-select" id="activityLinksToEvidence">
                                <option value="">-- Select Evidence Item --</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>When in the semester?</strong></label>
                            <input type="text" class="form-control" id="activityTiming" placeholder="e.g., Weeks 2-4">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-info" onclick="saveModuleLearningActivity()">Save Activity</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProgrammeLevelBackwardDesign() {
    return `
        <div class="row">
            <!-- SECTION 1: EXIT CAPABILITIES -->
            <div class="col-lg-6 mb-4">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">🎯 Exit Capabilities</h5>
                        <small>What must be true about a graduate of this programme?</small>
                    </div>
                    <div class="card-body">
                        ${renderExitCapabilitiesList()}
                    </div>
                    <div class="card-footer bg-light">
                        <button class="btn btn-sm btn-primary btn-add-exit-capability">
                            + Add Exit Capability
                        </button>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: PROGRAMME LEARNING OUTCOMES (PLOs) -->
            <div class="col-lg-6 mb-4">
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">📚 Programme Learning Outcomes (PLOs)</h5>
                        <small>Mapped from exit capabilities to module outcomes</small>
                    </div>
                    <div class="card-body">
                        ${renderProgrammeLearningOutcomesList()}
                    </div>
                    <div class="card-footer bg-light">
                        <button class="btn btn-sm btn-info btn-add-plo">
                            + Add PLO
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <!-- SECTION 3: PROGRAMME EVIDENCE -->
            <div class="col-lg-12 mb-4">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">📋 Programme Evidence</h5>
                        <small>What evidence proves this capability?</small>
                    </div>
                    <div class="card-body">
                        ${renderProgrammeEvidenceList()}
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 4: PROGRAMME PERFORMANCE SUMMARY -->
        <div class="row mt-4">
            <div class="col-12">
                ${renderProgrammePerformanceSummary()}
            </div>
        </div>
    `;
}

function renderExitCapabilitiesList() {
    if (!appState.exitCapabilities || appState.exitCapabilities.length === 0) {
        return '<div class="alert alert-secondary">No exit capabilities defined yet.</div>';
    }

    return appState.exitCapabilities.map(cap => `
        <div class="card mb-3 border-light">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div style="flex: 1;">
                        <p class="mb-2"><strong>${escapeHtml(cap.text)}</strong></p>
                        <div class="mb-2">
                            ${cap.tags && cap.tags.length > 0 ? `
                                <div class="mb-2">
                                    ${cap.tags.map(tag => `<span class="badge bg-info me-1">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <small class="text-muted">
                            📊 ${cap.evidence?.length || 0} evidence item${(cap.evidence?.length || 0) !== 1 ? 's' : ''}
                            ${(cap.evidence?.length || 0) === 0 ? `<br><span class="text-danger">⚠️ Not evidenced at programme level</span>` : ''}
                        </small>
                        <br>
                        <button class="btn btn-sm btn-success btn-add-evidence mt-2" data-cap-id="${cap.id}" style="font-size: 0.85rem;">
                            + Add Evidence
                        </button>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 btn-edit-exit-capability" data-id="${cap.id}">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete-exit-capability" data-id="${cap.id}">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProgrammeLearningOutcomesList() {
    if (!appState.draftPLOs || appState.draftPLOs.length === 0) {
        return '<div class="alert alert-secondary">No PLOs defined yet.</div>';
    }

    return appState.draftPLOs.map(plo => `
        <div class="card mb-3 border-light">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div style="flex: 1;">
                        <p class="mb-1"><strong>${escapeHtml(plo.statement)}</strong></p>
                        <small class="text-muted">
                            <span class="badge bg-secondary">${plo.level || 'Apply'}</span>
                        </small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 btn-edit-plo" data-id="${plo.id}">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete-plo" data-id="${plo.id}">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProgrammeEvidenceList() {
    let html = '';
    
    (appState.exitCapabilities || []).forEach(cap => {
        html += `
            <div class="mb-4">
                <h6 class="text-primary font-weight-bold">${escapeHtml(cap.text)}</h6>
                <div class="ms-3">
        `;
        
        if (cap.evidence && cap.evidence.length > 0) {
            cap.evidence.forEach(ev => {
                html += `
                    <div class="card card-sm mb-2 border-light">
                        <div class="card-body py-2 px-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div style="flex: 1; font-size: 0.9rem;">
                                    <small><strong>${ev.type}</strong> ${ev.individualOrGroup === 'group' ? '👥' : '👤'}</small><br>
                                    <small class="text-muted">Authenticity: ${ev.authenticityScore}/5 | Transfer: ${ev.workplaceTransferScore}/5</small>
                                </div>
                                <div>
                                    <button class="btn btn-xs btn-outline-primary me-1 btn-edit-evidence" data-cap-id="${cap.id}" data-ev-id="${ev.id}">
                                        ✏️
                                    </button>
                                    <button class="btn btn-xs btn-outline-danger btn-delete-evidence" data-cap-id="${cap.id}" data-ev-id="${ev.id}">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            html += '<div class="text-muted small"><em>No evidence added yet</em></div>';
        }
        
        html += `
                    <button class="btn btn-sm btn-outline-success mb-3 btn-add-evidence" data-cap-id="${cap.id}">
                        + Add Evidence
                    </button>
                </div>
            </div>
        `;
    });

    if (html === '') {
        return '<div class="alert alert-secondary">No exit capabilities defined yet. Add an exit capability first, then add evidence to it.</div>';
    }

    return html;
}

function renderProgrammePerformanceSummary() {
    const allEvidence = (appState.exitCapabilities || []).flatMap(cap => cap.evidence || []);
    
    if (allEvidence.length === 0) {
        return `
            <div class="alert alert-warning">
                <strong>⚠️ No programme evidence defined yet.</strong> Add evidence to exit capabilities to generate a summary.
            </div>
        `;
    }

    // Count evidence types
    const evidenceTypeCounts = {};
    allEvidence.forEach(ev => {
        evidenceTypeCounts[ev.type] = (evidenceTypeCounts[ev.type] || 0) + 1;
    });

    // Sort by frequency
    const sortedTypes = Object.entries(evidenceTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count }));

    // Calculate percentages
    const total = allEvidence.length;
    const typePercentages = sortedTypes.map(item => ({
        ...item,
        percentage: Math.round((item.count / total) * 100)
    }));

    // Detect over-reliance (>60% on single type)
    const overReliance = typePercentages.filter(t => t.percentage > 60);

    // Average authenticity & transfer
    const avgAuthenticity = (allEvidence.reduce((sum, ev) => sum + ev.authenticityScore, 0) / allEvidence.length).toFixed(1);
    const avgTransfer = (allEvidence.reduce((sum, ev) => sum + ev.workplaceTransferScore, 0) / allEvidence.length).toFixed(1);

    return `
        <div class="card border-warning">
            <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">📊 Programme Performance Summary</h5>
            </div>
            <div class="card-body">
                <p class="mb-3">
                    <strong>This programme demonstrates graduate capability through:</strong>
                </p>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Evidence Portfolio</h6>
                        <ul class="list-unstyled">
                            ${typePercentages.map(item => `
                                <li class="mb-2">
                                    <small>
                                        <strong>${item.type}:</strong> ${item.count} piece${item.count !== 1 ? 's' : ''} (${item.percentage}%)
                                        ${item.percentage > 60 ? '<span class="text-danger ms-1">⚠️ Over-reliant</span>' : ''}
                                    </small>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>Quality Metrics</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2"><small><strong>Avg Authenticity:</strong> ${avgAuthenticity}/5</small></li>
                            <li class="mb-2"><small><strong>Avg Workplace Transfer:</strong> ${avgTransfer}/5</small></li>
                            <li class="mb-2"><small><strong>Total Evidence Items:</strong> ${total}</small></li>
                            <li class="mb-2"><small><strong>Exit Capabilities:</strong> ${appState.exitCapabilities?.length || 0}</small></li>
                        </ul>
                    </div>
                </div>

                ${overReliance.length > 0 ? `
                    <div class="alert alert-warning mb-0">
                        <small><strong>⚠️ Alert:</strong> Programme relies heavily on ${overReliance.map(t => t.type).join(', ')}. Consider diversifying evidence types.</small>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ===== MODULE STUDIO TAB =====
/**
 * Render Module Studio with module list and details
 */
function renderModuleStudio() {
    const listContainer = document.getElementById('moduleStudioList');
    const detailsContainer = document.getElementById('moduleStudioDetails');
    const countBadge = document.getElementById('modulesCountBadge');
    
    if (!listContainer || !detailsContainer) return;

    const moduleCount = (appState.modules || []).length;
    
    // Debug: log module count
    console.log(`renderModuleStudio: ${moduleCount} modules loaded`);
    
    // Update count badge
    if (countBadge) {
        countBadge.textContent = `${moduleCount} module${moduleCount !== 1 ? 's' : ''}`;
    }

    // Render module list
    let listHtml = '<div class="d-flex flex-column gap-3">';
    (appState.modules || []).forEach((module, idx) => {
        console.log(`  Module ${idx}: ${module.title}`);
        listHtml += `
            <div class="card p-3 cursor-pointer module-list-item border-2" data-mod-idx="${idx}" style="cursor: pointer; min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
                <strong class="small" style="font-size: 0.95rem;">${escapeHtml(module.title)}</strong>
                <small class="text-muted">📚 ${module.credits} credits | Semester ${module.semester}</small>
                <small class="text-muted">Assessments: ${(module.assessments || []).length}</small>
            </div>
        `;
    });
    listHtml += '</div>';
    listContainer.innerHTML = listHtml;

    // Add click listeners to module items
    listContainer.querySelectorAll('.module-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const modIdx = parseInt(item.dataset.modIdx);
            renderModuleStudioDetails(modIdx);
        });
    });

    // Add Module button
    document.getElementById('btnAddNewModule')?.addEventListener('click', () => {
        addNewModule();
        renderModuleStudio();
    });

    // Show details for first module if exists
    if (appState.modules && appState.modules.length > 0) {
        renderModuleStudioDetails(0);
    } else {
        detailsContainer.innerHTML = '<p class="text-muted">No modules yet. Click "Add Module" to create one.</p>';
    }
}

/**
 * Render module details in Module Studio
 */
function renderModuleStudioDetails(moduleIndex) {
    const detailsContainer = document.getElementById('moduleStudioDetails');
    if (!detailsContainer) return;

    const module = appState.modules[moduleIndex];
    if (!module) {
        detailsContainer.innerHTML = '<p class="text-muted">Module not found</p>';
        return;
    }

    detailsContainer.innerHTML = showModuleEditorInline(moduleIndex, module);
    
    // Attach event handlers
    attachModuleStudioHandlers(moduleIndex);
}

/**
 * Store currently selected module index
 */
window.currentModuleStudioIndex = 0;

// ===== ONLINE EXPERIENCE (COI) TAB =====
// ===== LEARNING EXPERIENCE TAB =====
/**
 * Main renderer for Learning Experience tab (programme + module level, with separate tabs)
 */
function renderLearningExperience() {
    const container = document.getElementById('contentCOI');
    if (!container) return;

    let html = `
        <div class="card">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="leProgTab" data-bs-toggle="tab" data-bs-target="#leProgContent" type="button" role="tab">
                            📚 Programme Level
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="leModTab" data-bs-toggle="tab" data-bs-target="#leModContent" type="button" role="tab">
                            📅 Module Level
                        </button>
                    </li>
                </ul>
            </div>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="leProgContent" role="tabpanel">
                    ${renderProgrammeLearningExperience()}
                </div>
                <div class="tab-pane fade" id="leModContent" role="tabpanel">
                    ${renderModuleLearningExperience()}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    attachLearningExperienceHandlers();
}

/**
 * Render programme-level learning experience (high-level, design palette)
 */
function renderProgrammeLearningExperience() {
    const le = appState.learningExperience || {};
    
    const teachingOptions = [
        { label: '📢 Announcement', value: 'announcement' },
        { label: '🎥 Live Session', value: 'live' },
        { label: '☎️ Office Hour', value: 'office' },
        { label: '📝 Feedback', value: 'feedback' },
        { label: '❓ Q&A Forum', value: 'qa' },
        { label: '📹 Recorded Lecture', value: 'recorded' },
        { label: '📋 Syllabus / Guidance', value: 'syllabus' },
        { label: '🏆 Rubric / Assessment Guide', value: 'rubric' },
        { label: '✅ Example Solutions', value: 'examples' },
        { label: '📖 Study Guide', value: 'guide' }
    ];

    const socialOptions = [
        { label: '👥 Cohort Activity', value: 'cohort' },
        { label: '👫 Peer Triads', value: 'triads' },
        { label: '💬 Group Check-in', value: 'checkin' },
        { label: '🎲 Speed Networking', value: 'speed' },
        { label: '🤝 Social Icebreaker', value: 'icebreaker' },
        { label: '📚 Study Groups', value: 'study' },
        { label: '🎓 Peer Mentoring', value: 'mentoring' },
        { label: '💭 Discussion Circles', value: 'circles' },
        { label: '🎉 Community Event', value: 'event' },
        { label: '📱 Social Media Group', value: 'social' }
    ];

    const cognitiveOptions = [
        { label: '🎯 Trigger', value: 'trigger' },
        { label: '🔍 Exploration', value: 'exploration' },
        { label: '🔗 Integration', value: 'integration' },
        { label: '✅ Resolution', value: 'resolution' }
    ];

    const availablePresence = le.availablePresence || {teaching: [], social: [], cognitive: []};

    let html = `
        <div class="p-4">
            <h5>Programme Design Palette: Which Presence Elements Are Available?</h5>
            <p class="text-muted small">Select which presence types and methods will be part of your programme. This is non-prescriptive—it shows what's available for modules to use.</p>

            <div class="mb-4">
                <h6 class="mt-4">🎓 Teaching Presence Elements</h6>
                <div class="row">
    `;

    teachingOptions.forEach(opt => {
        const checked = availablePresence.teaching.includes(opt.value);
        html += `
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input prog-teaching-elem" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <label class="form-check-label">${opt.label}</label>
                        </div>
                    </div>
        `;
    });

    html += `
                </div>
            </div>

            <div class="mb-4">
                <h6>👫 Social Presence Elements</h6>
                <div class="row">
    `;

    socialOptions.forEach(opt => {
        const checked = availablePresence.social.includes(opt.value);
        html += `
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input prog-social-elem" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <label class="form-check-label">${opt.label}</label>
                        </div>
                    </div>
        `;
    });

    html += `
                </div>
            </div>

            <div class="mb-4">
                <h6>🧠 Cognitive Presence Elements</h6>
                <div class="row">
    `;

    cognitiveOptions.forEach(opt => {
        const checked = availablePresence.cognitive.includes(opt.value);
        html += `
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input prog-cognitive-elem" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <label class="form-check-label">${opt.label}</label>
                        </div>
                    </div>
        `;
    });

    html += `
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label fw-bold">Overall Description</label>
                <textarea class="form-control" rows="3" id="leProgDesc" placeholder="High-level overview of learning rhythm and approach...">${escapeHtml(le.description || '')}</textarea>
            </div>

            <div class="mb-4">
                <label class="form-label fw-bold">Open Text (Flexible Notes)</label>
                <textarea class="form-control" rows="3" id="leProgOpenText" placeholder="Any additional flexible guidance for learner experience...">${escapeHtml(le.openText || '')}</textarea>
            </div>

            <button class="btn btn-success" id="btnSaveProgLE">💾 Save Programme Learning Experience</button>
        </div>
    `;

    return html;
}

/**
 * Render module-level learning experience (weekly granularity with presence selections)
 */
function renderModuleLearningExperience() {
    if (appState.modules.length === 0) {
        return `
            <div class="p-4 text-muted">
                <p>Create modules first to define weekly learning rhythm.</p>
            </div>
        `;
    }

    const selectedModId = window.leSelectedModuleId || appState.modules[0].id;
    const module = appState.modules.find(m => m.id === selectedModId);
    if (!module) return '';

    const le = module.learningExperience || {};
    const progLE = appState.learningExperience || {};
    const availablePresence = progLE.availablePresence || {teaching: [], social: [], cognitive: []};

    let html = `
        <div class="p-4">
            <div class="mb-3">
                <label class="form-label fw-bold">Select Module:</label>
                <select class="form-select form-select-sm" id="leModuleSelector" style="width: auto;">
    `;

    appState.modules.forEach(mod => {
        html += `<option value="${mod.id}" ${mod.id === selectedModId ? 'selected' : ''}>
            ${escapeHtml(mod.title)} (${mod.credits} credits)
        </option>`;
    });

    html += `
                </select>
            </div>

            <div class="card mb-4 bg-light">
                <div class="card-header bg-secondary text-white small">
                    <strong>Programme Design Palette (Visual Reference)</strong>
                </div>
                <div class="card-body small">
                    <div class="row">
                        <div class="col-md-4">
                            <strong>Teaching:</strong> ${availablePresence.teaching?.map(t => `<span class="badge bg-info">${t}</span>`).join(' ') || '<span class="text-muted">None defined</span>'}
                        </div>
                        <div class="col-md-4">
                            <strong>Social:</strong> ${availablePresence.social?.map(s => `<span class="badge bg-success">${s}</span>`).join(' ') || '<span class="text-muted">None defined</span>'}
                        </div>
                        <div class="col-md-4">
                            <strong>Cognitive:</strong> ${availablePresence.cognitive?.map(c => `<span class="badge bg-warning">${c}</span>`).join(' ') || '<span class="text-muted">None defined</span>'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Module Description</label>
                <textarea class="form-control" rows="2" id="leModDesc" placeholder="How does this module fit the programme rhythm?...">${escapeHtml(le.description || '')}</textarea>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Weekly Rhythm</label>
                <div id="leModWeekDetail" class="mb-3">
    `;

    const weeks = le.weeklyRhythm || [];
    if (weeks.length === 0) {
        html += `
                    <div class="alert alert-warning small">
                        No weeks configured. <button class="btn btn-sm btn-outline-warning" id="btnInitWeeks">Initialize 12 Weeks</button>
                    </div>
        `;
    } else {
        html += `<div class="small text-muted mb-3">${weeks.length} weeks configured</div>`;
        weeks.forEach((week, idx) => {
            html += renderWeekPresenceEditor(idx, week);
        });
    }

    html += `
                </div>
                ${weeks.length > 0 ? `<button class="btn btn-sm btn-outline-success w-100 mb-3" id="btnAddModWeek">+ Add Week</button>` : ''}
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Module Notes</label>
                <textarea class="form-control" rows="2" id="leModNotes" placeholder="Module-specific rhythm considerations...">${escapeHtml(le.notes || '')}</textarea>
            </div>

            <button class="btn btn-info" id="btnSaveModLE">💾 Save Module Learning Experience</button>
        </div>
    `;

    return html;
}

/**
 * Render presence editor for a single week
 */
function renderWeekPresenceEditor(weekIndex, week) {
    const teaching = week?.teaching || [];
    const social = week?.social || [];
    let cognitive = week?.cognitive || [];
    // Ensure cognitive is an array (handle old data structure)
    if (!Array.isArray(cognitive)) {
        cognitive = [];
    }

    const teachingOptions = [
        { label: '📢 Announcement', value: 'announcement' },
        { label: '🎥 Live Session', value: 'live' },
        { label: '☎️ Office Hour', value: 'office' },
        { label: '📝 Feedback', value: 'feedback' },
        { label: '❓ Q&A Forum', value: 'qa' },
        { label: '📹 Recorded Lecture', value: 'recorded' },
        { label: '📋 Syllabus / Guidance', value: 'syllabus' },
        { label: '🏆 Rubric / Assessment Guide', value: 'rubric' },
        { label: '✅ Example Solutions', value: 'examples' },
        { label: '📖 Study Guide', value: 'guide' }
    ];

    const socialOptions = [
        { label: '👥 Cohort Activity', value: 'cohort' },
        { label: '👫 Peer Triads', value: 'triads' },
        { label: '💬 Group Check-in', value: 'checkin' },
        { label: '🎲 Speed Networking', value: 'speed' },
        { label: '🤝 Social Icebreaker', value: 'icebreaker' },
        { label: '📚 Study Groups', value: 'study' },
        { label: '🎓 Peer Mentoring', value: 'mentoring' },
        { label: '💭 Discussion Circles', value: 'circles' },
        { label: '🎉 Community Event', value: 'event' },
        { label: '📱 Social Media Group', value: 'social' }
    ];

    const cognitiveOptions = [
        { label: '📖 Reading', value: 'reading' },
        { label: '🎥 Watch Video', value: 'video' },
        { label: '📋 Case Study', value: 'caseStudy' },
        { label: '🧪 Simulation', value: 'simulation' },
        { label: '💻 Practice Exercise', value: 'exercise' },
        { label: '🔬 Lab/Experiment', value: 'lab' },
        { label: '📝 Problem Set', value: 'problemSet' },
        { label: '🎨 Creative Project', value: 'project' },
        { label: '📊 Data Analysis', value: 'dataAnalysis' },
        { label: '🗣️ Presentation', value: 'presentation' }
    ];

    // Separate predefined from custom cognitive items
    const predefinedCogValues = cognitiveOptions.map(o => o.value);
    const customCogItems = cognitive.filter(c => !predefinedCogValues.includes(c));

    let html = `
        <div class="card mb-3 p-3 bg-white border-secondary">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong class="small">Week ${weekIndex + 1}</strong>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteWeek(${weekIndex})">✕</button>
            </div>
    `;

    // Teaching Presence
    html += `
            <div class="mb-3">
                <div class="small fw-bold text-info">🎓 Teaching Presence</div>
                <div class="d-flex flex-wrap gap-2">
    `;
    teachingOptions.forEach(opt => {
        const checked = teaching.includes(opt.value);
        html += `
                    <div class="form-check form-check-inline">
                        <input type="checkbox" class="form-check-input week-teaching" value="${opt.value}" data-week="${weekIndex}" ${checked ? 'checked' : ''}>
                        <label class="form-check-label small" style="font-size: 0.85rem;">${opt.label}</label>
                    </div>
        `;
    });
    html += `
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control form-control-sm week-teaching-custom" data-week="${weekIndex}" placeholder="+ Add custom teaching presence" style="max-width: 300px;">
                </div>
            </div>
    `;

    // Social Presence
    html += `
            <div class="mb-3">
                <div class="small fw-bold text-success">👫 Social Presence</div>
                <div class="d-flex flex-wrap gap-2">
    `;
    socialOptions.forEach(opt => {
        const checked = social.includes(opt.value);
        html += `
                    <div class="form-check form-check-inline">
                        <input type="checkbox" class="form-check-input week-social" value="${opt.value}" data-week="${weekIndex}" ${checked ? 'checked' : ''}>
                        <label class="form-check-label small" style="font-size: 0.85rem;">${opt.label}</label>
                    </div>
        `;
    });
    html += `
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control form-control-sm week-social-custom" data-week="${weekIndex}" placeholder="+ Add custom social presence" style="max-width: 300px;">
                </div>
            </div>
    `;

    // Cognitive Presence (predefined + custom)
    html += `
            <div class="mb-3">
                <div class="small fw-bold text-warning">🧠 Cognitive Presence</div>
                <div class="d-flex flex-wrap gap-2 mb-2">
    `;
    cognitiveOptions.forEach(opt => {
        const checked = cognitive.includes(opt.value);
        html += `
                    <div class="form-check form-check-inline">
                        <input type="checkbox" class="form-check-input week-cognitive" value="${opt.value}" data-week="${weekIndex}" ${checked ? 'checked' : ''}>
                        <label class="form-check-label small" style="font-size: 0.85rem;">${opt.label}</label>
                    </div>
        `;
    });
    html += `
                </div>
    `;

    // Show custom cognitive items
    if (customCogItems.length > 0) {
        html += `<div class="mb-2">`;
        customCogItems.forEach(item => {
            html += `
                <span class="badge bg-warning text-dark me-2 mb-1">
                    ${escapeHtml(item)}
                    <button class="btn btn-sm btn-link p-0 text-dark ms-1" onclick="removeCustomCognitive(${weekIndex}, '${escapeHtml(item)}')">✕</button>
                </span>
            `;
        });
        html += `</div>`;
    }

    html += `
                <div class="mt-2">
                    <input type="text" class="form-control form-control-sm week-cognitive-custom" data-week="${weekIndex}" placeholder="+ Add custom cognitive activity" style="max-width: 300px;">
                </div>
            </div>
    `;

    html += `</div>`;
    return html;
}

/**
 * Attach event handlers for learning experience
 */
function attachLearningExperienceHandlers() {
    // Programme level checkboxes
    document.querySelectorAll('.prog-teaching-elem').forEach(cb => {
        cb.addEventListener('change', (e) => {
            appState.learningExperience = appState.learningExperience || {};
            appState.learningExperience.availablePresence = appState.learningExperience.availablePresence || {teaching: [], social: [], cognitive: []};
            if (e.target.checked) {
                if (!appState.learningExperience.availablePresence.teaching.includes(e.target.value)) {
                    appState.learningExperience.availablePresence.teaching.push(e.target.value);
                }
            } else {
                appState.learningExperience.availablePresence.teaching = 
                    appState.learningExperience.availablePresence.teaching.filter(v => v !== e.target.value);
            }
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.prog-social-elem').forEach(cb => {
        cb.addEventListener('change', (e) => {
            appState.learningExperience = appState.learningExperience || {};
            appState.learningExperience.availablePresence = appState.learningExperience.availablePresence || {teaching: [], social: [], cognitive: []};
            if (e.target.checked) {
                if (!appState.learningExperience.availablePresence.social.includes(e.target.value)) {
                    appState.learningExperience.availablePresence.social.push(e.target.value);
                }
            } else {
                appState.learningExperience.availablePresence.social = 
                    appState.learningExperience.availablePresence.social.filter(v => v !== e.target.value);
            }
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.prog-cognitive-elem').forEach(cb => {
        cb.addEventListener('change', (e) => {
            appState.learningExperience = appState.learningExperience || {};
            appState.learningExperience.availablePresence = appState.learningExperience.availablePresence || {teaching: [], social: [], cognitive: []};
            if (e.target.checked) {
                if (!appState.learningExperience.availablePresence.cognitive.includes(e.target.value)) {
                    appState.learningExperience.availablePresence.cognitive.push(e.target.value);
                }
            } else {
                appState.learningExperience.availablePresence.cognitive = 
                    appState.learningExperience.availablePresence.cognitive.filter(v => v !== e.target.value);
            }
            saveToLocalStorage();
        });
    });

    // Programme level text fields
    document.getElementById('btnSaveProgLE')?.addEventListener('click', () => {
        appState.learningExperience = appState.learningExperience || {};
        appState.learningExperience.description = document.getElementById('leProgDesc')?.value || '';
        appState.learningExperience.openText = document.getElementById('leProgOpenText')?.value || '';
        saveToLocalStorage();
        showToast('Programme learning experience saved', 'success');
    });

    // Module level
    document.getElementById('leModuleSelector')?.addEventListener('change', (e) => {
        window.leSelectedModuleId = e.target.value;
        renderLearningExperience();
    });

    document.getElementById('btnInitWeeks')?.addEventListener('click', () => {
        const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
        const module = appState.modules.find(m => m.id === selectedModId);
        const progLE = appState.learningExperience || {};
        const availablePresence = progLE.availablePresence || {teaching: [], social: [], cognitive: []};
        
        if (module) {
            module.learningExperience = module.learningExperience || {};
            // Pre-populate with programme palette items
            module.learningExperience.weeklyRhythm = Array.from({length: 12}, (_, i) => ({
                week: i + 1,
                teaching: [...availablePresence.teaching],
                social: [...availablePresence.social],
                cognitive: [...availablePresence.cognitive]
            }));
            saveToLocalStorage();
            renderLearningExperience();
            showToast('Initialized 12 weeks with programme palette items', 'success');
        }
    });

    document.getElementById('btnAddModWeek')?.addEventListener('click', () => {
        const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
        const module = appState.modules.find(m => m.id === selectedModId);
        const progLE = appState.learningExperience || {};
        const availablePresence = progLE.availablePresence || {teaching: [], social: [], cognitive: []};
        
        if (module) {
            module.learningExperience = module.learningExperience || {};
            module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
            const nextWeek = module.learningExperience.weeklyRhythm.length + 1;
            module.learningExperience.weeklyRhythm.push({
                week: nextWeek,
                teaching: [...availablePresence.teaching],
                social: [...availablePresence.social],
                cognitive: [...availablePresence.cognitive]
            });
            saveToLocalStorage();
            renderLearningExperience();
            showToast(`Added Week ${nextWeek}`, 'success');
        }
    });

    // Week presence checkboxes - Teaching & Social
    document.querySelectorAll('.week-teaching').forEach(cb => {
        cb.addEventListener('change', updateWeekPresence);
    });
    document.querySelectorAll('.week-social').forEach(cb => {
        cb.addEventListener('change', updateWeekPresence);
    });

    // Cognitive Presence checkboxes
    document.querySelectorAll('.week-cognitive').forEach(cb => {
        cb.addEventListener('change', updateWeekPresence);
    });

    // Custom input fields for teaching presence
    document.querySelectorAll('.week-teaching-custom').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = input.value.trim();
                if (text) {
                    const weekIndex = parseInt(e.target.dataset.week);
                    const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
                    const module = appState.modules.find(m => m.id === selectedModId);
                    if (module) {
                        module.learningExperience = module.learningExperience || {};
                        module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
                        const week = module.learningExperience.weeklyRhythm[weekIndex];
                        if (week) {
                            if (!week.teaching.includes(text)) {
                                week.teaching.push(text);
                            }
                            saveToLocalStorage();
                            renderLearningExperience();
                            showToast(`Added custom teaching presence: "${text}"`, 'success');
                        }
                    }
                }
            }
        });
    });

    // Custom input fields for social presence
    document.querySelectorAll('.week-social-custom').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = input.value.trim();
                if (text) {
                    const weekIndex = parseInt(e.target.dataset.week);
                    const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
                    const module = appState.modules.find(m => m.id === selectedModId);
                    if (module) {
                        module.learningExperience = module.learningExperience || {};
                        module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
                        const week = module.learningExperience.weeklyRhythm[weekIndex];
                        if (week) {
                            if (!week.social.includes(text)) {
                                week.social.push(text);
                            }
                            saveToLocalStorage();
                            renderLearningExperience();
                            showToast(`Added custom social presence: "${text}"`, 'success');
                        }
                    }
                }
            }
        });
    });

    // Custom input fields for cognitive presence
    document.querySelectorAll('.week-cognitive-custom').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = input.value.trim();
                if (text) {
                    const weekIndex = parseInt(e.target.dataset.week);
                    const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
                    const module = appState.modules.find(m => m.id === selectedModId);
                    if (module) {
                        module.learningExperience = module.learningExperience || {};
                        module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
                        const week = module.learningExperience.weeklyRhythm[weekIndex];
                        if (week) {
                            if (!week.cognitive.includes(text)) {
                                week.cognitive.push(text);
                            }
                            saveToLocalStorage();
                            renderLearningExperience();
                            showToast(`Added custom cognitive activity: "${text}"`, 'success');
                        }
                    }
                }
            }
        });
    });

    document.getElementById('btnSaveModLE')?.addEventListener('click', () => {
        const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
        const module = appState.modules.find(m => m.id === selectedModId);
        if (module) {
            module.learningExperience = module.learningExperience || {};
            module.learningExperience.description = document.getElementById('leModDesc')?.value || '';
            module.learningExperience.notes = document.getElementById('leModNotes')?.value || '';
            saveToLocalStorage();
            showToast('Module learning experience saved', 'success');
        }
    });

    document.getElementById('leModDesc')?.addEventListener('blur', () => {
        const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
        const module = appState.modules.find(m => m.id === selectedModId);
        if (module) {
            module.learningExperience = module.learningExperience || {};
            module.learningExperience.description = document.getElementById('leModDesc').value;
            saveToLocalStorage();
        }
    });

    document.getElementById('leModNotes')?.addEventListener('blur', () => {
        const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
        const module = appState.modules.find(m => m.id === selectedModId);
        if (module) {
            module.learningExperience = module.learningExperience || {};
            module.learningExperience.notes = document.getElementById('leModNotes').value;
            saveToLocalStorage();
        }
    });
}

function updateWeekPresence(e) {
    const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
    const module = appState.modules.find(m => m.id === selectedModId);
    if (!module) return;

    module.learningExperience = module.learningExperience || {};
    module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
    
    const weekIndex = parseInt(e.target.dataset.week);
    const week = module.learningExperience.weeklyRhythm[weekIndex];
    
    if (week) {
        const presenceType = e.target.classList.contains('week-teaching') ? 'teaching' : 
                             e.target.classList.contains('week-social') ? 'social' : 'cognitive';
        
        if (!week[presenceType]) week[presenceType] = [];
        
        if (e.target.checked) {
            if (!week[presenceType].includes(e.target.value)) {
                week[presenceType].push(e.target.value);
            }
        } else {
            week[presenceType] = week[presenceType].filter(v => v !== e.target.value);
        }
        saveToLocalStorage();
    }
}

function removeCustomCognitive(weekIndex, customItem) {
    const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
    const module = appState.modules.find(m => m.id === selectedModId);
    if (module) {
        module.learningExperience = module.learningExperience || {};
        module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
        const week = module.learningExperience.weeklyRhythm[weekIndex];
        if (week) {
            week.cognitive = (week.cognitive || []).filter(c => c !== customItem);
            saveToLocalStorage();
            renderLearningExperience();
            showToast(`Removed cognitive activity: "${customItem}"`, 'info');
        }
    }
}

function deleteWeek(weekIndex) {
    if (confirm(`Delete Week ${weekIndex + 1}?`)) {
        const selectedModId = window.leSelectedModuleId || appState.modules[0]?.id;
        const module = appState.modules.find(m => m.id === selectedModId);
        if (module) {
            module.learningExperience = module.learningExperience || {};
            module.learningExperience.weeklyRhythm = module.learningExperience.weeklyRhythm || [];
            module.learningExperience.weeklyRhythm.splice(weekIndex, 1);
            saveToLocalStorage();
            renderLearningExperience();
            showToast('Week deleted', 'info');
        }
    }
}

// ===== ROADMAP TAB =====
function renderRoadmap() {
    const container = document.getElementById('roadmapContent');
    if (!container) return;

    let html = '';

    html += `
        <div class="roadmap-section">
            <h3>Programme Vision</h3>
            <p><strong>Title:</strong> ${escapeHtml(appState.programmeTitle)}</p>
            <p><strong>Audience:</strong> ${escapeHtml(appState.audience)}</p>
            <p><strong>Value Proposition:</strong> ${escapeHtml(appState.valueProposition)}</p>
            <p><strong>Delivery:</strong> ${appState.nfqLevel ? `NFQ Level ${appState.nfqLevel}` : ''} | ${appState.credits} credits | ${escapeHtml(appState.deliveryDuration)}</p>
        </div>

        <div class="roadmap-section">
            <h3>Exit Capabilities</h3>
            <ul class="roadmap-list">
                ${(appState.exitCapabilities || []).map(cap => `<li><strong>${escapeHtml(cap.text)}</strong><br><small>${cap.tags?.map(t => `<span class="badge bg-info">${t}</span>`).join(' ')}</small></li>`).join('')}
            </ul>
        </div>

        <div class="roadmap-section">
            <h3>Programme Learning Outcomes (PLOs)</h3>
            <ul class="roadmap-list">
                ${appState.draftPLOs.map(plo => `<li>${escapeHtml(plo.statement)}</li>`).join('')}
            </ul>
        </div>

        <div class="roadmap-section">
            <h3>Assessment Portfolio</h3>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Assessment</th>
                        <th>Type</th>
                        <th>%</th>
                        <th>Authenticity</th>
                        <th>AI Risk</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.assessmentPortfolio.map(a => `
                        <tr>
                            <td>${escapeHtml(a.title)}</td>
                            <td>${a.type}</td>
                            <td>${a.weightingPercent}%</td>
                            <td>${a.authenticity}/5</td>
                            <td>${a.aiRisk}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="roadmap-section">
            <h3>Weekly Learning Rhythm</h3>
            <p>${escapeHtml(appState.learningExperience?.description || appState.deliveryStructure)}</p>
        </div>

        <div class="roadmap-section">
            <h3>Learning Experience Elements</h3>
            <p><strong>Programme Palette Available:</strong></p>
            <ul style="font-size: 0.9rem;">
                <li>Teaching: ${appState.learningExperience?.availablePresence?.teaching?.length || 0} options</li>
                <li>Social: ${appState.learningExperience?.availablePresence?.social?.length || 0} options</li>
                <li>Cognitive: ${appState.learningExperience?.availablePresence?.cognitive?.length || 0} options</li>
            </ul>
            <p className="small">${escapeHtml(appState.learningExperience?.openText || 'No additional notes')}</p>
        </div>

        <div class="roadmap-section">
            <h3>Risks & Mitigations</h3>
            ${appState.risksAndAssumptions.length === 0 ? '<p><em>No risks documented</em></p>' : `
            <div style="margin-top: 1rem;">
                ${['Academic', 'Operational', 'Market', 'Other'].map(category => {
                    const risksInCategory = appState.risksAndAssumptions.filter(r => r.category === category);
                    if (risksInCategory.length === 0) return '';
                    return `
                        <div style="margin-bottom: 1.5rem; padding: 0.75rem; background-color: #f8f9fa; border-left: 4px solid ${
                            category === 'Academic' ? '#ffc107' : category === 'Operational' ? '#17a2b8' : category === 'Market' ? '#dc3545' : '#6c757d'
                        }; border-radius: 4px;">
                            <h5 style="margin-top: 0; font-size: 0.95rem;"><strong>${category} Risks (${risksInCategory.length})</strong></h5>
                            <ul style="margin-bottom: 0; padding-left: 1.5rem;">
                                ${risksInCategory.map(risk => `
                                    <li style="margin-bottom: 0.5rem;">
                                        <strong>Risk:</strong> ${escapeHtml(risk.risk)}<br>
                                        <strong>Assumption:</strong> ${escapeHtml(risk.assumption)}<br>
                                        <strong>Mitigation:</strong> ${escapeHtml(risk.mitigation)}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `;
                }).join('')}
            </div>
            `}
        </div>

        <div class="roadmap-section">
            <h3>♿ Universal Design for Learning (UDL) Coverage</h3>
            <p class="text-muted small">Heatmap showing which modules address each UDL guideline. <span style="color: #28a745; font-weight: bold;">●</span> = Evidence documented, <span style="color: #e9ecef; font-weight: bold;">●</span> = Not addressed</p>
            
            ${renderUDLHeatmap()}
        </div>

        <div class="roadmap-section">
            <h3>♿ UDL Guidelines: Coverage Intensity Heat Map</h3>
            <p class="text-muted small">Intensity visualization showing how comprehensively each UDL guideline is addressed across your programme. <span style="color: #dc3545;">Red</span> = Gaps | <span style="color: #ffc107;">Yellow</span> = Partial | <span style="color: #28a745;">Green</span> = Strong coverage</p>
            
            ${renderUDLIntensityHeatmap()}
        </div>

        <div class="roadmap-section">
            <h3>🎯 Community of Inquiry (CoI): Cognitive Presence Heat Map</h3>
            <p class="text-muted small">Intensity visualization showing how well each stage of the inquiry cycle is supported across your programme. The four-stage cycle: <strong>Trigger Event → Exploration → Integration → Resolution</strong></p>
            
            ${renderCOIIntensityHeatmap()}
        </div>

        <div class="roadmap-section">
            <h3>Key Differentiators</h3>
            <ul class="roadmap-list">
                ${appState.differentiators.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Render UDL Evidence heatmap for roadmap
 */
function renderUDLHeatmap() {
    if (!appState.modules || appState.modules.length === 0) {
        return '<p class="text-muted"><em>No modules yet. Add modules to see UDL coverage.</em></p>';
    }

    // Define UDL structure
    const udlDimensions = {
        representation: {
            label: '📊 Representation',
            sublevels: ['Perception', 'Language', 'Comprehension']
        },
        actionExpression: {
            label: '🎯 Action & Expression',
            sublevels: ['PhysicalAction', 'Expression', 'Executive']
        },
        engagement: {
            label: '💡 Engagement',
            sublevels: ['Recruiting', 'Sustaining', 'SelfRegulation']
        }
    };

    // Build matrix data
    const modules = appState.modules;
    const allSublevels = [];
    Object.values(udlDimensions).forEach(dim => {
        dim.sublevels.forEach(sub => {
            allSublevels.push({ dimension: Object.keys(udlDimensions).find(k => udlDimensions[k] === dim), sublevel: sub });
        });
    });

    // Create heatmap HTML
    let html = `
        <div style="overflow-x: auto; margin-top: 1rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th style="padding: 0.75rem; text-align: left; background-color: #f8f9fa; border: 1px solid #dee2e6; min-width: 180px;"><strong>UDL Guideline</strong></th>
                        ${modules.map(mod => `
                            <th style="padding: 0.5rem; text-align: center; background-color: #f8f9fa; border: 1px solid #dee2e6; min-width: 120px; word-wrap: break-word;">
                                <small><strong>${escapeHtml(mod.title.substring(0, 20))}</strong></small>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${allSublevels.map(item => {
                        const dimensionKey = item.dimension;
                        const sublevel = item.sublevel;
                        const displayLabel = {
                            'Perception': '👁️ Perception',
                            'Language': '🔤 Language & Symbols',
                            'Comprehension': '🧠 Comprehension',
                            'PhysicalAction': '🖱️ Physical Action',
                            'Expression': '🗣️ Expression',
                            'Executive': '⚙️ Executive Functions',
                            'Recruiting': '🎪 Recruiting Attention',
                            'Sustaining': '💪 Sustaining Effort',
                            'SelfRegulation': '⚖️ Self-Regulation'
                        }[sublevel] || sublevel;

                        return `
                            <tr>
                                <td style="padding: 0.75rem; text-align: left; border: 1px solid #dee2e6; background-color: #f8f9fa;">
                                    <small><strong>${displayLabel}</strong></small>
                                </td>
                                ${modules.map(mod => {
                                    const evidence = mod.udlEvidence?.find(e => e.dimension === dimensionKey && e.sublevel === sublevel);
                                    const hasEvidence = evidence && evidence.evidence;
                                    const bgColor = hasEvidence ? '#d4edda' : '#f8f9fa';
                                    const borderColor = hasEvidence ? '#28a745' : '#dee2e6';
                                    const title = hasEvidence ? `Evidence: ${evidence.evidence.substring(0, 100)}...` : 'No evidence documented';
                                    
                                    return `
                                        <td style="padding: 0.5rem; text-align: center; border: 1px solid ${borderColor}; background-color: ${bgColor}; cursor: pointer;" 
                                            title="${escapeHtml(title)}"
                                            onmouseover="this.style.backgroundColor='${hasEvidence ? '#c3e6cb' : '#e9ecef'}'; this.style.boxShadow='0 0 4px rgba(0,0,0,0.1)';"
                                            onmouseout="this.style.backgroundColor='${bgColor}'; this.style.boxShadow='none';">
                                            <span style="font-size: 1.2rem;">${hasEvidence ? '✓' : '–'}</span>
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px; font-size: 0.9rem;">
            <p><strong>Coverage Summary:</strong></p>
            <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                ${modules.map(mod => {
                    const totalEvidence = mod.udlEvidence?.filter(e => e.evidence)?.length || 0;
                    return `<li>${escapeHtml(mod.title)}: <strong>${totalEvidence}/9</strong> UDL guidelines addressed</li>`;
                }).join('')}
            </ul>
        </div>
    `;

    return html;
}

/**
 * Render UDL Intensity heatmap - shows coverage density for each UDL subcategory
 */
function renderUDLIntensityHeatmap() {
    if (!appState.modules || appState.modules.length === 0) {
        return '<p class="text-muted"><em>No modules yet. Add modules to see UDL coverage intensity.</em></p>';
    }

    const udlCategories = [
        { dimension: 'representation', sublevel: 'Perception', label: '👁️ Perception' },
        { dimension: 'representation', sublevel: 'Language', label: '🔤 Language & Symbols' },
        { dimension: 'representation', sublevel: 'Comprehension', label: '🧠 Comprehension' },
        { dimension: 'actionExpression', sublevel: 'PhysicalAction', label: '🖱️ Physical Action' },
        { dimension: 'actionExpression', sublevel: 'Expression', label: '🗣️ Expression' },
        { dimension: 'actionExpression', sublevel: 'Executive', label: '⚙️ Executive Functions' },
        { dimension: 'engagement', sublevel: 'Recruiting', label: '🎪 Recruiting Attention' },
        { dimension: 'engagement', sublevel: 'Sustaining', label: '💪 Sustaining Effort' },
        { dimension: 'engagement', sublevel: 'SelfRegulation', label: '⚖️ Self-Regulation' }
    ];

    let html = `<div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">`;

    udlCategories.forEach((cat, idx) => {
        const coverage = appState.modules.filter(mod => 
            mod.udlEvidence?.find(e => e.dimension === cat.dimension && e.sublevel === cat.sublevel && e.evidence)
        ).length;

        const coveragePercent = (coverage / appState.modules.length) * 100;
        let heatColor;
        if (coveragePercent === 0) heatColor = '#dc3545'; // Red
        else if (coveragePercent < 33) heatColor = '#fd7e14'; // Orange
        else if (coveragePercent < 67) heatColor = '#ffc107'; // Yellow
        else heatColor = '#28a745'; // Green

        html += `
            <div style="flex: 0 0 calc(25% - 0.75rem); min-width: 160px; padding: 1rem; border-radius: 8px; background-color: ${heatColor}20; border: 2px solid ${heatColor}; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${cat.label}</div>
                <div style="font-size: 2rem; font-weight: bold; color: ${heatColor}; margin-bottom: 0.5rem;">${coverage}/${appState.modules.length}</div>
                <div style="font-size: 0.85rem; color: #555;">
                    <strong>${Math.round(coveragePercent)}%</strong> covered<br>
                    <small>${appState.modules.length - coverage} module${appState.modules.length - coverage !== 1 ? 's' : ''} need coverage</small>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

/**
 * Render CoI (Community of Inquiry) Intensity heatmap - shows cognitive presence coverage
 */
function renderCOIIntensityHeatmap() {
    const coiPhases = [
        { key: 'trigger', label: '🎯 Trigger Event', description: 'Stimulating student curiosity' },
        { key: 'exploration', label: '🔍 Exploration', description: 'Divergent thinking and idea generation' },
        { key: 'integration', label: '🔗 Integration', description: 'Convergent thinking and synthesis' },
        { key: 'resolution', label: '✅ Resolution', description: 'Application and confirmation' }
    ];

    let html = `<div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">`;

    coiPhases.forEach(phase => {
        // Check programme-level availability of cognitive presence
        const available = appState.learningExperience?.availablePresence?.cognitive?.includes(phase.key);
        
        // Count modules that might use this (simplified: if selected at programme level, assume potential)
        const availability = available ? 'Available ✓' : 'Not Selected';
        const heatColor = available ? '#28a745' : '#dc3545';
        const bgOpacity = available ? '20' : '20';

        html += `
            <div style="flex: 0 0 calc(25% - 0.75rem); min-width: 180px; padding: 1rem; border-radius: 8px; background-color: ${heatColor}${bgOpacity}; border: 2px solid ${heatColor}; text-align: center;">
                <div style="font-size: 1.2rem; margin-bottom: 0.5rem;"><strong>${phase.label}</strong></div>
                <div style="font-size: 0.9rem; color: #555; margin-bottom: 0.75rem;">${phase.description}</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: ${heatColor}; padding: 0.75rem; background-color: white; border-radius: 4px; border: 1px solid ${heatColor};">
                    ${available ? '✓ Active' : '✗ Inactive'}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    
    html += `
        <div style="margin-top: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px; font-size: 0.9rem;">
            <p><strong>💡 About Community of Inquiry (CoI):</strong></p>
            <p>The inquiry cycle model shows how students progress through meaningful learning. Configure which phases are available in your <strong>Programme Design → Learning Experience → Cognitive Presence</strong> section.</p>
            <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0; font-size: 0.85rem;">
                <li><strong>Trigger:</strong> How you initiate learning (motivating questions, scenarios)</li>
                <li><strong>Exploration:</strong> How students brainstorm and investigate</li>
                <li><strong>Integration:</strong> How students consolidate and synthesize ideas</li>
                <li><strong>Resolution:</strong> How students apply and confirm learning</li>
            </ul>
        </div>
    `;

    return html;
}

// ===== EXPORT TAB =====
function renderExport() {
    const preview = document.getElementById('jsonPreview');
    if (preview) {
        preview.textContent = serializeState();
    }

    const btnCopy = document.getElementById('btnCopyJSON');
    if (btnCopy) {
        btnCopy.onclick = () => {
            navigator.clipboard.writeText(serializeState()).then(() => {
                const notification = document.getElementById('copyNotification');
                notification.style.display = 'inline';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 2000);
            });
        };
    }
}

// ===== BACKWARD DESIGN CRUD =====
function showAddExitCapabilityModal() {
    const titleEl = document.getElementById('exitCapabilityModalTitle');
    const textEl = document.getElementById('exitCapabilityText');
    const customTagEl = document.getElementById('customTag');
    const modalEl = document.getElementById('exitCapabilityModal');
    
    if (!titleEl || !textEl || !customTagEl || !modalEl) {
        console.error('Exit capability modal elements not found');
        return;
    }
    
    titleEl.textContent = 'Add Exit Capability';
    textEl.value = '';
    document.querySelectorAll('.capability-tag-checkbox').forEach(cb => cb.checked = false);
    customTagEl.value = '';
    window.currentEditingCapabilityId = null;
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function showEditExitCapabilityModal(capabilityId) {
    const capability = appState.exitCapabilities.find(c => c.id === capabilityId);
    if (!capability) return;

    const titleEl = document.getElementById('exitCapabilityModalTitle');
    const textEl = document.getElementById('exitCapabilityText');
    const modalEl = document.getElementById('exitCapabilityModal');
    
    if (!titleEl || !textEl || !modalEl) {
        console.error('Exit capability modal elements not found');
        return;
    }

    titleEl.textContent = 'Edit Exit Capability';
    textEl.value = capability.text;
    
    document.querySelectorAll('.capability-tag-checkbox').forEach(cb => {
        cb.checked = (capability.tags || []).includes(cb.value);
    });
    
    window.currentEditingCapabilityId = capabilityId;
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function saveExitCapability() {
    const textEl = document.getElementById('exitCapabilityText');
    if (!textEl) {
        console.error('exitCapabilityText element not found');
        return;
    }
    
    const text = textEl.value.trim();
    if (!text) {
        showToast('Capability statement cannot be empty', 'danger');
        return;
    }

    const selectedTags = Array.from(document.querySelectorAll('.capability-tag-checkbox:checked'))
        .map(cb => cb.value);

    if (window.currentEditingCapabilityId) {
        const capability = appState.exitCapabilities.find(c => c.id === window.currentEditingCapabilityId);
        if (capability) {
            capability.text = text;
            capability.tags = selectedTags;
        }
    } else {
        appState.exitCapabilities.push({
            id: generateId('exitcap'),
            text,
            tags: selectedTags,
            evidence: []
        });
    }

    saveToLocalStorage();
    const modalEl = document.getElementById('exitCapabilityModal');
    if (modalEl) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }
    renderBackwardDesign();
    showToast('Exit capability saved', 'success');
}

function deleteExitCapability(capabilityId) {
    if (confirm('Delete this exit capability? Associated evidence will also be removed.')) {
        appState.exitCapabilities = appState.exitCapabilities.filter(c => c.id !== capabilityId);
        saveToLocalStorage();
        renderBackwardDesign();
        showToast('Exit capability deleted', 'info');
    }
}

function showAddPLOModal() {
    const titleEl = document.getElementById('ploModalTitle');
    const statementEl = document.getElementById('ploStatement');
    const levelEl = document.getElementById('ploLevel');
    const modalEl = document.getElementById('ploModal');
    
    if (!titleEl || !statementEl || !levelEl || !modalEl) {
        console.error('PLO modal elements not found');
        return;
    }
    
    titleEl.textContent = 'Add Programme Learning Outcome';
    statementEl.value = '';
    levelEl.value = 'Apply';
    window.currentEditingPLOId = null;
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function showEditPLOModal(ploId) {
    const plo = appState.draftPLOs.find(p => p.id === ploId);
    if (!plo) return;

    const titleEl = document.getElementById('ploModalTitle');
    const statementEl = document.getElementById('ploStatement');
    const levelEl = document.getElementById('ploLevel');
    const modalEl = document.getElementById('ploModal');
    
    if (!titleEl || !statementEl || !levelEl || !modalEl) {
        console.error('PLO modal elements not found');
        return;
    }

    titleEl.textContent = 'Edit Programme Learning Outcome';
    statementEl.value = plo.statement;
    levelEl.value = plo.level || 'Apply';
    window.currentEditingPLOId = ploId;
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function savePLO() {
    const statementEl = document.getElementById('ploStatement');
    const levelEl = document.getElementById('ploLevel');
    
    if (!statementEl || !levelEl) {
        console.error('PLO form elements not found');
        return;
    }
    
    const statement = statementEl.value.trim();
    const level = levelEl.value;
    
    if (!statement) {
        showToast('PLO statement cannot be empty', 'danger');
        return;
    }

    if (window.currentEditingPLOId) {
        const plo = appState.draftPLOs.find(p => p.id === window.currentEditingPLOId);
        if (plo) {
            plo.statement = statement;
            plo.level = level;
        }
    } else {
        appState.draftPLOs.push({
            id: generateId('plo'),
            statement,
            level
        });
    }

    saveToLocalStorage();
    const modalEl = document.getElementById('ploModal');
    if (modalEl) {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }
    renderBackwardDesign();
    showToast('PLO saved', 'success');
}

function deletePLO(ploId) {
    if (confirm('Delete this Programme Learning Outcome?')) {
        appState.draftPLOs = appState.draftPLOs.filter(p => p.id !== ploId);
        saveToLocalStorage();
        renderBackwardDesign();
        showToast('PLO deleted', 'info');
    }
}

function showAddEvidenceModal(capabilityId) {
    window.currentEvidenceCapabilityId = capabilityId;
    window.currentEvidenceId = null;
    
    document.getElementById('evidenceModalTitle').textContent = 'Add Evidence';
    document.getElementById('evidenceType').value = '';
    document.getElementById('evidenceIndividualOrGroup').value = 'individual';
    document.getElementById('evidenceAuthenticityScore').value = 3;
    document.getElementById('authenticityScoreLabel').textContent = '3/5';
    document.getElementById('evidenceTransferScore').value = 3;
    document.getElementById('transferScoreLabel').textContent = '3/5';
    document.getElementById('evidenceNotes').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('evidenceModal'));
    modal.show();
}

function showEditEvidenceModal(capabilityId, evidenceId) {
    const capability = appState.exitCapabilities.find(c => c.id === capabilityId);
    if (!capability) return;

    const evidence = capability.evidence.find(e => e.id === evidenceId);
    if (!evidence) return;

    window.currentEvidenceCapabilityId = capabilityId;
    window.currentEvidenceId = evidenceId;

    document.getElementById('evidenceModalTitle').textContent = 'Edit Evidence';
    document.getElementById('evidenceType').value = evidence.type;
    document.getElementById('evidenceIndividualOrGroup').value = evidence.individualOrGroup;
    document.getElementById('evidenceAuthenticityScore').value = evidence.authenticityScore;
    document.getElementById('authenticityScoreLabel').textContent = `${evidence.authenticityScore}/5`;
    document.getElementById('evidenceTransferScore').value = evidence.workplaceTransferScore;
    document.getElementById('transferScoreLabel').textContent = `${evidence.workplaceTransferScore}/5`;
    document.getElementById('evidenceNotes').value = evidence.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('evidenceModal'));
    modal.show();
}

function saveEvidence() {
    const type = document.getElementById('evidenceType').value.trim();
    if (!type) {
        showToast('Evidence type cannot be empty', 'danger');
        return;
    }

    const evidenceItem = {
        id: window.currentEvidenceId || generateId('ev'),
        type,
        individualOrGroup: document.getElementById('evidenceIndividualOrGroup').value,
        authenticityScore: parseInt(document.getElementById('evidenceAuthenticityScore').value),
        workplaceTransferScore: parseInt(document.getElementById('evidenceTransferScore').value),
        notes: document.getElementById('evidenceNotes').value.trim()
    };

    const capability = appState.exitCapabilities.find(c => c.id === window.currentEvidenceCapabilityId);
    if (!capability) return;

    if (window.currentEvidenceId) {
        const existingIndex = capability.evidence.findIndex(e => e.id === window.currentEvidenceId);
        if (existingIndex > -1) {
            capability.evidence[existingIndex] = evidenceItem;
        }
    } else {
        capability.evidence.push(evidenceItem);
    }

    saveToLocalStorage();
    bootstrap.Modal.getInstance(document.getElementById('evidenceModal')).hide();
    renderBackwardDesign();
    showToast('Evidence saved', 'success');
}

function deleteEvidence(capabilityId, evidenceId) {
    const capability = appState.exitCapabilities.find(c => c.id === capabilityId);
    if (capability) {
        capability.evidence = capability.evidence.filter(e => e.id !== evidenceId);
        saveToLocalStorage();
        renderBackwardDesign();
        showToast('Evidence deleted', 'info');
    }
}

// ===== PHASE 2B: MODULE-LEVEL BACKWARD DESIGN CRUD =====

function saveModuleAssessmentEvidence() {
    const module = appState.modules.find(m => m.id === window.currentModuleId);
    if (!module) return;

    const assessmentLink = document.getElementById('evidenceAssessmentLink').value;
    let description = document.getElementById('evidenceDescription').value.trim();
    let simulatedPerformance = document.getElementById('simulatedPerformance').value.trim();
    
    // If an assessment is linked, use its details if description is empty
    if (assessmentLink) {
        const linkedAssessment = module.assessments.find(a => a.id === assessmentLink);
        if (linkedAssessment) {
            if (!description) {
                description = `${linkedAssessment.name} (${linkedAssessment.type}) - Weight: ${linkedAssessment.weight}%`;
            }
            if (!simulatedPerformance) {
                simulatedPerformance = linkedAssessment.description || `Performance demonstrated through ${linkedAssessment.type}`;
            }
        }
    }

    if (!description) {
        showToast('Please fill in assessment description', 'danger');
        return;
    }

    const aiRisk = document.getElementById('assessmentAiRisk').value;
    const scaffoldSteps = document.getElementById('evidenceScaffold').value.trim().split(',').map(s => s.trim()).filter(s => s);

    if (!module.assessmentEvidence) module.assessmentEvidence = [];

    const evidenceItem = {
        id: window.currentEvidenceId || generateId('ev'),
        description,
        simulatedPerformance,
        aiRisk,
        scaffoldSteps,
        linkedAssessmentId: assessmentLink || null
    };

    if (window.currentEvidenceId) {
        const idx = module.assessmentEvidence.findIndex(e => e.id === window.currentEvidenceId);
        if (idx > -1) module.assessmentEvidence[idx] = evidenceItem;
    } else {
        module.assessmentEvidence.push(evidenceItem);
    }

    saveToLocalStorage();
    bootstrap.Modal.getInstance(document.getElementById('assessmentEvidenceModal')).hide();
    document.getElementById('moduleDetailContent').innerHTML = renderModuleBackwardDesignDetail(window.currentModuleId);
    showToast('Assessment evidence saved', 'success');
}

function populateAssessmentOptions(moduleId) {
    const module = appState.modules.find(m => m.id === moduleId);
    const selectEl = document.getElementById('evidenceAssessmentLink');
    
    if (!selectEl) return;
    
    // Clear existing options except the first one
    while (selectEl.options.length > 1) {
        selectEl.remove(1);
    }
    
    if (!module || !module.assessments || module.assessments.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'No assessments in this module';
        selectEl.appendChild(option);
        return;
    }
    
    // Add assessment options
    module.assessments.forEach(assessment => {
        const option = document.createElement('option');
        option.value = assessment.id;
        option.textContent = `${assessment.name} (${assessment.type}) - ${assessment.weight}%`;
        selectEl.appendChild(option);
    });
}

function saveModuleLearningActivity() {
    const description = document.getElementById('activityDescription').value.trim();
    const preparesForEvidenceId = document.getElementById('activityLinksToEvidence').value;
    const timing = document.getElementById('activityTiming').value.trim();

    if (!description || !preparesForEvidenceId) {
        showToast('Please fill in description and select evidence', 'danger');
        return;
    }

    const module = appState.modules.find(m => m.id === window.currentModuleId);
    if (!module) return;

    if (!module.learningActivities) module.learningActivities = [];

    const activityItem = {
        id: window.currentActivityId || generateId('act'),
        description,
        preparesForEvidenceId,
        timing
    };

    if (window.currentActivityId) {
        const idx = module.learningActivities.findIndex(a => a.id === window.currentActivityId);
        if (idx > -1) module.learningActivities[idx] = activityItem;
    } else {
        module.learningActivities.push(activityItem);
    }

    saveToLocalStorage();
    bootstrap.Modal.getInstance(document.getElementById('learningActivityModal')).hide();
    document.getElementById('moduleDetailContent').innerHTML = renderModuleBackwardDesignDetail(window.currentModuleId);
    showToast('Learning activity saved', 'success');
}

// ===== RENDER ALL / INIT =====
function renderAllTabs() {
    renderCanvas();
    renderBackwardDesign();
    renderAlignmentMap();
    renderModuleStudio();
    renderLearningExperience();
    renderRoadmap();
    renderExport();
}

// ===== EVENT LISTENERS (Header Buttons) =====
document.addEventListener('DOMContentLoaded', async () => {
    // Load patterns and state
    await loadPatterns();
    loadFromLocalStorage();
    renderAllTabs();

    // Header buttons
    document.getElementById('btnLoadExample')?.addEventListener('click', loadExampleData);

    document.getElementById('btnImport')?.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput')?.addEventListener('change', (e) => {
        importJSON(e.target.files[0]);
        e.target.value = '';
    });

    document.getElementById('btnExport')?.addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('exportModal')).show();
    });

    document.getElementById('btnExportQQI')?.addEventListener('click', exportToQQI);

    document.getElementById('btnDownloadFull')?.addEventListener('click', downloadFullJSON);
    document.getElementById('btnDownloadHandoff')?.addEventListener('click', downloadHandoffJSON);

    document.getElementById('btnReset')?.addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('resetModal')).show();
    });

    document.getElementById('btnConfirmReset')?.addEventListener('click', () => {
        resetToBlank();
        bootstrap.Modal.getInstance(document.getElementById('resetModal')).hide();
    });

    document.getElementById('btnGeneratePLOs')?.addEventListener('click', generatePLOsFromCapabilities);

    // Module handlers
    document.getElementById('btnAddModuleFromManager')?.addEventListener('click', addNewModule);
    document.getElementById('btnSaveModule')?.addEventListener('click', saveModuleFromEditor);

    // Auto-save
    setInterval(() => {
        saveToLocalStorage();
    }, AUTO_SAVE_INTERVAL);

    // Tab change handlers reload specific content
    document.getElementById('tabAlignment')?.addEventListener('click', () => {
        setTimeout(renderAlignmentMap, 500);
    });

    document.getElementById('tabBackwardDesign')?.addEventListener('click', () => {
        setTimeout(renderBackwardDesign, 500);
    });

    document.getElementById('tabAssessment')?.addEventListener('click', () => {
        setTimeout(renderAssessmentStudio, 500);
    });

    document.getElementById('tabCOI')?.addEventListener('click', () => {
        setTimeout(renderLearningExperience, 500);
    });

    document.getElementById('tabRoadmap')?.addEventListener('click', () => {
        setTimeout(renderRoadmap, 500);
    });

    document.getElementById('tabExport')?.addEventListener('click', () => {
        setTimeout(renderExport, 500);
    });

    showToast('Programme Design Studio loaded!', 'success');
});

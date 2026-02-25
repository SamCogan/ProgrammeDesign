// @ts-check
const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'programmeDesignStudio';

/**
 * Seed a known test state into localStorage before the page loads.
 * Uses addInitScript so it runs before app.js reads localStorage.
 */
async function seedState(page, overrides = {}) {
    const state = {
        programmeTitle: 'Test Programme',
        audience: 'Test audience',
        audienceConstraints: 'None',
        valueProposition: 'Test value',
        credits: 60,
        nfqLevel: 9,
        deliveryMode: 'Blended (Synchronous + Asynchronous)',
        deliveryDuration: '12 months',
        deliveryStructure: 'Weekly learning cycle',
        differentiators: ['Diff A', 'Diff B'],
        draftPLOs: [
            { id: 'plo-1', statement: 'Analyse business strategy', level: 'Analyse' }
        ],
        assessmentPortfolio: [
            {
                id: 'assess-1',
                title: 'Final Project',
                type: 'project',
                evidenceOutputs: ['Report'],
                weightingPercent: 100,
                individualOrGroup: 'individual',
                authenticity: 4,
                aiRisk: 'medium',
                aiRiskDesignMitigation: 'Viva',
                scaffoldSteps: ['Outline', 'Draft', 'Final'],
                feedbackMoments: ['Formative', 'Summative']
            }
        ],
        deliveryProfile: {
            deliveryMode: 50,
            syncAsync: 50,
            totalEffortHours: 1500,
            contactHours: { lectures: 50, tutorials: 30, labs: 0, seminars: 0, workshops: 0, directedElearning: 0, independentLearning: 0, other: 0 }
        },
        learningExperience: {
            description: 'Weekly cycle',
            availablePresence: { teaching: [], social: [], cognitive: [] },
            openText: ''
        },
        risksAndAssumptions: [
            { id: 'risk-1', category: 'Academic', risk: 'Low enrolment', assumption: 'Demand exists', mitigation: 'Marketing' }
        ],
        modules: [
            {
                id: 'mod-1',
                title: 'Module A',
                credits: 10,
                semester: 1,
                learningOutcomes: [{ id: 'modlo-1', statement: 'Apply concepts', level: 'Apply' }],
                assessments: [],
                learningExperience: { description: '', weeklyRhythm: [], notes: '' },
                udlEvidence: [],
                supportsExitCapabilities: [],
                assessmentEvidence: [],
                learningActivities: []
            }
        ],
        exitCapabilities: [
            { id: 'exitcap-1', text: 'Lead strategic initiatives', tags: ['Strategic', 'Leadership'], evidence: [] }
        ],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        ...overrides
    };

    await page.addInitScript((s) => {
        localStorage.setItem('programmeDesignStudio', JSON.stringify(s));
        // Dismiss welcome modal for most tests
        localStorage.setItem('programmeDesignStudio_welcomeDismissed', 'true');
    }, state);
}

/** Helper to read appState from localStorage */
async function getStoredState(page) {
    return page.evaluate(() => JSON.parse(localStorage.getItem('programmeDesignStudio')));
}

/** Click a sidebar nav tab and wait for its pane to appear */
async function navigateToTab(page, tabId, contentId) {
    await page.click(`#${tabId}`);
    await page.waitForSelector(`#${contentId}`, { state: 'visible', timeout: 3000 });
    // Wait a tick for dynamic rendering
    await page.waitForTimeout(600);
}

// ============================================================
// 1. PAGE LOAD & INITIALIZATION
// ============================================================
test.describe('Page load', () => {
    test('shows success toast on load', async ({ page }) => {
        // Dismiss welcome for this test
        await page.addInitScript(() => {
            localStorage.setItem('programmeDesignStudio_welcomeDismissed', 'true');
        });
        await page.goto('/');
        const toast = page.locator('.toast-body', { hasText: 'Programme Design Studio loaded' });
        await expect(toast).toBeVisible({ timeout: 5000 });
    });

    test('has correct page title', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('programmeDesignStudio_welcomeDismissed', 'true');
        });
        await page.goto('/');
        await expect(page).toHaveTitle('Programme Design Studio');
    });

    test('renders sidebar navigation tabs', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('programmeDesignStudio_welcomeDismissed', 'true');
        });
        await page.goto('/');
        await expect(page.locator('#tabCanvas')).toBeVisible();
        await expect(page.locator('#tabBackwardDesign')).toBeVisible();
        await expect(page.locator('#tabModuleStudio')).toBeVisible();
        await expect(page.locator('#tabDelivery')).toBeVisible();
        await expect(page.locator('#tabCOI')).toBeVisible();
        await expect(page.locator('#tabRoadmap')).toBeVisible();
        await expect(page.locator('#tabExport')).toBeVisible();
    });

    test('Canvas tab is active by default', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#tabCanvas')).toHaveClass(/active/);
        await expect(page.locator('#contentCanvas')).toBeVisible();
    });
});

// ============================================================
// 2. CANVAS TAB
// ============================================================
test.describe('Canvas tab', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
    });

    test('renders canvas tiles', async ({ page }) => {
        const tiles = page.locator('.canvas-tile');
        await expect(tiles.first()).toBeVisible();
        const count = await tiles.count();
        expect(count).toBeGreaterThanOrEqual(5);
    });

    test('displays audience from state', async ({ page }) => {
        const textarea = page.locator('textarea[data-field="audience"]');
        await expect(textarea).toHaveValue('Test audience');
    });

    test('displays differentiators from state', async ({ page }) => {
        const inputs = page.locator('input[name="differentiator"]');
        await expect(inputs).toHaveCount(2);
        await expect(inputs.first()).toHaveValue('Diff A');
    });

    test('adds a differentiator via app logic', async ({ page }) => {
        await page.evaluate(() => {
            appState.differentiators.push('New differentiator');
            saveToLocalStorage();
            renderCanvasTile('differentiators');
            // Re-render full tile
            const tile = document.querySelector('[data-tile-id="differentiators"]');
            if (tile) tile.innerHTML = renderCanvasTile('differentiators');
        });
        const inputs = page.locator('input[name="differentiator"]');
        await expect(inputs).toHaveCount(3);
    });

    test('removes a differentiator via app logic', async ({ page }) => {
        await page.evaluate(() => {
            appState.differentiators.splice(0, 1);
            saveToLocalStorage();
            const tile = document.querySelector('[data-tile-id="differentiators"]');
            if (tile) tile.innerHTML = renderCanvasTile('differentiators');
        });
        const inputs = page.locator('input[name="differentiator"]');
        await expect(inputs).toHaveCount(1);
    });

    test('displays exit capabilities count in tile', async ({ page }) => {
        const tile = page.locator('[data-tile-id="exitCapabilitiesRef"]');
        await expect(tile).toContainText('1 defined');
    });

    test('displays modules info in tile', async ({ page }) => {
        const tile = page.locator('[data-tile-id="modules"]');
        await expect(tile).toContainText('Module A');
    });
});

// ============================================================
// 3. CANVAS AUTO-SAVE
// ============================================================
test.describe('Canvas auto-save', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
    });

    test('persists audience change to localStorage', async ({ page }) => {
        const textarea = page.locator('textarea[data-field="audience"]');
        await textarea.fill('Updated audience');
        await textarea.dispatchEvent('change');
        await page.waitForTimeout(500);

        const state = await getStoredState(page);
        expect(state.audience).toBe('Updated audience');
    });

    test('persists differentiator change to localStorage', async ({ page }) => {
        const input = page.locator('input[name="differentiator"]').first();
        await input.fill('Changed diff');
        await input.dispatchEvent('change');
        await page.waitForTimeout(500);

        const state = await getStoredState(page);
        expect(state.differentiators[0]).toBe('Changed diff');
    });
});

// ============================================================
// 4. TAB NAVIGATION
// ============================================================
test.describe('Tab navigation', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
    });

    test('switches to Backward Design tab', async ({ page }) => {
        await navigateToTab(page, 'tabBackwardDesign', 'contentBackwardDesign');
        await expect(page.locator('#contentBackwardDesign')).toContainText('Backward Design');
    });

    test('switches to Module Studio tab', async ({ page }) => {
        await navigateToTab(page, 'tabModuleStudio', 'contentModuleStudio');
        await expect(page.locator('#contentModuleStudio')).toContainText('Module Studio');
    });

    test('switches to Delivery Profile tab', async ({ page }) => {
        await navigateToTab(page, 'tabDelivery', 'contentDelivery');
        await expect(page.locator('#contentDelivery')).toContainText('Delivery');
    });

    test('switches to Learning Experience tab', async ({ page }) => {
        await navigateToTab(page, 'tabCOI', 'contentCOI');
        await expect(page.locator('#contentCOI')).toBeVisible();
    });

    test('switches to Roadmap tab', async ({ page }) => {
        await navigateToTab(page, 'tabRoadmap', 'contentRoadmap');
        await expect(page.locator('#roadmapContent')).toContainText('Test Programme');
    });

    test('switches to Export tab', async ({ page }) => {
        await navigateToTab(page, 'tabExport', 'contentExport');
        await expect(page.locator('#contentExport')).toContainText('Export');
    });
});

// ============================================================
// 5. BACKWARD DESIGN – EXIT CAPABILITIES
// ============================================================
test.describe('Backward Design – Exit Capabilities', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabBackwardDesign', 'contentBackwardDesign');
    });

    test('displays existing exit capability', async ({ page }) => {
        await expect(page.locator('#bdProgrammeContent')).toContainText('Lead strategic initiatives');
    });

    test('opens add exit capability modal', async ({ page }) => {
        await page.click('.btn-add-exit-capability');
        await expect(page.locator('#exitCapabilityModal')).toBeVisible({ timeout: 3000 });
    });

    test('saves a new exit capability', async ({ page }) => {
        await page.click('.btn-add-exit-capability');
        await page.fill('#exitCapabilityText', 'New capability');
        await page.click('#exitCapabilityModal .btn-primary');
        await page.waitForTimeout(600);

        const state = await getStoredState(page);
        expect(state.exitCapabilities.length).toBeGreaterThanOrEqual(2);
    });

    test('deletes an exit capability', async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());
        await page.click('.btn-delete-exit-capability');
        await page.waitForTimeout(600);

        const state = await getStoredState(page);
        expect(state.exitCapabilities).toHaveLength(0);
    });
});

// ============================================================
// 6. BACKWARD DESIGN – PLOs
// ============================================================
test.describe('Backward Design – PLOs', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabBackwardDesign', 'contentBackwardDesign');
    });

    test('displays existing PLO', async ({ page }) => {
        await expect(page.locator('#bdProgrammeContent')).toContainText('Analyse business strategy');
    });

    test('opens add PLO modal', async ({ page }) => {
        await page.click('.btn-add-plo');
        await page.waitForTimeout(300);
        // The PLO modal is rendered dynamically inside contentBackwardDesign
        await expect(page.locator('#ploModal')).toBeVisible({ timeout: 3000 });
    });
});

// ============================================================
// 7. BACKWARD DESIGN – MODULE LEVEL
// ============================================================
test.describe('Backward Design – Module Level', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabBackwardDesign', 'contentBackwardDesign');
        await page.click('#bdModuleTab');
        await page.waitForTimeout(600);
    });

    test('displays module in selector list', async ({ page }) => {
        await expect(page.locator('.module-selector').first()).toContainText('Module A');
    });

    test('shows module detail with Step 1', async ({ page }) => {
        await expect(page.locator('#moduleDetailContent')).toContainText('Step 1: Link Module to Exit Capabilities');
    });

    test('links module to exit capability', async ({ page }) => {
        const checkbox = page.locator('.module-capability-checkbox').first();
        await checkbox.check();
        await page.waitForTimeout(600);

        const state = await getStoredState(page);
        expect(state.modules[0].supportsExitCapabilities).toContain('exitcap-1');
    });
});

// ============================================================
// 8. MODULE STUDIO
// ============================================================
test.describe('Module Studio', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabModuleStudio', 'contentModuleStudio');
    });

    test('displays module in sidebar list', async ({ page }) => {
        await expect(page.locator('#moduleStudioList')).toContainText('Module A');
    });

    test('shows module count badge', async ({ page }) => {
        await expect(page.locator('#modulesCountBadge')).toContainText('1');
    });

    test('adds a new module via button', async ({ page }) => {
        await page.click('#btnAddNewModule');
        await page.waitForTimeout(600);

        const state = await getStoredState(page);
        expect(state.modules.length).toBeGreaterThanOrEqual(2);
    });
});

// ============================================================
// 9. DELIVERY PROFILE
// ============================================================
test.describe('Delivery Profile', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabDelivery', 'contentDelivery');
    });

    test('displays total effort hours (60 credits × 25 = 1500)', async ({ page }) => {
        await expect(page.locator('#contentDelivery')).toContainText('1500');
    });

    test('shows contact hours total badge', async ({ page }) => {
        // lectures 50 + tutorials 30 = 80
        await expect(page.locator('#contactTotalBadge')).toContainText('80h');
    });

    test('displays independent learning hours', async ({ page }) => {
        // 1500 - 80 = 1420
        await expect(page.locator('#independentHoursDisplay')).toContainText('1420h');
    });

    test('updates delivery mode label on slider change', async ({ page }) => {
        await page.fill('#sliderDeliveryMode', '95');
        await page.locator('#sliderDeliveryMode').dispatchEvent('input');
        await page.waitForTimeout(300);
        await expect(page.locator('#deliveryModeLabel')).toContainText('Fully Online');
    });

    test('updates sync/async label on slider change', async ({ page }) => {
        await page.fill('#sliderSyncAsync', '5');
        await page.locator('#sliderSyncAsync').dispatchEvent('input');
        await page.waitForTimeout(300);
        await expect(page.locator('#syncAsyncLabel')).toContainText('Fully Synchronous');
    });

    test('persists contact hour changes via number input', async ({ page }) => {
        const input = page.locator('.contact-hours-input[data-contact-type="lectures"]');
        await input.fill('100');
        await input.dispatchEvent('change');
        await page.waitForTimeout(800);

        const state = await getStoredState(page);
        expect(state.deliveryProfile.contactHours.lectures).toBe(100);
    });

    test('syncs slider when number input changes', async ({ page }) => {
        const input = page.locator('.contact-hours-input[data-contact-type="tutorials"]');
        await input.fill('60');
        await input.dispatchEvent('change');
        await page.waitForTimeout(800);

        const slider = page.locator('.contact-hours-slider[data-contact-type="tutorials"]');
        await expect(slider).toHaveValue('60');
    });
});

// ============================================================
// 10. ROADMAP
// ============================================================
test.describe('Roadmap', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabRoadmap', 'contentRoadmap');
    });

    test('displays programme title', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Test Programme');
    });

    test('displays exit capabilities', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Lead strategic initiatives');
    });

    test('displays PLOs', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Analyse business strategy');
    });

    test('displays assessment portfolio', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Final Project');
    });

    test('displays differentiators', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Diff A');
    });

    test('displays risks', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Low enrolment');
    });

    test('displays delivery profile summary', async ({ page }) => {
        await expect(page.locator('#roadmapContent')).toContainText('Delivery Profile');
    });
});

// ============================================================
// 11. EXPORT TAB
// ============================================================
test.describe('Export tab', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabExport', 'contentExport');
    });

    test('shows JSON preview with programme data', async ({ page }) => {
        const preview = page.locator('#jsonPreview');
        await expect(preview).toContainText('Test Programme');
    });

    test('has download buttons', async ({ page }) => {
        await expect(page.locator('#btnDownloadFull')).toBeVisible();
        await expect(page.locator('#btnDownloadHandoff')).toBeVisible();
    });

    test('has copy to clipboard button', async ({ page }) => {
        await expect(page.locator('#btnCopyJSON')).toBeVisible();
    });
});

// ============================================================
// 12. RESET
// ============================================================
test.describe('Reset', () => {
    test('opens reset confirmation modal', async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await page.click('#btnReset');
        await expect(page.locator('#resetModal')).toBeVisible({ timeout: 3000 });
    });

    test('clears state on confirm', async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await page.click('#btnReset');
        await page.click('#btnConfirmReset');
        await page.waitForTimeout(600);

        const state = await getStoredState(page);
        // After reset, state is cleared from storage then re-saved as blank
        // Check that it's the blank template (title is 'New Programme')
        expect(state === null || state.programmeTitle === 'New Programme').toBeTruthy();
    });
});

// ============================================================
// 13. IMPORT JSON
// ============================================================
test.describe('Import JSON', () => {
    test('imports a valid JSON file', async ({ page }) => {
        await page.goto('/');

        const importData = {
            programmeTitle: 'Imported Programme',
            audience: 'Imported audience',
            credits: 90,
            nfqLevel: 10,
            deliveryMode: 'Online',
            deliveryDuration: '24 months',
            deliveryStructure: 'Fortnightly',
            differentiators: ['Imported diff'],
            draftPLOs: [],
            assessmentPortfolio: [],
            risksAndAssumptions: [],
            modules: [],
            exitCapabilities: []
        };

        const buffer = Buffer.from(JSON.stringify(importData));
        await page.locator('#fileInput').setInputFiles({
            name: 'test-import.json',
            mimeType: 'application/json',
            buffer
        });
        await page.waitForTimeout(1000);

        const state = await getStoredState(page);
        expect(state.programmeTitle).toBe('Imported Programme');
        expect(state.credits).toBe(90);
    });
});

// ============================================================
// 14. GLOBAL UTILITY FUNCTIONS (via page.evaluate)
// ============================================================
test.describe('Utility functions', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
    });

    test('escapeHtml escapes special characters', async ({ page }) => {
        const escaped = await page.evaluate(() => escapeHtml('<script>alert("xss")</script>'));
        expect(escaped).not.toContain('<script>');
        expect(escaped).toContain('&lt;script&gt;');
    });

    test('generateId returns prefixed unique IDs', async ({ page }) => {
        const ids = await page.evaluate(() => [generateId('test'), generateId('test'), generateId('mod')]);
        expect(ids[0]).toMatch(/^test-/);
        expect(ids[2]).toMatch(/^mod-/);
        expect(new Set(ids).size).toBe(3);
    });

    test('serializeState returns valid JSON', async ({ page }) => {
        const json = await page.evaluate(() => serializeState());
        const parsed = JSON.parse(json);
        expect(parsed.programmeTitle).toBe('Test Programme');
    });

    test('validateState returns no errors for valid state', async ({ page }) => {
        const errors = await page.evaluate(() => validateState());
        expect(errors).toHaveLength(0);
    });

    test('validateState detects missing title', async ({ page }) => {
        const errors = await page.evaluate(() => {
            appState.programmeTitle = '';
            return validateState();
        });
        expect(errors).toContain('Programme title is required');
    });

    test('validateState detects no modules', async ({ page }) => {
        const errors = await page.evaluate(() => {
            appState.modules = [];
            return validateState();
        });
        expect(errors).toContain('At least 1 module is required');
    });

    test('validateState detects no exit capabilities', async ({ page }) => {
        const errors = await page.evaluate(() => {
            appState.exitCapabilities = [];
            return validateState();
        });
        expect(errors).toContain('At least 1 exit capability is required');
    });
});

// ============================================================
// 15. QQI TRANSFORM
// ============================================================
test.describe('transformToQQI', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
    });

    test('produces valid QQI format', async ({ page }) => {
        const qqi = await page.evaluate(() => transformToQQI(appState));
        expect(qqi.title).toBe('Test Programme');
        expect(qqi.nfqLevel).toBe(9);
        expect(qqi.totalCredits).toBe(60);
        expect(qqi.schemaVersion).toBe(1.0);
        expect(qqi.modules).toHaveLength(1);
        expect(qqi.plos).toHaveLength(1);
        expect(qqi._studioMetadata).toBeDefined();
        expect(qqi._studioMetadata.audience).toBe('Test audience');
    });

    test('throws if title missing', async ({ page }) => {
        const error = await page.evaluate(() => {
            try { transformToQQI({ programmeTitle: '' }); return null; }
            catch (e) { return e.message; }
        });
        expect(error).toBe('Programme title is required');
    });
});

// ============================================================
// 16. UDL MIGRATION
// ============================================================
test.describe('migrateUDLGuidelines', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('maps old 2.2 sublevel names to 3.0', async ({ page }) => {
        const result = await page.evaluate(() => {
            const testState = {
                modules: [{
                    id: 'mod-test',
                    udlEvidence: [
                        { dimension: 'representation', sublevel: 'Comprehension', evidence: 'Test' },
                        { dimension: 'actionExpression', sublevel: 'PhysicalAction', evidence: 'Test2' },
                        { dimension: 'engagement', sublevel: 'SelfRegulation', evidence: 'Test3' }
                    ]
                }]
            };
            const migrated = migrateUDLGuidelines(testState);
            return migrated.modules[0].udlEvidence.map(e => e.sublevel);
        });
        expect(result).toEqual(['BuildingKnowledge', 'Interaction', 'EmotionalCapacity']);
    });

    test('leaves 3.0 sublevel names unchanged', async ({ page }) => {
        const result = await page.evaluate(() => {
            const testState = {
                modules: [{
                    id: 'mod-test',
                    udlEvidence: [
                        { dimension: 'representation', sublevel: 'Perception', evidence: 'Already correct' }
                    ]
                }]
            };
            return migrateUDLGuidelines(testState).modules[0].udlEvidence[0].sublevel;
        });
        expect(result).toBe('Perception');
    });
});

// ============================================================
// 17. WELCOME / SPLASH MODAL
// ============================================================
test.describe('Welcome modal', () => {
    test('shows welcome modal on first visit', async ({ page }) => {
        // Do NOT dismiss — no addInitScript for welcome key
        await page.goto('/');
        await expect(page.locator('#welcomeModal')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#welcomeModal')).toContainText('Programme Design Studio');
        await expect(page.locator('#welcomeModal')).toContainText('Backward Design');
        await expect(page.locator('#welcomeModal')).toContainText('Constructive Alignment');
        await expect(page.locator('#welcomeModal')).toContainText('Universal Design for Learning');
        await expect(page.locator('#welcomeModal')).toContainText('Community of Inquiry');
    });

    test('closes welcome modal with Get Started button', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#welcomeModal')).toBeVisible({ timeout: 5000 });
        await page.click('#btnWelcomeStart');
        await expect(page.locator('#welcomeModal')).not.toBeVisible({ timeout: 3000 });
    });

    test('does not show welcome if previously dismissed', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('programmeDesignStudio_welcomeDismissed', 'true');
        });
        await page.goto('/');
        await page.waitForTimeout(1000);
        await expect(page.locator('#welcomeModal')).not.toBeVisible();
    });

    test('remembers dismissal when checkbox checked', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#welcomeModal')).toBeVisible({ timeout: 5000 });
        await page.check('#welcomeDontShowAgain');
        await page.click('#btnWelcomeStart');
        await page.waitForTimeout(500);

        const dismissed = await page.evaluate(() =>
            localStorage.getItem('programmeDesignStudio_welcomeDismissed')
        );
        expect(dismissed).toBe('true');
    });

    test('Help button re-opens welcome modal', async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await page.waitForTimeout(500);
        await page.click('#btnHelp');
        await expect(page.locator('#welcomeModal')).toBeVisible({ timeout: 3000 });
    });
});

// ============================================================
// 18. NEW CONTACT HOUR TYPES IN DELIVERY PROFILE
// ============================================================
test.describe('Delivery Profile – new contact types', () => {
    test.beforeEach(async ({ page }) => {
        await seedState(page);
        await page.goto('/');
        await navigateToTab(page, 'tabDelivery', 'contentDelivery');
    });

    test('displays Directed e-Learning slider', async ({ page }) => {
        await expect(page.locator('.contact-hours-input[data-contact-type="directedElearning"]')).toBeVisible();
        await expect(page.locator('#contentDelivery')).toContainText('Directed e-Learning');
    });

    test('displays Independent Learning slider', async ({ page }) => {
        await expect(page.locator('.contact-hours-input[data-contact-type="independentLearning"]')).toBeVisible();
        await expect(page.locator('#contentDelivery')).toContainText('Independent Learning');
    });

    test('persists directed e-learning hours', async ({ page }) => {
        const input = page.locator('.contact-hours-input[data-contact-type="directedElearning"]');
        await input.fill('75');
        await input.dispatchEvent('change');
        await page.waitForTimeout(800);

        const state = await getStoredState(page);
        expect(state.deliveryProfile.contactHours.directedElearning).toBe(75);
    });

    test('persists independent learning hours', async ({ page }) => {
        const input = page.locator('.contact-hours-input[data-contact-type="independentLearning"]');
        await input.fill('200');
        await input.dispatchEvent('change');
        await page.waitForTimeout(800);

        const state = await getStoredState(page);
        expect(state.deliveryProfile.contactHours.independentLearning).toBe(200);
    });
});
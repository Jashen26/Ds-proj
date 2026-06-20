// ─── 0. Philippine Provinces & Regions ───────────────────────────────
const PH_PROVINCES_BY_REGION = {
    "NCR": ["Metro Manila"],
    "CAR": ["Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province"],
    "Region I (Ilocos Region)": ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"],
    "Region II (Cagayan Valley)": ["Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"],
    "Region III (Central Luzon)": ["Aurora", "Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales"],
    "Region IV-A (CALABARZON)": ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal"],
    "Region IV-B (MIMAROPA)": ["Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon"],
    "Region V (Bicol Region)": ["Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon"],
    "Region VI (Western Visayas)": ["Aklan", "Antique", "Capiz", "Guimaras", "Iloilo"],
    "Region VII (Central Visayas)": ["Bohol", "Cebu"],
    "Region VIII (Eastern Visayas)": ["Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte"],
    "Region IX (Zamboanga Peninsula)": ["Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"],
    "Region X (Northern Mindanao)": ["Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental"],
    "Region XI (Davao Region)": ["Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental"],
    "Region XII (SOCCSKSARGEN)": ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"],
    "Region XIII (Caraga)": ["Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur"],
    "BARMM": ["Basilan", "Lanao del Sur", "Maguindanao del Norte", "Maguindanao del Sur", "Sulu", "Tawi-Tawi"],
    "NIR (Negros Island Region)": ["Negros Occidental", "Negros Oriental", "Siquijor"]
};

// Flat lookup: province name -> region name
const PH_REGION_BY_PROVINCE = {};
Object.entries(PH_PROVINCES_BY_REGION).forEach(([region, provinces]) => {
    provinces.forEach(province => { PH_REGION_BY_PROVINCE[province] = region; });
});

// Populate every province <select> on the page with grouped options
document.querySelectorAll('select.province-select').forEach(select => {
    Object.entries(PH_PROVINCES_BY_REGION).forEach(([region, provinces]) => {
        const group = document.createElement('optgroup');
        group.label = region;
        provinces.forEach(province => {
            const opt = document.createElement('option');
            opt.value = province;
            opt.textContent = province;
            group.appendChild(opt);
        });
        select.appendChild(group);
    });

    // Auto-assign the region whenever a province is chosen
    select.addEventListener('change', () => {
        const regionField = select.closest('.form-grid').querySelector('.region-display');
        if (!regionField) return;
        const region = PH_REGION_BY_PROVINCE[select.value] || '';
        regionField.textContent = region || '—';
        regionField.classList.toggle('is-empty', !region);
    });
});

// ─── 1. Conditional Document Requirements ────────────────────────────
function updateDocRequirements() {
    const isSoloParent = document.getElementById('solo-yes').checked;
    const hasHouseholdMembers =
        document.querySelectorAll('#container-senior .nested-form-block').length > 0 ||
        document.querySelectorAll('#container-child .nested-form-block').length > 0;

    const reqHousehold = document.getElementById('doc-req-household');
    const reqIndigency = document.getElementById('doc-req-indigency');
    const section      = document.getElementById('doc-conditional-section');

    if(reqHousehold) reqHousehold.style.display = hasHouseholdMembers ? '' : 'none';
    if(reqIndigency) reqIndigency.style.display = isSoloParent        ? '' : 'none';
    if(section)      section.style.display      = (hasHouseholdMembers || isSoloParent) ? '' : 'none';
}

// Wire solo parent radio
document.querySelectorAll('input[name="soloParent"]').forEach(r =>
    r.addEventListener('change', updateDocRequirements)
);
updateDocRequirements();

// ─── 3. Pagination System ────────────────────────────────────────────
const stepOrder  = ['step-1','step-2','step-3','step-5','step-6','step-7'];
const stepPanels2 = stepOrder.map(id => document.getElementById(id));
const navItems  = document.querySelectorAll('.step-item');
let currentStep = 0; // index into stepOrder

function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// Validates the required fields within a given panel.
function validateStep(panel) {
    if(!panel) return false;
    panel.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
    panel.querySelectorAll('.field-error-msg').forEach(el => el.remove());
    let firstInvalid = null;
    const markInvalid = (el, msg) => {
        el.classList.add('field-invalid');
        if (msg) {
            const existing = el.parentElement.querySelector('.field-error-msg');
            if (!existing) {
                const span = document.createElement('span');
                span.className = 'field-error-msg';
                span.textContent = msg;
                el.after(span);
            }
        }
        if (!firstInvalid) firstInvalid = el;
    };

    // Generic required validation
    panel.querySelectorAll('.form-group').forEach(fg => {
        const label = fg.querySelector('label');
        if (!label || !label.querySelector('span')) return;
        if (!isVisible(fg)) return;

        const radios = fg.querySelectorAll('input[type="radio"]');
        if (radios.length) {
            if (![...radios].some(r => r.checked)) markInvalid(radios[0]);
            return;
        }

        const field = fg.querySelector('input, select, textarea');
        if (!field || field.disabled) return;
        if (!field.value || !field.value.trim()) markInvalid(field);
    });

    // Checkbox grids validation
    panel.querySelectorAll('.form-section-label').forEach(lbl => {
        if (!lbl.querySelector('span')) return;
        const sib = lbl.nextElementSibling;
        if (sib && (sib.classList.contains('checkbox-grid') || sib.classList.contains('diag-checkbox-grid'))) {
            const boxes = sib.querySelectorAll('input[type="checkbox"]');
            if (boxes.length && ![...boxes].some(b => b.checked)) markInvalid(sib);
        }
    });

    // Email format
    if (panel.id === 'step-1') {
        const email = document.getElementById('applicant-email');
        if (email && email.value.trim()) {
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
            if (!emailOk) markInvalid(email, 'Please enter a valid email address (e.g. name@example.com).');
        }

        const contact = document.getElementById('applicant-contact');
        if (contact && contact.value.trim()) {
            const contactOk = /^\+?[\d\s\-]{7,15}$/.test(contact.value.trim());
            if (!contactOk) markInvalid(contact, 'Contact number must contain digits only (7–15 digits).');
        }
    }

    // Name matching
    if (panel.id === 'step-6') {
        const sigField = document.getElementById('sig-name');
        if (sigField && sigField.value.trim()) {
            const firstName  = (document.getElementById('applicant-firstname')?.value  || '').trim();
            const middleName = (document.getElementById('applicant-middlename')?.value || '').trim();
            const surname    = (document.getElementById('applicant-surname')?.value    || '').trim();
            const suffix     = (document.getElementById('applicant-suffix')?.value     || '').trim();

            const normalize = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
            const typed = normalize(sigField.value);
            const candidates = [
                [firstName, middleName, surname, suffix],
                [firstName, middleName, surname],
                [firstName, surname, suffix],
                [firstName, surname],
            ].map(parts => normalize(parts.filter(Boolean).join(' ')));

            if (!candidates.includes(typed)) {
                markInvalid(sigField, `Name does not match your registered name. Expected: ${[firstName, middleName, surname, suffix].filter(Boolean).join(' ')}`);
            }
        }

        const terms   = document.getElementById('terms-cond');
        const consent = document.getElementById('data-consent');
        if (terms && !terms.checked) markInvalid(terms);
        if (consent && !consent.checked) markInvalid(consent);
    }

    if (panel.id === 'step-5') {
        const docChk = document.getElementById('doc-submitted');
        if (docChk && !docChk.checked) markInvalid(docChk);
    }

    if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return false;
    }
    return true;
}

// Live-clear invalid highlight
document.addEventListener('input', clearFieldInvalid);
document.addEventListener('change', clearFieldInvalid);

function clearFieldInvalid(e) {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    const removeError = (field) => {
        field.classList.remove('field-invalid');
        const msg = field.parentElement?.querySelector('.field-error-msg');
        if (msg) msg.remove();
    };

    if (el.classList.contains('field-invalid')) {
        if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) removeError(el);
        } else if (el.value && el.value.trim()) {
            removeError(el);
        }
    }

    if (el.type === 'radio' && el.checked && el.name) {
        document.querySelectorAll(`input[name="${el.name}"].field-invalid`)
            .forEach(r => removeError(r));
    }

    if (el.type === 'checkbox') {
        const grid = el.closest('.checkbox-grid, .diag-checkbox-grid');
        if (grid && grid.classList.contains('field-invalid')) {
            const anyChecked = [...grid.querySelectorAll('input[type="checkbox"]')].some(c => c.checked);
            if (anyChecked) grid.classList.remove('field-invalid');
        }
    }
}

function updateSidebar() {
    navItems.forEach((item, i) => {
        item.classList.remove('active', 'completed', 'locked');
        if (i < currentStep)       item.classList.add('completed');
        else if (i === currentStep) item.classList.add('active');
        else                         item.classList.add('locked');
    });
}

function showStep(index) {
    currentStep = index;
    stepPanels2.forEach((panel, i) => { if(panel) panel.classList.toggle('hidden-step', i !== index); });
    updateSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
    const current = stepPanels2[currentStep];
    if (!validateStep(current)) return;
    if (currentStep < stepOrder.length - 1) showStep(currentStep + 1);
}

function goBack() {
    if (currentStep > 0) showStep(currentStep - 1);
}

// Wire Next / Back buttons
for (let i = 1; i <= 5; i++) {
    const nextBtn = document.getElementById(`next-${i}`);
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    const backBtn = document.getElementById(`back-${i}`);
    if (backBtn) backBtn.addEventListener('click', goBack);
}
const back6 = document.getElementById('back-6');
if (back6) back6.addEventListener('click', goBack);

navItems.forEach((item, i) => {
    item.addEventListener('click', e => {
        e.preventDefault();
        if (i <= currentStep) showStep(i);
    });
});

showStep(0);

// ─── 4. Same-address Logic ───────────────────────────────────────────
const currInputs = ['curr-house','curr-street','curr-brgy','curr-city','curr-prov','curr-postal'];
const permInputs = ['perm-house','perm-street','perm-brgy','perm-city','perm-prov','perm-postal'];
const sameChk    = document.getElementById('same-address');

function checkCurrentFilled() {
    const allFilled = currInputs.every(id => {
        const el = document.getElementById(id);
        return el && el.value;
    });
    if(sameChk) {
        sameChk.disabled = !allFilled;
        if (!allFilled && sameChk.checked) { sameChk.checked = false; syncPermanent(false); }
    }
}

function syncPermanent(isSame) {
    permInputs.forEach((pid, i) => {
        const pe = document.getElementById(pid), ce = document.getElementById(currInputs[i]);
        if(pe && ce) {
            pe.value    = isSame ? ce.value : '';
            pe.disabled = isSame;
        }
    });

    const currRegion = document.getElementById('curr-reg');
    const permRegion = document.getElementById('perm-reg');
    if (currRegion && permRegion) {
        if (isSame) {
            permRegion.textContent = currRegion.textContent;
            permRegion.classList.toggle('is-empty', currRegion.classList.contains('is-empty'));
        } else {
            permRegion.textContent = '—';
            permRegion.classList.add('is-empty');
        }
    }
}

currInputs.forEach(id => {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('input',  checkCurrentFilled);
        el.addEventListener('change', checkCurrentFilled);
    }
});
if(sameChk) sameChk.addEventListener('change', e => syncPermanent(e.target.checked));
checkCurrentFilled();

// ─── 5. Household Repeater ───────────────────────────────────────────
function updateHouseholdCounts() {
    const counts = {
        adult:  document.querySelectorAll('#container-adult  .nested-form-block').length,
        child:  document.querySelectorAll('#container-child  .nested-form-block').length,
        senior: document.querySelectorAll('#container-senior .nested-form-block').length,
    };
    const cAdult = document.getElementById('count-adult');
    const cChild = document.getElementById('count-child');
    const cSenior = document.getElementById('count-senior');
    const cTotal = document.getElementById('count-total');
    
    if(cAdult) cAdult.textContent  = counts.adult;
    if(cChild) cChild.textContent  = counts.child;
    if(cSenior) cSenior.textContent = counts.senior;
    if(cTotal) cTotal.textContent  = 1 + counts.adult + counts.child + counts.senior;
}

function reindexBlocks(containerId, prefix) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.querySelectorAll('.nested-form-block').forEach((block, i) => {
        block.querySelector('.nested-block-title').textContent = `${prefix} #${i + 1}`;
        block.querySelectorAll('input[type="radio"]').forEach(r => {
            r.name = r.name.replace(/-\d+$/, '') + '-' + (i + 1);
        });
    });
}

function addBlock(containerId, templateId, prefix) {
    const container = document.getElementById(containerId);
    const tmpl = document.getElementById(templateId);
    if(!container || !tmpl) return;
    
    const clone = tmpl.content.cloneNode(true);
    clone.querySelector('.btn-remove-item').addEventListener('click', function (e) {
        e.target.closest('.nested-form-block').remove();
        reindexBlocks(containerId, prefix);
        updateHouseholdCounts();
        updateDocRequirements();
    });

    container.appendChild(clone);
    reindexBlocks(containerId, prefix);
    updateHouseholdCounts();
    updateDocRequirements();
}

const btnAddAdult = document.getElementById('btn-add-adult');
const btnAddChild = document.getElementById('btn-add-child');
const btnAddSenior = document.getElementById('btn-add-senior');

if(btnAddAdult) btnAddAdult.addEventListener('click', () => addBlock('container-adult',  'tmpl-adult',  'Adult Member'));
if(btnAddChild) btnAddChild.addEventListener('click', () => addBlock('container-child',  'tmpl-child',  'Dependent Child'));
if(btnAddSenior) btnAddSenior.addEventListener('click', () => addBlock('container-senior', 'tmpl-senior', 'Senior Citizen'));

// ─── 6. Step 6 → Step 7 ───────────────────────────────────
const unlock7 = document.getElementById('btn-unlock-step7');
if(unlock7) unlock7.addEventListener('click', goNext);

const btnGoBack = document.getElementById('btn-go-back');
if(btnGoBack) btnGoBack.addEventListener('click', goBack);

const btnFinalSubmit = document.getElementById('btn-final-submit');

// ─── 7. Eligibility Scoring ──────────────────────────────────────────
function computeEligibility() {
    let points = 0;
    const breakdown = [];

    const totalIncEl = document.getElementById('total-income');
    const totalIncome = parseFloat(totalIncEl ? totalIncEl.value : 0) || 0;
    
    const countTotalEl = document.getElementById('count-total');
    const familyMembers = parseInt(countTotalEl ? countTotalEl.textContent : "1", 10) || 1;
    const perCapita = totalIncome / familyMembers;

    let incomePts = 0;
    if (perCapita <= 3000)       incomePts = 5;
    else if (perCapita <= 6000)  incomePts = 4;
    else if (perCapita <= 10000) incomePts = 3;
    else if (perCapita <= 15000) incomePts = 2;
    points += incomePts;
    breakdown.push({
        label: 'Monthly Income per Household Member',
        detail: `₱${perCapita.toLocaleString('en-PH', { maximumFractionDigits: 0 })} per member`,
        points: incomePts,
        max: 5
    });

    const applicantPwd = document.querySelector('input[name="applicantPwd"]:checked');
    let pwdCount = (applicantPwd && applicantPwd.value === 'Yes') ? 1 : 0;
    document.querySelectorAll('.member-pwd-yes:checked').forEach(() => pwdCount++);
    let pwdPts = 0;
    if (pwdCount >= 3)       pwdPts = 4;
    else if (pwdCount === 2) pwdPts = 3;
    else if (pwdCount === 1) pwdPts = 2;
    points += pwdPts;
    breakdown.push({
        label: 'Persons with Disability (PWD) in Household',
        detail: `${pwdCount} member${pwdCount === 1 ? '' : 's'}`,
        points: pwdPts,
        max: 4
    });

    const soloParent = document.getElementById('solo-yes');
    const isSoloParent = !!(soloParent && soloParent.checked);
    const soloPts = isSoloParent ? 2 : 0;
    points += soloPts;
    breakdown.push({
        label: 'Solo Parent Status',
        detail: isSoloParent ? 'Yes' : 'No',
        points: soloPts,
        max: 2
    });

    let studentCount = 0;
    document.querySelectorAll('#container-child .nested-form-block .child-attending-school').forEach(sel => {
        if (sel.value === 'Yes') studentCount++;
    });
    let studentPts = 0;
    if (studentCount >= 3)      studentPts = 3;
    else if (studentCount === 2) studentPts = 2;
    else if (studentCount === 1) studentPts = 1;
    points += studentPts;
    breakdown.push({
        label: 'Children Attending School',
        detail: `${studentCount} child${studentCount === 1 ? '' : 'ren'}`,
        points: studentPts,
        max: 3
    });

    const cSeniorEl = document.getElementById('count-senior');
    const seniorCount = parseInt(cSeniorEl ? cSeniorEl.textContent : "0", 10) || 0;
    let seniorPts = 0;
    if (seniorCount >= 2)      seniorPts = 2;
    else if (seniorCount === 1) seniorPts = 1;
    points += seniorPts;
    breakdown.push({
        label: 'Senior Citizens in Household',
        detail: `${seniorCount} member${seniorCount === 1 ? '' : 's'}`,
        points: seniorPts,
        max: 2
    });

    const maxPoints = breakdown.reduce((sum, item) => sum + item.max, 0);

    let result;
    if (points >= 10) {
        result = { level: 'Full Assistance — Highest Priority', amount: '₱10,000 / month', eligible: true };
    } else if (points >= 7) {
        result = { level: 'High Assistance', amount: '₱7,500 / month', eligible: true };
    } else if (points >= 4) {
        result = { level: 'Moderate Assistance', amount: '₱5,000 / month', eligible: true };
    } else if (points >= 1) {
        result = { level: 'Limited Assistance', amount: '₱2,500 / month', eligible: true };
    } else {
        result = { level: 'Not Eligible for Regular Assistance', amount: '', eligible: false };
    }

    result.points = points;
    result.maxPoints = maxPoints;
    result.breakdown = breakdown;
    return result;
}

function generateReferenceNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `KWARTA-${y}-${rand}`;
}

// ─── 8. Per-user Result Persistence ──────────────────────────────────
function getUserKey() {
    const user = JSON.parse(localStorage.getItem('kwarta_activeUser'));
    return user ? `kwarta_result_${user.email}` : null;
}

function saveApplicationResult(resultData) {
    const key = getUserKey();
    if (key) localStorage.setItem(key, JSON.stringify(resultData));
}

function loadApplicationResult() {
    const key = getUserKey();
    if (!key) return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
}

function renderSavedResult(saved) {
    const levelEl  = document.getElementById('result-level');
    const amountEl = document.getElementById('result-amount');
    const noteEl   = document.getElementById('result-note');
    const refEl    = document.getElementById('result-ref');
    const dateEl   = document.getElementById('result-date');

    if (saved.eligible) {
        if(levelEl) levelEl.textContent  = `You may qualify for ${saved.level}`;
        if(amountEl) amountEl.textContent = `Estimated Assistance: ${saved.amount}`;
    } else {
        if(levelEl) levelEl.textContent  = saved.level;
        if(amountEl) amountEl.textContent = 'No regular monthly assistance — you may still qualify for emergency cases.';
        if (noteEl) noteEl.innerHTML = 'This is an estimate based on the information you provided. You may still qualify for <strong>emergency assistance</strong>, subject to verification and final approval.';
    }

    if (refEl)  refEl.textContent  = saved.ref;
    if (dateEl) dateEl.textContent = saved.date;

    const breakdownList = document.getElementById('breakdown-list');
    if (breakdownList && saved.breakdown) {
        breakdownList.innerHTML = '';
        saved.breakdown.forEach(item => {
            const row = document.createElement('div');
            row.className = 'breakdown-row';
            row.innerHTML = `
                <div class="breakdown-row-text">
                    <span class="breakdown-row-label">${item.label}</span>
                    <span class="breakdown-row-detail">${item.detail}</span>
                </div>
                <span class="breakdown-row-points${item.points === 0 ? ' is-zero' : ''}">${item.points}/${item.max}</span>
            `;
            breakdownList.appendChild(row);
        });
    }
    const breakdownTotalPts = document.getElementById('breakdown-total-points');
    if (breakdownTotalPts) breakdownTotalPts.textContent = `${saved.points}/${saved.maxPoints}`;

    setApplicationStatus(saved.status || 'pending');

    // Show results, hide form and sidebar
    document.querySelectorAll('.form-panel').forEach(p => p.classList.add('hidden-step'));
    const resultsPanel = document.getElementById('step-results');
    if(resultsPanel) resultsPanel.classList.remove('hidden-step');
    
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar) sidebar.style.display = 'none';
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) mainContainer.classList.add('no-sidebar');
}

// Ensure the form checks for existing submission immediately on load
const initResult = loadApplicationResult();
if (initResult) {
    renderSavedResult(initResult);
}

// ─── 9. Application Status (Under Review / Approved / Rejected) ─────────
const STATUS_CONFIG = {
    pending: {
        label: 'Under Review',
        description: 'Your application and supporting documents are being reviewed.',
        icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
    },
    approved: {
        label: 'Approved',
        description: 'Your application has been approved.',
        icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
    },
    rejected: {
        label: 'Rejected',
        description: 'Your application was not approved at this time.',
        icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
    }
};

function setApplicationStatus(status) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const badge       = document.getElementById('status-badge');
    const iconEl      = document.getElementById('status-icon');
    const labelEl     = document.getElementById('status-label');
    const descEl      = document.getElementById('status-description');

    if (!badge) return;
    badge.dataset.status = status;
    if (iconEl)  iconEl.innerHTML  = config.icon;
    if (labelEl) labelEl.textContent = config.label;
    if (descEl)  descEl.textContent  = config.description;
}

if (btnFinalSubmit) {
    btnFinalSubmit.addEventListener('click', () => {
        const result = computeEligibility();

        const levelEl  = document.getElementById('result-level');
        const amountEl = document.getElementById('result-amount');
        const noteEl   = document.getElementById('result-note');
        const refEl    = document.getElementById('result-ref');
        const dateEl   = document.getElementById('result-date');

        if (result.eligible) {
            levelEl.textContent  = `You may qualify for ${result.level}`;
            amountEl.textContent = `Estimated Assistance: ${result.amount}`;
        } else {
            levelEl.textContent  = result.level;
            amountEl.textContent = 'No regular monthly assistance — you may still qualify for emergency cases.';
            noteEl.innerHTML = 'This is an estimate based on the information you provided. You may still qualify for <strong>emergency assistance</strong>, subject to verification and final approval.';
        }

        const generatedRef = generateReferenceNumber();
        const generatedDate = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
        
        refEl.textContent  = generatedRef;
        dateEl.textContent = generatedDate;

        const breakdownList = document.getElementById('breakdown-list');
        if (breakdownList) {
            breakdownList.innerHTML = '';
            result.breakdown.forEach(item => {
                const row = document.createElement('div');
                row.className = 'breakdown-row';
                row.innerHTML = `
                    <div class="breakdown-row-text">
                        <span class="breakdown-row-label">${item.label}</span>
                        <span class="breakdown-row-detail">${item.detail}</span>
                    </div>
                    <span class="breakdown-row-points${item.points === 0 ? ' is-zero' : ''}">${item.points}/${item.max}</span>
                `;
                breakdownList.appendChild(row);
            });
        }
        const breakdownTotalPts = document.getElementById('breakdown-total-points');
        if (breakdownTotalPts) breakdownTotalPts.textContent = `${result.points}/${result.maxPoints}`;

        setApplicationStatus('pending');

        saveApplicationResult({
            eligible:   result.eligible,
            level:      result.level,
            amount:     result.amount,
            points:     result.points,
            maxPoints:  result.maxPoints,
            breakdown:  result.breakdown,
            ref:        generatedRef,
            date:       generatedDate,
            status:     'pending',
        });

        document.getElementById('step-7').classList.add('hidden-step');
        document.getElementById('step-results').classList.remove('hidden-step');
        const sidebar = document.getElementById('main-sidebar');
        if (sidebar) sidebar.style.display = 'none';
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) mainContainer.classList.add('no-sidebar');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── 10. Toggleable Score Breakdown ───────────────────────────────────
const breakdownToggle = document.getElementById('breakdown-toggle');
const breakdownContent = document.getElementById('breakdown-content');
if (breakdownToggle && breakdownContent) {
    breakdownToggle.addEventListener('click', () => {
        const isOpen = breakdownContent.classList.toggle('open');
        breakdownToggle.classList.toggle('open', isOpen);
        breakdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}
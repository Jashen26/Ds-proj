// ====================== KWARTA Application Form JS ======================

document.addEventListener('DOMContentLoaded', () => {

    // ====================== CORE ELEMENTS ======================
    const stateRadios = document.querySelectorAll('input[name="slider"]');
    const cards = document.querySelectorAll('.card');

    // Address
    const sameAddressCheck = document.getElementById('same-address');
    const permanentSection = document.getElementById('permanent-address-section');

    // Household
    const totalCountEl = document.getElementById('count-total');
    const adultCountEl = document.getElementById('count-adult');
    const childCountEl = document.getElementById('count-child');
    const seniorCountEl = document.getElementById('count-senior');
    const pwdCountEl = document.getElementById('count-pwd');

    const btnAddAdult = document.getElementById('btn-add-adult');
    const btnAddChild = document.getElementById('btn-add-child');
    const btnAddSenior = document.getElementById('btn-add-senior');
    const btnAddPWD = document.getElementById('btn-add-pwd');

    const containers = {
        adult: document.getElementById('container-adult'),
        child: document.getElementById('container-child'),
        senior: document.getElementById('container-senior'),
        pwd: document.getElementById('container-pwd')
    };

    // Solo Parent
    const soloYes = document.getElementById('solo-yes');

    // ====================== HELPER FUNCTIONS ======================
    function getCurrentCardIndex() {
        return Array.from(stateRadios).findIndex(radio => radio.checked);
    }

    function goToCard(index) {
        if (index < 0 || index > 4) return;
        stateRadios[index].checked = true;
        window.scrollTo({ top: 140, behavior: 'smooth' });
    }

    function validateCurrentCard() {
        const currentIndex = getCurrentCardIndex();
        const currentCard = cards[currentIndex];

        const required = currentCard.querySelectorAll('input[required], select[required]');
        let valid = true;

        required.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc2626';
                valid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (!valid) {
            alert("Please fill all required fields (*) before continuing.");
        }
        return valid;
    }

    // ====================== SAME ADDRESS LOGIC (Improved) ======================
    function syncPermanentAddress() {
        if (!sameAddressCheck.checked) {
            permanentSection.style.display = 'block';
            return;
        }

        // Copy values
        const fields = [
            { from: 'House no.', to: 'House no.' },
            { from: 'Street / Purok / Sitio', to: 'Street / Purok / Sitio' },
            { from: 'Barangay', to: 'Barangay' },
            { from: 'City / Municipality', to: 'City / Municipality' },
            { from: 'Province', to: 'Province' },
            { from: 'Region', to: 'Region' }
        ];

        const currentSections = document.querySelectorAll('.row-address, .row-thirds');
        const currentInputs = Array.from(currentSections[0].querySelectorAll('input, select'));
        const permInputs = Array.from(document.querySelectorAll('#permanent-address-section input, #permanent-address-section select'));

        currentInputs.forEach((input, i) => {
            if (permInputs[i]) {
                permInputs[i].value = input.value;
            }
        });

        permanentSection.style.display = 'none';
    }

    sameAddressCheck.addEventListener('change', () => {
        syncPermanentAddress();
    });

    // Auto-copy when current address changes and checkbox is checked
    document.querySelectorAll('#permanent-address-section').forEach(section => {
        section.addEventListener('input', () => {
            if (sameAddressCheck.checked) syncPermanentAddress();
        });
    });

    // ====================== HOUSEHOLD REPEATER ======================
    function createMemberRow(type) {
        const id = Date.now();
        let title = '';

        switch(type) {
            case 'adult':  title = 'Adult Member'; break;
            case 'child':  title = 'Dependent Child'; break;
            case 'senior': title = 'Senior Citizen'; break;
            case 'pwd':    title = 'PWD Member'; break;
        }

        const rowHTML = `
            <div class="nested-form-block repeater-row" data-type="${type}">
                <div class="repeater-section-header">
                    <div class="form-section-label">${title}</div>
                    <button type="button" class="btn-remove-item" style="background:none;border:none;color:#dc2626;font-size:1.4rem;cursor:pointer;">×</button>
                </div>
                <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
                    <div class="form-group">
                        <label>Full Name <span class="req">*</span></label>
                        <input type="text" required placeholder="Full name">
                    </div>
                    <div class="form-group">
                        <label>Relationship to Applicant</label>
                        <input type="text" placeholder="e.g. Spouse, Daughter, Mother">
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date">
                    </div>
                    ${type === 'child' || type === 'pwd' ? `
                    <div class="form-group">
                        <label>Age</label>
                        <input type="number" min="0" max="120" placeholder="Age">
                    </div>` : ''}
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rowHTML;
        const row = tempDiv.firstElementChild;

        // Remove button
        row.querySelector('.btn-remove-item').addEventListener('click', () => {
            row.remove();
            updateHouseholdCounts();
        });

        return row;
    }

    function updateHouseholdCounts() {
        const counts = {
            adult:  containers.adult.querySelectorAll('.repeater-row').length,
            child:  containers.child.querySelectorAll('.repeater-row').length,
            senior: containers.senior.querySelectorAll('.repeater-row').length,
            pwd:    containers.pwd.querySelectorAll('.repeater-row').length,
        };

        totalCountEl.textContent = 1 + counts.adult + counts.child + counts.senior + counts.pwd;
        adultCountEl.textContent  = counts.adult;
        childCountEl.textContent  = counts.child;
        seniorCountEl.textContent = counts.senior;
        pwdCountEl.textContent    = counts.pwd;
    }

    // Add buttons
    btnAddAdult.addEventListener('click', () => {
        containers.adult.appendChild(createMemberRow('adult'));
        updateHouseholdCounts();
    });

    btnAddChild.addEventListener('click', () => {
        containers.child.appendChild(createMemberRow('child'));
        updateHouseholdCounts();
    });

    btnAddSenior.addEventListener('click', () => {
        containers.senior.appendChild(createMemberRow('senior'));
        updateHouseholdCounts();
    });

    btnAddPWD.addEventListener('click', () => {
        containers.pwd.appendChild(createMemberRow('pwd'));
        updateHouseholdCounts();
    });
    // ====================== FINAL SUBMISSION ======================
    const submitBtn = document.querySelector('.btn--submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const terms = document.getElementById('terms-cond');
            const consent = document.getElementById('data-consent');
            const sigName = document.getElementById('sig-name');

            if (!terms || !terms.checked || !consent || !consent.checked) {
                alert("Please agree to both Terms & Conditions and Data Consent.");
                return;
            }

            if (!sigName || !sigName.value.trim()) {
                alert("Please enter your full name as signature.");
                sigName.focus();
                return;
            }

            submitBtn.textContent = "Submitting Application...";
            submitBtn.disabled = true;

            setTimeout(() => {
                alert("✅ Your application has been successfully submitted!\n\nThank you for applying to KWARTA.");
                // Optional: Reset or redirect
                // window.location.reload();
            }, 1800);
        });
    }

    // ====================== INITIAL SETUP ======================
    updateHouseholdCounts();

    // Optional: Auto-copy address when fields change
    document.querySelectorAll('.row-address input, .row-thirds input, .row-thirds select').forEach(el => {
        el.addEventListener('change', () => {
            if (sameAddressCheck.checked) syncPermanentAddress();
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

});
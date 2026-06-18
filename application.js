const activeUserSession = localStorage.getItem('currentUser');

if (!activeUserSession) {
    alert("Access Denied! Please log in first.");
    window.location.href = "login.html";
} else {
    const userObj = JSON.parse(activeUserSession);
    
    const displayElem = document.getElementById('userDisplay');
    if (displayElem) {
        displayElem.textContent = userObj.email;
    }
}

document.getElementById('signOutBtn').addEventListener('click', function(e) {
    e.preventDefault(); 

    localStorage.removeItem('currentUser');
    
    // alert("You have logged out securely.");
    window.location.href = "homePage.html";
});



// ─── 0. Medical History: toggle relationship input ───────────────────
        function toggleRelInput(radio) {
            const row = radio.closest('.med-rel-row');
            const relInput = row.querySelector('.med-rel-rel input');
            if (radio.value === 'yes') {
                relInput.disabled = false;
                relInput.focus();
            } else {
                relInput.disabled = true;
                relInput.value = '';
            }
        }

        // ─── 1. Conditional Document Requirements ────────────────────────────
        function updateDocRequirements() {
            const isSoloParent = document.getElementById('solo-yes').checked;
            const hasHouseholdMembers =
                document.querySelectorAll('#container-senior .nested-form-block').length > 0 ||
                document.querySelectorAll('#container-pwd .nested-form-block').length > 0 ||
                document.querySelectorAll('#container-child .nested-form-block').length > 0;

            const reqHousehold = document.getElementById('doc-req-household');
            const reqIndigency = document.getElementById('doc-req-indigency');
            const section      = document.getElementById('doc-conditional-section');

            reqHousehold.style.display = hasHouseholdMembers ? '' : 'none';
            reqIndigency.style.display = isSoloParent        ? '' : 'none';
            section.style.display      = (hasHouseholdMembers || isSoloParent) ? '' : 'none';
        }

        // Wire solo parent radio
        document.querySelectorAll('input[name="soloParent"]').forEach(r =>
            r.addEventListener('change', updateDocRequirements)
        );
        updateDocRequirements();

        // ─── 1. Scroll Progress Bar ──────────────────────────────────────────
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            document.getElementById('scrollBar').style.width = (winScroll / height * 100) + '%';
        });

        // ─── 2. Sidebar ScrollSpy ────────────────────────────────────────────
        const highlight = document.getElementById('active-highlight');
        const navItems  = document.querySelectorAll('.step-item');
        const formSections = document.querySelectorAll('.form-panel');

        function moveHighlight(el) {
            if (!el) return;
            highlight.style.transform = `translateY(${el.offsetTop}px)`;
            highlight.style.height    = `${el.offsetHeight}px`;
            navItems.forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }

        window.addEventListener('load', () => moveHighlight(document.querySelector('.step-item.active')));
        navItems.forEach(item => item.addEventListener('click', function () { moveHighlight(this); }));

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('hidden-step')) {
                    const link = document.querySelector(`.step-item[href="#${entry.target.id}"]`);
                    moveHighlight(link);
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
        formSections.forEach(s => observer.observe(s));

        // ─── 3. Same-address Logic ───────────────────────────────────────────
        const currInputs = ['curr-house','curr-street','curr-brgy','curr-city','curr-prov','curr-reg'];
        const permInputs = ['perm-house','perm-street','perm-brgy','perm-city','perm-prov','perm-reg'];
        const sameChk    = document.getElementById('same-address');

        function checkCurrentFilled() {
            const allFilled = currInputs.every(id => document.getElementById(id).value);
            sameChk.disabled = !allFilled;
            if (!allFilled && sameChk.checked) { sameChk.checked = false; syncPermanent(false); }
        }

        function syncPermanent(isSame) {
            permInputs.forEach((pid, i) => {
                const pe = document.getElementById(pid), ce = document.getElementById(currInputs[i]);
                pe.value    = isSame ? ce.value : '';
                pe.disabled = isSame;
            });
        }

        currInputs.forEach(id => {
            document.getElementById(id).addEventListener('input',  checkCurrentFilled);
            document.getElementById(id).addEventListener('change', checkCurrentFilled);
        });
        sameChk.addEventListener('change', e => syncPermanent(e.target.checked));
        checkCurrentFilled();

        // ─── 4. Household Repeater ───────────────────────────────────────────
        function updateHouseholdCounts() {
            const counts = {
                adult:  document.querySelectorAll('#container-adult  .nested-form-block').length,
                child:  document.querySelectorAll('#container-child  .nested-form-block').length,
                senior: document.querySelectorAll('#container-senior .nested-form-block').length,
                pwd:    document.querySelectorAll('#container-pwd    .nested-form-block').length,
            };
            document.getElementById('count-adult').textContent  = counts.adult;
            document.getElementById('count-child').textContent  = counts.child;
            document.getElementById('count-senior').textContent = counts.senior;
            document.getElementById('count-pwd').textContent    = counts.pwd;
            document.getElementById('count-total').textContent  = 1 + counts.adult + counts.child + counts.senior + counts.pwd;
        }

        function reindexBlocks(containerId, prefix) {
            document.getElementById(containerId)
                .querySelectorAll('.nested-form-block')
                .forEach((block, i) => {
                    block.querySelector('.nested-block-title').textContent = `${prefix} #${i + 1}`;
                });
        }

        function addBlock(containerId, templateId, prefix) {
            const container = document.getElementById(containerId);
            const clone     = document.getElementById(templateId).content.cloneNode(true);

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

        document.getElementById('btn-add-adult') .addEventListener('click', () => addBlock('container-adult',  'tmpl-adult',  'Adult Member'));
        document.getElementById('btn-add-child') .addEventListener('click', () => addBlock('container-child',  'tmpl-child',  'Dependent Child'));
        document.getElementById('btn-add-senior').addEventListener('click', () => addBlock('container-senior', 'tmpl-senior', 'Senior Citizen'));
        document.getElementById('btn-add-pwd')   .addEventListener('click', () => addBlock('container-pwd',    'tmpl-pwd',    'PWD Member'));

        // ─── 5. Step 6 → Step 7 Lock Flow ───────────────────────────────────
        const stepPanels = ['step-1','step-2','step-3','step-4','step-5','step-6'].map(id => document.getElementById(id));
        const step7Panel = document.getElementById('step-7');
        const step7Link  = document.querySelector('.step-item[href="#step-7"]');

        document.getElementById('btn-unlock-step7').addEventListener('click', () => {
            const terms   = document.getElementById('terms-cond').checked;
            const consent = document.getElementById('data-consent').checked;
            const sigName = document.getElementById('sig-name').value.trim();

            if (!terms || !consent) { alert('Please check both the Terms and Conditions and Data Processing Consent to continue.'); return; }
            if (!sigName)           { alert('Please type your printed name as a signature to continue.'); return; }

            stepPanels.forEach(p => p.classList.add('locked-step'));
            step7Panel.classList.remove('hidden-step');
            if (step7Link) { step7Link.style.pointerEvents = ''; step7Link.style.opacity = ''; }
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });

        document.getElementById('btn-go-back').addEventListener('click', () => {
            stepPanels.forEach(p => p.classList.remove('locked-step'));
            step7Panel.classList.add('hidden-step');
            if (step7Link) { step7Link.style.pointerEvents = 'none'; step7Link.style.opacity = '0.5'; }
            document.getElementById('step-6').scrollIntoView({ behavior: 'smooth' });
        });
        // ─── 6. Navbar: hide Apply link after final submission ───────────────
        const navApply = document.getElementById('nav-apply');
        const btnFinalSubmit = document.getElementById('btn-final-submit');
        if (btnFinalSubmit) {
            btnFinalSubmit.addEventListener('click', () => {
                if (navApply) navApply.style.display = 'none';
            });
        }
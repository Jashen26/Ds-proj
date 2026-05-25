// ── STATE ──
let currentUser = null;
let currentStep = 1;
const TOTAL_STEPS = 5;

// ── STORAGE HELPERS ──
function getUsers() { return JSON.parse(localStorage.getItem('kwarta_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('kwarta_users', JSON.stringify(u)); }
function getApplications() { return JSON.parse(localStorage.getItem('kwarta_apps') || '[]'); }
function saveApplications(a) { localStorage.setItem('kwarta_apps', JSON.stringify(a)); }
function getUserApps() { return getApplications().filter(a => a.userEmail === currentUser); }

// ── AUTH ──
function switchTab(tab) {
  document.getElementById('signinForm').style.display = tab === 'signin' ? '' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? '' : 'none';
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'signin') || (i === 1 && tab === 'signup'));
  });
}

function handleSignIn() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  if (!email || !password) { showErr(err, 'Please fill in all fields.'); return; }
  const users = getUsers();
  if (!users[email] || users[email].password !== password) { showErr(err, 'Invalid email or password.'); return; }
  err.style.display = 'none';
  loginUser(email);
}

function handleSignUp() {
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const err = document.getElementById('registerError');
  if (!email || !password) { showErr(err, 'Please fill in all fields.'); return; }
  if (password.length < 6) { showErr(err, 'Password must be at least 6 characters.'); return; }
  const users = getUsers();
  if (users[email]) { showErr(err, 'An account with this email already exists.'); return; }
  users[email] = { password };
  saveUsers(users);
  err.style.display = 'none';
  loginUser(email);
}

function loginUser(email) {
  currentUser = email;
  sessionStorage.setItem('kwarta_session', email);
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('appPage').style.display = '';
  document.getElementById('navEmail').textContent = email;
  showTab('myapps');
  loadApplications();
}

function handleSignOut() {
  currentUser = null;
  sessionStorage.removeItem('kwarta_session');
  document.getElementById('appPage').style.display = 'none';
  document.getElementById('authPage').style.display = '';
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = '';
}

// ── TABS ──
function showTab(tab) {
  const isNew = tab === 'newapp';
  document.getElementById('myAppsView').style.display = isNew ? 'none' : '';
  document.getElementById('newAppView').style.display = isNew ? '' : 'none';
  document.getElementById('tabMyApps').classList.toggle('active', !isNew);
  document.getElementById('tabNewApp').classList.toggle('active', isNew);
  if (isNew) resetForm();
  if (!isNew) loadApplications();
}

// ── LOAD APPLICATIONS ──
function loadApplications() {
  const apps = getUserApps();
  const list = document.getElementById('appsList');
  const noApps = document.getElementById('noApps');
  if (apps.length === 0) {
    list.innerHTML = '';
    noApps.style.display = '';
    return;
  }
  noApps.style.display = 'none';
  list.innerHTML = apps.map((a, i) => `
    <div class="app-card">
      <div class="app-card-header">
        <div>
          <div class="app-card-name">${a.name}</div>
          <div class="app-card-email">${a.email}</div>
        </div>
        <span class="status-badge ${a.status === 'Approved' ? 'approved' : a.status === 'Rejected' ? 'rejected' : ''}">${a.status}</span>
      </div>
      <div class="app-stats">
        <div class="app-stat"><label>Assistance Type</label><strong>${a.assistanceType}</strong></div>
        <div class="app-stat"><label>Amount Requested</label><strong>₱${Number(a.amount).toLocaleString()}</strong></div>
        <div class="app-stat"><label>Monthly Income</label><strong>₱${Number(a.income).toLocaleString()}</strong></div>
        <div class="app-stat"><label>Family Members</label><strong>${a.familyMembers}</strong></div>
      </div>
      <div class="app-card-footer">
        <span class="app-date">Submitted ${a.date}</span>
        <button class="btn-view" onclick="viewDetail(${i})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          View Details
        </button>
      </div>
    </div>
  `).join('');
}

// ── VIEW DETAIL ──
function viewDetail(idx) {
  const apps = getUserApps();
  const a = apps[idx];
  document.getElementById('modalName').textContent = a.name;
  document.getElementById('modalEmail').textContent = a.email;
  const sb = document.getElementById('modalStatus');
  sb.textContent = a.status;
  sb.className = 'status-badge' + (a.status === 'Approved' ? ' approved' : a.status === 'Rejected' ? ' rejected' : '');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-item"><label>Full Name</label><strong>${a.name}</strong></div>
    <div class="modal-item"><label>Email</label><strong>${a.email}</strong></div>
    <div class="modal-item"><label>Phone</label><strong>${a.phone || '—'}</strong></div>
    <div class="modal-item"><label>Date of Birth</label><strong>${a.dob || '—'}</strong></div>
    <div class="modal-item"><label>Address</label><strong>${a.address || '—'}</strong></div>
    <div class="modal-item"><label>City / Province</label><strong>${a.city || '—'} / ${a.province || '—'}</strong></div>
    <div class="modal-item"><label>Citizenship</label><strong>${a.citizenship || '—'}</strong></div>
    <div class="modal-item"><label>Education</label><strong>${a.education || '—'}</strong></div>
    <div class="modal-item"><label>Monthly Income</label><strong>₱${Number(a.income).toLocaleString()}</strong></div>
    <div class="modal-item"><label>Family Members</label><strong>${a.familyMembers}</strong></div>
    <div class="modal-item"><label>Source of Income</label><strong>${a.source || '—'}</strong></div>
    <div class="modal-item"><label>Assistance Type</label><strong>${a.assistanceType}</strong></div>
    <div class="modal-item"><label>Amount Requested</label><strong>₱${Number(a.amount).toLocaleString()}</strong></div>
    <div class="modal-item"><label>Submitted</label><strong>${a.date}</strong></div>
    <div class="modal-item" style="grid-column:1/-1"><label>Reason</label><strong>${a.reason || '—'}</strong></div>
  `;
  document.getElementById('detailModal').style.display = 'flex';
}

function closeModal(e) {
  if (e.target.id === 'detailModal') document.getElementById('detailModal').style.display = 'none';
}

// ── FORM STEPS ──
function resetForm() {
  currentStep = 1;
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    document.getElementById('step' + i).style.display = i === 1 ? '' : 'none';
  }
  updateProgress();
  updateNav();
  // clear fields
  ['f_name','f_email','f_phone','f_address','f_city','f_province','f_postal',
   'f_citizenship','f_income','f_family','f_source','f_amount','f_reason'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f_education').value = '';
  document.getElementById('f_type').value = '';
  document.getElementById('f_dob').value = '';
}

function updateProgress() {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const el = document.getElementById('pb' + i);
    if (i < currentStep) { el.className = 'pb-step done'; }
    else if (i === currentStep) { el.className = 'pb-step active'; }
    else { el.className = 'pb-step'; }
  }
}

function updateNav() {
  const prev = document.getElementById('btnPrev');
  const next = document.getElementById('btnNext');
  prev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  if (currentStep === TOTAL_STEPS) {
    next.textContent = '✓ Submit Application';
    next.className = 'btn-primary green';
  } else {
    next.textContent = 'Next';
    next.className = 'btn-primary';
  }
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep === TOTAL_STEPS) { submitApplication(); return; }
  if (currentStep === TOTAL_STEPS - 1) buildReview();
  document.getElementById('step' + currentStep).style.display = 'none';
  currentStep++;
  document.getElementById('step' + currentStep).style.display = '';
  updateProgress();
  updateNav();
}

function prevStep() {
  document.getElementById('step' + currentStep).style.display = 'none';
  currentStep--;
  document.getElementById('step' + currentStep).style.display = '';
  updateProgress();
  updateNav();
}

function validateStep(step) {
  const errEl = document.getElementById('err' + step);
  if (!errEl) return true;
  errEl.style.display = 'none';
  if (step === 1) {
    if (!document.getElementById('f_name').value.trim()) { showErr(errEl, 'Full Name is required.'); return false; }
    if (!document.getElementById('f_email').value.trim()) { showErr(errEl, 'Email is required.'); return false; }
  }
  if (step === 2) {
    if (!document.getElementById('f_income').value) { showErr(errEl, 'Monthly income is required.'); return false; }
    if (!document.getElementById('f_family').value) { showErr(errEl, 'Number of family members is required.'); return false; }
  }
  if (step === 3) {
    if (!document.getElementById('f_type').value) { showErr(errEl, 'Please select a type of assistance.'); return false; }
    if (!document.getElementById('f_amount').value) { showErr(errEl, 'Amount requested is required.'); return false; }
  }
  return true;
}

function buildReview() {
  const name = document.getElementById('f_name').value;
  const email = document.getElementById('f_email').value;
  const income = document.getElementById('f_income').value;
  const family = document.getElementById('f_family').value;
  const type = document.getElementById('f_type').value;
  const amount = document.getElementById('f_amount').value;
  document.getElementById('reviewGrid').innerHTML = `
    <div class="review-item"><label>Full Name</label><strong>${name}</strong></div>
    <div class="review-item"><label>Email</label><strong>${email}</strong></div>
    <div class="review-item"><label>Monthly Income</label><strong>₱${Number(income).toLocaleString()}</strong></div>
    <div class="review-item"><label>Family Members</label><strong>${family}</strong></div>
    <div class="review-item"><label>Assistance Type</label><strong>${type.replace(' & Nutrition','').replace(' & ','/')}</strong></div>
    <div class="review-item"><label>Amount Requested</label><strong>₱${Number(amount).toLocaleString()}</strong></div>
  `;
}

function submitApplication() {
  const apps = getApplications();
  const now = new Date();
  const dateStr = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;
  apps.push({
    userEmail: currentUser,
    name: document.getElementById('f_name').value.trim(),
    email: document.getElementById('f_email').value.trim(),
    phone: document.getElementById('f_phone').value.trim(),
    address: document.getElementById('f_address').value.trim(),
    city: document.getElementById('f_city').value.trim(),
    province: document.getElementById('f_province').value.trim(),
    postal: document.getElementById('f_postal').value.trim(),
    citizenship: document.getElementById('f_citizenship').value.trim(),
    dob: document.getElementById('f_dob').value,
    income: document.getElementById('f_income').value,
    familyMembers: document.getElementById('f_family').value,
    source: document.getElementById('f_source').value.trim(),
    education: document.getElementById('f_education').value,
    assistanceType: document.getElementById('f_type').value.replace(' & Nutrition','').replace(' & ','/'),
    amount: document.getElementById('f_amount').value,
    reason: document.getElementById('f_reason').value.trim(),
    status: 'Under Review',
    date: dateStr
  });
  saveApplications(apps);
  showTab('myapps');
}

function markDoc(input, statusId) {
  const el = document.getElementById(statusId);
  const label = input.closest('.file-label');
  if (input.files && input.files[0]) {
    el.textContent = '✓ ' + input.files[0].name.substring(0, 20) + (input.files[0].name.length > 20 ? '…' : '');
    label.classList.add('uploaded');
  }
}

// ── INIT ──
window.onload = function() {
  const session = sessionStorage.getItem('kwarta_session');
  if (session) {
    loginUser(session);
  }
};
// ==========================================
// KWARTA - Authentication System
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Strict Context Identification ────────────────────────────────────
    // We only look at the exact file name to prevent folder-name collisions
    const filename = window.location.pathname.split('/').pop().toLowerCase();
    const isAuthPage = filename === 'signup.html' || filename === 'signup';
    const isAppPage  = filename === 'application.html' || filename === 'application';

    const currentUser = JSON.parse(localStorage.getItem('kwarta_activeUser'));

    // ── 2. Route Guards ─────────────────────────────────────────────────────
    if (isAppPage && !currentUser) {
        window.location.replace('signup.html');
        return;
    }
    if (isAuthPage && currentUser) {
        window.location.replace('application.html');
        return;
    }

    // ── 3. Global Navbar Population ─────────────────────────────────────────
    const accountItem = document.getElementById('nav-account-item');
    if (accountItem) {
        if (currentUser) {
            accountItem.classList.add('nav-has-dropdown');
            accountItem.innerHTML = `
                <span class="nav-trigger">
                    Account
                    <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
                <div class="nav-dropdown">
                    <div class="nav-dropdown-card">
                        <div style="padding: 0.5rem 0.875rem; font-size: 0.75rem; color: var(--gray-dark); font-weight: 600; border-bottom: 1px solid var(--gray-light); margin-bottom: 0.25rem;">
                            ${currentUser.name}
                        </div>
                        <a href="#" class="nav-dropdown-danger" id="btn-signout">Sign Out</a>
                    </div>
                </div>`;
            
            document.getElementById('btn-signout').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('kwarta_activeUser');
                window.location.replace('signup.html');
            });
        } else {
            accountItem.classList.remove('nav-has-dropdown');
            accountItem.innerHTML = `<a href="signup.html" style="display: block; color: var(--accent); background: rgba(255,255,255,0.9); font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 2rem; text-decoration: none; transition: all 0.2s;">Sign In</a>`;
        }
    }

    document.querySelectorAll('.nav-dropdown-apply, .nav-apply-btn').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                window.location.href = 'signup.html';
            }
        });
    });

    // ========================================================================
    // Stop here if we aren't on the Auth page.
    // ========================================================================
    if (!isAuthPage) return;

    const loginPanel  = document.getElementById('login-panel');
    const signupPanel = document.getElementById('signup-panel');
    const loginError  = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');

    function switchPanel(hide, show, clearEl) {
        hide.style.animation = 'panel-fade-out 0.18s ease forwards';
        setTimeout(() => {
            hide.classList.add('hidden-step');
            hide.style.animation = '';
            show.classList.remove('hidden-step');
            show.style.animation = 'panel-fade-in 0.22s ease forwards';
            clearEl.textContent = '';
        }, 160);
    }

    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        switchPanel(loginPanel, signupPanel, loginError);
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchPanel(signupPanel, loginPanel, signupError);
    });

    const getUsers = () => JSON.parse(localStorage.getItem('kwarta_users')) || [];

    document.querySelectorAll('.pwd-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.querySelector('.eye-open').classList.toggle('hidden-step', !isHidden);
            btn.querySelector('.eye-closed').classList.toggle('hidden-step', isHidden);
        });
    });

    function shakeField(input) {
        input.classList.remove('field-shake');
        void input.offsetWidth;
        input.classList.add('field-shake');
        input.addEventListener('animationend', () => input.classList.remove('field-shake'), { once: true });
    }

    function markFieldError(input) {
        input.classList.add('auth-field-invalid');
        shakeField(input);
        input.addEventListener('input', () => input.classList.remove('auth-field-invalid'), { once: true });
    }

    function showError(el, msg) {
        el.style.animation = 'none';
        el.textContent = msg;
        el.style.animation = 'error-slide-in 0.2s ease forwards';
    }

    // ── Signup Validation ──
    const btnSignup = document.getElementById('btn-signup');
    if (btnSignup) {
        btnSignup.addEventListener('click', () => {
            signupError.textContent = '';
            const nameEl    = document.getElementById('signup-name');
            const emailEl   = document.getElementById('signup-email');
            const passEl    = document.getElementById('signup-password');
            const confirmEl = document.getElementById('signup-password-confirm');

            const name    = nameEl.value.trim();
            const email   = emailEl.value.trim();
            const pass    = passEl.value;
            const confirm = confirmEl.value;

            let invalid = false;

            if (!name) { markFieldError(nameEl); invalid = true; }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { markFieldError(emailEl); invalid = true; }
            if (pass.length < 8) { markFieldError(passEl); invalid = true; }
            if (pass !== confirm) { markFieldError(confirmEl); invalid = true; }

            if (invalid) {
                showError(signupError, !name ? 'Please fill out all required fields.'
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email address.'
                    : pass.length < 8 ? 'Password must be at least 8 characters.'
                    : 'Passwords do not match.');
                return;
            }

            const users = getUsers();
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                markFieldError(emailEl);
                showError(signupError, 'An account with this email already exists.');
                return;
            }

            const newUser = { name, email, password: pass };
            users.push(newUser);
            localStorage.setItem('kwarta_users', JSON.stringify(users));
            localStorage.setItem('kwarta_activeUser', JSON.stringify(newUser));
            window.location.href = 'application.html';
        });
    }

    // ── Login Validation ──
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            loginError.textContent = '';
            const emailEl = document.getElementById('login-email');
            const passEl  = document.getElementById('login-password');
            const email   = emailEl.value.trim();
            const pass    = passEl.value;

            if (!email || !pass) {
                if (!email) markFieldError(emailEl);
                if (!pass)  markFieldError(passEl);
                showError(loginError, 'Please enter both email and password.');
                return;
            }

            const users = getUsers();
            const validUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
            
            if (validUser) {
                localStorage.setItem('kwarta_activeUser', JSON.stringify(validUser));
                window.location.href = 'application.html';
            } else {
                markFieldError(emailEl);
                markFieldError(passEl);
                showError(loginError, 'Invalid email or password.');
            }
        });
    }

    const loginPassInput = document.getElementById('login-password');
    if (loginPassInput) {
        loginPassInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('btn-login').click();
        });
    }
});

// ─── 2. Scroll Progress Bar ──────────────────────────────────────────
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollBar = document.getElementById('scrollBar');
    if(scrollBar) scrollBar.style.width = (winScroll / height * 100) + '%';
});
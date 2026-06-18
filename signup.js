document.getElementById('goToLogin').addEventListener('click', function() {
    window.location.href = "login.html";
});

document.getElementById('signupBtn').addEventListener('click', function() {
    const emailInput = document.getElementById('signupEmail').value.trim();
    const passwordInput = document.getElementById('signupPassword').value;

    if (!emailInput || !passwordInput) {
        alert("Please fill in all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('allUsers')) || [];

    const userExists = users.some(user => user.email === emailInput);
    if (userExists) {
        alert("This email is already registered!");
        return;
    }

    users.push({
        email: emailInput,
        password: passwordInput
    });

    localStorage.setItem('allUsers', JSON.stringify(users));

    // alert("Sign up successful! Redirecting to login page...");
    window.location.href = "login.html";
});
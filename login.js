document.getElementById('goToSignup').addEventListener('click', function() {
    window.location.href = "signup.html";
});

document.getElementById('loginBtn').addEventListener('click', function() {
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;

    if (!emailInput || !passwordInput) {
        alert("Please fill in all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('allUsers')) || [];

    const matchedUser = users.find(user => user.email === emailInput && user.password === passwordInput);

    if (matchedUser) {
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        
        // alert("Login successful!");
        window.location.href = "application.html";
    } else {
        alert("Invalid email or password!");
    }
});
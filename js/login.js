const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const navSignIn = document.getElementById('navSignIn');
const navSignUp = document.getElementById('navSignUp');

/**
 * Toggle password visibility
 */
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isHidden);
    icon.classList.toggle('fa-eye-slash', isHidden);
}

/**
 * UI Toggle: Switch to Signup Form
 */
function showSignup() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    navSignUp.style.display = 'none';
    navSignIn.style.display = 'block';
}

/**
 * UI Toggle: Switch to Login Form
 */
function showLogin() {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    navSignIn.style.display = 'none';
    navSignUp.style.display = 'block';
}

/**
 * Login Form Submission Handler
 */
document.getElementById('loginFormEl').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch('https://gamesite-y5iw.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("userId", data.user._id);
            localStorage.setItem("username", data.user.username);
            alert("Welcome " + data.user.username);
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server is not responding.");
    }
});

/**
 * Signup Form Submission Handler
 */
document.getElementById('signupFormEl').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const res = await fetch('https://gamesite-y5iw.onrender.com/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (data.success) {
            alert("Registration successful! Please login.");
            showLogin();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Server is not responding.");
    }
});

// Set default view on page load
window.onload = showLogin;
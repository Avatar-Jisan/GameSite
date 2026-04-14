// Selecting DOM elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const navSignIn = document.getElementById('navSignIn');
const navSignUp = document.getElementById('navSignUp');

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
loginForm.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page refresh

    // Extracting input values
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;

    try {
        // API Call to Backend
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

if (data.success) {

    // ✅ SAVE USER SESSION
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
signupForm.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page refresh

    // Extracting input values
    const username = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;

    try {
        // API Call to Backend
        const res = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (data.success) {
            alert("Registration successful! Please login.");
            showLogin(); // Switch back to login view
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
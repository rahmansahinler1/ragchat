function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initialize() {
    try {
        await loadScript('/static/js/signup.js');

        initLoginWidgets({
            signupForm: document.getElementById('login-form'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            loginButton: document.getElementById('login-button'),
            togglePasswordButton: document.getElementById('toggle-password')
        });
    } catch (error) {
        console.error('Error initializing signup page:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

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
        await loadScript('/static/js/login.js');

        initLoginWidgets({
            loginForm: document.getElementById('login-form'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            loginButton: document.getElementById('login-button'),
            togglePasswordButton: document.getElementById('toggle-password')
        });
    } catch (error) {
        console.error('Error initializing login page:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

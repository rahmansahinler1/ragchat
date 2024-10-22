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
        
        initSignupWidgets({
            signupForm: document.getElementById('signup-form'),
            nameInput: document.getElementById('name'),
            surnameInput: document.getElementById('surname'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            signupButton: document.getElementById('signup-button'),
            togglePasswordButton: document.getElementById('toggle-password')
        });
    } catch (error) {
        console.error('Error initializing signup page:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

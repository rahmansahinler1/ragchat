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
        // Load homepage.js
        await loadScript('/static/js/homepage.js');

        // Initialize homepage widgets and event listeners
        initHomepageWidgets({
            loginButton: document.querySelector('.login-btn'),
            signUpButton: document.querySelector('.sign-up-btn'),
            continueButton: document.querySelector('.continue'),
            socialIcons: document.querySelectorAll('.social-icons a')
        });

    } catch (error) {
        console.error('Error initializing homepage:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

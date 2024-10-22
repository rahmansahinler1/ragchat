function initHomepageWidgets({
    loginButton,
    signUpButton,
    continueButton,
    socialIcons
}) {
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToLogin();
    });

    signUpButton.addEventListener('click', (event) => {
        event.preventDefault();
        signUp();
    });

    continueButton.addEventListener('click', () => {
        scrollToNextSection();
    });

    socialIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.preventDefault();
            const platform = icon.querySelector('i').classList.contains('fa-linkedin') ? 'LinkedIn' : 'Twitter';
            openSocialMedia(platform);
        });
    });

    window.addEventListener('scroll', handleScroll);
}

function navigateToLogin() {
    window.location.href = '/login';
}

function signUp() {
    window.location.href = '/signup';
}

function scrollToNextSection() {
    const nextSection = document.getElementById('section2');
    nextSection.scrollIntoView({ behavior: 'smooth' });
}

function openSocialMedia(platform) {
    console.log(`Opening ${platform} page`);
    // Will be integrated. User will be sent to the correct social media platform.
}

function handleScroll() {
    // Will be integrated. Correct scrolling functionalities will be implemented
}

window.initHomepageWidgets = initHomepageWidgets;

function initHomepageWidgets({
    loginButton,
    signUpButton,
    continueButton,
    socialIcons
}) {
    // Login button interaction
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToLogin();
    });
    // Sign Up button interaction
    signUpButton.addEventListener('click', (event) => {
        event.preventDefault();
        signUp();
    });
    // Continue button interaction
    continueButton.addEventListener('click', () => {
        scrollToNextSection();
    });
    // Social icons interactions
    socialIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.preventDefault();
            const platform = icon.querySelector('i').classList.contains('fa-linkedin') ? 'LinkedIn' : 'Twitter';
            openSocialMedia(platform);
        });
    });
    // Scroll event for animations or other effects
    window.addEventListener('scroll', handleScroll);
}

// Function definitions
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

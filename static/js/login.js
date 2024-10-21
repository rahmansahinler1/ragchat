function initLoginWidgets({
    loginForm,
    emailInput,
    passwordInput,
    loginButton,
    togglePasswordButton
}) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleLogin(emailInput.value, passwordInput.value);
    });
    // Real-time checkings for email and password
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    // Password toggle
    togglePasswordButton.addEventListener('click', () => togglePassword(passwordInput, togglePasswordButton));
}

async function handleLogin(email, password) {
    try {
        const response = await fetch('/api/v1/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = '/app';
        } else {
            displayError('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        displayError('An error occurred during login.');
    }
}

function validateEmail() {
    // Implement email validation logic
}

function validatePassword() {
    // Implement password validation logic
}

function displayError(message) {
    // Implement error display logic
    alert(message); // For now, we'll use a simple alert. You can replace this with a more user-friendly UI later.
}

function togglePassword(passwordInput, toggleButton) {
    const toggleIcon = toggleButton.querySelector('i');
    const toggleText = toggleButton.querySelector('span');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
        toggleText.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
        toggleText.textContent = 'Show';
    }
}

// Make initLoginWidgets accessible globally
window.initLoginWidgets = initLoginWidgets;
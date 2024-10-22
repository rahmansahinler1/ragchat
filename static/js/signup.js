function initSignupWidgets({
    signupForm,
    nameInput,
    surnameInput,
    emailInput,
    passwordInput,
    signupButton,
    togglePasswordButton
}) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSignup(nameInput.value, surnameInput.value, emailInput.value, passwordInput.value, signupButton, signupForm);
    });

    nameInput.addEventListener('input', validateNameSurname);

    surnameInput.addEventListener('input', validateNameSurname);

    emailInput.addEventListener('input', validateEmail);

    passwordInput.addEventListener('input', validatePassword);
    
    togglePasswordButton.addEventListener('click', () => togglePassword(passwordInput, togglePasswordButton));
}

async function handleSignup(name, surname, email, password, signupButton, signupForm) {
    try {
        signupButton.disabled = true;
        signupButton.innerHTML = 'Signing up...';

        const response = await fetch('/api/v1/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_name: name,
                user_surname: surname,
                user_email: email,
                user_password: password 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage(data.message, signupButton, signupForm);
            setTimeout(() => window.location.href = '/', 5000);
        } else {
            displayError(data.message, signupButton, signupForm);
        }
    } catch (error) {
        console.error('Login error:', error);
        displayError('An error occurred during login.');
    } finally {
        signupButton.disabled = false;
        signupButton.innerHTML = 'Sign up';
    }
}

function validateNameSurname() {
    // Implement email validation logic
}

function validateEmail() {
    // Implement email validation logic
}

function validatePassword() {
    // Implement password validation logic
}

function displayError(message, signupButton, signupForm) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    signupForm.insertBefore(errorDiv, signupButton.parentElement);
    setTimeout(() => errorDiv.remove(), 5000);
}

function displayMessage(message, signupButton, signupForm) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-success mt-3';
    messageDiv.textContent = message;
    signupForm.insertBefore(messageDiv, signupButton.parentElement);
    setTimeout(() => messageDiv.remove(), 5000);
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

window.initSignupWidgets = initSignupWidgets;

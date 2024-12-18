function initLoginWidgets({
    loginForm,
    emailInput,
    passwordInput,
    loginButton,
    togglePasswordButton
}) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleLogin(emailInput.value, passwordInput.value, loginButton, loginForm);
    });

    emailInput.addEventListener('input', validateEmail);

    passwordInput.addEventListener('input', validatePassword);
    
    togglePasswordButton.addEventListener('click', () => togglePassword(passwordInput, togglePasswordButton));
}

async function handleLogin(email, password, loginButton, loginForm) {
    try {
        loginButton.disabled = true;
        loginButton.innerHTML = 'Logging in...';

        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_email: email, 
                trial_password: password 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage(data.message, loginButton, loginForm);
            localStorage.setItem('sessionId', data.session_id);
            localStorage.setItem('firstTime', 0);
            setTimeout(() => window.location.href = `/chat/${data.session_id}`, 1000);
        } else {
            displayError(data.message, loginButton, loginForm);
        }

    } catch (error) {
        console.error('Login error:', error);
        displayError('An error occurred during login.');
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Log-in';
    }
}

function validateEmail() {
    // Implement email validation logic
}

function validatePassword() {
    // Implement password validation logic
}

function displayError(message, loginButton, loginForm) {
    
    const existingErrorDiv = loginForm.querySelector('.alert-danger');
    if(existingErrorDiv) {
        existingErrorDiv.remove();
    }
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    loginForm.insertBefore(errorDiv, loginButton.parentElement);
    setTimeout(() => errorDiv.remove(), 5000);
    if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
    }
    
    this.errorTimeout = setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function displayMessage(message, loginButton, loginForm) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-success mt-3';
    messageDiv.textContent = message;
    loginForm.insertBefore(messageDiv, loginButton.parentElement);
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

window.initLoginWidgets = initLoginWidgets;

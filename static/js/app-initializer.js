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
        await loadScript('/static/js/app.js');
        const userData = await window.fetchUserInfo(window.serverData.userId);

        if (!userData) {
            throw new Error('Failed to load user data');
        }

        const currentDomain = 0;

        initAppWidgets({
            // App elements
            selectedFileList: document.querySelector('.selected-file-list'),
            uploadFilesButton: document.getElementById('btn-upload-files'),
            removeSelectionButton: document.getElementById('btn-remove-selection'),
            domainFileList: document.querySelector('.domain-file-list'),
            domainTitle: document.getElementById('domain-title'),
            removeUploadButton: document.getElementById('btn-remove-upload'),
            userData: userData,
            currentDomain: currentDomain,
            selectFilesButton: document.getElementById('btn-select-files'),
            fileInput: document.getElementById('file-input'),
            domainButtons: Array.from(document.querySelectorAll('#btn-domain-number')),
            sendButton: document.querySelector('.btn-send-message'),
            userInput: document.getElementById('user-input'),
            userInputTextbox: document.getElementById('bottom-send-tools'),
            chatBox: document.querySelector('.chat-box'),
            resourceSection: document.querySelector('.resource-section'),
        });

        initFeedbackWidgets({
            // Feedback form elements
            feedbackButton: document.getElementById('feedback-button'),
            feedbackModal: document.getElementById('feedback-modal'),
            closeButtons: document.querySelectorAll('.close-modal'),
            feedbackForm: document.getElementById('feedback-form'),
            screenshotInput: document.getElementById('feedback-screenshot'),
            userData: userData
        });

        window.addMessageToChat(`Welcome ${userData.user_name} ${userData.user_surname}`, 'ragchat');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

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
        // Load scripts
        await loadScript('/static/js/app.js');
        // In the future, this will be updated after logic process
        const userEmail = "rahmansahinler1@gmail.com";
        const currentDomain = 0;
        // Fetch initial user data
        const userData = await window.fetchUserInfo(userEmail);
        if (!userData) {
            throw new Error('Failed to load user data');
        }
        // Initialize functions
        initWidgets({
            selectedFileList: document.querySelector('.selected-file-list'),
            uploadFilesButton: document.getElementById('btn-upload-files'),
            removeSelectionButton: document.getElementById('btn-remove-selection'),
            domainFileList: document.querySelector('.domain-file-list'),
            removeUploadButton: document.getElementById('btn-remove-upload'),
            userData: userData,
            currentDomain: currentDomain,
            selectFilesButton: document.getElementById('btn-select-files'),
            fileInput: document.getElementById('file-input'),
            domainButtons: Array.from(document.querySelectorAll('#btn-domain-number')),
            sendButton: document.querySelector('.btn-send-message'),
            userInput: document.getElementById('user-input'),
            chatBox: document.querySelector('.chat-box')
        });
        clearFileSelections(userData);

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

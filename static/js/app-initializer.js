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
            domainButtons: Array.from(document.querySelectorAll('.btn-circle')),
            sendButton: document.querySelector('.btn-send-message'),
            userInput: document.getElementById('user-input'),
            chatBox: document.querySelector('.chat-box'),
            resourceSection: document.querySelector('.resource-section')
        });

        clearFileSelections(userData);
        window.addMessageToChat(`Welcome ${userData.user_name} ${userData.user_surname}`, 'ragchat');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

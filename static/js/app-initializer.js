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

        // Fetch initial user data
        const userData = await window.fetchUserInfo(userEmail);
        if (!userData) {
            throw new Error('Failed to load user data');
        }

        // Load chat elements
        const chatBox = document.querySelector('.chat-box');
        const userInput = document.getElementById('user-input');
        const sendButton = document.querySelector('.btn-send-message');

        // Load file selection elements
        const fileInput = document.getElementById('file-input');
        const selectedFileList = document.querySelector('.selected-file-list');
        const selectFilesButton = document.getElementById('btn-select-files');
        const removeSelectionButton = document.getElementById('btn-remove-selection');
        
        // Load file upload elements
        const domainFileList = document.querySelector('.domain-file-list');
        const uploadFilesButton = document.getElementById('btn-upload-files');
        const removeUploadButton = document.getElementById('btn-remove-upload');

        // Load domain selection elements
        const domainTitle = document.getElementById('domain-title');
        const domainButtons = Array.from(document.querySelectorAll('#btn-domain-number'));
        
        // Initialize functions
        initChat(chatBox, userInput, sendButton, userData);
        initselectFiles(selectFilesButton, fileInput, uploadFilesButton, selectedFileList, removeSelectionButton);
        initRemoveSelection(selectedFileList, uploadFilesButton, removeSelectionButton, domainFileList, removeUploadButton);
        initUploadFiles(uploadFilesButton, userEmail, domainFileList, removeUploadButton, selectedFileList);
        initRemoveUpload(removeUploadButton, uploadFilesButton, domainFileList, userEmail, selectedFileList, removeSelectionButton);
        initDomainSelection(domainButtons, domainTitle, userData);

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);
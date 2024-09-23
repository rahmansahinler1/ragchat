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
        const userData = await window.fetchUserData(userEmail);
        if (!userData) {
            throw new Error('Failed to load user data');
        }

        // Load chat elements
        const chatArea = document.getElementById('chatArea');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');

        // Load file operation elements
        const fileInput = document.getElementById('fileInput');
        const selectFilesButton = document.getElementById('selectFilesButton');
        const uploadFilesButton = document.getElementById('uploadFilesButton');
        const removeSelectionButton = document.getElementById('removeSelectionButton');
        const removeUploadButton = document.getElementById('removeUploadButton');
        const domainFileList = document.getElementById('domainFileList');
        const selectedFileList = document.getElementById('selectedFileList');
        
        // Initialize functions
        initChat(chatArea, userInput, sendButton, userEmail);
        initAddFiles(selectFilesButton, fileInput, uploadFilesButton, selectedFileList, removeSelectionButton);
        initUploadFiles(uploadFilesButton, userEmail, domainFileList, removeUploadButton, selectedFileList);
        initRemoveSelection(selectedFileList, uploadFilesButton, removeSelectionButton);
        initRemoveUpload(removeUploadButton, uploadFilesButton, domainFileList, userEmail);

        // Update the initial widgets when first loaded
        updateDomainList(userData, domainFileList, removeUploadButton);
        window.addMessageToChat(`Welcome ${userData[0].user_name}, how are you today?`, 'ragchat');

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);
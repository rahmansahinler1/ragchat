function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function checkForChanges() {
    window.sendMessage("Welcome the ragchat! Please wait ragchat to check it's memory for any change...");
    try {
        const response = await fetch('/api/v1/data_pipeline/check_changes', {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to check for changes');
        }
        const changedFileMessages = await response.json();
        changedFileMessages.forEach(message => {
            window.sendMessage(message);
        });
        window.sendMessage("Memory is sync. You can start asking!");

    } catch (error) {
        console.error('Error checking for changes:', error);
        window.sendMessage('Error while checking changes!')
    }
}

async function initializeApp() {
    try {
        // Load scripts
        await loadScript('/static/js/chat.js');
        await loadScript('/static/js/upload.js');
        await loadScript('/static/js/indexing.js');

        // Load chat elements
        const chatArea = document.getElementById('chatArea');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');

        // Load file upload elements
        const uploadButton = document.getElementById('uploadButton');
        const fileInput = document.getElementById('fileInput');

        // Load index operation elements
        const createIndexButton = document.getElementById('createIndexButton');
        const loadIndexButton = document.getElementById('loadIndexButton');

        // Initialize functions
        initChat(chatArea, userInput, sendButton);
        initFileUpload(uploadButton, fileInput);
        initIndexOperations(createIndexButton, loadIndexButton);

        // Check for changes when the app initializes
        await checkForChanges();

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

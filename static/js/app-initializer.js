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

        // Load chat elements
        const chatArea = document.getElementById('chatArea');
        const userInput = document.getElementById('userInput');
        const fileInput = document.getElementById('fileInput');
        const sendButton = document.getElementById('sendButton');
        const addFilesButton = document.getElementById('addFilesButton');
        const uploadFilesButton = document.getElementById('uploadFilesButton');

        // Initialize functions
        initChat(chatArea, userInput, sendButton);
        initAddFiles(addFilesButton, fileInput, uploadFilesButton);
        initUploadFiles(uploadFilesButton)

        // Welcome message
        window.addMessageToChat("Welcome the ragchat!", 'ragchat');

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

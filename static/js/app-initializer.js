function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initializeApp() {
    try {
        // Load all required scripts
        await loadScript('/static/js/chat.js');
        await loadScript('/static/js/upload.js');
        await loadScript('/static/js/indexing.js');

        // Chat elements
        const chatArea = document.getElementById('chatArea');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');

        // File upload elements
        const uploadButton = document.getElementById('uploadButton');
        const fileInput = document.getElementById('fileInput');

        // Index operation elements
        const createIndexButton = document.getElementById('createIndexButton');
        const loadIndexButton = document.getElementById('loadIndexButton');

        // Initialize chat functionality
        if (typeof initChat === 'function') {
            initChat(chatArea, userInput, sendButton);
        } else {
            console.error('Chat initialization function not found');
        }

        // Initialize file upload functionality
        if (typeof initFileUpload === 'function') {
            initFileUpload(uploadButton, fileInput);
        } else {
            console.error('File upload initialization function not found');
        }

        if (typeof initIndexOperations === 'function') {
            initIndexOperations(createIndexButton, loadIndexButton);
        } else {
            console.error('Index operations initialization function not found');
        }

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

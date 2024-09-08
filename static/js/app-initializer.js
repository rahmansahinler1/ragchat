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
        const sendButton = document.getElementById('sendButton');
        const checkChangesButton = document.getElementById('checkUpdatesButton')

        // Initialize functions
        initChat(chatArea, userInput, sendButton);
        initDataPipeline(checkChangesButton);

        // Check for changes when the app initializes
        window.addMessageToChat("Welcome the ragchat! Please wait ragchat to check it's memory for any change...", 'ragchat');
        await checkChanges();

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

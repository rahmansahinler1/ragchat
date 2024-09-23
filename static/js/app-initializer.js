function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function fetchInitialUserData(userEmail) {
    try {
        const response = await fetch('/api/v1/db/get_user_info', {
            method: 'POST',
            body: JSON.stringify({ user_email: userEmail }),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch initial user data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching initial user data:', error);
        return null;
    }
}

async function initialize() {
    try {
        // Load scripts
        await loadScript('/static/js/app.js');
        
        // In the future, this will be updated after logic process
        const userEmail = "rahmansahinler1@gmail.com";

        // Fetch initial user data
        const initialUserData = await fetchInitialUserData(userEmail);
        if (!initialUserData) {
            throw new Error('Failed to load initial user data');
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
        initChat(chatArea, userInput, sendButton);
        initAddFiles(selectFilesButton, fileInput, uploadFilesButton, selectedFileList, removeSelectionButton);
        initUploadFiles(uploadFilesButton);
        initRemoveSelection(selectedFileList, uploadFilesButton, removeSelectionButton);
        initRemoveUpload(removeUploadButton);

        // Update the initial widgets when first loaded
        initWidgetLoad(initialUserData, domainFileList, removeUploadButton);

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);
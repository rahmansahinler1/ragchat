// Chatting
function initChat(chatArea, userInput, sendButton) {
    sendButton.addEventListener('click', () => sendMessage(userInput));
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(userInput);
        }
    });
    window.chatArea = chatArea;
}

function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    window.chatArea.appendChild(messageElement);
    window.chatArea.scrollTop = window.chatArea.scrollHeight;
}

async function sendMessage(userInput) {
    const message = userInput.value.trim();
    if (message) {
        window.addMessageToChat(message, 'you');
        try {
            const response = await fetch('/api/v1/qa/generate_answer', {
                method: 'POST',
                body: JSON.stringify({ user_query: message }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error('Failed to generate response!');
            }
            const data = await response.json();
            window.addMessageToChat(data.response, 'ragchat');
            data.resources.forEach(resource => {
                window.addMessageToChat(`File: ${resource.file_name}//Page: ${resource.page}`, 'ragchat');
            });
        } catch (error) {
            console.error('Error!', error);
            window.addMessageToChat('Error!', 'ragchat')
        }
    }
}

// File Operations
function initAddFiles(addFilesButton, fileInput, uploadFilesButton) {
    addFilesButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => addFiles(fileInput, uploadFilesButton))
}

function initUploadFiles(uploadFilesButton) {
    uploadFilesButton.addEventListener('click', () => uploadFiles(uploadFilesButton));
}

async function addFiles(fileInput, uploadFilesButton) {
    const files = fileInput.files;
    const formData = new FormData();
    
    if (files.length === 0) {
        return;
    }

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        formData.append('lastModified', files[i].lastModified);
    }

    try {
        const response = await fetch('api/v1/io/add_files', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to add files!');
        }
        
        const data = await response.json();
        window.addMessageToChat(`Files added successfully: ${data.file_names.join(', ')}`, 'ragchat');

        if (data.total_files > 0) {
            uploadFilesButton.disabled = false
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        window.addMessageToChat('Error while adding files!', 'ragchat');
    }

    fileInput.value = '';
}

async function uploadFiles(uploadFilesButton) {
    try {
        uploadFilesButton.disabled = true;

        const response = await fetch('api/v1/io/upload_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'upload' })
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload files!');
        }
        
        const data = await response.json();
        
        if (data.success) {
            window.addMessageToChat(`Files uploaded successfully`, 'ragchat');
        } else {
            throw new Error(data.message || 'Upload failed');
        }

    } catch (error) {
        console.error('Error uploading files:', error);
        window.addMessageToChat('Error while uploading files: ' + error.message, 'ragchat');
    } finally {
        uploadFilesButton.disabled = false;
    }
}


window.initChat = initChat;
window.addMessageToChat = addMessageToChat;
window.initAddFiles = initAddFiles;
window.initUploadFiles = initUploadFiles;

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
function initAddFiles(selectFilesButton, fileInput, uploadFilesButton, selectedFileList, removeSelectionButton) {
    selectFilesButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => addFiles(fileInput, uploadFilesButton, selectedFileList, removeSelectionButton))
}

function initRemoveSelection(selectedFileList, uploadFilesButton, removeSelectionButton) {
    removeSelectionButton.addEventListener('click', () => removeFileSelection(selectedFileList, uploadFilesButton, removeSelectionButton));
}

function initUploadFiles(uploadFilesButton) {
    uploadFilesButton.addEventListener('click', () => uploadFiles(uploadFilesButton));
}

function initRemoveUpload(removeUploadButton) {
    removeUploadButton.addEventListener('click', () => removeFileUpload(selectedFileList, uploadFilesButton, removeSelectionButton));
}


async function addFiles(fileInput, uploadFilesButton, selectedFileList, removeSelectionButton) {
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
        const response = await fetch('api/v1/io/select_files', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to add files!');
        }
        
        const data = await response.json();
        if (data && data.file_names) {
            data.file_names.forEach(fileName => {
                const li = document.createElement('li');
                li.textContent = fileName;
                selectedFileList.appendChild(li);
            });
        }

        if (data.total_files > 0) {
            uploadFilesButton.disabled = false;
            removeSelectionButton.disabled = false;
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        window.addMessageToChat('Error while adding files!', 'ragchat');
    }

    fileInput.value = '';
}

async function removeFileSelection(selectedFileList, uploadFilesButton, removeSelectionButton) {
    try {
        const response = await fetch('api/v1/io/remove_file_selections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove files!');
        }

        const data = await response.json();

        if (data.success) {
            selectedFileList.innerHTML = '';
            uploadFilesButton.disabled = true;
            removeSelectionButton.disabled = true;

            window.addMessageToChat(`Selected files deleted`, 'ragchat');
        } else {
            throw new Error(data.message || 'Failed to remove files');
        }
    } catch (error) {
        console.error('Error removing files:', error);
        window.addMessageToChat('Error while removing files: ' + error.message, 'ragchat');
    }
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

function initWidgetLoad(initialUserData, domainFileList, removeUploadButton) {
    const userName = initialUserData[0].user_name
    const domainFiles = initialUserData[1]

    if (domainFiles) {
        domainFileList.innerHTML = '';
        domainFiles.forEach(file => {
            const li = document.createElement('li');
            li.textContent = `${file.file_domain}: ${file.file_name}.${file.file_type}`;
            domainFileList.appendChild(li);
        });
        removeUploadButton.disabled = false;
    }
    window.addMessageToChat(`Welcome ${userName}, how are you today?`, 'ragchat');
}

window.initChat = initChat;
window.addMessageToChat = addMessageToChat;
window.initAddFiles = initAddFiles;
window.initUploadFiles = initUploadFiles;
window.removeFileSelection = removeFileSelection;

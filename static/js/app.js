// Initialize functions and globalize necessary widgets
function initWidgets({
    selectedFileList,
    uploadFilesButton,
    removeSelectionButton,
    domainFileList,
    removeUploadButton,
    userData,
    currentDomain,
    selectFilesButton,
    fileInput,
    domainButtons,
    sendButton,
    userInput,
    chatBox
}) {
    // File selection
    selectFilesButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => selectFiles(fileInput, userData, uploadFilesButton, selectedFileList, removeSelectionButton))
    // Selection removal
    removeSelectionButton.addEventListener('click', () => removeFileSelection(selectedFileList, userData));
    // Domain selection
    domainButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectDomain(button, index, domainButtons, userData));
    });
    // Uplaod files
    uploadFilesButton.addEventListener('click', () => uploadFiles(uploadFilesButton, selectedFileList, userData));
    // Remove upload
    removeUploadButton.addEventListener('click', () => removeFileUpload(removeUploadButton, uploadFilesButton, domainFileList, selectedFileList, removeSelectionButton));
    // Chatting
    sendButton.addEventListener('click', () => sendMessage(userInput, userData));
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(userInput, userData);
        }
    });

    // Globalize necessary widgets
    Object.assign(window, {
        removeSelectionButton,
        selectedFileList,
        uploadFilesButton,
        domainFileList,
        removeUploadButton,
        chatBox,
        currentDomain
    });
}

// Helper functions
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (sender.toLowerCase() === 'you') {
        messageElement.classList.add('user-message');
    } else {
        messageElement.classList.add('bot-message');
    }
    
    messageElement.textContent = message;
    
    window.chatBox.appendChild(messageElement);
    window.chatBox.scrollTop = window.chatBox.scrollHeight;
}

function updateButtonStates() {
    const selectedFiles = window.selectedFileList.querySelectorAll('.file-item');
    const uploadedFiles = window.domainFileList.querySelectorAll('.file-item');

    if (selectedFiles.length === 0) {
        uploadFilesButton.disabled = true;
        removeSelectionButton.disabled = true;
    } else {
        uploadFilesButton.disabled = false;
        removeSelectionButton.disabled = false;
    }

    if (uploadedFiles.length === 0) {
        removeUploadButton.disabled = true;
    } else {
        removeUploadButton.disabled = false;
    }
}

function updateDomainList(domainInfo) {
 if (domainInfo.files.length > 0) {
        window.domainFileList.innerHTML = '';
        domainInfo.files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'file-checkbox';

            const label = document.createElement('label');
            label.textContent = `${file.file_name}`;

            fileItem.appendChild(checkbox);
            fileItem.appendChild(label);
            window.domainFileList.appendChild(fileItem);
        });
    } else {
        domainFileList.innerHTML = '<p>There is nothing in here...</p>';
        removeUploadButton.disabled = true;
    }
}

// Request functions
async function sendMessage(userInput, userData) {
    const message = userInput.value.trim();

    if (!message) {
        window.addMessageToChat("Please enter your sentence!", 'ragchat');
        return;
    }

    if (message) {
        window.addMessageToChat(message, 'you');
        try {
            const response = await fetch('/api/v1/qa/generate_answer', {
                method: 'POST',
                body: JSON.stringify({ 
                    user_query: message,
                    user_email: userData.user_id
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error('Failed to generate response!');
            }
            const data = await response.json();
            window.addMessageToChat(data.answer, 'ragchat');
        } catch (error) {
            console.error('Error!', error);
            window.addMessageToChat('Error!', 'ragchat')
        }
    } else {
        console.error('Error!', error);
        window.addMessageToChat('No message!', 'ragchat')
    }
}

async function selectFiles(fileInput, userData) {
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
        const userID = userData.user_info.user_id;
        const url = `api/v1/io/select_files?userID=${encodeURIComponent(userID)}`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to add files!');
        }
        
        const data = await response.json();
        if (data && data.file_names) {
            data.file_names.forEach(fileName => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'file-checkbox';

                const label = document.createElement('label');
                label.textContent = fileName;

                fileItem.appendChild(checkbox);
                fileItem.appendChild(label);
                window.selectedFileList.appendChild(fileItem);
            });
            updateButtonStates();
        }
    } catch (error) {
        console.error('Error selecting files:', error);
        window.addMessageToChat('Error while selecting files!', 'ragchat');
    }
    fileInput.value = '';
}

async function removeFileSelection(selectedFileList, userData) {
    try {
        const checkedBoxes = selectedFileList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            window.addMessageToChat('No files selected for removal', 'ragchat');
            return;
        }
        const filesToRemove = Array.from(checkedBoxes).map(checkbox => checkbox.nextElementSibling.textContent);
        const userID = userData.user_info.user_id;
        const url = `api/v1/io/remove_file_selections?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                filesToRemove
            })
        });

        if (!response.ok) {
            throw new Error('Failed to remove files!');
        }

        const data = await response.json();
        if (data.success) {
            checkedBoxes.forEach(checkbox => {
                const fileItem = checkbox.closest('.file-item');
                if (fileItem) {
                    fileItem.remove();
                }
            });
            updateButtonStates();
            window.addMessageToChat(`Selected files deleted`, 'ragchat');
        } else {
            throw new Error(data.message || 'Failed to remove files');
        }
    } catch (error) {
        console.error('Error removing files:', error);
        window.addMessageToChat('Error while removing files: ' + error.message, 'ragchat');
    }
}

async function clearFileSelections(userData) {
    try {
        const response = await fetch(`api/v1/io/clear_file_selections?userID=${encodeURIComponent(userData.user_info.user_id)}`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear user selections');
        }
        updateButtonStates();
        
    } catch (error) {
        console.error('Error clearing user selections:', error);
        window.addMessageToChat('Error while clearing previous selections!', 'ragchat');
    }
}

async function selectDomain(clickedButton, index, domainButtons, userData) {
    try {
        domainButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');

        const currentDomain = index + 1;
        const userID = userData.user_info.user_id;
        const url = `api/v1/qa/select_domain?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                currentDomain
            })
        });

        const data = await response.json();
        if (data.success) {
            updateDomainList(data);
            updateButtonStates();
            window.addMessageToChat(`Selected files deleted`, 'ragchat');
        } else {
            throw new Error(data.message || 'Failed to remove files');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch file info');
        }

    } catch (error) {
        console.error('Error fetching domain info:', error);
        window.addMessageToChat(`Error switching to domain ${index + 1}: ${error.message}`, 'ragchat');
    }
}

async function uploadFiles(uploadFilesButton, selectedFileList, userData) {
    try {
        uploadFilesButton.disabled = true;
        const currentDomain = 1;

        const userID = userData.user_info.user_id;
        const url = `api/v1/io/upload_files?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                currentDomain
            })
        });

        const data = await response.json();
        if (data.success) {
            updateDomainList(data.domain_info)
            selectedFileList.innerHTML = 'Uploaded! This place is empty now...';
        } else {
            throw new Error(data.message || 'Upload failed');
        }

    } catch (error) {
        console.error('Error uploading files:', error);
        window.addMessageToChat('Error while uploading files: ' + error.message, 'ragchat');
    }
}

async function removeFileUpload(removeUploadButton, uploadFilesButton, domainFileList, userEmail, selectedFileList, removeSelectionButton) {
    try {
        removeUploadButton.disabled = true;
        const checkedBoxes = domainFileList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            window.addMessageToChat('No file selected for deletion', 'ragchat');
            removeUploadButton.disabled = false;
            return;
        }
        const filesToRemove = Array.from(checkedBoxes).map(checkbox => checkbox.nextElementSibling.textContent);

        const response = await fetch('api/v1/io/remove_file_upload', {
            method: 'POST',
            body: JSON.stringify({ 
                user_email: userEmail,
                files_to_remove: filesToRemove
             }),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove file upload!');
        }

        const data = await response.json();

        if (data.success) {
            const deletedContent = data.message.deleted_content;
            const deletedFiles = data.message.deleted_files;
            
            checkedBoxes.forEach(checkbox => {
                const fileItem = checkbox.closest('.file-item');
                if (fileItem) {
                    fileItem.remove();
                }
            });
            
            window.addMessageToChat(
                `Selected files deleted successfully. ${deletedContent} file sentences and ${deletedFiles} files were deleted.`,
                'ragchat'
            );

            updateButtonStates();

            const userData = await fetchUserInfo(userEmail);
            updateDomainList(userData, domainFileList, removeUploadButton)

        } else {
            throw new Error(data.message || 'Failed to remove files');
        }
    } catch (error) {
        console.error('Error removing files:', error);
        window.addMessageToChat('Error while removing files: ' + error.message, 'ragchat');
    }
}

async function fetchUserInfo(userEmail) {
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
        data = await response.json();
        if (!data) {
            window.addMessageToChat('User could not be found!', 'ragchat');
            return;
        }
        return data

    } catch (error) {
        console.error('Error fetching initial user data:', error);
        return null;
    }
}

async function fetchFileInfo(userData, currentDomain) {
    try {
        const response = await fetch('/api/v1/db/get_file_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_id: userData.user_info.user_id, 
                selected_domain_number: currentDomain 
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch initial user data');
        }
        data = await response.json();
        if (!data) {
            window.addMessageToChat('User could not be found!', 'ragchat');
            return;
        }
        return data

    } catch (error) {
        console.error('Error fetching initial user data:', error);
        return null;
    }
}


window.initWidgets = initWidgets;
window.addMessageToChat = addMessageToChat;
window.fetchUserInfo = fetchUserInfo;

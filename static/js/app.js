// Initialize functions and globalize necessary widgets
function initAppWidgets({
    selectedFileList,
    uploadFilesButton,
    removeSelectionButton,
    domainFileList,
    domainTitle,
    removeUploadButton,
    userData,
    currentDomain,
    selectFilesButton,
    fileInput,
    domainButtons,
    sendButton,
    userInput,
    chatBox,
    resourceSection
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
    uploadFilesButton.addEventListener('click', () => uploadFiles(uploadFilesButton, userData));
    // Remove upload
    removeUploadButton.addEventListener('click', () => removeFileUpload(removeUploadButton, userData));
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
        domainTitle,
        removeUploadButton,
        chatBox,
        currentDomain,
        resourceSection
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

function populateResources(resources, sentences) {
    window.resourceSection.innerHTML = '<div class="colored-div-resources"><h2 class="text-center">Resources</h2></div>';

    if (!resources || !sentences || resources.file_names.length === 0) {
        const noResourcesMsg = document.createElement('p');
        noResourcesMsg.textContent = 'No resources available for this query.';
        noResourcesMsg.className = 'text-center mt-3';
        window.resourceSection.appendChild(noResourcesMsg);
        return;
    }

    const resourceList = document.createElement('div');
    resourceList.className = 'resource-list';

    const groupedResources = {};

    for (let i = 0; i < resources.file_names.length; i++) {
        const fileName = resources.file_names[i];
        if (!groupedResources[fileName]) {
            groupedResources[fileName] = [];
        }
        groupedResources[fileName].push({
            pageNumber: resources.page_numbers[i],
            sentence: sentences[i]
        });
    }

    for (const fileName in groupedResources) {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';

        groupedResources[fileName].forEach((resource, index) => {
            const header = document.createElement('h6');
            header.innerHTML = `<strong id="resource-from-text">Resource From:</strong> <span class="document-title">${fileName} | Page ${resource.pageNumber}</span>`;

            const description = document.createElement('p');
            description.className = 'description';
            description.innerHTML = `<span class="bullet"><i class="fa-solid fa-arrow-right"></i></span>${resource.sentence}`;
            description.title = resource.sentence;

            resourceItem.appendChild(header);
            resourceItem.appendChild(description);

            if (index < groupedResources[fileName].length - 1) {
                const spacer = document.createElement('div');
                spacer.style.height = '10px';
                resourceItem.appendChild(spacer);
            }
        });

        resourceList.appendChild(resourceItem);
    }

    window.resourceSection.appendChild(resourceList);
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
    if (domainInfo.file_names && domainInfo.file_names.length > 0) {
        domainFileList.innerHTML = '';
        domainInfo.file_names.forEach(fileName => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'file-checkbox';

            const label = document.createElement('label');
            label.textContent = fileName;

            fileItem.appendChild(checkbox);
            fileItem.appendChild(label);
            window.domainFileList.appendChild(fileItem);
        });
    } else {
        window.domainFileList.innerHTML = '<p class = "empty-message">No files in this domain.</p>';
    }
    if (domainInfo.domain_name) {
        window.domainTitle.textContent = domainInfo.domain_name;
    } else {
        window.domainTitle.textContent = '<p>No specifed domain name</p>';
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
            const userID = userData.user_id;
            const url = `/api/v1/qa/generate_answer?userID=${encodeURIComponent(userID)}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ user_message: message })
            });
            if (!response.ok) {
                throw new Error('Failed to generate response!');
            }
            const data = await response.json();
            window.addMessageToChat(data.answer, 'ragchat');

            if (data.resources && data.sentences) {
                populateResources(data.resources, data.sentences)
            }

        } catch (error) {
            console.error('Error generating message!', error);
            window.addMessageToChat('Error generating message!', 'ragchat')
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
        const userID = userData.user_id;
        const url = `/api/v1/io/select_files?userID=${encodeURIComponent(userID)}`;
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
        const userID = userData.user_id;
        const url = `/api/v1/io/remove_file_selections?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ files_to_remove: filesToRemove })
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
        const response = await fetch(`/api/v1/io/clear_file_selections?userID=${encodeURIComponent(userData.user_id)}`, {
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
        const userID = userData.user_id;
        const url = `/api/v1/qa/select_domain?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                currentDomain
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch domain info');
        }
        const data = await response.json();

        updateDomainList(data);
        updateButtonStates();
        window.addMessageToChat(`Successfully switched to domain ${currentDomain}`, 'ragchat');

    } catch (error) {
        console.error('Error fetching domain info:', error);
        window.addMessageToChat(`Error switching to domain ${index + 1}: ${error.message}`, 'ragchat');
    }
}

async function uploadFiles(uploadFilesButton, userData) {
    try {
        uploadFilesButton.disabled = true;
        const userID = userData.user_id;
        const url = `/api/v1/io/upload_files?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.domain_name) {
            updateDomainList(data);
            updateButtonStates();
            window.addMessageToChat(`Successfully uploaded files to domain ${data.domain_name}`, 'ragchat');
            window.selectedFileList.innerHTML = '';
        }
        else {
            window.addMessageToChat(`${data.message}`, 'ragchat');
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        window.addMessageToChat('Error while uploading files: ' + error.message, 'ragchat');
    }
}

async function removeFileUpload(removeUploadButton, userData) {
    try {
        removeUploadButton.disabled = true;
        const checkedBoxes = domainFileList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            window.addMessageToChat('No file selected for deletion', 'ragchat');
            removeUploadButton.disabled = false;
            return;
        }
        const filesToRemove = Array.from(checkedBoxes).map(checkbox => checkbox.nextElementSibling.textContent);
        const userID = userData.user_id;
        const url = `/api/v1/io/remove_file_upload?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ files_to_remove: filesToRemove })
        });

        if (!response.ok) {
            throw new Error('Failed to remove file upload!');
        }

        const data = await response.json();
        if (data.domain_name) {
            updateDomainList(data);
            updateButtonStates();
            window.addMessageToChat(`${data.message}`,'ragchat');
        }
        else {
            window.addMessageToChat(`${data.message}`, 'ragchat');
        }
    } catch (error) {
        console.error('Error removing files:', error);
        window.addMessageToChat('Error while removing files: ' + error.message, 'ragchat');
    }
}

async function fetchUserInfo(userID) {
    try {
        const response = await fetch('/api/v1/db/get_user_info', {
            method: 'POST',
            body: JSON.stringify({ user_id: userID }),
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

// Dark Mode configurations
let darkmode = localStorage.getItem('dark-mode');
const themeSwitch = document.getElementById('theme-switch');

const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('dark-mode', 'enabled');
}

const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('dark-mode', null);
}

if(darkmode === 'enabled') {
    enableDarkMode();
}

themeSwitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('dark-mode');
    if(darkmode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

window.initAppWidgets = initAppWidgets;
window.addMessageToChat = addMessageToChat;
window.fetchUserInfo = fetchUserInfo;

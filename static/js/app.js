// Local storage for every user
class FileBasket {
    constructor() {
        this.files = new Map();
        this.totalSize = 0;
    }

    addFiles(fileList) {
        for (let file of fileList) {
            if (!this.files.has(file.name)) {
                this.files.set(file.name, {
                    file: file,
                    lastModified: file.lastModified
                });
                this.totalSize += file.size;
            }
        }
        return this.getFileNames();
    }

    removeFiles(fileNames) {
        fileNames.forEach(fileName => {
            const fileInfo = this.files.get(fileName);
            if (fileInfo) {
                this.totalSize -= fileInfo.file.size;
                this.files.delete(fileName);
            }
        });
        return this.getFileNames();
    }

    getFileNames() {
        return Array.from(this.files.keys());
    }

    clear() {
        this.files.clear();
        this.totalSize = 0;
    }

    getUploadFormData() {
        const formData = new FormData();
        this.files.forEach((fileInfo, fileName) => {
            formData.append('files', fileInfo.file);
            formData.append('lastModified', fileInfo.lastModified);
        });
        return formData;
    }
}

const fileBasket = new FileBasket();

// Initialization of widgets and behaviours
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
    userInputTextbox,
    chatBox,
    resourceSection
}) {
    selectFilesButton.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', () => selectFiles(fileInput, selectedFileList))

    removeSelectionButton.addEventListener('click', () => removeFileSelection(selectedFileList));

    domainButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectDomain(button, index, domainButtons, userData));
    });

    uploadFilesButton.addEventListener('click', () => uploadFiles(uploadFilesButton, userData));

    removeUploadButton.addEventListener('click', () => removeFileUpload(removeUploadButton, userData));

    sendButton.addEventListener('click', () => sendMessage(userInput, userData));

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(userInput, userData, userInputTextbox);
        }
    });

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

function initFeedbackWidgets({
    feedbackButton,
    feedbackModal,
    closeButtons,
    feedbackForm,
    screenshotInput,
    userData
}) {
    feedbackButton.addEventListener('click', () => {
        feedbackModal.classList.add('active');
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
            feedbackForm.reset();
        });
    });

    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            feedbackModal.classList.remove('active');
            feedbackForm.reset();
        }
    });

    screenshotInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            e.target.value = '';
        }
    });

    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendFeedback(feedbackForm, userData, feedbackButton);
    });
}

// Local functions
function selectFiles(fileInput, selectedFileList) {
    const updatedFiles = fileBasket.addFiles(fileInput.files);
    
    // Update UI
    selectedFileList.innerHTML = '';
    updatedFiles.forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'file-checkbox';
        const label = document.createElement('label');
        label.textContent = fileName;
        fileItem.appendChild(checkbox);
        fileItem.appendChild(label);
        selectedFileList.appendChild(fileItem);
    });
    
    updateButtonStates();
    fileInput.value = '';
}

function removeFileSelection(selectedFileList) {
    const checkedBoxes = selectedFileList.querySelectorAll('input[type="checkbox"]:checked');
    
    if (checkedBoxes.length === 0) {
        window.addMessageToChat('No files selected for removal', 'ragchat');
        return;
    }

    const filesToRemove = Array.from(checkedBoxes).map(checkbox => 
        checkbox.nextElementSibling.textContent
    );
    
    fileBasket.removeFiles(filesToRemove);
    
    // Update UI
    checkedBoxes.forEach(checkbox => {
        const fileItem = checkbox.closest('.file-item');
        if (fileItem) {
            fileItem.remove();
        }
    });
    
    updateButtonStates();
}

function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Create message section with icon
    const messageSection = document.createElement('div');
    messageSection.classList.add('message-section');
    
    if (sender.toLowerCase() === 'you') {
        messageElement.classList.add('user-message');
        
        const userIcon = document.createElement('i');
        userIcon.classList.add('fas', 'fa-user-circle');
        userIcon.style.marginRight = '8px';
        userIcon.style.color = '#007AEA';
        
        const messageText = document.createElement('span');
        messageText.textContent = message;
        
        messageSection.appendChild(userIcon);
        messageSection.appendChild(messageText);
    } else {
        messageElement.classList.add('bot-message');
        
        // Create custom ragchat icon
        const ragchatIcon = document.createElement('img');
        ragchatIcon.src = '/static/favicon/favicon-32x32.png';
        ragchatIcon.alt = 'ragchat';
        ragchatIcon.style.width = '20px';
        ragchatIcon.style.height = '20px';
        ragchatIcon.style.marginRight = '8px';
        ragchatIcon.style.marginTop = '4px';
        
        const messageText = document.createElement('span');
        messageText.textContent = message;
        
        messageSection.appendChild(ragchatIcon);
        messageSection.appendChild(messageText);
    }
    
    messageElement.appendChild(messageSection);
    window.chatBox.appendChild(messageElement);
    window.chatBox.scrollTop = window.chatBox.scrollHeight;
}

function generateResponse(information, explanation) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    
    // Create information section
    const infoSection = document.createElement('div');
    infoSection.classList.add('info-section');
    
    const infoIcon = document.createElement('i');
    infoIcon.classList.add('fas', 'fa-info-circle');
    infoIcon.style.marginRight = '8px';
    infoIcon.style.color = '#007AEA';
    
    const infoText = document.createElement('span');
    infoText.textContent = information;
    
    infoSection.appendChild(infoIcon);
    infoSection.appendChild(infoText);
    
    // Create explanation section
    const explainSection = document.createElement('div');
    explainSection.classList.add('explain-section');
    explainSection.style.marginTop = '12px';
    
    const explainIcon = document.createElement('i');
    explainIcon.classList.add('fas', 'fa-question-circle');
    explainIcon.style.marginRight = '8px';
    explainIcon.style.color = '#6c757d';
    
    const explainText = document.createElement('span');
    explainText.textContent = explanation;
    
    explainSection.appendChild(explainIcon);
    explainSection.appendChild(explainText);
    
    // Add sections to message
    messageElement.appendChild(infoSection);
    messageElement.appendChild(explainSection);
    
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

    for (let i = 0; i < sentences.length; i++) {
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
            const description = document.createElement('p');
            header.innerHTML = `<strong id="resource-from-text">Resource From:</strong> <span class="document-title">${fileName} | Page ${resource.pageNumber}</span>`;
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
async function sendMessage(userInput, userData, userInputTextbox) {
    const message = userInput.value.trim();

    if (!message) {
        window.addMessageToChat("Please enter your sentence!", 'ragchat');
        return;
    }

    if (message) {
        window.addMessageToChat(message, 'you');
        userInput.value = '';
        try {
            const userID = userData.user_id;
            const url = `/api/v1/qa/generate_answer?userID=${encodeURIComponent(userID)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ user_message: message })
            });

            if (!response.ok) {
                throw new Error('Server error!');
            }

            const data = await response.json();

            if (data.information && data.explanation) {
                generateResponse(data.information, data.explanation);
                populateResources(data.resources, data.resource_sentences);
            } else {
                window.addMessageToChat(data.message, 'ragchat')
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
        if (fileBasket.files.size === 0) {
            window.addMessageToChat("No files selected for upload", 'ragchat');
            return;
        }

        uploadFilesButton.disabled = true;
        const formData = fileBasket.getUploadFormData();
        const url = `/api/v1/io/upload_files?userID=${userData.user_id}`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        
        if (data.domain_name) {
            updateDomainList(data);
            updateButtonStates();
            window.addMessageToChat(`Successfully uploaded files to ${data.domain_name}`, 'ragchat');
            window.selectedFileList.innerHTML = '';
            fileBasket.clear();
        } else {
            window.addMessageToChat(data.message, 'ragchat');
        }

    } catch (error) {
        console.error('Error uploading files:', error);
        window.addMessageToChat('Error while uploading files: ' + error.message, 'ragchat');
    } finally {
        uploadFilesButton.disabled = false;
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

async function sendFeedback(feedbackForm, userData, submitButton) {
    try {
        const descriptionField = feedbackForm.querySelector('#feedback-description');
        if (!descriptionField || !descriptionField.value.trim()) {
            window.addMessageToChat('Please provide a description for your feedback', 'ragchat');
            return;
        }

        submitButton.disabled = true;
        
        const formData = new FormData(feedbackForm);
        const userID = userData.user_id;
        const url = `/api/v1/db/insert_feedback?userID=${encodeURIComponent(userID)}`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to submit feedback');
        }

        window.addMessageToChat('Thank you for your feedback!', 'ragchat');
        feedbackForm.reset();
        document.getElementById('feedback-modal').classList.remove('active');
        submitButton.disabled = false;

    } catch (error) {
        console.error('Error submitting feedback:', error);
        window.addMessageToChat('Failed to submit feedback. Please try again.', 'ragchat');
        submitButton.disabled = false;
    }
}

async function checkVersion() {
    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        const currentVersion = localStorage.getItem('appVersion');
        
        if (!currentVersion) {
            localStorage.setItem('appVersion', data.version);
            return;
        }

        if (data.version !== currentVersion) {
            localStorage.setItem('appVersion', data.version);
            window.location.reload(true);
        }
    } catch (error) {
        console.error('Version check failed:', error);
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

let uploadedFiles = new Set(); // Currently selected files waiting to be uploaded
let uploadedFileObjects = new Map(); // Keep track of actual File objects
let sidebarFiles = new Map(); // Files that have been uploaded to the sidebar
let domainToDelete = null;
let selectedDomainCard = null;
let isUploading = false;

// Constants
const MAX_DOMAIN_NAME_LENGTH = 30; // Maximum length for domain names


// Initial domains data
const initialDomains = [
    { id: 'regulations', name: 'Regulations', fileCount: 0 },
    { id: 'algorithms', name: 'Algorithms', fileCount: 0 },
    { id: 'security', name: 'Security', fileCount: 0 },
    { id: 'automation', name: 'Automation', fileCount: 0 }
];

// Utility Functions
function generateFileId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'bi-file-pdf';
        case 'docx':
            return 'bi-file-word';
        case 'doc':
            return 'bi-file-word';
        case 'txt':
            return 'bi-file-text';
        default:
            return 'bi-file';
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Domain Management Functions
function createDomainCard(domain) {
    const displayName = domain.name.length > MAX_DOMAIN_NAME_LENGTH
        ? domain.name.substring(0, MAX_DOMAIN_NAME_LENGTH) + '...'
        : domain.name;

    return `
        <div class="domain-card" data-domain-id="${domain.id}">
            <div class="domain-content">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="${domain.id}" class="domain-checkbox">
                    <label for="${domain.id}" class="checkbox-label"></label>
                </div>
                <div class="domain-info">
                    <h6 title="${domain.name}">${displayName}</h6>
                    <span class="file-count">${domain.fileCount} files</span>
                </div>
            </div>
            <button class="delete-button">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `;
}

function initializeDomains() {
    const domainsContainer = document.getElementById('domainsContainer');
    if (domainsContainer) {
        domainsContainer.innerHTML = initialDomains.map(domain => createDomainCard(domain)).join('');
        setupEventListeners();
    }
}

function setupEventListeners() {
    // Single selection for checkboxes
    const checkboxes = document.querySelectorAll('.domain-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                checkboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function () {
            domainToDelete = this.closest('.domain-card');
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            deleteModal.show();
        });
    });
}

// File Management Functions
function handleFiles(newFiles) {
    if (isUploading) return;

    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadArea = document.getElementById('dropZone');
    let duplicateFound = false;

    Array.from(newFiles).forEach(file => {
        if (uploadedFiles.has(file.name)) {
            duplicateFound = true;
            return;
        }

        // Store the actual File object
        uploadedFileObjects.set(file.name, file);
        uploadedFiles.add(file.name);

        displayFileInList(file, fileList);
    });

    if (duplicateFound) {
        alert('Some files were skipped as they were already added');
    }

    updateUploadUI(fileList, uploadBtn, uploadArea);
}

function displayFileInList(file, fileList) {
    const icon = getFileIcon(file.name);

    const fileItem = document.createElement('div');
    fileItem.className = 'file-item pending-upload';
    fileItem.dataset.fileName = file.name;
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="bi ${icon} text-primary-green"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
        <div class="file-remove">
            <i class="bi bi-trash"></i>
        </div>
    `;

    // Add remove handler
    const removeButton = fileItem.querySelector('.file-remove');
    removeButton.addEventListener('click', () => {
        if (!isUploading) {
            uploadedFiles.delete(file.name);
            uploadedFileObjects.delete(file.name);
            fileItem.remove();
            updateUploadUI(fileList, document.getElementById('uploadBtn'), document.getElementById('dropZone'));
        }
    });

    fileList.appendChild(fileItem);
}

function updateUploadUI(fileList, uploadBtn, uploadArea) {
    if (uploadedFiles.size > 0) {
        uploadArea.style.display = 'none';
        uploadBtn.disabled = false;
        ensureAddMoreFilesButton(fileList);
    } else {
        uploadArea.style.display = 'flex';
        uploadBtn.disabled = true;
        removeAddMoreFilesButton();
    }
}

function ensureAddMoreFilesButton(fileList) {
    let addFileBtn = document.querySelector('.add-file-btn');
    if (!addFileBtn) {
        addFileBtn = document.createElement('button');
        addFileBtn.className = 'add-file-btn';
        addFileBtn.innerHTML = `
            <i class="bi bi-plus-circle"></i>
            Add More Files
        `;
        addFileBtn.addEventListener('click', () => {
            if (!isUploading) {
                document.getElementById('fileInput').click();
            }
        });
        fileList.after(addFileBtn);
    }
    addFileBtn.disabled = isUploading;
    addFileBtn.style.opacity = isUploading ? '0.5' : '1';
}

function removeAddMoreFilesButton() {
    const addFileBtn = document.querySelector('.add-file-btn');
    if (addFileBtn) {
        addFileBtn.remove();
    }
}

function startUpload() {
    if (uploadedFiles.size === 0 || isUploading) return;

    const fileItems = document.querySelectorAll('.file-item');
    let completed = 0;
    isUploading = true;

    // Disable UI elements
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;

    const addMoreFilesBtn = document.querySelector('.add-file-btn');
    if (addMoreFilesBtn) {
        addMoreFilesBtn.disabled = true;
        addMoreFilesBtn.style.opacity = '0.5';
    }

    fileItems.forEach(item => {
        item.classList.remove('pending-upload');
        item.classList.add('uploading');

        const progressBar = item.querySelector('.progress-bar');
        const progressContainer = item.querySelector('.file-progress');
        progressContainer.style.display = 'block';

        simulateFileUpload(item, progressBar, () => {
            completed++;
            item.classList.remove('uploading');
            item.classList.add('uploaded');

            if (completed === fileItems.length) {
                finishUpload();
            }
        });
    });
}

function simulateFileUpload(fileItem, progressBar, onComplete) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            onComplete();
        }
        progressBar.style.width = `${progress}%`;
    }, 500);
}

function finishUpload() {
    isUploading = false;

    const filesToAdd = Array.from(uploadedFileObjects.values());
    updateSidebarFiles(filesToAdd);

    // Clear upload data
    uploadedFiles.clear();
    uploadedFileObjects.clear();

    // Close modal and clean up
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('fileUploadModal'));
        if (modal) {
            modal.hide();
        }
        document.body.classList.remove('modal-open');
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => backdrop.remove());
    }, 500);
}

function updateFileMenuPosition() {
    const sidebarFileList = document.getElementById('sidebarFileList');
    const fileMenuBtn = document.querySelector('.open-file-btn');
    const fileListContainer = document.querySelector('.file-list-container');
    const openFileBtn = document.querySelector('.open-file-btn');
    const fileAdd = document.querySelector('.file-add');
    const helperText = document.querySelector('.helper-text');

    if (sidebarFileList && sidebarFileList.children.length > 0) {
        helperText.style.display = 'none';
        helperText.style.height = '0';
        helperText.style.margin = '0';
        helperText.style.padding = '0';
    } else {
        fileListContainer.style.height = 'auto';
        fileMenuBtn.style.position = 'static';
        fileMenuBtn.style.width = '100%';
    }
}

function updateSidebarFiles(files) {
    const sidebarFileList = document.getElementById('sidebarFileList');
    if (!sidebarFileList) return;

    Array.from(files).forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        const icon = getFileIcon(extension);

        const maxLength = 25;
        let displayName = file.name;
        if (displayName.length > maxLength) {
            const ext = displayName.slice(displayName.lastIndexOf('.'));
            displayName = displayName.slice(0, maxLength - ext.length - 3) + '..' + ext;
        }

        const fileItem = document.createElement('li');
        fileItem.innerHTML = `
            <i class="bi ${icon} file-icon sidebar-file-list-icon" style="color:#10B981"></i>
            <span class="file-name" title="${file.name}">${displayName}</span>
            <div class="file-actions">
                <i class="bi bi-three-dots-vertical"></i>
                <div class="action-menu">
                    <div class="action-menu-item rename-action">
                        <i class="bi bi-pencil"></i>
                        Rename
                    </div>
                    <div class="action-menu-item delete-action">
                        <i class="bi bi-trash"></i>
                        Delete
                    </div>
                </div>
            </div>
        `;

        sidebarFileList.appendChild(fileItem);
        setupFileActionHandlers(fileItem);
    });

    updateFileMenuPosition();
    updateDomainFileCount();
}

function setupFileActionHandlers(fileItem) {
    const actionDots = fileItem.querySelector('.bi-three-dots-vertical');
    const menu = fileItem.querySelector('.action-menu');
    const renameAction = fileItem.querySelector('.rename-action');
    const deleteAction = fileItem.querySelector('.delete-action');

    actionDots.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus(menu);
        menu.classList.toggle('show');
    });

    renameAction.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileName = fileItem.querySelector('.file-name');
        const currentName = fileName.textContent;

        const lastDotIndex = currentName.lastIndexOf('.');
        const nameWithoutExt = currentName.substring(0, lastDotIndex);
        const extension = currentName.substring(lastDotIndex);

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'rename-input';
        input.value = nameWithoutExt;

        fileName.replaceWith(input);
        input.focus();
        menu.classList.remove('show');

        function handleRename() {
            let newName = input.value.trim();
            if (newName) {
                newName = newName + extension;
                fileName.textContent = newName;
            } else {
                fileName.textContent = currentName;
            }
            input.replaceWith(fileName);
        }

        input.addEventListener('blur', handleRename);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    });

    deleteAction.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this file?')) {
            fileItem.remove();
            updateFileMenuPosition();
            updateDomainFileCount();
        }
        menu.classList.remove('show');
    });
}

function closeAllMenus(exceptMenu = null) {
    document.querySelectorAll('.action-menu.show').forEach(menu => {
        if (menu !== exceptMenu) {
            menu.classList.remove('show');
        }
    });
}

function updateDomainFileCount() {
    const selectedDomain = selectedDomainCard;
    if (!selectedDomain) return;

    const fileCountElement = selectedDomain.querySelector('.file-count');
    const sidebarFileList = document.getElementById('sidebarFileList');
    const currentFileCount = sidebarFileList ? sidebarFileList.children.length : 0;

    // Update domain card file count
    fileCountElement.textContent = `${currentFileCount} files`;

    // Update sources box count
    const sourcesBox = document.querySelector('.sources-box');
    if (sourcesBox) {
        const sourcesNumber = sourcesBox.querySelector('.sources-number');
        sourcesNumber.textContent = currentFileCount;
        sourcesBox.setAttribute('data-count', currentFileCount);
    }
}
// Event Listeners Setup
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const uploadBtn = document.getElementById('uploadBtn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('domainSearchInput');
    const newDomainBtn = document.getElementById('newDomainBtn');

    // Setup Search Functionality
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            document.querySelectorAll('.domain-card:not(.new-domain-input-card)').forEach(card => {
                const domainName = card.querySelector('h6').textContent.toLowerCase();
                card.classList.toggle('filtered', !domainName.includes(searchTerm));
            });
        });
    }

    // Setup Domain Selection
    const selectButton = document.querySelector('.select-button');
    if (selectButton) {
        selectButton.addEventListener('click', function () {
            const selectedCheckbox = document.querySelector('.domain-checkbox:checked');
            if (selectedCheckbox) {
                selectedDomainCard = selectedCheckbox.closest('.domain-card');
                const selectedDomainName = selectedDomainCard.querySelector('h6').textContent;

                const sidebarDomainText = document.querySelector('.bi-folder.empty-folder').nextElementSibling;
                if (sidebarDomainText) {
                    sidebarDomainText.textContent = selectedDomainName;
                }

                bootstrap.Modal.getInstance(document.getElementById('domainSelectModal')).hide();
            }
        });
    }
    const domainText = document.querySelector('.selected-domain-text');
    
    if (domainText) {
        // Add title attribute when text is truncated
        const updateTitle = () => {
            if (domainText.offsetWidth < domainText.scrollWidth) {
                domainText.title = domainText.textContent;
            } else {
                domainText.removeAttribute('title');
            }
        };

        // Update on content change
        const observer = new MutationObserver(updateTitle);
        observer.observe(domainText, { 
            characterData: true, 
            childList: true, 
            subtree: true 
        });

        // Initial check
        updateTitle();
    }
    // Setup Domain Deletion
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            if (domainToDelete) {
                if (domainToDelete === selectedDomainCard) {
                    const sidebarDomainText = document.querySelector('.bi-folder.empty-folder').nextElementSibling;
                    if (sidebarDomainText) {
                        sidebarDomainText.textContent = 'Select Domain';
                    }
                    selectedDomainCard = null;
                }

                domainToDelete.remove();
                domainToDelete = null;
                bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();

                // Clear modal backdrop
                document.body.classList.remove('modal-open');
                const modalBackdrops = document.querySelectorAll('.modal-backdrop');
                modalBackdrops.forEach(backdrop => backdrop.remove());
            }
        });
    }

    // Setup New Domain Creation
    if (newDomainBtn) {
        newDomainBtn.addEventListener('click', function () {
            const templateContent = document.getElementById('newDomainInputTemplate').content.cloneNode(true);
            const domainsContainer = document.getElementById('domainsContainer');
            domainsContainer.appendChild(templateContent);

            const inputCard = domainsContainer.querySelector('.new-domain-input-card');
            const input = inputCard.querySelector('.new-domain-input');
            const confirmBtn = inputCard.querySelector('.confirm-button');
            const cancelBtn = inputCard.querySelector('.cancel-button');

            input.setAttribute('maxlength', MAX_DOMAIN_NAME_LENGTH);

            if (window.innerWidth <= 350) {
                const actionsContainer = inputCard.querySelector('.new-domain-actions');
                actionsContainer.style.marginLeft = '8px';
                confirmBtn.style.padding = '4px';
                cancelBtn.style.padding = '4px';
            }

            input.focus();

            confirmBtn.addEventListener('click', function () {
                const name = input.value.trim();
                if (name) {
                    const newDomain = {
                        id: name.toLowerCase().replace(/\s+/g, '-'),
                        name: name,
                        fileCount: 0
                    };
                    inputCard.insertAdjacentHTML('beforebegin', createDomainCard(newDomain));
                    inputCard.remove();
                    setupEventListeners();
                }
            });

            cancelBtn.addEventListener('click', () => inputCard.remove());

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') confirmBtn.click();
            });
        });
    }
    const userSection = document.getElementById('userProfileMenu');
    
    if (userSection) {
        userSection.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!userSection.contains(e.target)) {
                userSection.classList.remove('active');
            }
        });

        // Handle menu items click
        const menuItems = userSection.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                if (this.classList.contains('logout-item')) {
                    // Handle logout
                    console.log('Logging out...');
                    // Add your logout logic here
                }
                userSection.classList.remove('active');
            });
        });
    }
    // Setup File Upload Modal
    const openFileBtn = document.querySelector('.open-file-btn');
    if (openFileBtn) {
        openFileBtn.addEventListener('click', function () {
            const selectedDomain = document.querySelector('.bi-folder.empty-folder').nextElementSibling.textContent;
            if (selectedDomain === 'Select Domain') {
                alert('Please select a domain first');
                return;
            }

            const modal = new bootstrap.Modal(document.getElementById('fileUploadModal'));
            document.querySelector('#fileUploadModal .domain-name').textContent = selectedDomain;

            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';

            if (uploadBtn) uploadBtn.disabled = true;
            if (dropZone) dropZone.style.display = 'flex';

            uploadedFiles.clear();
            uploadedFileObjects.clear();
            removeAddMoreFilesButton();

            modal.show();
        });
    }

    // Setup Drag and Drop
    if (dropZone && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                if (!isUploading) {
                    dropZone.classList.add('dragover');
                }
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', function (e) {
            if (!isUploading) {
                const files = e.dataTransfer.files;
                handleFiles(files);
            }
        }, false);

        const chooseText = document.querySelector('.choose-text');
        if (chooseText) {
            chooseText.addEventListener('click', () => {
                if (!isUploading) {
                    fileInput.click();
                }
            });
        }

        fileInput.addEventListener('change', function () {
            handleFiles(this.files);
        });
    }
    const menuTrigger = document.querySelector('.menu-trigger');
    const sidebarContainer = document.querySelector('.sidebar-container');
    let backdrop;
    let timeout;

    // Create backdrop element
    function createBackdrop() {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }
    createBackdrop();

    function showSidebar() {
        clearTimeout(timeout);
        sidebarContainer.classList.add('visible');
        backdrop.classList.add('visible');
    }

    function hideSidebar() {
        timeout = setTimeout(() => {
            sidebarContainer.classList.remove('visible');
            backdrop.classList.remove('visible');
        }, 300); // Delay to allow moving mouse to sidebar
    }

    // Menu button hover
    menuTrigger.addEventListener('mouseenter', showSidebar);
    menuTrigger.addEventListener('mouseleave', hideSidebar);

    // Sidebar hover
    sidebarContainer.addEventListener('mouseenter', showSidebar);
    sidebarContainer.addEventListener('mouseleave', hideSidebar);

    // Backdrop click
    backdrop.addEventListener('click', () => {
        sidebarContainer.classList.remove('visible');
        backdrop.classList.remove('visible');
    });
    const domainNameSpan = document.querySelector('.domain-name');
    
    if (domainNameSpan) {
        // Add title attribute when text is truncated
        const updateTitle = () => {
            if (domainNameSpan.offsetWidth < domainNameSpan.scrollWidth) {
                domainNameSpan.title = domainNameSpan.textContent;
            } else {
                domainNameSpan.removeAttribute('title');
            }
        };

        // Update on content change
        const observer = new MutationObserver(updateTitle);
        observer.observe(domainNameSpan, { 
            characterData: true, 
            childList: true, 
            subtree: true 
        });

        // Initial check
        updateTitle();
    }
    // Setup Upload Button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', startUpload);
    }
    const uploadIconWrapper = document.querySelector('.upload-icon-wrapper');
    if (uploadIconWrapper) {
        uploadIconWrapper.addEventListener('click', () => {
            if (!isUploading) {
                document.getElementById('fileInput').click();
            }
        });
    }
    const documentNames = document.querySelectorAll('.document-name');
    
    documentNames.forEach(docName => {
        const fullText = docName.textContent;
        const lastDotIndex = fullText.lastIndexOf('.');
        
        if (lastDotIndex !== -1) {
            const nameWithoutExt = fullText.substring(0, lastDotIndex);
            const extension = fullText.substring(lastDotIndex);
            
            // Maximum length for the name part (adjust as needed)
            const maxLength = 40;
            
            if (nameWithoutExt.length > maxLength) {
                const truncatedName = nameWithoutExt.substring(0, maxLength) + '...' + extension;
                docName.textContent = truncatedName;
                docName.title = fullText; // Show full name on hover
            }
        }
    });
    // Setup Menu Button
    // Setup Settings Icon
    const settingsIcon = document.querySelector('.settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', function () {
            const modal = new bootstrap.Modal(document.getElementById('domainSelectModal'));
            modal.show();
        });
    }

    // Global click handler for closing action menus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.file-actions')) {
            closeAllMenus();
        }
    });
    
    
    
    // Initialize domains
    initializeDomains();
});
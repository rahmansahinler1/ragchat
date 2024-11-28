// Local Storage
class FileBasket {
    constructor() {
        this.files = new Map();
        this.uploadQueue = [];
        this.totalSize = 0;
        this.MAX_BATCH_SIZE = 20 * 1024 * 1024; // 20MB in bytes
        this.MAX_CONCURRENT = 10;
    }

    addFiles(fileList) {
        for (let file of fileList) {
            if (!this.files.has(file.name)) {
                this.files.set(file.name, {
                    file: file,
                    lastModified: file.lastModified,
                    status: 'pending'
                });
                this.uploadQueue.push(file.name);
                this.totalSize += file.size;
            }
        }
        return this.getFileNames();
    }

    getBatch() {
        let currentBatchSize = 0;
        const batch = [];
        
        while (this.uploadQueue.length > 0 && batch.length < this.MAX_CONCURRENT) {
            const fileName = this.uploadQueue[0];
            const fileInfo = this.files.get(fileName);
            
            if (currentBatchSize + fileInfo.file.size > this.MAX_BATCH_SIZE) {
                break;
            }
            
            batch.push(this.uploadQueue.shift());
            currentBatchSize += fileInfo.file.size;
        }
        
        return batch;
    }

    getFileFormData(fileName) {
        const fileInfo = this.files.get(fileName);
        if (!fileInfo) return null;

        const formData = new FormData();
        formData.append('file', fileInfo.file);
        formData.append('lastModified', fileInfo.lastModified);
        return formData;
    }

    removeFile(fileName) {
        const fileInfo = this.files.get(fileName);
        if (fileInfo) {
            this.totalSize -= fileInfo.file.size;
            this.files.delete(fileName);
            const queueIndex = this.uploadQueue.indexOf(fileName);
            if (queueIndex > -1) {
                this.uploadQueue.splice(queueIndex, 1);
            }
        }
    }

    removeFiles(fileNames) {
        fileNames.forEach(fileName => {
            this.removeFile(fileName);
        });
        return this.getFileNames();
    }

    getFileNames() {
        return Array.from(this.files.keys());
    }

    hasFilesToUpload() {
        return this.uploadQueue.length > 0;
    }

    clear() {
        this.files.clear();
        this.uploadQueue = [];
        this.totalSize = 0;
    }
}

class DomainManager {
    constructor() {
        this.domains = new Map(); // Stores domain objects
        this.selectedDomain = null;
        this.MAX_NAME_LENGTH = 30;
        this.MAX_DOMAINS = 10; // Maximum domains per user
    }

    // Domain structure: { id, name, files: Map(), fileCount, createdAt }
    initializeDomains(userDomains) {
        userDomains.forEach(domain => {
            this.domains.set(domain.id, {
                id: domain.id,
                name: domain.name,
                files: new Map(),
                fileCount: domain.fileCount || 0,
                createdAt: domain.createdAt || new Date()
            });
        });
    }

    addDomain(name) {
        if (this.domains.size >= this.MAX_DOMAINS) {
            throw new Error('Maximum domain limit reached');
        }

        const domainId = crypto.randomUUID();
        const newDomain = {
            id: domainId,
            name: this.validateName(name),
            files: new Map(),
            fileCount: 0,
            createdAt: new Date()
        };

        this.domains.set(domainId, newDomain);
        return newDomain;
    }

    deleteDomain(domainId) {
        if (!this.domains.has(domainId)) {
            throw new Error('Domain not found');
        }

        if (this.selectedDomain === domainId) {
            this.selectedDomain = null;
        }

        return this.domains.delete(domainId);
    }

    renameDomain(domainId, newName) {
        const domain = this.domains.get(domainId);
        if (!domain) {
            throw new Error('Domain not found');
        }

        domain.name = this.validateName(newName);
        return domain;
    }

    selectDomain(domainId) {
        if (!this.domains.has(domainId)) {
            throw new Error('Domain not found');
        }

        this.selectedDomain = domainId;
        return this.domains.get(domainId);
    }

    getSelectedDomain() {
        return this.selectedDomain ? 
            this.domains.get(this.selectedDomain) : null;
    }

    addFilesToDomain(domainId, files) {
        const domain = this.domains.get(domainId);
        if (!domain) {
            throw new Error('Domain not found');
        }

        files.forEach(file => {
            domain.files.set(file.name, {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                addedAt: new Date()
            });
        });

        domain.fileCount = domain.files.size;
        return domain.fileCount;
    }

    removeFilesFromDomain(domainId, fileNames) {
        const domain = this.domains.get(domainId);
        if (!domain) {
            throw new Error('Domain not found');
        }

        fileNames.forEach(fileName => {
            domain.files.delete(fileName);
        });

        domain.fileCount = domain.files.size;
        return domain.fileCount;
    }

    getDomainFiles(domainId) {
        const domain = this.domains.get(domainId);
        return domain ? Array.from(domain.files.values()) : [];
    }

    searchDomains(query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.domains.values())
            .filter(domain => domain.name.toLowerCase().includes(searchTerm));
    }

    validateName(name) {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error('Domain name cannot be empty');
        }
        if (trimmedName.length > this.MAX_NAME_LENGTH) {
            throw new Error(`Domain name cannot exceed ${this.MAX_NAME_LENGTH} characters`);
        }
        return trimmedName;
    }

    getDomainSummary(domainId) {
        const domain = this.domains.get(domainId);
        if (!domain) {
            throw new Error('Domain not found');
        }

        return {
            id: domain.id,
            name: domain.name,
            fileCount: domain.fileCount,
            createdAt: domain.createdAt,
            isSelected: this.selectedDomain === domainId
        };
    }

    getAllDomains() {
        return Array.from(this.domains.values());
    }
}

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
                <div class="domain-actions">
                <button class="edit-button">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="delete-button">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
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
    // Domain Checkboxes
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

    // Domain Cards
    document.querySelectorAll('.domain-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Don't trigger if clicking edit or delete buttons
            if (e.target.closest('.edit-button') || e.target.closest('.delete-button')) {
                return;
            }

            // Don't trigger if clicking inside an input field (during edit)
            if (e.target.closest('.domain-name-input-wrapper')) {
                return;
            }

            const checkbox = this.querySelector('.domain-checkbox');
            const isChecked = checkbox.checked;

            // Uncheck all other checkboxes
            document.querySelectorAll('.domain-checkbox').forEach(cb => {
                cb.checked = false;
            });

            // Toggle this checkbox
            checkbox.checked = !isChecked;
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

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function () {
            const domainCard = this.closest('.domain-card');
            const domainInfo = domainCard.querySelector('.domain-info');
            const domainNameElement = domainInfo.querySelector('h6');
            const currentName = domainNameElement.getAttribute('title') || domainNameElement.textContent;
            const currentDisplay = domainNameElement.textContent;

            // Create wrapper for input and buttons
            const wrapper = document.createElement('div');
            wrapper.className = 'domain-name-input-wrapper';

            // Create input element
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'domain-name-input';
            input.value = currentName;
            input.maxLength = MAX_DOMAIN_NAME_LENGTH;

            // Create confirm/cancel buttons container
            const actionButtons = document.createElement('div');
            actionButtons.className = 'domain-edit-actions';
            actionButtons.innerHTML = `
            <button class="edit-confirm-button" title="Confirm">
                <i class="bi bi-check"></i>
            </button>
            <button class="edit-cancel-button" title="Cancel">
                <i class="bi bi-x"></i>
            </button>
        `;

            // Add input and buttons to wrapper
            wrapper.appendChild(input);
            wrapper.appendChild(actionButtons);

            // Replace h6 with wrapper
            domainNameElement.replaceWith(wrapper);
            input.focus();

            function handleConfirm() {
                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    const displayName = newName.length > MAX_DOMAIN_NAME_LENGTH
                        ? newName.substring(0, MAX_DOMAIN_NAME_LENGTH) + '...'
                        : newName;

                    const newH6 = document.createElement('h6');
                    newH6.textContent = displayName;
                    newH6.title = newName;
                    wrapper.replaceWith(newH6);

                    // Update domain id if it was selected
                    if (domainCard === selectedDomainCard) {
                        const sidebarDomainText = document.querySelector('.selected-domain-text');
                        if (sidebarDomainText) {
                            sidebarDomainText.textContent = displayName;
                            sidebarDomainText.title = newName;
                        }
                    }
                } else {
                    handleCancel();
                }
            }

            function handleCancel() {
                const newH6 = document.createElement('h6');
                newH6.textContent = currentDisplay;
                newH6.title = currentName;
                wrapper.replaceWith(newH6);
            }

            // Attach event listeners
            wrapper.querySelector('.edit-confirm-button').addEventListener('click', handleConfirm);
            wrapper.querySelector('.edit-cancel-button').addEventListener('click', handleCancel);

            // Handle enter key for confirm
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });

            // Handle escape key for cancel
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                }
            });

            // Stop propagation to prevent unwanted behaviors
            input.addEventListener('click', (e) => e.stopPropagation());
            actionButtons.addEventListener('click', (e) => e.stopPropagation());
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
    const selectedDomain = selectedDomainCard;
    if (!selectedDomain || !files.length) return;

    const domainId = selectedDomain.dataset.domainId;
    const sidebarFileList = document.getElementById('sidebarFileList');
    if (!sidebarFileList) return;

    // Get or create the array for this domain
    let domainFileArray = domainFiles.get(domainId);
    if (!domainFileArray) {
        domainFileArray = [];
        domainFiles.set(domainId, domainFileArray);
    }

    // Add new files to the domain's file array and display them
    Array.from(files).forEach(file => {
        // Store file information
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
        domainFileArray.push(fileInfo);

        // Display in sidebar
        displayFileInSidebar(fileInfo, sidebarFileList, domainId);
    });

    updateFileMenuPosition();
    updateDomainFileCount();
}
function displayFileInSidebar(file, sidebarFileList, domainId) {
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
        <div class="d-flex align-items-center w-100">
    <div class="icon-container">
        <i class="bi ${icon} file-icon sidebar-file-list-icon" style="color:#10B981"></i>
        <button class="delete-file-btn">
            <i class="bi bi-trash"></i>
        </button>
        <div class="delete-confirm-actions">
            <button class="confirm-delete-btn" title="Confirm delete">
                <i class="bi bi-check"></i>
            </button>
            <button class="cancel-delete-btn" title="Cancel delete">
                <i class="bi bi-x"></i>
            </button>
        </div>
    </div>
    <span class="file-name" title="${file.name}">${displayName}</span>
    <div class="checkbox-wrapper">
        <input type="checkbox" class="file-checkbox" id="file-${generateFileId()}">
        <label class="checkbox-label" for="file-${generateFileId()}"></label>
    </div>
    </div>
    `;

    // Add delete handler
    const deleteBtn = fileItem.querySelector('.delete-file-btn');
    const confirmActions = fileItem.querySelector('.delete-confirm-actions');
    const confirmBtn = fileItem.querySelector('.confirm-delete-btn');
    const cancelBtn = fileItem.querySelector('.cancel-delete-btn');

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBtn.classList.add('confirming');
        confirmActions.classList.add('show');
    });

    confirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove file from domainFiles Map
        const domainFileArray = domainFiles.get(domainId);
        if (domainFileArray) {
            const index = domainFileArray.findIndex(f => f.name === file.name);
            if (index !== -1) {
                domainFileArray.splice(index, 1);
            }
        }
        fileItem.remove();
        updateFileMenuPosition();
        updateDomainFileCount();
    });

    cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBtn.classList.remove('confirming');
        confirmActions.classList.remove('show');
    });

    // Close confirmation on clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-file-btn') && 
            !e.target.closest('.delete-confirm-actions')) {
            deleteBtn.classList.remove('confirming');
            confirmActions.classList.remove('show');
        }
    });

    sidebarFileList.appendChild(fileItem);
}
function setupFileActionHandlers(fileItem) {
    const actionDots = fileItem.querySelector('.bi-three-dots-vertical');
    const menu = fileItem.querySelector('.action-menu');
    const renameAction = fileItem.querySelector('.rename-action');
    const deleteAction = fileItem.querySelector('.delete-action');

    actionDots.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    renameAction.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileName = fileItem.querySelector('.file-name');
        const currentName = fileName.textContent;
        const domainFileArray = domainFiles.get(domainId);

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

                // Update file name in domainFiles
                const fileIndex = domainFileArray.findIndex(f => f.name === currentName);
                if (fileIndex !== -1) {
                    domainFileArray[fileIndex].name = newName;
                }
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
            const fileName = fileItem.querySelector('.file-name').textContent;
            const domainFileArray = domainFiles.get(domainId);

            // Remove file from domainFiles array
            const fileIndex = domainFileArray.findIndex(f => f.name === fileName);
            if (fileIndex !== -1) {
                domainFileArray.splice(fileIndex, 1);
            }

            fileItem.remove();
            updateFileMenuPosition();
            updateDomainFileCount();
        }
        menu.classList.remove('show');
    });
}
function handleDomainSelection(domainCard) {
    selectedDomainCard = domainCard;
    const domainId = domainCard.dataset.domainId;
    const selectedDomainName = domainCard.querySelector('h6').textContent;

    // Update sidebar domain text
    const sidebarDomainText = document.querySelector('.selected-domain-text');
    if (sidebarDomainText) {
        sidebarDomainText.textContent = selectedDomainName;
        sidebarDomainText.title = selectedDomainName;
    }

    // Clear and update sidebar file list
    const sidebarFileList = document.getElementById('sidebarFileList');
    if (sidebarFileList) {
        sidebarFileList.innerHTML = '';

        // Get files for selected domain
        const domainFileArray = domainFiles.get(domainId) || [];
        domainFileArray.forEach(file => {
            displayFileInSidebar(file, sidebarFileList, domainId);
        });
    }

    updateFileMenuPosition();
    updateDomainFileCount();
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
function updateDomainFileCount() {
    const selectedDomain = selectedDomainCard;
    if (!selectedDomain) return;

    const domainId = selectedDomain.dataset.domainId;
    const domainFileArray = domainFiles.get(domainId) || [];
    const currentFileCount = domainFileArray.length;

    // Update domain card file count
    const fileCountElement = selectedDomain.querySelector('.file-count');
    if (fileCountElement) {
        fileCountElement.textContent = `${currentFileCount} files`;
    }

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
    const sidebarContainer = document.querySelector('.sidebar-container');
    const menuTrigger = document.querySelector('.menu-trigger');
    const resourcesTrigger = document.querySelector('.resources-trigger');
    const resourcesContainer = document.querySelector('.resources-container');
    const backdrop = document.createElement('div');

    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);

    let timeout;
    if (resourcesTrigger && resourcesContainer) {
        resourcesTrigger.addEventListener('click', () => {
            resourcesContainer.classList.toggle('show');
            
            // Backdrop kontrolü
            if (resourcesContainer.classList.contains('show')) {
                backdrop.classList.add('show');
                document.body.style.overflow = 'hidden';
            } else {
                backdrop.classList.remove('show');
                document.body.style.overflow = '';
            }
        });

        // Backdrop'a tıklandığında resources'ı kapat
        backdrop.addEventListener('click', () => {
            resourcesContainer.classList.remove('show');
            backdrop.classList.remove('show');
            document.body.style.overflow = '';
        });

        // Escape tuşu ile kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && resourcesContainer.classList.contains('show')) {
                resourcesContainer.classList.remove('show');
                backdrop.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    function toggleSidebar() {
        sidebarContainer.classList.toggle('open');
        backdrop.classList.toggle('show');
        document.body.style.overflow = sidebarContainer.classList.contains('open') ? 'hidden' : '';
    }

    function showSidebar() {
        if (window.innerWidth >= 992) {
            clearTimeout(timeout);
            sidebarContainer.classList.add('open');
        }
    }

    function hideSidebar() {
        if (window.innerWidth >= 992) {
            timeout = setTimeout(() => {
                if (!sidebarContainer.matches(':hover')) {
                    sidebarContainer.classList.remove('open');
                }
            }, 300);
        }
    }

    // Mobile click handler
    menuTrigger.addEventListener('click', () => {
        if (window.innerWidth < 992) {
            toggleSidebar();
        }
    });

    // Desktop hover handlers
    if (window.innerWidth >= 992) {
        menuTrigger.addEventListener('mouseenter', showSidebar);
        menuTrigger.addEventListener('mouseleave', hideSidebar);
        sidebarContainer.addEventListener('mouseenter', showSidebar);
        sidebarContainer.addEventListener('mouseleave', hideSidebar);
    }

    // Backdrop click handler
    backdrop.addEventListener('click', () => {
        sidebarContainer.classList.remove('open');
        backdrop.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Handle menu icon rotation on mobile
    if (window.innerWidth < 992) {
        const menuIcon = menuTrigger.querySelector('.bi-list');
        if (menuIcon) {
            menuTrigger.addEventListener('click', () => {
                if (sidebarContainer.classList.contains('open')) {
                    menuIcon.style.transform = 'rotate(45deg)';
                } else {
                    menuIcon.style.transform = 'rotate(0)';
                }
            });
        }
    }

    // Update on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            backdrop.classList.remove('show');
            document.body.style.overflow = '';
            menuTrigger.querySelector('.bi-list').style.transform = 'rotate(0)';
        }
    });
    
    // Feedback 
    const feedbackLink = document.querySelector('.bottom-links a[href="#"]:not(.premium-link)');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeButtons = feedbackModal.querySelectorAll('.close-modal, .btn-cancel');
    const feedbackForm = document.getElementById('feedback-form');

    feedbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        feedbackModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
    
    // Hide modal
    function hideModal() {
        feedbackModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // Close modal with buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', hideModal);
    });
    
    // Close modal when clicking outside
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            hideModal();
        }
    });
    
    // Handle form submission
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        hideModal();
    });

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
    document.querySelector('.select-button').addEventListener('click', function () {
        const selectedCheckbox = document.querySelector('.domain-checkbox:checked');
        if (selectedCheckbox) {
            const domainCard = selectedCheckbox.closest('.domain-card');
            handleDomainSelection(domainCard);
            bootstrap.Modal.getInstance(document.getElementById('domainSelectModal')).hide();
        }
    });
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
        userSection.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!userSection.contains(e.target)) {
                userSection.classList.remove('active');
            }
        });

        // Handle menu items click
        const menuItems = userSection.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
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
    // Alert Message For Premium Button
    const premiumLink = document.querySelector('.premium-link');
    const premiumAlert = document.getElementById('premiumAlert');
    const alertButton = premiumAlert.querySelector('.alert-button');

    premiumLink.addEventListener('click', function (e) {
        e.preventDefault();
        premiumAlert.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    alertButton.addEventListener('click', function () {
        premiumAlert.classList.remove('show');
        document.body.style.overflow = '';
    });

    premiumAlert.addEventListener('click', function (e) {
        if (e.target === premiumAlert) {
            premiumAlert.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    // Global click handler for closing action menus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.file-actions')) {
        }
    });

    // Initialize domains
    initializeDomains();
});
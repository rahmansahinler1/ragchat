// Core Event System
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

// Base Component
class Component {
    constructor(element) {
        this.element = element;
        this.events = new EventEmitter();
    }

    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    }

    destroy() {
        this.element.remove();
    }
}

// Domain Card Component
class DomainCard extends Component {
    constructor(domainData) {
        const element = document.createElement('div');
        element.className = 'domain-card';
        super(element);
        
        this.data = domainData;
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <div class="domain-content">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="${this.data.id}" class="domain-checkbox">
                    <label for="${this.data.id}" class="checkbox-label"></label>
                </div>
                <div class="domain-info">
                    <h6 title="${this.data.name}">${this.data.name}</h6>
                    <span class="file-count">${this.data.fileCount || 0} files</span>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const checkbox = this.element.querySelector('.domain-checkbox');
        checkbox.addEventListener('change', () => {
            this.events.emit('selected', {
                id: this.data.id,
                selected: checkbox.checked
            });
        });
    }

    setSelected(selected) {
        const checkbox = this.element.querySelector('.domain-checkbox');
        checkbox.checked = selected;
    }
}

// Domain Manager (Storage)
class DomainManager {
    constructor() {
        this.domains = new Map();
        this.selectedDomainId = null;
        this.events = new EventEmitter();
    }

    addDomain(domain) {
        const domainCard = new DomainCard(domain);
        this.domains.set(domain.id, {
            data: domain,
            component: domainCard
        });

        domainCard.events.on('selected', ({id, selected}) => {
            if (selected) {
                this.selectDomain(id);
            }
        });

        return domainCard;
    }

    selectDomain(domainId) {
        // Deselect previous
        if (this.selectedDomainId) {
            const previous = this.domains.get(this.selectedDomainId);
            if (previous) {
                previous.component.setSelected(false);
            }
        }

        // Select new
        const domain = this.domains.get(domainId);
        if (domain) {
            domain.component.setSelected(true);
            this.selectedDomainId = domainId;
            this.events.emit('domainSelected', domain.data);
        }
    }
}

// Sidebar Component
class Sidebar extends Component {
    constructor() {
        const element = document.createElement('div');
        element.className = 'sidebar-container';
        super(element);
        
        this.isOpen = false;
        this.timeout = null;
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <div class="sidebar d-flex flex-column flex-shrink-0 h-100">
                <div class="top-header py-3 px-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-3">
                            <h1 class="logo-text m-0 d-xl-block">ragchat</h1>
                        </div>
                    </div>
                </div>
                <div class="px-4 py-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-folder empty-folder"></i>
                            <span class="d-xl-block selected-domain-text">Select Domain</span>
                        </div>
                        <i class="bi bi-gear settings-icon"></i>
                    </div>

                    <div class="file-list-container">
                        <div id="sidebarFileList" class="sidebar-files">
                        </div>
                    </div>
                    <div class="file-add">
                        <button class="open-file-btn">
                            Open File Menu
                        </button>
                        <p class="helper-text">
                            Select your domain and start adding files with file menu
                        </p>
                    </div>
                </div>

                <div class="bottom-section mt-auto">
                    <div class="text-center mb-3">
                        <span class="plan-badge d-xl-block">Free Plan</span>
                    </div>
                    <div class="user-section d-flex align-items-center gap-3 mb-3" role="button" id="userProfileMenu">
                        <div class="user-avatar">i</div>
                        <div class="user-info d-xl-block">
                            <div class="user-email">ibrahimyasing@gmail.com</div>
                            <div class="user-status">
                                <span class="status-dot"></span>
                                Active
                            </div>
                        </div>
                        <div class="user-menu">
                            <div class="menu-item">
                                <i class="bi bi-person-circle"></i>
                                Profile
                            </div>
                            <div class="menu-item">
                                <i class="bi bi-gear"></i>
                                Settings
                            </div>
                            <div class="menu-divider"></div>
                            <div class="menu-item logout-item">
                                <i class="bi bi-box-arrow-right"></i>
                                Logout
                            </div>
                        </div>
                    </div>
                    <div class="bottom-links justify-content-center">
                        <a href="#" class="premium-link">Go Premium!</a>
                        <a href="#">Feedback</a>
                    </div>
                </div>
                <div id="sidebar-seperator"></div>
            </div>
        `;

        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(this.backdrop);
    }

    setupEventListeners() {
        // Existing event listeners
        const settingsIcon = this.element.querySelector('.settings-icon');
        settingsIcon.addEventListener('click', () => {
            this.events.emit('settingsClick');
        });
    
        const fileMenuBtn = this.element.querySelector('.open-file-btn');
        fileMenuBtn.addEventListener('click', () => {
            this.events.emit('fileMenuClick');
        });
    
        this.backdrop.addEventListener('click', () => {
            this.toggle(false);
        });
    
        // Add hover handlers for desktop
        if (window.innerWidth >= 992) {
            // Menu trigger hover
            const menuTrigger = document.querySelector('.menu-trigger');
            if (menuTrigger) {
                menuTrigger.addEventListener('mouseenter', () => {
                    console.log('Menu trigger hover');
                    clearTimeout(this.timeout);
                    this.toggle(true);
                });
    
                menuTrigger.addEventListener('mouseleave', () => {
                    this.timeout = setTimeout(() => {
                        if (!this.element.matches(':hover')) {
                            this.toggle(false);
                        }
                    }, 300);
                });
            }
    
            // Sidebar hover
            this.element.addEventListener('mouseenter', () => {
                console.log('Sidebar hover');
                clearTimeout(this.timeout);
                this.toggle(true);
            });
    
            this.element.addEventListener('mouseleave', () => {
                this.timeout = setTimeout(() => {
                    if (!document.querySelector('.menu-trigger')?.matches(':hover')) {
                        this.toggle(false);
                    }
                }, 300);
            });
        }
    
        // Mobile menu trigger handler
        this.events.on('menuTrigger', () => {
            if (window.innerWidth < 992) {
                const menuIcon = document.querySelector('.menu-trigger .bi-list');
                if (menuIcon) {
                    menuIcon.style.transform = this.isOpen ? 'rotate(0)' : 'rotate(45deg)';
                }
                this.toggle();
            }
        });
    
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992) {
                this.backdrop.classList.remove('show');
                document.body.style.overflow = '';
                const menuIcon = document.querySelector('.menu-trigger .bi-list');
                if (menuIcon) {
                    menuIcon.style.transform = 'rotate(0)';
                }
            }
        });

        // User Profile Menu
        const userSection = this.element.querySelector('#userProfileMenu');
        if (userSection) {
            userSection.addEventListener('click', (e) => {
                e.stopPropagation();
                userSection.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!userSection.contains(e.target)) {
                    userSection.classList.remove('active');
                }
            });

            // Handle menu items
            userSection.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (item.classList.contains('logout-item')) {
                        // Handle logout logic here
                        console.log('Logging out...');
                    }
                    userSection.classList.remove('active');
                });
            });
        }

        // Premium and Feedback links
        const premiumLink = this.element.querySelector('.premium-link');
        if (premiumLink) {
            premiumLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.events.emit('premiumClick');
            });
        }

        const feedbackLink = this.element.querySelector('.bottom-links a:not(.premium-link)');
        if (feedbackLink) {
            feedbackLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.events.emit('feedbackClick');
            });
        }
    }

    toggle(force = null) {
        this.isOpen = force !== null ? force : !this.isOpen;
        this.element.classList.toggle('open', this.isOpen);
        this.backdrop.classList.toggle('show', this.isOpen);
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    updateDomainSelection(domain) {
        const domainText = this.element.querySelector('.selected-domain-text');
        const folderIcon = this.element.querySelector('.bi-folder');
        
        if (domain) {
            domainText.textContent = domain.name;
            domainText.title = domain.name;
            folderIcon.classList.remove('empty-folder');
        } else {
            domainText.textContent = 'Select Domain';
            domainText.removeAttribute('title');
            folderIcon.classList.add('empty-folder');
        }
    }

    updateFileList(files = []) {
        const fileList = this.element.querySelector('#sidebarFileList');
        fileList.innerHTML = '';
        
        files.forEach(file => {
            // Add file to sidebar list
            const fileItem = this.createFileListItem(file);
            fileList.appendChild(fileItem);
        });

        this.updateFileMenuVisibility();
    }

    createFileListItem(file) {
        const fileItem = document.createElement('li');
        // File item HTML structure...
        return fileItem;
    }

    updateFileMenuVisibility() {
        const fileList = this.element.querySelector('#sidebarFileList');
        const helperText = this.element.querySelector('.helper-text');
        const fileMenuBtn = this.element.querySelector('.open-file-btn');
        const fileListContainer = this.element.querySelector('.file-list-container');

        if (fileList.children.length > 0) {
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

    
}

// Update App class to include Sidebar
class App {
    constructor() {
        this.domainManager = new DomainManager();
        this.sidebar = new Sidebar();
        this.events = new EventEmitter();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for domain selection
        this.domainManager.events.on('domainSelected', (domain) => {
            this.sidebar.updateDomainSelection(domain);
            // Update file list when domain is selected
            const files = []; // Get files for selected domain
            this.sidebar.updateFileList(files);
        });

        // Listen for sidebar events
        this.sidebar.events.on('settingsClick', () => {
            // Open domain settings modal
            console.log('Open domain settings');
        });

        this.sidebar.events.on('fileMenuClick', () => {
            // Open file upload modal
            console.log('Open file menu');
        });
    }

    init() {
        // Add sidebar to DOM
        document.body.appendChild(this.sidebar.element);

        // Setup menu trigger
        const menuTrigger = document.querySelector('.menu-trigger');
        if (menuTrigger) {
            menuTrigger.addEventListener('click', () => {
                this.sidebar.events.emit('menuTrigger');
            });
        }

        // Initialize with test data
        const testDomain = {
            id: '1',
            name: 'Test Domain',
            fileCount: 0
        };

        const domainContainer = document.getElementById('domainsContainer');
        const domainCard = this.domainManager.addDomain(testDomain);
        domainContainer.appendChild(domainCard.element);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
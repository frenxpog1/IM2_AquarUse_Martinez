// Shared Utilities and Constants
window.AppUtils = {
    // Service prices
    servicePrices: {
        'Regular Laundry': 60,
        'Wash and Fold': 65,
        'Dry Cleaning': 250,
        'Iron and Press': 70
    },

    // Supply consumption per service
    supplyConsumption: {
        'Regular Laundry': { detergent: 1, softener: 1, bleach: 1, fragrance: 1, stain_remover: 1, steam_water: 0, garment_bag: 0 },
        'Wash and Fold': { detergent: 1, softener: 1, bleach: 1, fragrance: 1, stain_remover: 1, steam_water: 0, garment_bag: 1 },
        'Dry Cleaning': { detergent: 0, softener: 0, bleach: 0, fragrance: 1, stain_remover: 1, steam_water: 0, garment_bag: 1 },
        'Iron and Press': { detergent: 0, softener: 0, bleach: 0, fragrance: 1, stain_remover: 0, steam_water: 1, garment_bag: 0 }
    },

    // Supply labels
    supplyLabels: {
        detergent: 'Detergent',
        softener: 'Softener',
        bleach: 'Bleach',
        fragrance: 'Fragrance',
        stain_remover: 'Stain Remover',
        steam_water: 'Steam Water',
        garment_bag: 'Garment Bag'
    },

    // Format date utility
    formatDate(inputDate) {
        if (!inputDate) return '';
        const date = new Date(inputDate);
        const options = { month: 'long', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    // Get status class and text
    getStatusClassAndText(statusValue) {
        if (statusValue === 'pending') return { class: 'pending', text: 'Pending' };
        if (statusValue === 'ongoing') return { class: 'ongoing', text: 'Ongoing' };
        if (statusValue === 'complete') return { class: 'completed', text: 'Complete' };
        return { class: 'pending', text: 'Pending' };
    },

    // Get stock status
    getStockStatus(qty) {
        if (qty >= 6) return { text: 'In Stock', class: 'in-stock' };
        if (qty >= 1) return { text: 'Low Stock', class: 'low-stock' };
        return { text: 'No Stock', class: 'no-stock' };
    },

    // Modal utilities
    setupModalClose(modalOverlay) {
        if (!modalOverlay) return;

        // Close on overlay click
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    },

    // Setup global escape key handler for all modals
    setupGlobalModalClose() {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                // Close all visible modals
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => {
                    if (!modal.classList.contains('hidden')) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add logo and message
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-logo">
                    <img src="assets/logo.png" alt="Logo" class="notification-logo-img">
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to container
        notificationContainer.appendChild(notification);

        // Auto remove after 4 seconds
        const autoRemove = setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);

        // Manual close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            notification.remove();
        });

        // Slide in animation
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 100);
    },

    // Pagination utility
    createPagination(container, items, currentPage, itemsPerPage, onPageChange) {
        const totalPages = Math.ceil(items.length / itemsPerPage);
        
        if (totalPages <= 1) {
            // Remove existing pagination if not needed
            const existingPagination = container.querySelector('.supply-pagination');
            if (existingPagination) {
                existingPagination.remove();
            }
            return;
        }

        // Remove existing pagination
        const existingPagination = container.querySelector('.supply-pagination');
        if (existingPagination) {
            existingPagination.remove();
        }

        const pagination = document.createElement('div');
        pagination.className = 'supply-pagination';

        let paginationHTML = '<div class="supply-pagination-info supply-prev">< Previous</div><div class="supply-pagination-controls">';
        
        // Show up to 4 page numbers
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, startPage + 3);
        
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? ' active' : '';
            paginationHTML += `<div class="supply-pagination-btn${activeClass}" data-page="${i}">${i}</div>`;
        }
        
        paginationHTML += '</div><div class="supply-pagination-info supply-next">Next ></div>';
        pagination.innerHTML = paginationHTML;
        
        container.appendChild(pagination);

        // Add event listeners
        pagination.querySelectorAll('.supply-pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                onPageChange(page);
            });
        });

        pagination.querySelector('.supply-prev')?.addEventListener('click', () => {
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        });

        pagination.querySelector('.supply-next')?.addEventListener('click', () => {
            if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
            }
        });
    },

    // Get paginated items
    getPaginatedItems(items, currentPage, itemsPerPage) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    },

    // Search functionality
    setupSearch(searchInputId, searchCallback) {
        const searchInput = document.getElementById(searchInputId);
        if (!searchInput) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();
                searchCallback(query);
            }, 300); // Debounce search
        });

        // Clear search on escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchCallback('');
            }
        });
    },

    // Generic search filter function
    filterItems(items, query, searchFields) {
        if (!query) return items;
        
        return items.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(query);
                }
                if (typeof value === 'number') {
                    return value.toString().includes(query);
                }
                return false;
            });
        });
    }
};

// Global data store
window.AppData = {
    orders: [],
    customers: [],
    staff: [],
    supplies: {
        detergent: 15,
        softener: 15,
        bleach: 15,
        fragrance: 15,
        stain_remover: 15,
        steam_water: 15,
        garment_bag: 15
    },
    orderIdCounter: 1,

    // Save data to localStorage
    save() {
        localStorage.setItem('laundryAppData', JSON.stringify({
            orders: this.orders,
            customers: this.customers,
            staff: this.staff,
            supplies: this.supplies,
            orderIdCounter: this.orderIdCounter
        }));
    },

    // Load data from localStorage
    load() {
        const saved = localStorage.getItem('laundryAppData');
        if (saved) {
            const data = JSON.parse(saved);
            this.orders = data.orders || [];
            this.customers = data.customers || [];
            this.staff = data.staff || [];
            this.supplies = data.supplies || this.supplies;
            this.orderIdCounter = data.orderIdCounter || 1;
        }
    }
};

// Load data on initialization
window.AppData.load();
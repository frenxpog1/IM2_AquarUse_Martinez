// Main Application Controller
class LaundryApp {
  constructor() {
    this.userEmail = localStorage.getItem('userEmail');
    this.init();
  }

  init() {
    this.initializeElements();
    this.setupNavigation();
    this.setupUserPermissions();
    window.AppUtils.setupGlobalModalClose();
    this.showSection('dashboard');
  }

  initializeElements() {
    // Section elements
    this.sections = {
      dashboard: document.getElementById('dashboard-section'),
      orders: document.getElementById('orders-section'),
      customers: document.getElementById('customers-section'),
      supplies: document.getElementById('supplies-section'),
      staff: document.getElementById('staff-section'),
      accounts: document.getElementById('accounts-section'),
      sales: document.getElementById('sales-section')
    };

    // Navigation elements
    this.navElements = {
      dashboard: document.getElementById('nav-dashboard'),
      orders: document.getElementById('nav-orders'),
      customers: document.getElementById('nav-customers'),
      supplies: document.getElementById('nav-supplies'),
      staff: document.getElementById('nav-staff'),
      accounts: document.getElementById('nav-accounts'),
      sales: document.getElementById('nav-sales')
    };

    this.sidebarBtns = document.querySelectorAll('.sidebar-btn');
  }

  setupUserPermissions() {
    if (this.userEmail === 'admin@aquaruse') {
      if (this.navElements.accounts) this.navElements.accounts.style.display = '';
      if (this.navElements.sales) this.navElements.sales.style.display = '';
      
      if (this.navElements.staff) {
        const children = Array.from(this.navElements.staff.childNodes);
        for (let i = 0; i < children.length; i++) {
          if (children[i].nodeType === Node.TEXT_NODE && children[i].textContent.includes('Staff')) {
            children[i].textContent = children[i].textContent.replace('Staff', 'Admin');
          }
        }
      }
    }
  }

  setupNavigation() {
    // Dashboard navigation
    this.navElements.dashboard?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('dashboard');
      if (window.dashboardModule) window.dashboardModule.render();
    });

    // Orders navigation
    this.navElements.orders?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('orders');
      console.log('Orders navigation clicked');
      if (window.ordersModule) {
        console.log('Orders module found, calling render');
        window.ordersModule.render();
      } else {
        console.log('Orders module not found');
      }
    });

    // Customers navigation
    this.navElements.customers?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('customers');
      if (window.customersModule) window.customersModule.render();
    });

    // Supplies navigation
    this.navElements.supplies?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('supplies');
      if (window.suppliesModule) window.suppliesModule.render();
    });

    // Staff navigation
    this.navElements.staff?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('staff');
      if (window.staffModule) window.staffModule.render();
    });

    // Accounts navigation
    this.navElements.accounts?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('accounts');
      if (window.accountsModule) window.accountsModule.render();
    });

    // Sales navigation
    this.navElements.sales?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSection('sales');
      if (window.salesModule) window.salesModule.render();
    });
  }

  showSection(sectionName) {
    // Hide all sections
    Object.values(this.sections).forEach(section => {
      if (section) section.style.display = 'none';
    });

    // Show selected section
    if (this.sections[sectionName]) {
      this.sections[sectionName].style.display = '';
    }

    // Update active navigation
    this.sidebarBtns.forEach(btn => btn.classList.remove('active'));
    if (this.navElements[sectionName]) {
      this.navElements[sectionName].classList.add('active');
    }
  }
}

// Global app instance
window.laundryApp = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.laundryApp = new LaundryApp();
});
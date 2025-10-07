// Staff Module
class StaffModule {
  constructor() {
    this.staffList = document.getElementById('staff-list');
    this.currentPage = 1;
    this.itemsPerPage = 5;
    this.init();
  }

  init() {
    this.setupStaffModal();
    this.setupSearch();
  }

  setupSearch() {
    window.AppUtils.setupSearch('staff-search', (query) => {
      this.searchQuery = query;
      this.currentPage = 1; // Reset to first page
      this.render();
    });
  }

  setupStaffModal() {
    const addStaffBtn = document.getElementById('addStaffBtn');
    const staffModalOverlay = document.getElementById('staffModalOverlay');
    const staffModalForm = document.querySelector('#staffModalOverlay .modal-form');
    const staffModalClose = document.getElementById('staffModalClose');

    if (!addStaffBtn || !staffModalOverlay || !staffModalForm) return;

    // Add staff button click
    addStaffBtn.addEventListener('click', () => {
      staffModalOverlay.classList.remove('hidden');
      staffModalForm.reset();
    });

    // Close button click
    if (staffModalClose) {
      staffModalClose.addEventListener('click', () => {
        staffModalOverlay.classList.add('hidden');
      });
    }

    // Modal close setup
    window.AppUtils.setupModalClose(staffModalOverlay);

    // Form submission
    staffModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleStaffFormSubmission(staffModalForm);
    });
  }

  handleStaffFormSubmission(form) {
    const formData = {
      staffName: document.getElementById('staffName')?.value?.trim(),
      staffEmail: document.getElementById('staffEmail')?.value?.trim(),
      staffPhone: document.getElementById('staffPhone')?.value?.trim(),
      staffPassword: document.getElementById('staffPassword')?.value?.trim()
    };

    // Validation
    if (!formData.staffName || !formData.staffEmail || !formData.staffPhone || !formData.staffPassword) {
      window.AppUtils.showNotification('Please fill in all required fields');
      return;
    }

    // Create new staff member
    const newStaff = {
      id: window.AppUtils.generateId(),
      name: formData.staffName,
      email: formData.staffEmail,
      phone: formData.staffPhone,
      password: formData.staffPassword // Store password for login
    };

    window.AppData.staff.push(newStaff);
    window.AppData.save();

    // Update display
    this.render();

    // Close modal and reset form
    document.getElementById('staffModalOverlay').classList.add('hidden');
    form.reset();

    window.AppUtils.showNotification('Staff member added successfully!');
  }

  render() {
    if (!this.staffList) return;

    this.staffList.innerHTML = '';

    // Apply search filter
    let filteredStaff = window.AppData.staff;
    if (this.searchQuery) {
      filteredStaff = window.AppUtils.filterItems(window.AppData.staff, this.searchQuery, ['name', 'email', 'phone']);
    }

    if (filteredStaff.length === 0) {
      this.staffList.innerHTML = '<div class="orders-empty-center">No staff members found.</div>';
      return;
    }

    // Get paginated staff
    const paginatedStaff = window.AppUtils.getPaginatedItems(filteredStaff, this.currentPage, this.itemsPerPage);

    const table = document.createElement('table');
    table.className = 'staff-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone Number</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    paginatedStaff.forEach((staff) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${staff.name || ''}</td>
        <td>${staff.email || ''}</td>
        <td>${staff.phone || ''}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    this.staffList.appendChild(table);

    // Add pagination
    window.AppUtils.createPagination(
      this.staffList.parentElement,
      filteredStaff,
      this.currentPage,
      this.itemsPerPage,
      (page) => {
        this.currentPage = page;
        this.render();
      }
    );
  }
}

// Initialize staff module
window.staffModule = new StaffModule();
// Orders Module
class OrdersModule {
  constructor() {
    this.ordersList = document.getElementById('orders-list');
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.itemsPerPage = 5;
    this.init();
    // Force initial render
    setTimeout(() => this.render(), 100);
  }

  init() {
    this.setupOrderModal();
    this.setupFilters();
    this.setupSearch();
  }

  setupSearch() {
    window.AppUtils.setupSearch('orders-search', (query) => {
      this.searchQuery = query;
      this.currentPage = 1; // Reset to first page
      this.render();
    });
  }

  setupFilters() {
    // Setup order filter tabs
    const orderTabs = document.querySelectorAll('.orders-table-header .table-tab');
    orderTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        orderTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Set filter based on tab text
        const tabText = tab.textContent.toLowerCase();
        if (tabText.includes('all')) this.currentFilter = 'all';
        else if (tabText.includes('pending')) this.currentFilter = 'pending';
        else if (tabText.includes('ongoing')) this.currentFilter = 'ongoing';
        else if (tabText.includes('completed')) this.currentFilter = 'completed';
        
        // Reset to first page when filter changes
        this.currentPage = 1;
        this.render();
      });
    });
  }

  setupOrderModal() {
    const addOrderBtn = document.getElementById('addOrderBtnOrders');
    const orderModalOverlay = document.getElementById('orderModalOverlay');
    const orderModalForm = document.querySelector('#orderModalOverlay .modal-form');
    const orderModalClose = document.getElementById('orderModalClose');

    if (!addOrderBtn || !orderModalOverlay || !orderModalForm) return;

    // Add order button click
    addOrderBtn.addEventListener('click', () => {
      orderModalOverlay.classList.remove('hidden');
      // Reset form when opening
      orderModalForm.reset();
      // Reset form when opening - no date field in order modal
    });

    // Close button click
    if (orderModalClose) {
      orderModalClose.addEventListener('click', () => {
        orderModalOverlay.classList.add('hidden');
      });
    }

    // Modal close setup
    window.AppUtils.setupModalClose(orderModalOverlay);

    // Auto-calculate remaining balance
    const orderTypeSelect = document.getElementById('orderType');
    const orderLoadCountInput = document.getElementById('orderLoadCount');
    const orderAmountPaidInput = document.getElementById('orderAmountPaid');
    const orderRemainingBalanceInput = document.getElementById('orderRemainingBalance');
    
    const calculateBalance = () => {
      const serviceType = orderTypeSelect?.value;
      const loadCount = parseInt(orderLoadCountInput?.value) || 0;
      const amountPaid = parseFloat(orderAmountPaidInput?.value) || 0;
      
      if (serviceType && loadCount > 0) {
        const basePrice = window.AppUtils.servicePrices[serviceType] || 0;
        const totalAmount = basePrice * loadCount;
        const remainingBalance = Math.max(0, totalAmount - amountPaid);
        
        if (orderRemainingBalanceInput) {
          orderRemainingBalanceInput.value = remainingBalance.toFixed(2);
        }
      }
    };
    
    // Add event listeners for auto-calculation
    if (orderTypeSelect) orderTypeSelect.addEventListener('change', calculateBalance);
    if (orderLoadCountInput) orderLoadCountInput.addEventListener('input', calculateBalance);
    if (orderAmountPaidInput) orderAmountPaidInput.addEventListener('input', calculateBalance);

    // Form submission
    orderModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleOrderFormSubmission(orderModalForm);
    });
  }

  handleOrderFormSubmission(form) {
    const formData = {
      customerName: document.getElementById('orderCustomer')?.value?.trim(),
      customerNumber: document.getElementById('orderCustomerNumber')?.value?.trim(),
      loadCount: document.getElementById('orderLoadCount')?.value,
      orderType: document.getElementById('orderType')?.value,
      amountPaid: document.getElementById('orderAmountPaid')?.value,
      remainingBalance: document.getElementById('orderRemainingBalance')?.value
    };

    // Validation
    if (!formData.customerName || !formData.customerNumber || !formData.loadCount || !formData.orderType || !formData.amountPaid) {
      window.AppUtils.showNotification('Please fill in all required fields');
      return;
    }

    // Validate amounts are positive numbers
    const amountPaid = parseFloat(formData.amountPaid);
    const remainingBalance = parseFloat(formData.remainingBalance);
    const loadCount = parseInt(formData.loadCount);
    
    if (isNaN(amountPaid) || amountPaid < 0) {
      window.AppUtils.showNotification('Please enter a valid amount paid');
      return;
    }
    
    if (isNaN(loadCount) || loadCount <= 0) {
      window.AppUtils.showNotification('Please enter a valid load count');
      return;
    }

    // Calculate total amount (paid + remaining balance)
    const totalAmount = amountPaid + (remainingBalance || 0);

    // Create new order
    const orderId = String(window.AppData.orderIdCounter).padStart(5, '0');
    const newOrder = {
      name: formData.customerName,
      number: formData.customerNumber,
      service: formData.orderType,
      load: loadCount,
      amount: totalAmount.toString(),
      paid: amountPaid.toString(),
      balance: (remainingBalance || 0).toString(),
      orderId: orderId,
      dateValue: new Date().toISOString().split('T')[0], // Today's date
      statusValue: 'pending', // Default status
      notes: '' // No notes field in new design
    };

    window.AppData.orders.push(newOrder);
    window.AppData.orderIdCounter++;
    window.AppData.save();

    // Update displays
    this.render();
    if (window.dashboardModule) window.dashboardModule.render();

    // Close modal and reset form
    document.getElementById('orderModalOverlay').classList.add('hidden');
    form.reset();

    window.AppUtils.showNotification('Order added successfully!');
  }

  getStatusClass(status) {
    if (status === 'pending') return 'order-status pending';
    if (status === 'ongoing') return 'order-status ongoing';
    if (status === 'complete' || status === 'completed') return 'order-status completed';
    return 'order-status';
  }

  createOrderRow(order, index) {
    const row = document.createElement('tr');
    row.className = 'order-row';
    
    const statusClass = this.getStatusClass(order.statusValue).replace('order-status ', '');
    const statusText = order.statusValue ? order.statusValue.charAt(0).toUpperCase() + order.statusValue.slice(1) : '';
    
    row.innerHTML = `
      <td class="customer-cell">${order.name || ''}</td>
      <td class="order-id-cell">#${order.orderId || ''}</td>
      <td class="type-cell">${order.service || ''}</td>
      <td class="date-cell">${window.AppUtils.formatDate(order.dateValue) || ''}</td>
      <td class="status-cell">
        <span class="status-badge ${statusClass}">${statusText}</span>
      </td>
      <td class="amount-cell">₱${order.amount || '0'}</td>
      <td class="actions-cell">
        <button class="download-btn">Download</button>
      </td>
    `;

    row.querySelector('.download-btn').addEventListener('click', () => {
      window.AppUtils.showNotification(`Downloading receipt for order #${order.orderId}`);
    });

    return row;
  }

  editOrder(index) {
    // Use the customer modal for editing (reuse existing functionality)
    if (window.dashboardModule) {
      window.dashboardModule.editOrder(index);
    }
  }

  render() {
    console.log('Orders render called');
    if (!this.ordersList) {
      console.log('Orders list element not found');
      return;
    }

    // Filter orders based on current filter
    let filteredOrders = window.AppData.orders;
    
    if (this.currentFilter !== 'all') {
      filteredOrders = window.AppData.orders.filter(order => 
        order.statusValue === this.currentFilter
      );
    }

    // Apply search filter
    if (this.searchQuery) {
      filteredOrders = window.AppUtils.filterItems(filteredOrders, this.searchQuery, ['name', 'orderId', 'service']);
    }

    if (filteredOrders.length === 0) {
      this.ordersList.innerHTML = '<div class="orders-empty-center">No orders found for this filter.</div>';
      return;
    }

    // Get paginated orders
    const paginatedOrders = window.AppUtils.getPaginatedItems(filteredOrders, this.currentPage, this.itemsPerPage);

    // Create table structure
    const table = document.createElement('table');
    table.className = 'orders-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Customer</th>
        <th>Order ID</th>
        <th>Type</th>
        <th>Date</th>
        <th>Status</th>
        <th>Amount</th>
        <th>Receipt</th>
      </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    
    paginatedOrders.forEach((order, idx) => {
      // Find the original index in the full orders array
      const originalIndex = window.AppData.orders.findIndex(o => o.orderId === order.orderId);
      const row = this.createOrderRow(order, originalIndex);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    
    this.ordersList.innerHTML = '';
    this.ordersList.appendChild(table);

    // Add pagination
    window.AppUtils.createPagination(
      this.ordersList.parentElement,
      filteredOrders,
      this.currentPage,
      this.itemsPerPage,
      (page) => {
        this.currentPage = page;
        this.render();
      }
    );
  }
}

// Initialize orders module
window.ordersModule = new OrdersModule();
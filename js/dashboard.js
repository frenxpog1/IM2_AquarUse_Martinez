// Dashboard Module
class DashboardModule {
  constructor() {
    this.balanceAmountElem = document.getElementById('balance-amount');
    this.unpaidAmountElem = document.getElementById('unpaid-amount');
    this.currentOrderFilter = 'all';
    this.currentSupplyFilter = 'all';
    this.currentOrderPage = 1;
    this.currentSupplyPage = 1;
    this.init();
  }

  init() {
    this.setupCustomerModal();
    this.setupFilters();
    this.setupSearch();
    this.render();
  }

  setupSearch() {
    window.AppUtils.setupSearch('dashboard-search', (query) => {
      this.searchQuery = query;
      this.currentOrderPage = 1; // Reset to first page
      this.renderDashboardOrdersTable();
    });
  }

  setupFilters() {
    // Setup order filter tabs
    const orderTabs = document.querySelectorAll('.orders-table-header .table-tab');
    orderTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        orderTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        // Set filter based on tab text
        const tabText = tab.textContent.toLowerCase();
        if (tabText.includes('all')) this.currentOrderFilter = 'all';
        else if (tabText.includes('pending')) this.currentOrderFilter = 'pending';
        else if (tabText.includes('ongoing')) this.currentOrderFilter = 'ongoing';
        else if (tabText.includes('completed')) this.currentOrderFilter = 'completed';

        // Reset pagination when filter changes
        this.currentOrderPage = 1;
        this.renderDashboardOrdersTable();
      });
    });

    // Setup supply filter tabs
    const supplyTabs = document.querySelectorAll('.supply-tabs .supply-tab');
    supplyTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        supplyTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        // Set filter based on tab text
        const tabText = tab.textContent.toLowerCase();
        if (tabText.includes('all')) this.currentSupplyFilter = 'all';
        else if (tabText.includes('low')) this.currentSupplyFilter = 'low';
        else if (tabText.includes('full')) this.currentSupplyFilter = 'full';

        // Reset pagination when filter changes
        this.currentSupplyPage = 1;
        this.renderDashboardSupplyTable();
      });
    });
  }

  setupCustomerModal() {
    const addOrderBtn = document.getElementById('addOrderBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.querySelector('.modal');
    const modalForm = document.querySelector('.modal-form');
    const modalDeleteBtn = document.getElementById('modalDeleteBtn');

    if (!addOrderBtn || !modalOverlay || !modalForm) return;

    let editingOrderIndex = null;

    // Add order button click
    addOrderBtn.addEventListener('click', () => {
      editingOrderIndex = null;
      modalOverlay.classList.remove('hidden');
      modal.querySelector('h2').textContent = 'New Customer';
      modalForm.querySelector('.modal-add').textContent = 'Add';
      modalForm.reset();
      setTimeout(() => this.updateAmountField(modalForm), 0);
      if (modalDeleteBtn) modalDeleteBtn.style.display = 'none';
    });

    // Modal close setup
    window.AppUtils.setupModalClose(modalOverlay);

    // Form field updates
    modalForm.querySelector('#amount')?.addEventListener('input', () => this.updateBalanceField(modalForm));
    modalForm.querySelector('#paid')?.addEventListener('input', () => this.updateBalanceField(modalForm));
    modalForm.querySelector('#service')?.addEventListener('change', () => this.updateAmountField(modalForm));
    modalForm.querySelector('#load')?.addEventListener('input', () => this.updateAmountField(modalForm));

    // Form submission
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmission(modalForm, editingOrderIndex);
      editingOrderIndex = null;
    });

    // Delete button
    if (modalDeleteBtn) {
      modalDeleteBtn.addEventListener('click', () => {
        if (editingOrderIndex !== null) {
          window.AppData.orders.splice(editingOrderIndex, 1);
          window.AppData.save();
          editingOrderIndex = null;
          modalOverlay.classList.add('hidden');
          this.render();
          if (window.ordersModule) window.ordersModule.render();
        }
      });
    }

    // Store editingOrderIndex for access in other methods
    this.editingOrderIndex = editingOrderIndex;
    this.setEditingIndex = (index) => { editingOrderIndex = index; };
  }

  updateAmountField(modalForm) {
    const service = modalForm.querySelector('#service')?.value;
    const load = parseInt(modalForm.querySelector('#load')?.value, 10) || 0;
    const pricePerKilo = window.AppUtils.servicePrices[service] || 0;
    const amount = pricePerKilo * load;
    const amountField = modalForm.querySelector('#amount');
    if (amountField) {
      amountField.value = amount > 0 ? amount : '';
    }
    this.updateBalanceField(modalForm);
  }

  updateBalanceField(modalForm) {
    const amount = parseInt(modalForm.querySelector('#amount')?.value, 10) || 0;
    const paid = parseInt(modalForm.querySelector('#paid')?.value, 10) || 0;
    const balance = amount - paid;
    const balanceField = modalForm.querySelector('#balance');
    if (balanceField) {
      balanceField.value = balance > 0 ? balance : 0;
    }
  }

  handleFormSubmission(modalForm, editingOrderIndex) {
    const formData = {
      name: modalForm.querySelector('#name')?.value,
      number: modalForm.querySelector('#number')?.value,
      statusValue: modalForm.querySelector('#status')?.value,
      service: modalForm.querySelector('#service')?.value,
      load: parseInt(modalForm.querySelector('#load')?.value, 10) || 0,
      amount: modalForm.querySelector('#amount')?.value,
      paid: modalForm.querySelector('#paid')?.value,
      balance: modalForm.querySelector('#balance')?.value,
      dateValue: modalForm.querySelector('#date')?.value
    };

    // Handle editing existing order
    if (editingOrderIndex !== null) {
      window.AppData.orders[editingOrderIndex] = {
        ...formData,
        orderId: window.AppData.orders[editingOrderIndex].orderId
      };
      window.AppData.save();
      this.render();
      modalForm.reset();
      document.getElementById('modalOverlay').classList.add('hidden');
      return;
    }

    // Check supply availability
    const consumption = window.AppUtils.supplyConsumption[formData.service];
    let canDeduct = true;

    for (const key in consumption) {
      const required = consumption[key] * formData.load;
      if (window.AppData.supplies[key] < required) {
        canDeduct = false;
        break;
      }
    }

    if (!canDeduct) {
      window.AppUtils.showNotification('Not enough supplies in stock for this order. Please check supply levels.');
      return;
    }

    // Deduct supplies
    for (const key in consumption) {
      window.AppData.supplies[key] -= consumption[key] * formData.load;
    }

    // Add new order
    const orderId = String(window.AppData.orderIdCounter).padStart(5, '0');
    window.AppData.orders.push({ ...formData, orderId });
    window.AppData.orderIdCounter++;

    // Update customer data
    let customer = window.AppData.customers.find(c => c.name === formData.name && c.number === formData.number);
    if (customer) {
      customer.status = 'active';
    } else {
      window.AppData.customers.push({ name: formData.name, number: formData.number, status: 'active' });
    }

    window.AppData.save();
    this.render();
    if (window.customersModule) window.customersModule.render();
    if (window.suppliesModule) window.suppliesModule.render();

    modalForm.reset();
    document.getElementById('modalOverlay').classList.add('hidden');
  }

  createOrderCard(data, index) {
    const statusObj = window.AppUtils.getStatusClassAndText(data.statusValue);
    const newCard = document.createElement('div');
    newCard.className = 'order-card';
    newCard.innerHTML = `
      <div class="order-status ${statusObj.class}">${statusObj.text}</div>
      <div class="order-id">#${data.orderId}</div>
      <div class="order-date">${window.AppUtils.formatDate(data.dateValue)}</div>
      <div class="order-main-row">
        <div class="order-main-left">
          <div class="order-name">${data.name}</div>
          <div class="order-type">${data.service}</div>
          <div class="order-price">₱ ${data.amount}</div>
        </div>
        <div class="order-main-right order-card-bottom" style="display:flex;flex-direction:column;align-items:flex-end;gap:0;">
          <div class="order-paid">Paid: ₱ ${data.paid}</div>
          <div class="order-balance">Balance: ₱ ${data.balance}</div>
        </div>
      </div>
      <button class="order-update">Edit</button>
    `;

    newCard.querySelector('.order-update').addEventListener('click', () => {
      this.editOrder(index);
    });

    return newCard;
  }

  editOrder(index) {
    this.setEditingIndex(index);
    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.querySelector('.modal');
    const modalForm = document.querySelector('.modal-form');
    const modalDeleteBtn = document.getElementById('modalDeleteBtn');

    modalOverlay.classList.remove('hidden');
    modal.querySelector('h2').textContent = 'Edit Customer';
    modalForm.querySelector('.modal-add').textContent = 'Update';

    const order = window.AppData.orders[index];
    modalForm.querySelector('#name').value = order.name;
    modalForm.querySelector('#number').value = order.number || '';
    modalForm.querySelector('#status').value = order.statusValue;
    modalForm.querySelector('#service').value = order.service;
    modalForm.querySelector('#load').value = order.load;
    modalForm.querySelector('#amount').value = order.amount;
    modalForm.querySelector('#paid').value = order.paid;
    modalForm.querySelector('#balance').value = order.balance;
    modalForm.querySelector('#date').value = order.dateValue;

    setTimeout(() => this.updateAmountField(modalForm), 0);
    if (modalDeleteBtn) modalDeleteBtn.style.display = '';
  }

  recalculateTotals() {
    let totalAmount = 0;
    let totalUnpaid = 0;

    for (const order of window.AppData.orders) {
      const amt = parseInt(order.amount, 10);
      const unp = parseInt(order.balance, 10);
      if (!isNaN(amt)) totalAmount += amt;
      if (!isNaN(unp)) totalUnpaid += unp;
    }

    if (this.balanceAmountElem) this.balanceAmountElem.textContent = `₱${totalAmount}`;
    if (this.unpaidAmountElem) this.unpaidAmountElem.textContent = `₱${totalUnpaid}`;
  }

  updateStatusCounters() {
    let pending = 0, ongoing = 0, completed = 0;

    for (const order of window.AppData.orders) {
      if (order.statusValue === 'pending') pending++;
      else if (order.statusValue === 'ongoing') ongoing++;
      else if (order.statusValue === 'complete') completed++;
    }

    const statusCounts = document.querySelectorAll('.status-count');
    if (statusCounts.length >= 3) {
      statusCounts[0].textContent = pending;
      statusCounts[1].textContent = ongoing;
      statusCounts[2].textContent = completed;
    }
  }

  renderSupplyList() {
    const dashboardSupplyList = document.getElementById('dashboard-supply-list');
    if (!dashboardSupplyList) return;

    dashboardSupplyList.innerHTML = '';
    Object.keys(window.AppData.supplies).forEach(key => {
      const status = window.AppUtils.getStockStatus(window.AppData.supplies[key]);
      const row = document.createElement('div');
      row.className = 'supply-row';
      row.innerHTML = `
        ${window.AppUtils.supplyLabels[key]} <span class="supply-status ${status.class}">${status.text}</span>
      `;
      dashboardSupplyList.appendChild(row);
    });
  }

  renderDashboardSupplyTable() {
    const container = document.getElementById('dashboard-supply-table');
    if (!container) return;

    // Filter supplies based on current filter
    let filteredSupplies = Object.keys(window.AppData.supplies);

    if (this.currentSupplyFilter === 'low') {
      filteredSupplies = filteredSupplies.filter(key => {
        const qty = window.AppData.supplies[key];
        return qty >= 1 && qty < 6;
      });
    } else if (this.currentSupplyFilter === 'full') {
      filteredSupplies = filteredSupplies.filter(key => {
        const qty = window.AppData.supplies[key];
        return qty >= 6;
      });
    }

    // Pagination setup
    this.currentSupplyPage = this.currentSupplyPage || 1;
    const itemsPerPage = 3;
    const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);
    const startIndex = (this.currentSupplyPage - 1) * itemsPerPage;
    const displaySupplies = filteredSupplies.slice(startIndex, startIndex + itemsPerPage);

    if (displaySupplies.length === 0) {
      container.innerHTML = '<div class="orders-empty-center">No supplies found for this filter.</div>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'supply-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; background: #f8f9fa;">Supply</th>
        <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; background: #f8f9fa;">Quantity</th>
        <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; background: #f8f9fa;">Status</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    displaySupplies.forEach(key => {
      const status = window.AppUtils.getStockStatus(window.AppData.supplies[key]);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${window.AppUtils.supplyLabels[key]}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;"><span class="supply-quantity">${window.AppData.supplies[key]}</span></td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;"><span class="supply-status ${status.class}">${status.text}</span></td>
      `;

      // Add hover effect
      row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = '#f5f5f5';
      });
      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = '';
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);

    // Add pagination if there are more than 3 items
    if (filteredSupplies.length > 3) {
      const pagination = document.createElement('div');
      pagination.className = 'supply-pagination';

      let paginationHTML = '<div class="supply-pagination-info supply-prev">< Previous</div><div class="supply-pagination-controls">';
      for (let i = 1; i <= Math.min(totalPages, 4); i++) {
        const activeClass = i === this.currentSupplyPage ? ' active' : '';
        paginationHTML += `<div class="supply-pagination-btn${activeClass}" data-page="${i}">${i}</div>`;
      }
      paginationHTML += '</div><div class="supply-pagination-info supply-next">Next ></div>';

      pagination.innerHTML = paginationHTML;
      container.appendChild(pagination);

      // Add event listeners for pagination
      pagination.querySelectorAll('.supply-pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentSupplyPage = parseInt(btn.dataset.page);
          this.renderDashboardSupplyTable();
        });
      });

      pagination.querySelector('.supply-prev')?.addEventListener('click', () => {
        if (this.currentSupplyPage > 1) {
          this.currentSupplyPage--;
          this.renderDashboardSupplyTable();
        }
      });

      pagination.querySelector('.supply-next')?.addEventListener('click', () => {
        if (this.currentSupplyPage < totalPages) {
          this.currentSupplyPage++;
          this.renderDashboardSupplyTable();
        }
      });
    }
  }

  createDashboardOrderRow(order, index) {
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

  getStatusClass(status) {
    if (status === 'pending') return 'order-status pending';
    if (status === 'ongoing') return 'order-status ongoing';
    if (status === 'complete' || status === 'completed') return 'order-status completed';
    return 'order-status';
  }

  renderDashboardOrdersTable() {
    const container = document.getElementById('dashboard-orders-table');
    if (!container) return;

    // Filter orders based on current filter
    let filteredOrders = window.AppData.orders;
    
    if (this.currentOrderFilter !== 'all') {
      filteredOrders = window.AppData.orders.filter(order => 
        order.statusValue === this.currentOrderFilter
      );
    }

    // Apply search filter
    if (this.searchQuery) {
      filteredOrders = window.AppUtils.filterItems(filteredOrders, this.searchQuery, ['name', 'orderId', 'service']);
    }

    if (filteredOrders.length === 0) {
      container.innerHTML = '<div class="orders-empty-center">No orders found for this filter.</div>';
      return;
    }

    // Get paginated orders
    const itemsPerPage = 5;
    const paginatedOrders = window.AppUtils.getPaginatedItems(filteredOrders, this.currentOrderPage, itemsPerPage);

    // Create table structure (same as orders page)
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
      const row = this.createDashboardOrderRow(order, originalIndex);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    
    container.innerHTML = '';
    container.appendChild(table);

    // Add pagination
    window.AppUtils.createPagination(
      container.parentElement,
      filteredOrders,
      this.currentOrderPage,
      itemsPerPage,
      (page) => {
        this.currentOrderPage = page;
        this.renderDashboardOrdersTable();
      }
    );
  }

  render() {
    // Render the main dashboard components
    this.recalculateTotals();
    this.updateStatusCounters();
    this.renderSupplyList();
    this.renderDashboardSupplyTable();
    this.renderDashboardOrdersTable();
  }
}

// Initialize dashboard module
window.dashboardModule = new DashboardModule();
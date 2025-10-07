// Supplies Module
class SuppliesModule {
  constructor() {
    this.suppliesList = document.getElementById('supplies-list');
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.itemsPerPage = 5;
    this.init();
  }

  init() {
    this.setupSupplyAlignment();
    this.setupFilters();
    this.setupSearch();
  }

  setupSearch() {
    window.AppUtils.setupSearch('supplies-search', (query) => {
      this.searchQuery = query;
      this.currentPage = 1; // Reset to first page
      this.render();
    });
  }

  setupFilters() {
    // Setup supply filter tabs
    const supplyTabs = document.querySelectorAll('.supplies-table-header .table-tab');
    supplyTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        supplyTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Set filter based on tab text
        const tabText = tab.textContent.toLowerCase();
        if (tabText.includes('all')) this.currentFilter = 'all';
        else if (tabText.includes('low')) this.currentFilter = 'low';
        else if (tabText.includes('full')) this.currentFilter = 'full';
        
        // Reset to first page when filter changes
        this.currentPage = 1;
        this.render();
      });
    });
  }

  setupSupplyAlignment() {
    // Supply Alignment Functionality
    const alignSuppliesBtn = document.getElementById('alignSuppliesBtn');
    const exportSuppliesBtn = document.getElementById('exportSuppliesBtn');
    const importSuppliesBtn = document.getElementById('importSuppliesBtn');
    const supplyAlignModal = document.getElementById('supplyAlignModal');
    const closeAlignModal = document.getElementById('closeAlignModal');
    const alignTabs = document.querySelectorAll('.align-tab');
    const alignTabContents = document.querySelectorAll('.align-tab-content');

    // Modal controls
    if (alignSuppliesBtn) {
      alignSuppliesBtn.addEventListener('click', () => {
        supplyAlignModal?.classList.remove('hidden');
        this.updateShareOutput();
        this.updateRequestSuppliesList();
      });
    }

    if (closeAlignModal) {
      closeAlignModal.addEventListener('click', () => {
        supplyAlignModal?.classList.add('hidden');
      });
    }

    if (supplyAlignModal) {
      window.AppUtils.setupModalClose(supplyAlignModal);
    }

    // Tab switching
    alignTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Update active tab
        alignTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide tab content
        alignTabContents.forEach(content => {
          if (content.id === targetTab + '-tab') {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
      });
    });

    // Export functionality
    if (exportSuppliesBtn) {
      exportSuppliesBtn.addEventListener('click', () => this.exportSupplies());
    }

    // Import functionality
    if (importSuppliesBtn) {
      importSuppliesBtn.addEventListener('click', () => this.importSupplies());
    }

    // Compare functionality
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.compareSupplies());
    }

    // Request functionality
    const generateRequestBtn = document.getElementById('generateRequestBtn');
    if (generateRequestBtn) {
      generateRequestBtn.addEventListener('click', () => this.generateRequest());
    }

    // Copy share functionality
    const copyShareBtn = document.getElementById('copyShareBtn');
    if (copyShareBtn) {
      copyShareBtn.addEventListener('click', () => this.copyShareData());
    }
  }

  exportSupplies() {
    const supplyData = {
      timestamp: new Date().toISOString(),
      location: 'Your Location',
      supplies: window.AppData.supplies
    };
    
    const dataStr = JSON.stringify(supplyData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `supplies-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  importSupplies() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.supplies) {
            if (confirm('This will replace your current supply levels. Continue?')) {
              window.AppData.supplies = { ...data.supplies };
              window.AppData.save();
              this.render();
              if (window.dashboardModule) window.dashboardModule.renderSupplyList();
              window.AppUtils.showNotification('Supplies imported successfully!');
            }
          } else {
            window.AppUtils.showNotification('Invalid supply data format.');
          }
        } catch (error) {
          window.AppUtils.showNotification('Error reading file: ' + error.message);
        }
      };
      reader.readAsText(file);
    });
    
    input.click();
  }

  compareSupplies() {
    const otherSuppliesInput = document.getElementById('otherSuppliesInput');
    const comparisonResult = document.getElementById('comparisonResult');
    
    if (!otherSuppliesInput || !comparisonResult) return;

    const otherData = otherSuppliesInput.value.trim();
    if (!otherData) {
      window.AppUtils.showNotification('Please paste supply data to compare.');
      return;
    }

    try {
      const parsedData = JSON.parse(otherData);
      const otherSupplies = parsedData.supplies || parsedData;
      
      let comparisonHTML = '<h4>Supply Comparison</h4>';
      
      Object.keys(window.AppData.supplies).forEach(key => {
        const myQty = window.AppData.supplies[key] || 0;
        const otherQty = otherSupplies[key] || 0;
        const diff = myQty - otherQty;
        
        let diffClass = 'equal';
        let diffText = 'Same';
        
        if (diff > 0) {
          diffClass = 'higher';
          diffText = `+${diff}`;
        } else if (diff < 0) {
          diffClass = 'lower';
          diffText = `${diff}`;
        }
        
        comparisonHTML += `
          <div class="comparison-item">
            <span>${window.AppUtils.supplyLabels[key]}</span>
            <span>You: ${myQty} | Them: ${otherQty}</span>
            <span class="supply-diff ${diffClass}">${diffText}</span>
          </div>
        `;
      });
      
      comparisonResult.innerHTML = comparisonHTML;
    } catch (error) {
      window.AppUtils.showNotification('Invalid data format. Please check the pasted data.');
    }
  }

  updateRequestSuppliesList() {
    const requestSuppliesList = document.getElementById('requestSuppliesList');
    if (!requestSuppliesList) return;
    
    let html = '';
    Object.keys(window.AppData.supplies).forEach(key => {
      html += `
        <div class="request-supply-item">
          <input type="checkbox" id="request-${key}" value="${key}">
          <label for="request-${key}">${window.AppUtils.supplyLabels[key]}</label>
          <span class="current-qty">(${window.AppData.supplies[key]})</span>
        </div>
      `;
    });
    
    requestSuppliesList.innerHTML = html;
  }

  generateRequest() {
    const checkedSupplies = [];
    const checkboxes = document.querySelectorAll('#requestSuppliesList input[type="checkbox"]:checked');
    const requestMessage = document.getElementById('requestMessage');
    const requestOutput = document.getElementById('requestOutput');
    
    if (!requestOutput) return;

    checkboxes.forEach(checkbox => {
      const supplyKey = checkbox.value;
      checkedSupplies.push({
        name: window.AppUtils.supplyLabels[supplyKey],
        current: window.AppData.supplies[supplyKey],
        key: supplyKey
      });
    });
    
    if (checkedSupplies.length === 0) {
      window.AppUtils.showNotification('Please select supplies to request.');
      return;
    }
    
    const message = requestMessage?.value.trim() || '';
    const timestamp = new Date().toLocaleString();
    
    let requestText = `SUPPLY REQUEST - ${timestamp}\n\n`;
    requestText += `From: Your Location\n`;
    requestText += `Message: ${message || 'No additional message'}\n\n`;
    requestText += `Requested Supplies:\n`;
    requestText += `${'='.repeat(40)}\n`;
    
    checkedSupplies.forEach(supply => {
      requestText += `• ${supply.name}: Currently have ${supply.current}\n`;
    });
    
    requestText += `\n${'='.repeat(40)}\n`;
    requestText += `Please coordinate supply transfer when convenient.\n`;
    requestText += `Contact information: [Add your contact details]`;
    
    requestOutput.textContent = requestText;
  }

  updateShareOutput() {
    const shareOutput = document.getElementById('shareOutput');
    if (!shareOutput) return;
    
    const shareData = {
      timestamp: new Date().toISOString(),
      location: 'Your Location',
      supplies: window.AppData.supplies,
      totalItems: Object.values(window.AppData.supplies).reduce((sum, qty) => sum + qty, 0)
    };
    
    shareOutput.value = JSON.stringify(shareData, null, 2);
  }

  copyShareData() {
    const shareOutput = document.getElementById('shareOutput');
    const copyShareBtn = document.getElementById('copyShareBtn');
    
    if (!shareOutput || !copyShareBtn) return;

    shareOutput.select();
    shareOutput.setSelectionRange(0, 99999);
    
    try {
      document.execCommand('copy');
      copyShareBtn.textContent = 'Copied!';
      copyShareBtn.style.background = '#4CAF50';
      
      setTimeout(() => {
        copyShareBtn.textContent = 'Copy to Clipboard';
        copyShareBtn.style.background = '#43766C';
      }, 2000);
    } catch (err) {
      window.AppUtils.showNotification('Failed to copy to clipboard');
    }
  }

  render() {
    if (!this.suppliesList) return;

    this.suppliesList.innerHTML = '';
    
    // Filter supplies based on current filter
    let filteredSupplies = Object.keys(window.AppData.supplies);
    
    if (this.currentFilter === 'low') {
      filteredSupplies = filteredSupplies.filter(key => {
        const qty = window.AppData.supplies[key];
        return qty >= 1 && qty < 6;
      });
    } else if (this.currentFilter === 'full') {
      filteredSupplies = filteredSupplies.filter(key => {
        const qty = window.AppData.supplies[key];
        return qty >= 6;
      });
    }

    // Apply search filter
    if (this.searchQuery) {
      filteredSupplies = filteredSupplies.filter(key => {
        const label = window.AppUtils.supplyLabels[key];
        return label.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }

    if (filteredSupplies.length === 0) {
      this.suppliesList.innerHTML = '<div class="orders-empty-center">No supplies found for this filter.</div>';
      return;
    }
    
    // Get paginated supplies
    const paginatedSupplies = window.AppUtils.getPaginatedItems(filteredSupplies, this.currentPage, this.itemsPerPage);
    
    const table = document.createElement('table');
    table.className = 'supplies-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Supply</th>
        <th>Quantity</th>
        <th>Status</th>
        <th>Adjust</th>
      </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    paginatedSupplies.forEach(key => {
      const row = document.createElement('tr');
      const status = window.AppUtils.getStockStatus(window.AppData.supplies[key]);
      row.innerHTML = `
        <td>${window.AppUtils.supplyLabels[key]}</td>
        <td><span id="qty-${key}">${window.AppData.supplies[key]}</span></td>
        <td><span class="supply-status ${status.class}">${status.text}</span></td>
        <td>
          <div class="supply-adjust-buttons">
            <button class="supply-minus" data-supply="${key}" ${window.AppData.supplies[key] === 0 ? 'disabled' : ''}>−</button>
            <button class="supply-plus" data-supply="${key}">+</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    this.suppliesList.appendChild(table);

    // Add pagination
    window.AppUtils.createPagination(
      this.suppliesList.parentElement,
      filteredSupplies,
      this.currentPage,
      this.itemsPerPage,
      (page) => {
        this.currentPage = page;
        this.render();
      }
    );

    // Add event listeners for plus/minus buttons
    this.suppliesList.querySelectorAll('.supply-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-supply');
        window.AppData.supplies[key]++;
        window.AppData.save();
        this.render();
        if (window.dashboardModule) window.dashboardModule.renderSupplyList();
      });
    });

    this.suppliesList.querySelectorAll('.supply-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-supply');
        if (window.AppData.supplies[key] > 0) {
          window.AppData.supplies[key]--;
          window.AppData.save();
          this.render();
          if (window.dashboardModule) window.dashboardModule.renderSupplyList();
        }
      });
    });
  }
}

// Initialize supplies module
window.suppliesModule = new SuppliesModule();
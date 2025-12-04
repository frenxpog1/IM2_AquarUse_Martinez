// Admin Panel for Data Management
class AdminPanel {
  constructor() {
    this.createAdminButton();
  }

  createAdminButton() {
    // Only show for admin users
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail !== 'admin@aquaruse') return;

    // Create floating admin button
    const adminBtn = document.createElement('button');
    adminBtn.innerHTML = '⚙️';
    adminBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #213555;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;
    
    adminBtn.addEventListener('mouseover', () => {
      adminBtn.style.transform = 'scale(1.1)';
    });
    
    adminBtn.addEventListener('mouseout', () => {
      adminBtn.style.transform = 'scale(1)';
    });

    adminBtn.addEventListener('click', () => {
      this.showAdminPanel();
    });

    document.body.appendChild(adminBtn);
  }

  async getCurrentDataCounts() {
    let counts = { orders: 0, customers: 0, staff: 0, supplies: 0 };
    
    try {
      // Try to get real counts from API
      const [ordersResult, customersResult, staffResult, suppliesResult] = await Promise.all([
        window.apiService.getOrders(),
        window.apiService.getCustomers(),
        window.apiService.get('staff'),
        window.apiService.get('supplies')
      ]);

      if (ordersResult && ordersResult.success) counts.orders = ordersResult.data.length;
      if (customersResult && customersResult.success) counts.customers = customersResult.data.length;
      if (staffResult && staffResult.success) counts.staff = staffResult.data.length;
      if (suppliesResult && suppliesResult.success) {
        counts.supplies = suppliesResult.data.reduce((sum, supply) => sum + supply.quantity, 0);
      }
    } catch (error) {
      console.warn('Could not get API counts, using local data');
      // Fallback to local data
      counts.orders = window.AppData.orders ? window.AppData.orders.length : 0;
      counts.customers = window.AppData.customers ? window.AppData.customers.length : 0;
      counts.staff = window.AppData.staff ? window.AppData.staff.length : 0;
      counts.supplies = window.AppData.supplies ? Object.values(window.AppData.supplies).reduce((sum, qty) => sum + qty, 0) : 0;
    }

    return counts;
  }

  async showAdminPanel() {
    const counts = await this.getCurrentDataCounts();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <h2>Admin Data Panel</h2>
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <button id="addSampleData" class="admin-btn" style="background: #4CAF50;">
            ➕ Add Sample Data
          </button>
          <button id="resetData" class="admin-btn" style="background: #FF9800;">
            🔄 Reset to Sample Data
          </button>
          <button id="clearData" class="admin-btn" style="background: #f44336;">
            🗑️ Delete All Data
          </button>
          <button id="exportData" class="admin-btn" style="background: #2196F3;">
            📥 Export Data
          </button>
          <button id="importData" class="admin-btn" style="background: #FF9800;">
            📤 Import Data
          </button>
          <button id="testAPI" class="admin-btn" style="background: #9C27B0;">
            🔧 Test API Connection
          </button>
          <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <h3 style="margin-top: 0;">Current Data Summary:</h3>
            <p><strong>Orders:</strong> ${counts.orders}</p>
            <p><strong>Customers:</strong> ${counts.customers}</p>
            <p><strong>Staff:</strong> ${counts.staff}</p>
            <p><strong>Total Supplies:</strong> ${counts.supplies}</p>
          </div>
          <button id="closeAdmin" class="admin-btn" style="background: #666;">
            ❌ Close
          </button>
        </div>
      </div>
    `;

    // Add styles for admin buttons
    const style = document.createElement('style');
    style.textContent = `
      .admin-btn {
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: opacity 0.3s ease;
      }
      .admin-btn:hover {
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Setup event listeners
    document.getElementById('addSampleData').addEventListener('click', async () => {
      if (confirm('Add sample data? This will add sample orders, customers, and staff.')) {
        const btn = document.getElementById('addSampleData');
        btn.disabled = true;
        btn.textContent = '⏳ Adding...';
        
        try {
          await this.addSampleData();
          window.AppUtils.showNotification('Sample data added successfully!');
          modal.remove();
          // Refresh the page to show new data
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          window.AppUtils.showNotification('Error adding sample data: ' + error.message);
          btn.disabled = false;
          btn.textContent = '➕ Add Sample Data';
        }
      }
    });

    document.getElementById('resetData').addEventListener('click', async () => {
      if (confirm('Reset to sample data? This will DELETE ALL current data and replace with sample data.')) {
        const btn = document.getElementById('resetData');
        btn.disabled = true;
        btn.textContent = '⏳ Resetting...';
        
        try {
          await this.resetToSampleData();
          window.AppUtils.showNotification('Data reset to sample data successfully!');
          modal.remove();
          // Refresh the page to show new data
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          window.AppUtils.showNotification('Error resetting data: ' + error.message);
          btn.disabled = false;
          btn.textContent = '🔄 Reset to Sample Data';
        }
      }
    });

    document.getElementById('clearData').addEventListener('click', async () => {
      // First test if API is working
      try {
        console.log('Testing API connection...');
        const healthCheck = await window.apiService.get('health');
        console.log('API health check result:', healthCheck);
      } catch (error) {
        console.warn('API health check failed:', error);
      }
      
      if (confirm('Delete ALL data? This action cannot be undone!\n\nThis will delete:\n- All orders\n- All customers\n- All staff\n- All supplies data\n- All settings')) {
        const btn = document.getElementById('clearData');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Deleting...';
        
        try {
          console.log('User confirmed data deletion');
          await this.clearAllData();
          
          // Set flag to prevent auto-loading data
          window.dataCleared = true;
          
          console.log('Data deletion completed successfully');
          window.AppUtils.showNotification('All data deleted successfully!', 'success');
          
          modal.remove();
          
          // Refresh the page to show empty state
          setTimeout(() => {
            console.log('Reloading page to show empty state');
            window.location.reload();
          }, 1500);
          
        } catch (error) {
          console.error('Error during data deletion:', error);
          window.AppUtils.showNotification('Error deleting data: ' + error.message, 'error');
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }
    });

    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importData').addEventListener('click', () => {
      this.importData();
    });

    document.getElementById('testAPI').addEventListener('click', async () => {
      const btn = document.getElementById('testAPI');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Testing...';
      
      try {
        console.log('=== API CONNECTION TEST ===');
        
        // Test health endpoint
        const health = await window.apiService.get('health');
        console.log('Health check:', health);
        
        // Test clear data endpoint (dry run)
        console.log('Testing clear data endpoint...');
        const clearTest = await fetch('../php/api.php?action=clear_all_data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_email: 'admin@aquaruse' })
        });
        const clearResult = await clearTest.json();
        console.log('Clear data test result:', clearResult);
        
        window.AppUtils.showNotification('API test completed - check console for details', 'info');
        
      } catch (error) {
        console.error('API test failed:', error);
        window.AppUtils.showNotification('API test failed: ' + error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

    document.getElementById('closeAdmin').addEventListener('click', () => {
      modal.remove();
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      orders: window.AppData.orders,
      customers: window.AppData.customers,
      staff: window.AppData.staff,
      supplies: window.AppData.supplies,
      orderIdCounter: window.AppData.orderIdCounter
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `laundry-app-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.AppUtils.showNotification('Data exported successfully!');
  }

  importData() {
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
          
          if (data.orders && data.customers && data.staff && data.supplies) {
            if (confirm('Import this data? This will overwrite all current data.')) {
              window.AppData.orders = data.orders;
              window.AppData.customers = data.customers;
              window.AppData.staff = data.staff;
              window.AppData.supplies = data.supplies;
              window.AppData.orderIdCounter = data.orderIdCounter || 1;
              window.AppData.save();

              // Refresh all modules
              if (window.dashboardModule) window.dashboardModule.render();
              if (window.ordersModule) window.ordersModule.render();
              if (window.customersModule) window.customersModule.render();
              if (window.suppliesModule) window.suppliesModule.render();
              if (window.staffModule) window.staffModule.render();

              window.AppUtils.showNotification('Data imported successfully!');
            }
          } else {
            window.AppUtils.showNotification('Invalid data format. Please check the file.');
          }
        } catch (error) {
          window.AppUtils.showNotification('Error reading file: ' + error.message);
        }
      };
      reader.readAsText(file);
    });

    input.click();
  }

  async clearAllData() {
    console.log('Starting data clear process...');
    
    let apiSuccess = false;
    
    try {
      // Clear data via API
      console.log('Attempting to clear data via API...');
      const result = await window.apiService.clearAllData('admin@aquaruse');
      
      if (result && result.success) {
        console.log('Data cleared via API successfully');
        apiSuccess = true;
      } else {
        console.warn('API clear failed:', result);
        console.log('Continuing with local data clearing...');
      }
    } catch (error) {
      console.warn('API not available for clearing:', error.message);
      console.log('Continuing with local data clearing...');
    }

    console.log('Clearing local data...');
    
    // Clear local data (this always happens for immediate UI update)
    window.AppData.orders = [];
    window.AppData.customers = [];
    window.AppData.staff = [];
    window.AppData.supplies = {}; // Empty - will be loaded from database
    window.AppData.orderIdCounter = 1;
    window.AppData.isLoaded = false; // Force reload on next access
    window.AppData.saveToLocalStorage();

    // Clear localStorage staff accounts
    localStorage.removeItem('staffAccounts');
    
    // Clear all localStorage data
    localStorage.removeItem('laundryAppData');
    
    // Clear any user-specific settings
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('userSettings_') || key.startsWith('cached')) {
        localStorage.removeItem(key);
      }
    });

    // Clear any cached data in modules
    if (window.ordersModule) window.ordersModule.orders = null;
    if (window.customersModule) window.customersModule.customers = null;
    if (window.suppliesModule) window.suppliesModule.supplies = null;
    if (window.staffModule) window.staffModule.staff = null;

    // Set flag to prevent auto-loading data on next page load
    localStorage.setItem('dataCleared', 'true');
    window.dataCleared = true;
    
    console.log('Data clear process completed');
    
    if (!apiSuccess) {
      console.warn('Note: API clearing failed, but local data has been cleared. If you have a database, you may need to clear it manually.');
    }
  }

  async addSampleData() {
    // Load sample data from 2_insert_data.sql via API
    try {
      console.log('Loading sample data from 2_insert_data.sql...');
      
      // Clear the data cleared flag FIRST
      localStorage.removeItem('dataCleared');
      window.dataCleared = false;
      
      // Call the API endpoint that reads and executes the SQL file
      const result = await window.apiService.resetToSampleData('admin@aquaruse');
      
      if (result && result.success) {
        console.log('Sample data loaded from SQL file successfully');
        // Force reload data
        window.AppData.isLoaded = false;
      } else {
        throw new Error(result?.error || 'Failed to load sample data');
      }
    } catch (error) {
      console.error('Error loading sample data:', error.message);
      throw error;
    }
  }

  async resetToSampleData() {
    console.log('Starting sample data reset...');
    
    try {
      // Reset data via API
      console.log('Attempting to reset data via API...');
      const result = await window.apiService.resetToSampleData('admin@aquaruse');
      
      if (result && result.success) {
        console.log('Sample data reset via API successfully');
        // Clear the data cleared flag
        localStorage.removeItem('dataCleared');
        // Force AppData to reload
        window.AppData.isLoaded = false;
        // Force reload all modules to get fresh data
        this.reloadAllModules();
      } else {
        console.warn('API reset failed, using local sample data:', result);
        throw new Error('API reset failed: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.warn('API not available for reset, using local sample data:', error.message);
      this.setLocalSampleData();
    }
  }

  async setLocalSampleData() {
    // Clear the dataCleared flag first
    localStorage.removeItem('dataCleared');
    window.dataCleared = false;
    
    // Try to use API to reset sample data
    try {
      const result = await window.apiService.resetToSampleData('admin@aquaruse');
      if (result && result.success) {
        console.log('Sample data set via API');
        // Clear localStorage and force reload from API
        localStorage.removeItem('laundryAppData');
        window.AppData.isLoaded = false;
        await window.AppData.init();
        this.reloadAllModules();
        return;
      }
    } catch (error) {
      console.warn('API sample data failed:', error);
    }

    // API failed - cannot set sample data without database
    console.error('Cannot set sample data: API not available');
    window.AppUtils.showNotification('Error: Database connection required to load sample data', 'error');
    throw new Error('API required for sample data');
  }

  async setLocalSampleDataOLD() {
    // DEPRECATED: This method is no longer used
    // All data must come from database via API
    // Keeping for reference only
    
    // Set minimal staff accounts for login (only thing that stays local)
    const staffAccounts = [
      {
        id: 'staff-1',
        name: 'Demo Staff',
        email: 'staff@aquaruse',
        phone: '09111111111',
        password: 'staff123',
        role: 'staff'
      }
    ];
    localStorage.setItem('staffAccounts', JSON.stringify(staffAccounts));

    this.reloadAllModules();
  }

  reloadAllModules() {
    // Clear cached data and force reload all modules
    if (window.ordersModule) {
      window.ordersModule.orders = null;
      window.ordersModule.render();
    }
    if (window.customersModule) {
      window.customersModule.customers = null;
      window.customersModule.render();
    }
    if (window.suppliesModule) {
      window.suppliesModule.supplies = null;
      window.suppliesModule.render();
    }
    if (window.staffModule) {
      window.staffModule.staff = null;
      window.staffModule.render();
    }
    if (window.dashboardModule) {
      window.dashboardModule.render();
    }
  }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});
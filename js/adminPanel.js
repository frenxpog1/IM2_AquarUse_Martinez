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

  showAdminPanel() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <h2>Admin Data Panel</h2>
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <button id="resetData" class="admin-btn" style="background: #4CAF50;">
            🔄 Reset to Sample Data
          </button>
          <button id="clearData" class="admin-btn" style="background: #f44336;">
            🗑️ Clear All Data
          </button>
          <button id="exportData" class="admin-btn" style="background: #2196F3;">
            📥 Export Data
          </button>
          <button id="importData" class="admin-btn" style="background: #FF9800;">
            📤 Import Data
          </button>
          <div style="margin-top: 20px;">
            <h3>Current Data Summary:</h3>
            <p>Orders: ${window.AppData.orders.length}</p>
            <p>Customers: ${window.AppData.customers.length}</p>
            <p>Staff: ${window.AppData.staff.length}</p>
            <p>Total Supplies: ${Object.values(window.AppData.supplies).reduce((sum, qty) => sum + qty, 0)}</p>
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
    document.getElementById('resetData').addEventListener('click', () => {
      if (confirm('Reset to sample data? This will overwrite all current data.')) {
        window.tempDataSystem.resetToSampleData();
        window.AppUtils.showNotification('Data reset to sample data successfully!');
        modal.remove();
      }
    });

    document.getElementById('clearData').addEventListener('click', () => {
      if (confirm('Clear all data? This action cannot be undone.')) {
        window.tempDataSystem.clearAllData();
        window.AppUtils.showNotification('All data cleared successfully!');
        modal.remove();
      }
    });

    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importData').addEventListener('click', () => {
      this.importData();
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
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});
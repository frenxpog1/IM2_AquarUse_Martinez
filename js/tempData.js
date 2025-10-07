// Temporary Data System - Replace with SQL database later
class TempDataSystem {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Check if data exists in localStorage, if not create sample data
    if (!localStorage.getItem('laundryAppData')) {
      this.createSampleData();
    }
    window.AppData.load();

    // Migrate old customer data from 'type' to 'status'
    this.migrateCustomerData();
  }

  migrateCustomerData() {
    let needsSave = false;

    // Check if any customers have 'type' instead of 'status'
    window.AppData.customers.forEach(customer => {
      if (customer.type && !customer.status) {
        // Migrate from old 'type' to new 'status'
        customer.status = customer.type === 'Returning' ? 'active' : 'inactive';
        delete customer.type;
        needsSave = true;
      }
    });

    if (needsSave) {
      window.AppData.save();
    }
  }

  createSampleData() {
    // Sample orders data
    const sampleOrders = [
      {
        orderId: '00001',
        name: 'John Doe',
        number: '09123456789',
        service: 'Dry Cleaning',
        statusValue: 'completed',
        amount: '2500',
        paid: '2500',
        balance: '0',
        dateValue: '2024-01-28',
        load: 5,
        notes: 'Regular customer'
      },
      {
        orderId: '00002',
        name: 'Jane Smith',
        number: '09187654321',
        service: 'Wash and Fold',
        statusValue: 'ongoing',
        amount: '750',
        paid: '500',
        balance: '250',
        dateValue: '2024-01-25',
        load: 3,
        notes: 'Express service'
      },
      {
        orderId: '00003',
        name: 'Adam Cruz',
        number: '09156789012',
        service: 'Wash and Fold',
        statusValue: 'ongoing',
        amount: '150',
        paid: '0',
        balance: '150',
        dateValue: '2024-01-20',
        load: 1,
        notes: ''
      },
      {
        orderId: '00004',
        name: 'Emily Rose',
        number: '09134567890',
        service: 'Dry Cleaning',
        statusValue: 'pending',
        amount: '1050',
        paid: '0',
        balance: '1050',
        dateValue: '2024-01-15',
        load: 4,
        notes: 'Special fabric'
      },
      {
        orderId: '00005',
        name: 'Alexander Morrison',
        number: '09198765432',
        service: 'Dry Cleaning',
        statusValue: 'completed',
        amount: '840',
        paid: '840',
        balance: '0',
        dateValue: '2024-01-14',
        load: 3,
        notes: ''
      }
    ];

    // Sample customers data
    const sampleCustomers = [
      { name: 'John Doe', number: '09123456789', status: 'active' },
      { name: 'Jane Smith', number: '09187654321', status: 'active' },
      { name: 'Adam Cruz', number: '09156789012', status: 'inactive' },
      { name: 'Emily Rose', number: '09134567890', status: 'active' },
      { name: 'Alexander Morrison', number: '09198765432', status: 'active' },
      { name: 'Maria Garcia', number: '09145678901', status: 'inactive' },
      { name: 'Robert Johnson', number: '09167890123', status: 'active' }
    ];

    // Sample staff data
    const sampleStaff = [
      {
        id: 'staff001',
        name: 'Sarah Wilson',
        email: 'sarah@aquaruse.com',
        phone: '09123456789',
        position: 'Manager',
        salary: '25000',
        startDate: '2023-01-15'
      },
      {
        id: 'staff002',
        name: 'Mike Chen',
        email: 'mike@aquaruse.com',
        phone: '09187654321',
        position: 'Supervisor',
        salary: '20000',
        startDate: '2023-03-20'
      },
      {
        id: 'staff003',
        name: 'Lisa Rodriguez',
        email: 'lisa@aquaruse.com',
        phone: '09156789012',
        position: 'Laundry Attendant',
        salary: '15000',
        startDate: '2023-06-10'
      }
    ];

    // Sample supplies with varied quantities for testing filters
    const sampleSupplies = {
      detergent: 25,      // In Stock
      softener: 18,       // In Stock
      bleach: 4,          // Low Stock
      fragrance: 12,      // In Stock
      stain_remover: 2,   // Low Stock
      steam_water: 30,    // In Stock
      garment_bag: 0      // No Stock
    };

    // Set the data
    window.AppData.orders = sampleOrders;
    window.AppData.customers = sampleCustomers;
    window.AppData.staff = sampleStaff;
    window.AppData.supplies = sampleSupplies;
    window.AppData.orderIdCounter = 6; // Next ID after sample data

    // Save to localStorage
    window.AppData.save();
  }

  // Method to reset data (for testing)
  resetToSampleData() {
    localStorage.removeItem('laundryAppData');
    this.createSampleData();

    // Refresh all modules
    if (window.dashboardModule) window.dashboardModule.render();
    if (window.ordersModule) window.ordersModule.render();
    if (window.customersModule) window.customersModule.render();
    if (window.suppliesModule) window.suppliesModule.render();
    if (window.staffModule) window.staffModule.render();
  }

  // Method to clear all data
  clearAllData() {
    window.AppData.orders = [];
    window.AppData.customers = [];
    window.AppData.staff = [];
    window.AppData.supplies = {
      detergent: 0,
      softener: 0,
      bleach: 0,
      fragrance: 0,
      stain_remover: 0,
      steam_water: 0,
      garment_bag: 0
    };
    window.AppData.orderIdCounter = 1;
    window.AppData.save();
  }
}

// Initialize temporary data system
window.tempDataSystem = new TempDataSystem();
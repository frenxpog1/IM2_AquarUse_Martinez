// Demo Data for Vercel/Static Deployment
// This module simulates a database using localStorage when PHP is not available

window.DemoData = {
    // Initial data sets
    initialOrders: [
        { orderId: '00001', name: 'John Doe', dateValue: '2026-06-01', service: 'Regular Laundry', kg: 5, amount: 300, paid: 300, balance: 0, statusValue: 'complete', number: '09123456789' },
        { orderId: '00002', name: 'Jane Smith', dateValue: '2026-06-02', service: 'Wash and Fold', kg: 3, amount: 195, paid: 100, balance: 95, statusValue: 'ongoing', number: '09987654321' },
        { orderId: '00003', name: 'Mike Ross', dateValue: '2026-06-03', service: 'Dry Cleaning', kg: 1, amount: 250, paid: 0, balance: 250, statusValue: 'pending', number: '09555444333' }
    ],
    
    initialSupplies: {
        detergent: 15,
        softener: 10,
        bleach: 5,
        fragrance: 8,
        stain_remover: 4,
        steam_water: 12,
        garment_bag: 20
    },
    
    initialStaff: [
        { id: 'admin-1', name: 'Admin User', email: 'admin@aquaruse', phone: '000', password: 'admin', role: 'admin' },
        { id: 'staff-1', name: 'Demo Staff', email: 'staff@aquaruse', phone: '111', password: 'staff', role: 'staff' }
    ],

    init() {
        console.log('Initializing Demo Mode...');
        
        // Initialize localStorage if empty
        if (!localStorage.getItem('laundryAppData_demo')) {
            const data = {
                orders: this.initialOrders,
                supplies: this.initialSupplies,
                staff: this.initialStaff,
                orderIdCounter: 4
            };
            localStorage.setItem('laundryAppData_demo', JSON.stringify(data));
        }

        // Set up staff accounts for login check
        if (!localStorage.getItem('staffAccounts')) {
            localStorage.setItem('staffAccounts', JSON.stringify(this.initialStaff));
        }
        
        // Set admin email
        if (!localStorage.getItem('adminEmail')) {
            localStorage.setItem('adminEmail', 'admin@aquaruse');
        }
    },

    getData() {
        return JSON.parse(localStorage.getItem('laundryAppData_demo'));
    },

    saveData(data) {
        localStorage.setItem('laundryAppData_demo', JSON.stringify(data));
    },

    // Mock API methods
    async mockRequest(action, data = null) {
        const appData = this.getData();
        
        switch(action) {
            case 'orders':
                return { success: true, data: appData.orders };
            
            case 'customers':
                // AppData.js generates customers from orders, so we just return success
                return { success: true, data: [] };
                
            case 'supplies':
                // Convert supplies object to array format API expects
                const supplyArray = Object.entries(appData.supplies).map(([name, qty]) => ({
                    name: name,
                    quantity: qty
                }));
                return { success: true, data: supplyArray };
                
            case 'staff':
                return { success: true, data: appData.staff };
                
            case 'add_order':
                appData.orders.unshift(data);
                appData.orderIdCounter++;
                this.saveData(appData);
                return { success: true };
                
            case 'update_supply':
                appData.supplies[data.name] = data.quantity;
                this.saveData(appData);
                return { success: true };
                
            default:
                return { success: true, message: 'Mock action successful' };
        }
    }
};

# Aquaruse Laundry Management System

A comprehensive, modern laundry management system with role-based access, intelligent notifications, inventory management, and offline support. Now with a **Demo Mode** for easy deployment on Vercel and other static hosting platforms.

## 🌟 Key Features

### 🚀 NEW: Demo Mode & Vercel Support
- **Static Deployment**: Runs perfectly on Vercel, GitHub Pages, and Netlify without needing a PHP/MySQL server.
- **Mock Database**: Uses `localStorage` to simulate a database, preserving all functionality (Orders, Staff, Supplies) within the browser.
- **Automatic Detection**: Intelligently switches between XAMPP (Local) and Demo (Vercel) modes based on the environment.

### 🔐 Authentication & Authorization
- **Admin Access**: Full system control with staff management capabilities.
- **Staff Access**: Limited access to daily operations only.
- **Role-based UI**: Dynamic interface based on user permissions.
- **Secure Login**: Password-protected accounts with validation.
- **Session Management**: Auto-logout and session timeout options.

### 📊 Business Management
- **Order Management**: Create, edit, and track laundry orders with multiple service types and real-time payment tracking.
- **Customer Database**: Automatic customer creation from orders with activity tracking (Active/Inactive).
- **Inventory Control**: Real-time supply tracking with automatic consumption based on service type.
- **Staff Management**: Add, edit, and delete staff members (Admin Only).

### 🔔 Intelligent Notification System
- **Toast Notifications**: Real-time alerts for immediate actions (auto-dismiss after 3s).
- **Internal Panel**: Persistent history categorized by type (Orders, Alerts, Staff, System).
- **Smart Stock Alerts**: Throttled notifications to prevent spam (max once every 4 hours for same issues).

### 🎨 User Experience
- **Themes**: Beautiful Light and Dark mode support with persistent preferences.
- **Profile Management**: Custom profile picture upload with automatic compression.
- **Interface Design**: Modern, card-based layout with responsive design and intuitive navigation.

---

## 📋 Deployment Options

### 1. Vercel / GitHub Pages (Demo Version)
This is the fastest way to showcase the app. It uses **Demo Mode** (`localStorage`).

1. **Connect to GitHub**: Push your code to a GitHub repository.
2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com/) and click "**Add New Project**".
   - Select your repository.
   - Framework Preset: "**Other**".
   - Click "**Deploy**".
3. **Access**: Open the provided `.vercel.app` link.

### 2. XAMPP / Local Server (Production Version)
Uses PHP and MySQL for persistent data storage.

1. **Clone the Project**:
   ```bash
   git clone https://github.com/frenxpog1/IM2_AquarUse_Martinez.git
   ```
2. **Move to htdocs**: Copy the folder to `C:\xampp\htdocs\aquaruse`.
3. **Database Setup**:
   - Open `phpMyAdmin` (http://localhost/phpmyadmin).
   - Create a database named `aquaruse`.
   - Import `1_setup_database.sql` and `2_insert_data.sql`.
4. **Access**: Navigate to `http://localhost/aquaruse/`.

---

## 🔑 Default Credentials (Demo Mode)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@aquaruse` | `admin` |
| **Staff** | `staff@aquaruse` | `staff` |

---

## 📁 Project Structure

```
aquaruse/
├── html/                       # HTML Pages
│   ├── login.html              # Login page with demo credentials
│   └── spa.html                # Main application (SPA)
├── js/                         # JavaScript Modules
│   ├── demo-mode.js            # [NEW] Mock database for Vercel/Demo
│   ├── api-service.js          # API communication (Switchable Mode)
│   ├── app.js                  # Main app controller
│   ├── utils.js                # Utilities & Supply Consumption Logic
│   └── ...                     # Other functional modules
├── php/                        # Backend PHP Files (MySQL required)
│   ├── api.php                 # Main RESTful API
│   └── ...
├── css/                        # Stylesheets (Light/Dark themes)
├── assets/                     # Logos and Backgrounds
├── 1_setup_database.sql        # Database Schema
└── 2_insert_data.sql           # Sample Data
```

---

## 🔧 Technical Features

- **Dual Storage**: Seamlessly switches between Database (API) and browser storage (`localStorage`).
- **Offline Support**: Full functionality maintained without an active internet connection.
- **Image Compression**: Automatically resizes profile pictures to 200x200px (70% quality) for performance.
- **Input Validation**: Robust handling of forms and data entry.

## 📝 Version History

### Version 2.1 (Current)
- ✅ **Vercel Support**: Added `demo-mode.js` for serverless operation.
- ✅ **Structural Fixes**: Resolved all unclosed `<div>` and duplicate `<form>` tags in `spa.html`.
- ✅ **Data Sync**: Fixed supply consumption to sync immediately with the database/mock.
- ✅ **UI Cleanup**: Initialized balance displays to zero to prevent "flickering" data.

### Version 2.0
- ✅ Enhanced staff management (Edit/Delete).
- ✅ Intelligent notification system with throttling.
- ✅ Dark theme optimization and profile customization.

---

**Developed with ❤️ for Aquaruse Laundry**  
**Version**: 2.1  
**Last Updated**: June 2026  
**Status**: Vercel & XAMPP Ready

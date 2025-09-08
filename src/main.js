import { AdminSystem } from './components/AdminSystem.js';
import { DataManager } from './utils/DataManager.js';

// Initialize data manager
const dataManager = new DataManager();

// Initialize admin system
const adminSystem = new AdminSystem(dataManager);

// Mount the application
const app = document.getElementById('app');
app.appendChild(adminSystem.render());
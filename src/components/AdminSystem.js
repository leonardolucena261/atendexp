import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { BuildingManager } from './BuildingManager.js';
import { RoomManager } from './RoomManager.js';
import { Dashboard } from './Dashboard.js';
import { ClassManager } from './ClassManager.js';
import { PeriodManager } from './PeriodManager.js';
import { TeacherManager } from './TeacherManager.js';
import { TeacherScheduleView } from './TeacherScheduleView.js';

export class AdminSystem {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentView = 'dashboard';
    this.currentBuildingFilter = null;
    this.container = null;
    this.mainContent = null;
    this.sidebar = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'admin-container';

    // Create header
    const header = new Header(this.toggleSidebar.bind(this));
    this.container.appendChild(header.render());

    // Create main layout
    const mainLayout = document.createElement('div');
    mainLayout.className = 'main-layout';

    // Create sidebar
    this.sidebar = new Sidebar(this.handleNavigation.bind(this), this.dataManager);
    mainLayout.appendChild(this.sidebar.render());

    // Create main content area
    this.mainContent = document.createElement('div');
    this.mainContent.className = 'main-content';
    mainLayout.appendChild(this.mainContent);

    this.container.appendChild(mainLayout);

    // Render initial view
    this.renderCurrentView();

    return this.container;
  }

  handleNavigation(view, buildingId = null) {
    this.currentView = view;
    this.currentBuildingFilter = buildingId;
    this.renderCurrentView();
    
    // Update sidebar active state
    this.sidebar.updateActiveState(view, buildingId);
    
    // Make AdminSystem globally accessible for quick actions
    window.adminSystem = this;
  }

  toggleSidebar() {
    this.sidebar.toggleCollapse();
  }

  renderCurrentView() {
    this.mainContent.innerHTML = '';
    
    let component;
    switch (this.currentView) {
      case 'buildings':
        component = new BuildingManager(this.dataManager);
        break;
      case 'rooms':
        component = new RoomManager(this.dataManager, this.currentBuildingFilter);
        break;
      case 'classes':
        component = new ClassManager(this.dataManager, this.currentBuildingFilter);
        break;
      case 'periods':
        component = new PeriodManager(this.dataManager);
        break;
      case 'teachers':
        component = new TeacherManager(this.dataManager);
        break;
      case 'teacher-schedules':
        component = new TeacherScheduleView(this.dataManager);
        // Adicionar listener para atualização da escala
        document.addEventListener('scheduleUpdated', () => {
          if (component && typeof component.refreshSchedule === 'function') {
            component.refreshSchedule();
          }
        });
        break;
      default:
        component = new Dashboard(this.dataManager);
    }

    this.mainContent.appendChild(component.render());
  }
}
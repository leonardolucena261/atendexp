export class Sidebar {
  constructor(onNavigate, dataManager) {
    this.onNavigate = onNavigate;
    this.dataManager = dataManager;
    this.isCollapsed = false;
    this.expandedMenus = new Set();
  }

  render() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';

    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { 
        id: 'buildings', 
        label: 'Prédios', 
        icon: '🏢',
        hasSubmenu: true,
        submenu: [
          { id: 'buildings-manage', label: 'Gerenciar Prédios', icon: '🏢' },
          { id: 'rooms', label: 'Salas de Aula', icon: '🚪' }
        ]
      },
      { 
        id: 'classes', 
        label: 'Turmas', 
        icon: '👥'
      },
      { 
        id: 'teachers', 
        label: 'Professores', 
        icon: '👨‍🏫'
      },
      { 
        id: 'periods', 
        label: 'Períodos Letivos', 
        icon: '📅'
      },
      { 
        id: 'reports', 
        label: 'Relatórios', 
        icon: '📊',
        hasSubmenu: true,
        submenu: [
          { id: 'occupancy-report', label: 'Ocupação de Salas', icon: '📈' },
          { id: 'class-report', label: 'Relatório de Turmas', icon: '📋' }
        ]
      }
    ];

    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';

    menuItems.forEach(item => {
      const menuContainer = this.createMenuItem(item);
      nav.appendChild(menuContainer);
    });

    sidebar.appendChild(nav);
    return sidebar;
  }

  createMenuItem(item) {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-item-container';

    const menuItem = document.createElement('button');
    menuItem.className = 'sidebar-item';
    menuItem.dataset.view = item.id;
    
    if (item.id === 'dashboard') {
      menuItem.classList.add('active');
    }

    menuItem.innerHTML = `
      <span class="sidebar-icon">${item.icon}</span>
      <span class="sidebar-label">${item.label}</span>
      ${item.hasSubmenu ? '<span class="submenu-arrow">▶</span>' : ''}
    `;

    menuItem.addEventListener('click', () => {
      if (item.hasSubmenu) {
        this.toggleSubmenu(item.id);
      } else {
        this.onNavigate(item.id);
        this.updateActiveState(item.id);
      }
    });

    menuContainer.appendChild(menuItem);

    // Add submenu if exists
    if (item.hasSubmenu && item.submenu) {
      const submenu = document.createElement('div');
      submenu.className = 'submenu';
      submenu.id = `submenu-${item.id}`;
      
      item.submenu.forEach(subItem => {
        const subMenuItem = document.createElement('button');
        subMenuItem.className = 'submenu-item';
        subMenuItem.dataset.view = subItem.id;
        subMenuItem.innerHTML = `
          <span class="submenu-icon">${subItem.icon}</span>
          <span class="submenu-label">${subItem.label}</span>
        `;
        
        subMenuItem.addEventListener('click', () => {
          if (subItem.id === 'buildings-manage') {
            this.onNavigate('buildings');
          } else if (subItem.id === 'rooms') {
            this.onNavigate('rooms');
          } else {
            this.onNavigate(subItem.id);
          }
          this.updateActiveState(subItem.id);
        });
        
        submenu.appendChild(subMenuItem);
      });
      
      menuContainer.appendChild(submenu);
    }

    return menuContainer;
  }

  toggleSubmenu(menuId) {
    const submenu = document.getElementById(`submenu-${menuId}`);
    const arrow = document.querySelector(`[data-view="${menuId}"] .submenu-arrow`);
    
    if (this.expandedMenus.has(menuId)) {
      this.expandedMenus.delete(menuId);
      submenu.classList.remove('expanded');
      arrow.style.transform = 'rotate(0deg)';
    } else {
      this.expandedMenus.add(menuId);
      submenu.classList.add('expanded');
      arrow.style.transform = 'rotate(90deg)';
    }
  }

  toggleCollapse() {
    const sidebar = document.getElementById('sidebar');
    this.isCollapsed = !this.isCollapsed;
    
    if (this.isCollapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }

  updateActiveState(view, buildingId = null) {
    const sidebarItems = document.querySelectorAll('.sidebar-item, .submenu-item');
    sidebarItems.forEach(item => {
      item.classList.remove('active');
    });

    if (view === 'buildings' || view === 'rooms' || view === 'buildings-manage') {
      // Expand buildings submenu
      this.expandedMenus.add('buildings');
      const submenu = document.getElementById('submenu-buildings');
      const arrow = document.querySelector('[data-view="buildings"] .submenu-arrow');
      if (submenu && arrow) {
        submenu.classList.add('expanded');
        arrow.style.transform = 'rotate(90deg)';
      }
      
      // Activate the correct submenu item
      const targetView = view === 'buildings' || view === 'buildings-manage' ? 'buildings-manage' : 'rooms';
      const activeItem = document.querySelector(`[data-view="${targetView}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    } else if (view === 'occupancy-report' || view === 'class-report') {
      // Expand reports submenu
      this.expandedMenus.add('reports');
      const submenu = document.getElementById('submenu-reports');
      const arrow = document.querySelector('[data-view="reports"] .submenu-arrow');
      if (submenu && arrow) {
        submenu.classList.add('expanded');
        arrow.style.transform = 'rotate(90deg)';
      }
      
      const activeItem = document.querySelector(`[data-view="${view}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    } else {
      const activeItem = document.querySelector(`[data-view="${view}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    }
  }
}
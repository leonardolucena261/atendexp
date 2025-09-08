export class Header {
  constructor(onToggleSidebar) {
    this.onToggleSidebar = onToggleSidebar;
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
  }

  render() {
    const header = document.createElement('header');
    header.className = 'header';

    header.innerHTML = `
      <div class="header-content">
        <div class="header-left">
          <button class="sidebar-toggle" id="sidebarToggle">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <div class="logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V10H22V7L12 2Z" fill="currentColor"/>
                <path d="M4 11V20H8V15H16V20H20V11H4Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1>Cidade do Saber</h1>
              <span>Sistema Administrativo</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button class="theme-toggle" id="themeToggle" title="Alternar tema">
            <span class="theme-icon">${this.isDarkMode ? '☀️' : '🌙'}</span>
          </button>
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <span>Administrador</span>
          </div>
        </div>
      </div>
    `;

    // Add toggle functionality
    header.querySelector('#sidebarToggle').addEventListener('click', () => {
      if (this.onToggleSidebar) {
        this.onToggleSidebar();
      }
    });

    // Add theme toggle functionality
    header.querySelector('#themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Apply initial theme
    this.applyTheme();

    return header;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
    
    // Update icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = this.isDarkMode ? '☀️' : '🌙';
    }
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
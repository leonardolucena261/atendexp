export class Dashboard {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  render() {
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';

    const buildings = this.dataManager.getBuildings();
    const rooms = this.dataManager.getRooms();
    const classes = this.dataManager.getClasses();
    const periods = this.dataManager.getPeriods();
    const teachers = this.dataManager.getTeachers();

    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <p>Visão geral do sistema de gerenciamento</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <h3>${buildings.length}</h3>
            <p>Prédios Cadastrados</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🚪</div>
          <div class="stat-content">
            <h3>${rooms.length}</h3>
            <p>Salas de Aula</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎓</div>
          <div class="stat-content">
            <h3>${classes.length}</h3>
            <p>Turmas Ativas</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👨‍🏫</div>
          <div class="stat-content">
            <h3>${teachers.length}</h3>
            <p>Professores</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>${periods.length}</h3>
            <p>Períodos Letivos</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-activity">
          <h3>Atividade Recente</h3>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">🏢</div>
              <div class="activity-text">
                <p>Sistema iniciado</p>
                <span>Agora</span>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>Ações Rápidas</h3>
          <div class="action-buttons">
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('buildings')">
              <span>🏢</span>
              Gerenciar Prédios
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('rooms')">
              <span>🚪</span>
              Gerenciar Salas
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('classes')">
              <span>👥</span>
              Gerenciar Turmas
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('teachers')">
              <span>👨‍🏫</span>
              Gerenciar Professores
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('periods')">
              <span>📅</span>
              Períodos Letivos
            </button>
          </div>
        </div>
      </div>
    `;

    return dashboard;
  }
}
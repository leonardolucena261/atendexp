import { Modal } from './Modal.js';

export class BuildingManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'building-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const buildings = this.dataManager.getBuildings();

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Gerenciamento de Prédios</h2>
          <p>Cadastre e gerencie os prédios da Cidade do Saber</p>
        </div>
        <button class="btn btn-primary" id="addBuildingBtn">
          <span>➕</span>
          Novo Prédio
        </button>
      </div>

      <div class="content-section">
        <div class="buildings-grid" id="buildingsGrid">
          ${buildings.map(building => this.renderBuildingCard(building)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addBuildingBtn').addEventListener('click', () => {
      this.showBuildingModal();
    });

    // Add edit/delete listeners for each building
    buildings.forEach(building => {
      const card = this.container.querySelector(`[data-building-id="${building.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showBuildingModal(building);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteBuilding(building.id);
      });
    });
  }

  renderBuildingCard(building) {
    const rooms = this.dataManager.getRoomsByBuilding(building.id);
    
    return `
      <div class="building-card" data-building-id="${building.id}">
        <div class="building-header">
          <h3>${building.name}</h3>
          <div class="building-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="building-info">
          <p class="building-description">${building.description}</p>
          <div class="building-stats">
            <span class="stat">
              <strong>${rooms.length}</strong> salas
            </span>
            <span class="stat">
              <strong>${building.floors}</strong> andares
            </span>
          </div>
        </div>
      </div>
    `;
  }

  showBuildingModal(building = null) {
    const isEdit = building !== null;
    const title = isEdit ? 'Editar Prédio' : 'Novo Prédio';

    const formHtml = `
      <form id="buildingForm" class="modal-form">
        <div class="form-group">
          <label for="buildingName">Nome do Prédio</label>
          <input 
            type="text" 
            id="buildingName" 
            value="${building?.name || ''}" 
            placeholder="Ex: Prédio Principal"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="buildingDescription">Descrição</label>
          <textarea 
            id="buildingDescription" 
            placeholder="Descrição do prédio..."
            rows="3"
          >${building?.description || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="buildingFloors">Número de Andares</label>
          <input 
            type="number" 
            id="buildingFloors" 
            value="${building?.floors || 1}" 
            min="1"
            required
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    `;

    const modal = new Modal(title, formHtml);
    document.body.appendChild(modal.render());

    // Handle form submission
    const form = document.getElementById('buildingForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBuildingData(building?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  saveBuildingData(buildingId = null) {
    const name = document.getElementById('buildingName').value;
    const description = document.getElementById('buildingDescription').value;
    const floors = parseInt(document.getElementById('buildingFloors').value);

    const buildingData = {
      name,
      description,
      floors,
      createdAt: buildingId ? undefined : new Date().toISOString()
    };

    if (buildingId) {
      this.dataManager.updateBuilding(buildingId, buildingData);
    } else {
      this.dataManager.addBuilding(buildingData);
    }

    this.renderContent();
  }

  deleteBuilding(buildingId) {
    if (confirm('Tem certeza que deseja excluir este prédio? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteBuilding(buildingId);
      this.renderContent();
    }
  }
}
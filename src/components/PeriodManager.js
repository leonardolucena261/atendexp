import { Modal } from './Modal.js';

export class PeriodManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'period-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const periods = this.dataManager.getPeriods();

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Períodos Letivos</h2>
          <p>Configure os períodos letivos para organizar as turmas</p>
        </div>
        <button class="btn btn-primary" id="addPeriodBtn">
          <span>➕</span>
          Novo Período
        </button>
      </div>

      <div class="content-section">
        <div class="periods-grid" id="periodsGrid">
          ${periods.map(period => this.renderPeriodCard(period)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addPeriodBtn').addEventListener('click', () => {
      this.showPeriodModal();
    });

    // Add edit/delete listeners for each period
    periods.forEach(period => {
      const card = this.container.querySelector(`[data-period-id="${period.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showPeriodModal(period);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deletePeriod(period.id);
      });
    });
  }

  renderPeriodCard(period) {
    const classes = this.dataManager.getClassesByPeriod(period.id);
    
    return `
      <div class="period-card" data-period-id="${period.id}">
        <div class="period-header">
          <h3>${period.name}</h3>
          <div class="period-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="period-info">
          <div class="period-detail">
            <span class="label">Ano:</span>
            <span class="value">${period.year}</span>
          </div>
          <div class="period-detail">
            <span class="label">Divisão:</span>
            <span class="value">${period.division}</span>
          </div>
          <div class="period-detail">
            <span class="label">Início:</span>
            <span class="value">${new Date(period.startDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="period-detail">
            <span class="label">Término:</span>
            <span class="value">${new Date(period.endDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="period-stats">
            <span class="stat">
              <strong>${classes.length}</strong> turmas
            </span>
          </div>
        </div>
      </div>
    `;
  }

  showPeriodModal(period = null) {
    const isEdit = period !== null;
    const title = isEdit ? 'Editar Período Letivo' : 'Novo Período Letivo';

    const formHtml = `
      <form id="periodForm" class="modal-form">
        <div class="form-group">
          <label for="periodName">Nome do Período</label>
          <input 
            type="text" 
            id="periodName" 
            value="${period?.name || ''}" 
            placeholder="Ex: 1º Semestre"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="periodYear">Ano</label>
            <input 
              type="number" 
              id="periodYear" 
              value="${period?.year || new Date().getFullYear()}" 
              min="2020"
              max="2030"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="periodDivision">Divisão</label>
            <select id="periodDivision" required>
              <option value="">Selecione a divisão</option>
              <option value="Semestral" ${period?.division === 'Semestral' ? 'selected' : ''}>Semestral</option>
              <option value="Trimestral" ${period?.division === 'Trimestral' ? 'selected' : ''}>Trimestral</option>
              <option value="Bimestral" ${period?.division === 'Bimestral' ? 'selected' : ''}>Bimestral</option>
              <option value="Mensal" ${period?.division === 'Mensal' ? 'selected' : ''}>Mensal</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="periodStartDate">Data de Início</label>
            <input 
              type="date" 
              id="periodStartDate" 
              value="${period?.startDate || ''}" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="periodEndDate">Data de Término</label>
            <input 
              type="date" 
              id="periodEndDate" 
              value="${period?.endDate || ''}" 
              required
            >
          </div>
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
    const form = document.getElementById('periodForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePeriodData(period?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  savePeriodData(periodId = null) {
    const name = document.getElementById('periodName').value;
    const year = parseInt(document.getElementById('periodYear').value);
    const division = document.getElementById('periodDivision').value;
    const startDate = document.getElementById('periodStartDate').value;
    const endDate = document.getElementById('periodEndDate').value;

    const periodData = {
      name,
      year,
      division,
      startDate,
      endDate,
      createdAt: periodId ? undefined : new Date().toISOString()
    };

    if (periodId) {
      this.dataManager.updatePeriod(periodId, periodData);
    } else {
      this.dataManager.addPeriod(periodData);
    }

    this.renderContent();
  }

  deletePeriod(periodId) {
    const classes = this.dataManager.getClassesByPeriod(periodId);
    if (classes.length > 0) {
      alert('Não é possível excluir este período pois existem turmas vinculadas a ele.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este período letivo? Esta ação não pode ser desfeita.')) {
      this.dataManager.deletePeriod(periodId);
      this.renderContent();
    }
  }
}
import { Modal } from './Modal.js';

export class RoomManager {
  constructor(dataManager, buildingFilter = null) {
    this.dataManager = dataManager;
    this.buildingFilter = buildingFilter;
    this.selectedPeriod = null;
    this.container = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'room-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    let rooms = this.dataManager.getRooms();
    const periods = this.dataManager.getPeriods();
    
    // Filter rooms by building if specified
    if (this.buildingFilter) {
      rooms = rooms.filter(room => room.buildingId === this.buildingFilter);
    }
    
    const buildings = this.dataManager.getBuildings();
    const filterBuilding = buildings.find(b => b.id === this.buildingFilter);
    const pageTitle = this.buildingFilter 
      ? `Salas - ${filterBuilding?.name || 'Prédio'}`
      : 'Gerenciamento de Salas';

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>${pageTitle}</h2>
          <p>${this.buildingFilter ? 'Salas de aula deste prédio' : 'Cadastre e gerencie as salas de aula dos prédios'}</p>
        </div>
        <button class="btn btn-primary" id="addRoomBtn">
          <span>➕</span>
          Nova Sala
        </button>
      </div>

      <div class="content-section">
        ${!this.buildingFilter ? `
          <div class="filter-section">
            <select id="periodFilter" class="filter-select">
              <option value="">Todos os períodos</option>
              ${periods.map(period => 
                `<option value="${period.id}" ${this.selectedPeriod === period.id ? 'selected' : ''}>
                  ${period.name} (${period.year})
                </option>`
              ).join('')}
            </select>
            <select id="buildingFilter" class="filter-select">
              <option value="">Todos os prédios</option>
              ${buildings.map(building => 
                `<option value="${building.id}">${building.name}</option>`
              ).join('')}
            </select>
          </div>
        ` : `
          <div class="filter-section">
            <select id="periodFilter" class="filter-select">
              <option value="">Todos os períodos</option>
              ${periods.map(period => 
                `<option value="${period.id}" ${this.selectedPeriod === period.id ? 'selected' : ''}>
                  ${period.name} (${period.year})
                </option>`
              ).join('')}
            </select>
          </div>
        `}
        <div class="rooms-grid" id="roomsGrid">
          ${rooms.map(room => this.renderRoomCard(room, buildings)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addRoomBtn').addEventListener('click', () => {
      this.showRoomModal();
    });

    // Add period filter listener
    const periodFilter = this.container.querySelector('#periodFilter');
    if (periodFilter) {
      periodFilter.addEventListener('change', (e) => {
        this.selectedPeriod = e.target.value || null;
        this.renderContent();
      });
    }

    // Add filter listener if not filtered by building
    if (!this.buildingFilter) {
      const filterSelect = this.container.querySelector('#buildingFilter');
      filterSelect.addEventListener('change', (e) => {
        this.buildingFilter = e.target.value || null;
        this.renderContent();
      });
    }
    // Add edit/delete listeners for each room
    rooms.forEach(room => {
      const card = this.container.querySelector(`[data-room-id="${room.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showRoomModal(room);
      });

      card.querySelector('.photos-btn').addEventListener('click', () => {
        this.showPhotosCarousel(room);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteRoom(room.id);
      });
    });
  }

  renderRoomCard(room, buildings) {
    const building = buildings.find(b => b.id === room.buildingId);
    const buildingName = building ? building.name : 'Prédio não encontrado';
    
    // Get classes for this room, filtered by period if selected
    let classes = this.dataManager.getClassesByRoom(room.id);
    if (this.selectedPeriod) {
      classes = classes.filter(cls => cls.periodId === this.selectedPeriod);
    }
    
    // Get period info for display
    const periods = this.dataManager.getPeriods();
    const periodText = this.selectedPeriod 
      ? periods.find(p => p.id === this.selectedPeriod)?.name || 'Período'
      : 'Todos os períodos';

    return `
      <div class="room-card" data-room-id="${room.id}">
        <div class="room-header">
          <h3>${room.name}</h3>
          <div class="room-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon photos-btn" title="Ver fotos">📷</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="room-info">
          <div class="room-detail">
            <span class="label">Prédio:</span>
            <span class="value">${buildingName}</span>
          </div>
          <div class="room-detail">
            <span class="label">Andar:</span>
            <span class="value">${room.floor}º andar</span>
          </div>
          <div class="room-detail">
            <span class="label">Capacidade:</span>
            <span class="value">${room.capacity} pessoas</span>
          </div>
          <div class="room-detail">
            <span class="label">Tipo:</span>
            <span class="value">${room.type}</span>
          </div>
          <div class="room-detail">
            <span class="label">Período:</span>
            <span class="value">${periodText}</span>
          </div>
          <div class="room-detail">
            <span class="label">Turmas ativas:</span>
            <span class="value">${classes.length} turma${classes.length !== 1 ? 's' : ''}</span>
          </div>
          ${classes.length > 0 ? `
            <div class="classes-list">
              <div class="classes-header">
                <span class="label">Turmas nesta sala:</span>
              </div>
              ${classes.map(cls => `
                <div class="class-item" data-class-id="${cls.id}">
                  <div class="class-name">${cls.name}</div>
                  <div class="class-details">
                    <span class="class-time">${cls.startTime} - ${cls.endTime}</span>
                    <span class="class-days">${cls.weekDays.join(', ')}</span>
                    <span class="class-students">${cls.enrolledStudents} alunos</span>
                  </div>
                  ${this.renderClassCapacityBar(cls, room.capacity)}
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-classes">
              <p>Nenhuma turma cadastrada nesta sala para o período selecionado</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderClassCapacityBar(classData, roomCapacity) {
    const capacityPercentage = Math.min((classData.enrolledStudents / roomCapacity) * 100, 100);
    
    let capacityStatus = 'normal';
    let statusIcon = '✅';
    let statusText = 'Adequada';
    
    if (capacityPercentage > 100) {
      capacityStatus = 'exceeded';
      statusIcon = '⚠️';
      statusText = 'Excedida';
    } else if (capacityPercentage > 85) {
      capacityStatus = 'high';
      statusIcon = '⚡';
      statusText = 'Quase lotada';
    }

    return `
      <div class="class-capacity-section">
        <div class="class-capacity-header">
          <span class="capacity-label">Ocupação desta turma:</span>
          <span class="capacity-status ${capacityStatus}">
            ${statusIcon} ${statusText}
          </span>
        </div>
        <div class="capacity-bar">
          <div class="capacity-fill ${capacityStatus}" style="width: ${capacityPercentage}%"></div>
        </div>
        <div class="capacity-text">
          ${classData.enrolledStudents}/${roomCapacity} alunos (${Math.round(capacityPercentage)}%)
        </div>
      </div>
    `;
  }

  showPhotosCarousel(room) {
    // Simulated photos - in a real app, these would come from the database
    const photos = [
      'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];

    const carouselContent = `
      <div class="photo-carousel">
        <div class="carousel-container">
          <div class="carousel-slides" id="carouselSlides">
            ${photos.map((photo, index) => `
              <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <img src="${photo}" alt="Foto da ${room.name}" />
              </div>
            `).join('')}
          </div>
          <button class="carousel-btn prev" id="prevBtn">‹</button>
          <button class="carousel-btn next" id="nextBtn">›</button>
        </div>
        <div class="carousel-indicators">
          ${photos.map((_, index) => `
            <button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
          `).join('')}
        </div>
      </div>
    `;

    const modal = new Modal(`Fotos - ${room.name}`, carouselContent);
    document.body.appendChild(modal.render());

    // Carousel functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentSlide = index;
    };

    document.getElementById('prevBtn').addEventListener('click', () => {
      const newIndex = currentSlide === 0 ? photos.length - 1 : currentSlide - 1;
      showSlide(newIndex);
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      const newIndex = currentSlide === photos.length - 1 ? 0 : currentSlide + 1;
      showSlide(newIndex);
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => showSlide(index));
    });
  }

  showRoomModal(room = null) {
    const isEdit = room !== null;
    const title = isEdit ? 'Editar Sala' : 'Nova Sala';
    const buildings = this.dataManager.getBuildings();

    const buildingOptions = buildings.map(building => 
      `<option value="${building.id}" ${room?.buildingId === building.id ? 'selected' : ''}>
        ${building.name}
      </option>`
    ).join('');

    const form = `
      <form id="roomForm" class="modal-form">
        <div class="form-group">
          <label for="roomName">Nome da Sala</label>
          <input 
            type="text" 
            id="roomName" 
            value="${room?.name || ''}" 
            placeholder="Ex: Sala 101"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="roomBuilding">Prédio</label>
          <select id="roomBuilding" required>
            <option value="">Selecione um prédio</option>
            ${buildingOptions}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="roomFloor">Andar</label>
            <input 
              type="number" 
              id="roomFloor" 
              value="${room?.floor || 1}" 
              min="1"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="roomCapacity">Capacidade</label>
            <input 
              type="number" 
              id="roomCapacity" 
              value="${room?.capacity || 20}" 
              min="1"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="roomType">Tipo de Sala</label>
          <select id="roomType" required>
            <option value="">Selecione o tipo</option>
            <option value="Cultura" ${room?.type === 'Cultura' ? 'selected' : ''}>Cultura</option>
            <option value="Educação" ${room?.type === 'Educação' ? 'selected' : ''}>Educação</option>
            <option value="Esporte" ${room?.type === 'Esporte' ? 'selected' : ''}>Esporte</option>
            <option value="Multiuso" ${room?.type === 'Multiuso' ? 'selected' : ''}>Multiuso</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    `;

    const modal = new Modal(title, form);
    document.body.appendChild(modal.render());

    // Handle form submission
    const formElement = document.getElementById('roomForm');
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRoomData(room?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  saveRoomData(roomId = null) {
    const name = document.getElementById('roomName').value;
    const buildingId = document.getElementById('roomBuilding').value;
    const floor = parseInt(document.getElementById('roomFloor').value);
    const capacity = parseInt(document.getElementById('roomCapacity').value);
    const type = document.getElementById('roomType').value;

    const roomData = {
      name,
      buildingId,
      floor,
      capacity,
      type,
      createdAt: roomId ? undefined : new Date().toISOString()
    };

    if (roomId) {
      this.dataManager.updateRoom(roomId, roomData);
    } else {
      this.dataManager.addRoom(roomData);
    }

    this.renderContent();
  }

  deleteRoom(roomId) {
    if (confirm('Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteRoom(roomId);
      this.renderContent();
    }
  }
}
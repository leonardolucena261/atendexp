import { Modal } from './Modal.js';

export class TeacherManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.selectedPeriod = null;
    this.selectedSpecialty = null;
    this.nameFilter = '';
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'teacher-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const allTeachers = this.dataManager.getTeachers();
    const periods = this.dataManager.getPeriods();
    const specialties = this.dataManager.getSpecialties();
    const teachers = this.getFilteredTeachers(allTeachers);

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Gerenciamento de Professores</h2>
          <p>Cadastre e gerencie os professores e suas cargas horárias</p>
        </div>
        <button class="btn btn-primary" id="addTeacherBtn">
          <span>➕</span>
          Novo Professor
        </button>
      </div>

      <div class="content-section">
        <div class="filter-section">
          <input 
            type="text" 
            id="nameFilter" 
            class="filter-select" 
            placeholder="🔍 Buscar por nome do professor..."
            value="${this.nameFilter}"
            style="min-width: 300px;"
          >
          <select id="specialtyFilter" class="filter-select">
            <option value="">Todas as especialidades</option>
            ${specialties.map(specialty => 
              `<option value="${specialty.id}" ${this.selectedSpecialty === specialty.id ? 'selected' : ''}>
                ${specialty.name}
              </option>`
            ).join('')}
          </select>
          <select id="periodFilter" class="filter-select">
            <option value="">Todos os períodos letivos</option>
            ${periods.map(period => 
              `<option value="${period.id}" ${this.selectedPeriod === period.id ? 'selected' : ''}>
                ${period.name} (${period.year})
              </option>`
            ).join('')}
          </select>
          <div class="filter-info">
            <span>📊 ${teachers.length} professor${teachers.length !== 1 ? 'es' : ''} encontrado${teachers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="teachers-grid" id="teachersGrid">
          ${teachers.map(teacher => this.renderTeacherCard(teacher)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addTeacherBtn').addEventListener('click', () => {
      this.showTeacherModal();
    });

    // Add filter listeners
    this.container.querySelector('#nameFilter').addEventListener('input', (e) => {
      this.nameFilter = e.target.value;
      this.updateTeachersList();
    });

    this.container.querySelector('#periodFilter').addEventListener('change', (e) => {
      this.selectedPeriod = e.target.value || null;
      this.renderContent();
    });

    this.container.querySelector('#specialtyFilter').addEventListener('change', (e) => {
      this.selectedSpecialty = e.target.value || null;
      this.renderContent();
    });

    this.container.querySelector('#specialtyFilter').addEventListener('change', (e) => {
      this.selectedSpecialty = e.target.value || null;
      this.renderContent();
    });

    // Add edit/delete/schedule listeners for each teacher
    teachers.forEach(teacher => {
      const card = this.container.querySelector(`[data-teacher-id="${teacher.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showTeacherModal(teacher);
      });

      card.querySelector('.schedule-btn').addEventListener('click', () => {
        this.showTeacherSchedule(teacher);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteTeacher(teacher.id);
      });
    });
  }

  updateTeachersList() {
    const allTeachers = this.dataManager.getTeachers();
    const teachers = this.getFilteredTeachers(allTeachers);
    
    // Update only the teachers grid and filter info
    const teachersGrid = this.container.querySelector('#teachersGrid');
    const filterInfo = this.container.querySelector('.filter-info span');
    const specialtyFilter = this.container.querySelector('#specialtyFilter');
    
    teachersGrid.innerHTML = teachers.map(teacher => this.renderTeacherCard(teacher)).join('');
    filterInfo.textContent = `📊 ${teachers.length} professor${teachers.length !== 1 ? 'es' : ''} encontrado${teachers.length !== 1 ? 's' : ''}`;
    
    // Update specialty filter options in case new specialties were added
    const specialties = this.dataManager.getSpecialties();
    specialtyFilter.innerHTML = `
      <option value="">Todas as especialidades</option>
      ${specialties.map(specialty => 
        `<option value="${specialty.id}" ${this.selectedSpecialty === specialty.id ? 'selected' : ''}>
          ${specialty.name}
        </option>`
      ).join('')}
    `;
    
    // Re-add event listeners for teacher cards
    teachers.forEach(teacher => {
      const card = this.container.querySelector(`[data-teacher-id="${teacher.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showTeacherModal(teacher);
      });

      card.querySelector('.schedule-btn').addEventListener('click', () => {
        this.showTeacherSchedule(teacher);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteTeacher(teacher.id);
      });
    });
  }

  renderTeacherCard(teacher) {
    const allClasses = this.dataManager.getClassesByTeacher(teacher.id);
    const periods = this.dataManager.getPeriods();
    const rooms = this.dataManager.getRooms();
    const buildings = this.dataManager.getBuildings();
    const specialties = this.dataManager.getSpecialties();
    
    // Filter classes by selected period if any
    const classes = this.selectedPeriod 
      ? allClasses.filter(cls => cls.periodId === this.selectedPeriod)
      : allClasses;
    
    const currentWorkload = classes.reduce((total, cls) => total + (cls.workload || 0), 0);
    const workloadPercentage = Math.min((currentWorkload / teacher.maxWorkload) * 100, 100);
    
    let workloadStatus = 'normal';
    let statusIcon = '✅';
    let statusText = 'Adequada';
    
    if (workloadPercentage > 100) {
      workloadStatus = 'exceeded';
      statusIcon = '⚠️';
      statusText = 'Excedida';
    } else if (workloadPercentage > 85) {
      workloadStatus = 'high';
      statusIcon = '⚡';
      statusText = 'Quase lotada';
    }

    // Group classes by period
    const classesByPeriod = this.groupClassesByPeriod(allClasses, periods);
    const periodText = this.selectedPeriod 
      ? periods.find(p => p.id === this.selectedPeriod)?.name || 'Período'
      : 'Todos os períodos';

    // Get teacher specialties names
    const teacherSpecialties = (teacher.specialties || [])
      .map(specId => specialties.find(s => s.id === specId)?.name)
      .filter(Boolean)
      .join(', ') || 'Não informado';

    return `
      <div class="teacher-card" data-teacher-id="${teacher.id}">
        <div class="teacher-header">
          <h3>${teacher.name}</h3>
          <div class="teacher-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon schedule-btn" title="Ver horários">📅</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="teacher-info">
          <div class="teacher-detail">
            <span class="label">Email:</span>
            <span class="value">${teacher.email}</span>
          </div>
          <div class="teacher-detail">
            <span class="label">Telefone:</span>
            <span class="value">${teacher.phone}</span>
          </div>
          <div class="teacher-detail">
            <span class="label">Especialidades:</span>
            <span class="value">${teacherSpecialties}</span>
          </div>
          <div class="teacher-detail">
            <span class="label">Período:</span>
            <span class="value">${periodText}</span>
          </div>
          <div class="teacher-detail">
            <span class="label">Turmas no período:</span>
            <span class="value">${classes.length} turma${classes.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="teacher-detail">
            <span class="label">Total de turmas:</span>
            <span class="value">${allClasses.length} turma${allClasses.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="workload-section">
            <div class="workload-header">
              <span class="label">Carga Horária (${periodText}):</span>
              <span class="workload-status ${workloadStatus}">
                ${statusIcon} ${statusText}
              </span>
            </div>
            <div class="workload-bar">
              <div class="workload-fill ${workloadStatus}" style="width: ${workloadPercentage}%"></div>
            </div>
            <div class="workload-text">
              ${currentWorkload}h/${teacher.maxWorkload}h (${Math.round(workloadPercentage)}%)
            </div>
          </div>
          ${this.renderTeacherClasses(classesByPeriod, rooms, buildings, periods)}
        </div>
      </div>
    `;
  }

  showTeacherSchedule(teacher) {
    const classes = this.dataManager.getClassesByTeacher(teacher.id);
    const periods = this.dataManager.getPeriods();
    const rooms = this.dataManager.getRooms();
    const buildings = this.dataManager.getBuildings();
    
    // Group classes by period
    const classesByPeriod = {};
    periods.forEach(period => {
      classesByPeriod[period.id] = classes.filter(cls => cls.periodId === period.id);
    });

    // Create weekly schedule grid
    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const timeSlots = this.generateTimeSlots();
    
    let scheduleGrid = `
      <div class="schedule-grid">
        <div class="schedule-header">
          <div class="time-column">Horário</div>
          ${weekDays.map(day => `<div class="day-column">${day}</div>`).join('')}
        </div>
    `;

    timeSlots.forEach(timeSlot => {
      scheduleGrid += `<div class="schedule-row">`;
      scheduleGrid += `<div class="time-slot">${timeSlot}</div>`;
      
      weekDays.forEach(day => {
        const classInSlot = this.findClassInTimeSlot(classes, day, timeSlot);
        scheduleGrid += `
          <div class="schedule-cell ${classInSlot ? 'occupied' : 'free'}">
            ${classInSlot ? `
              <div class="class-info">
                <div class="class-name">${classInSlot.name}</div>
                <div class="class-room">${this.getRoomName(classInSlot.roomId, rooms, buildings)}</div>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      scheduleGrid += `</div>`;
    });

    scheduleGrid += `</div>`;

    const scheduleContent = `
      <div class="teacher-schedule">
        <div class="teacher-summary">
          <h4>📊 Resumo da Carga Horária</h4>
          <p><strong>Total:</strong> ${classes.reduce((total, cls) => total + cls.workload, 0)}h de ${teacher.maxWorkload}h</p>
          <p><strong>Turmas ativas:</strong> ${classes.length}</p>
        </div>
        
        ${scheduleGrid}
        
        <div class="classes-list">
          <h4>📚 Turmas por Período</h4>
          ${periods.map(period => {
            const periodClasses = classesByPeriod[period.id] || [];
            return periodClasses.length > 0 ? `
              <div class="period-section">
                <h5>${period.name} (${period.year})</h5>
                ${periodClasses.map(cls => {
                  const room = this.dataManager.getRooms().find(r => r.id === cls.roomId);
                  const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
                  return `
                    <div class="class-item">
                      <div class="class-name">${cls.name}</div>
                      <div class="class-details">
                        <span class="class-time">${cls.startTime} - ${cls.endTime}</span>
                        <span class="class-days">${cls.weekDays.join(', ')}</span>
                        <span class="class-location">${room?.name} - ${building?.name}</span>
                        <span class="class-students">${cls.enrolledStudents} alunos</span>
                        <span class="class-workload">${cls.workload}h</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : '';
          }).join('')}
        </div>
      </div>
    `;

    const modal = new Modal(`Horários - ${teacher.name}`, scheduleContent);
    document.body.appendChild(modal.render());
  }

  generateTimeSlots() {
    const slots = [];
    for (let hour = 7; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  findClassInTimeSlot(classes, day, timeSlot) {
    return classes.find(cls => {
      if (!cls.weekDays.includes(day)) return false;
      
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const startHour = parseInt(cls.startTime.split(':')[0]);
      const endHour = parseInt(cls.endTime.split(':')[0]);
      
      return slotHour >= startHour && slotHour < endHour;
    });
  }

  getRoomName(roomId, rooms, buildings) {
    const room = rooms.find(r => r.id === roomId);
    const building = buildings.find(b => b.id === room?.buildingId);
    return `${room?.name} - ${building?.name}`;
  }

  showTeacherModal(teacher = null) {
    const isEdit = teacher !== null;
    const title = isEdit ? 'Editar Professor' : 'Novo Professor';
    const specialties = this.dataManager.getSpecialties();

    const formHtml = `
      <form id="teacherForm" class="modal-form">
        <div class="form-group">
          <label for="teacherName">Nome</label>
          <input 
            type="text" 
            id="teacherName" 
            value="${teacher?.name || ''}" 
            placeholder="Nome completo do professor"
            required
          >
        </div>
        
        <div class="form-group">
          <div class="specialty-header">
            <label>Especialidades</label>
            <button type="button" class="btn btn-secondary" id="addSpecialtyBtn">
              ➕ Nova Especialidade
            </button>
          </div>
          <div class="specialty-selection" id="specialtySelection">
            ${specialties.map(specialty => {
              const isSelected = teacher?.specialties?.includes(specialty.id) || false;
              return `
                <label class="specialty-item">
                  <input 
                    type="checkbox" 
                    value="${specialty.id}" 
                    ${isSelected ? 'checked' : ''}
                    class="specialty-checkbox"
                  >
                  <span class="specialty-name">${specialty.name}</span>
                  <span class="specialty-description">${specialty.description}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="teacherEmail">Email</label>
            <input 
              type="email" 
              id="teacherEmail" 
              value="${teacher?.email || ''}" 
              placeholder="joao@email.com"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="teacherPhone">Telefone</label>
            <input 
              type="tel" 
              id="teacherPhone" 
              value="${teacher?.phone || ''}" 
              placeholder="(11) 99999-9999"
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="teacherMaxWorkload">Carga Horária Máxima (horas)</label>
            <input 
              type="number" 
              id="teacherMaxWorkload" 
              value="${teacher?.maxWorkload || 40}" 
              min="1"
              max="60"
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

    // Handle add specialty button
    document.getElementById('addSpecialtyBtn').addEventListener('click', () => {
      this.showAddSpecialtyModal();
    });

    // Handle form submission
    const form = document.getElementById('teacherForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTeacherData(teacher?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  saveTeacherData(teacherId = null) {
    const name = document.getElementById('teacherName').value;
    const email = document.getElementById('teacherEmail').value;
    const phone = document.getElementById('teacherPhone').value;
    const maxWorkload = parseInt(document.getElementById('teacherMaxWorkload').value);
    
    // Get selected specialties
    const selectedSpecialties = Array.from(document.querySelectorAll('.specialty-checkbox:checked'))
      .map(checkbox => checkbox.value);

    if (selectedSpecialties.length === 0) {
      alert('Por favor, selecione pelo menos uma especialidade.');
      return;
    }

    const teacherData = {
      name,
      email,
      phone,
      specialties: selectedSpecialties,
      maxWorkload,
      createdAt: teacherId ? undefined : new Date().toISOString()
    };

    if (teacherId) {
      this.dataManager.updateTeacher(teacherId, teacherData);
    } else {
      this.dataManager.addTeacher(teacherData);
    }

    this.renderContent();
  }

  getFilteredTeachers(teachers) {
    let filtered = teachers;
    
    // Filter by name
    if (this.nameFilter.trim()) {
      const searchTerm = this.nameFilter.toLowerCase().trim();
      const specialties = this.dataManager.getSpecialties();
      filtered = filtered.filter(teacher => {
        const teacherSpecialties = (teacher.specialties || [])
          .map(specId => specialties.find(s => s.id === specId)?.name)
          .filter(Boolean)
          .join(' ').toLowerCase();
        
        return teacher.name.toLowerCase().includes(searchTerm) ||
          teacher.email.toLowerCase().includes(searchTerm) ||
          teacherSpecialties.includes(searchTerm);
      });
    }
    
    // Filter by period (only show teachers who have classes in the selected period)
    if (this.selectedPeriod) {
      filtered = filtered.filter(teacher => {
        const classes = this.dataManager.getClassesByTeacher(teacher.id);
        return classes.some(cls => cls.periodId === this.selectedPeriod);
      });
    }
    
    // Filter by specialty
    if (this.selectedSpecialty) {
      filtered = filtered.filter(teacher => 
        teacher.specialties && teacher.specialties.includes(this.selectedSpecialty)
      );
    }
    
    return filtered;
  }

  groupClassesByPeriod(classes, periods) {
    const grouped = {};
    
    periods.forEach(period => {
      const periodClasses = classes.filter(cls => cls.periodId === period.id);
      if (periodClasses.length > 0) {
        grouped[period.id] = {
          period: period,
          classes: periodClasses
        };
      }
    });
    
    return grouped;
  }

  renderTeacherClasses(classesByPeriod, rooms, buildings, periods) {
    const periodEntries = Object.entries(classesByPeriod);
    
    if (periodEntries.length === 0) {
      return `
        <div class="teacher-classes">
          <div class="classes-header">
            <span class="label">📚 Turmas:</span>
          </div>
          <div class="empty-classes">
            <p>Nenhuma turma atribuída${this.selectedPeriod ? ' neste período' : ''}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="teacher-classes">
        <div class="classes-header">
          <span class="label">📚 Turmas por Período:</span>
        </div>
        ${periodEntries.map(([periodId, data]) => {
          const { period, classes } = data;
          return `
            <div class="period-classes">
              <div class="period-title">
                <strong>${period.name} (${period.year})</strong>
                <span class="period-count">${classes.length} turma${classes.length !== 1 ? 's' : ''}</span>
              </div>
              <div class="classes-list">
                ${classes.map(cls => {
                  const room = rooms.find(r => r.id === cls.roomId);
                  const building = buildings.find(b => b.id === room?.buildingId);
                  return `
                    <div class="class-item">
                      <div class="class-name">${cls.name}</div>
                      <div class="class-details">
                        <span class="class-time">🕐 ${cls.startTime} - ${cls.endTime}</span>
                        <span class="class-days">📅 ${cls.weekDays.join(', ')}</span>
                        <span class="class-location">📍 ${room?.name} - ${building?.name}</span>
                        <span class="class-students">👥 ${cls.enrolledStudents} alunos</span>
                        <span class="class-workload">⏱️ ${cls.workload}h</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  deleteTeacher(teacherId) {
    const classes = this.dataManager.getClassesByTeacher(teacherId);
    if (classes.length > 0) {
      alert('Não é possível excluir este professor pois existem turmas vinculadas a ele.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteTeacher(teacherId);
      this.renderContent();
    }
  }

  showAddSpecialtyModal() {
    const formHtml = `
      <form id="specialtyForm" class="modal-form">
        <div class="form-group">
          <label for="specialtyName">Nome da Especialidade</label>
          <input 
            type="text" 
            id="specialtyName" 
            placeholder="Ex: Dança Contemporânea"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="specialtyDescription">Descrição</label>
          <textarea 
            id="specialtyDescription" 
            placeholder="Breve descrição da especialidade..."
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelSpecialtyBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">Adicionar</button>
        </div>
      </form>
    `;

    const modal = new Modal('Nova Especialidade', formHtml);
    document.body.appendChild(modal.render());

    // Handle form submission
    document.getElementById('specialtyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('specialtyName').value;
      const description = document.getElementById('specialtyDescription').value;
      
      const newSpecialty = this.dataManager.addSpecialty({
        name,
        description
      });
      
      modal.close();
      
      // Update the specialty selection in the teacher form
      this.updateSpecialtySelection(newSpecialty);
    });

    // Handle cancel
    document.getElementById('cancelSpecialtyBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  updateSpecialtySelection(newSpecialty) {
    const specialtySelection = document.getElementById('specialtySelection');
    if (specialtySelection) {
      // Add the new specialty to the selection
      const specialtyItem = document.createElement('label');
      specialtyItem.className = 'specialty-item';
      specialtyItem.innerHTML = `
        <input 
          type="checkbox" 
          value="${newSpecialty.id}" 
          checked
          class="specialty-checkbox"
        >
        <span class="specialty-name">${newSpecialty.name}</span>
        <span class="specialty-description">${newSpecialty.description}</span>
      `;
      
      specialtySelection.appendChild(specialtyItem);
    }
  }
}
import { Modal } from './Modal.js';

export class TeacherManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'teacher-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const teachers = this.dataManager.getTeachers();

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
        <div class="teachers-grid" id="teachersGrid">
          ${teachers.map(teacher => this.renderTeacherCard(teacher)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addTeacherBtn').addEventListener('click', () => {
      this.showTeacherModal();
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

  renderTeacherCard(teacher) {
    const classes = this.dataManager.getClassesByTeacher(teacher.id);
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
            <span class="label">Especialidade:</span>
            <span class="value">${teacher.specialty}</span>
          </div>
          <div class="teacher-detail">
            <span class="label">Turmas ativas:</span>
            <span class="value">${classes.length} turma${classes.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="workload-section">
            <div class="workload-header">
              <span class="label">Carga Horária:</span>
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

    const formHtml = `
      <form id="teacherForm" class="modal-form">
        <div class="form-group">
          <label for="teacherName">Nome Completo</label>
          <input 
            type="text" 
            id="teacherName" 
            value="${teacher?.name || ''}" 
            placeholder="Ex: João Silva"
            required
          >
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
            <label for="teacherSpecialty">Especialidade</label>
            <input 
              type="text" 
              id="teacherSpecialty" 
              value="${teacher?.specialty || ''}" 
              placeholder="Ex: Matemática, Dança, Música"
              required
            >
          </div>
          
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
    const specialty = document.getElementById('teacherSpecialty').value;
    const maxWorkload = parseInt(document.getElementById('teacherMaxWorkload').value);

    const teacherData = {
      name,
      email,
      phone,
      specialty,
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
}
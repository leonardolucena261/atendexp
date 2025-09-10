import { Modal } from './Modal.js';

export class TeacherScheduleView {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.selectedTeacher = null;
    this.container = document.createElement('div');
    this.container.className = 'teacher-schedule-container';
  }

  render() {
    this.updateView();
    return this.container;
  }

  updateView() {
    const teachers = this.dataManager.getTeachers();
    
    this.container.innerHTML = `
        <div class="teacher-schedule-header">
          <h2>📅 Horários dos Professores</h2>
          <div class="teacher-selector">
            <select id="teacherSelect" class="form-select">
              <option value="">Selecione um professor</option>
              ${teachers.map(teacher => `
                <option value="${teacher.id}">${teacher.name} - ${teacher.specialty}</option>
              `).join('')}
            </select>
            ${this.selectedTeacher ? `
              <button id="exportPdfBtn" class="btn btn-secondary">
                📄 Exportar PDF
              </button>
            ` : ''}
          </div>
        </div>
        
        ${this.selectedTeacher ? this.renderTeacherSchedule() : this.renderEmptyState()}
    `;
    
    this.attachEventListeners();
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">👨‍🏫</div>
        <h3>Selecione um professor</h3>
        <p>Escolha um professor no menu acima para visualizar seus horários</p>
      </div>
    `;
  }

  renderTeacherSchedule() {
    const teacher = this.selectedTeacher;
    const classes = this.dataManager.getClasses().filter(c => c.teacherId === teacher.id);
    const workload = this.calculateWorkload(classes);
    
    return `
      <div class="teacher-info-card">
        <div class="teacher-avatar">
          <div class="avatar-circle">${teacher.name.charAt(0).toUpperCase()}</div>
        </div>
        <div class="teacher-details">
          <h3>${teacher.name}</h3>
          <p class="teacher-specialty">${teacher.specialty}</p>
          <p class="teacher-contact">📧 ${teacher.email} | 📞 ${teacher.phone}</p>
          <div class="workload-info">
            <span>Carga Horária: ${workload}h / ${teacher.maxWorkload}h</span>
            <div class="workload-bar">
              <div class="workload-progress" style="width: ${(workload / teacher.maxWorkload) * 100}%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="schedule-grid-container">
        <h4>Grade de Horários</h4>
        ${this.renderScheduleGrid(classes)}
      </div>

      <div class="classes-summary">
        <h4>Resumo das Turmas (${classes.length})</h4>
        ${this.renderClassesSummary(classes)}
      </div>
    `;
  }

  renderScheduleGrid(classes) {
    const hours = [];
    for (let i = 7; i <= 22; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return `
      <div class="schedule-grid">
        <div class="grid-header">
          <div class="time-header">Horário</div>
          ${days.map(day => `<div class="day-header">${day}</div>`).join('')}
        </div>
        ${hours.map(hour => `
          <div class="grid-row">
            <div class="time-cell">${hour}</div>
            ${days.map(day => {
              const classInSlot = this.findClassInSlot(classes, day, hour);
              return `
                <div class="schedule-cell ${classInSlot ? 'occupied' : 'empty'}">
                  ${classInSlot ? `
                    <div class="class-info">
                      <div class="class-name">${classInSlot.name}</div>
                      <div class="class-details">
                        ${classInSlot.room} - ${classInSlot.building}
                        <br>
                        ${classInSlot.students} alunos
                      </div>
                      <button class="edit-class-btn" data-class-id="${classInSlot.id}">✏️</button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderClassesSummary(classes) {
    if (classes.length === 0) {
      return `
        <div class="empty-classes">
          <p>Este professor ainda não possui turmas atribuídas.</p>
        </div>
      `;
    }

    const classesByPeriod = this.groupClassesByPeriod(classes);
    
    return `
      <div class="classes-list">
        ${Object.entries(classesByPeriod).map(([period, periodClasses]) => `
          <div class="period-group">
            <h5>${period}</h5>
            <div class="classes-grid">
              ${periodClasses.map(cls => `
                <div class="class-card">
                  <div class="class-header">
                    <h6>${cls.name}</h6>
                    <button class="edit-class-btn" data-class-id="${cls.id}">✏️</button>
                  </div>
                  <div class="class-info">
                    <p><strong>Sala:</strong> ${cls.room} - ${cls.building}</p>
                    <p><strong>Horário:</strong> ${cls.startTime} - ${cls.endTime}</p>
                    <p><strong>Dias:</strong> ${cls.days.join(', ')}</p>
                    <p><strong>Alunos:</strong> ${cls.students}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  findClassInSlot(classes, day, hour) {
    return classes.find(cls => {
      if (!cls.days.includes(day)) return false;
      
      const startHour = parseInt(cls.startTime.split(':')[0]);
      const endHour = parseInt(cls.endTime.split(':')[0]);
      const currentHour = parseInt(hour.split(':')[0]);
      
      return currentHour >= startHour && currentHour < endHour;
    });
  }

  groupClassesByPeriod(classes) {
    return classes.reduce((groups, cls) => {
      if (!groups[cls.period]) {
        groups[cls.period] = [];
      }
      groups[cls.period].push(cls);
      return groups;
    }, {});
  }

  calculateWorkload(classes) {
    return classes.reduce((total, cls) => {
      const startHour = parseInt(cls.startTime.split(':')[0]);
      const endHour = parseInt(cls.endTime.split(':')[0]);
      const hoursPerDay = endHour - startHour;
      const daysPerWeek = cls.days.length;
      return total + (hoursPerDay * daysPerWeek);
    }, 0);
  }

  exportToPDF() {
    if (!this.selectedTeacher) return;
    
    const teacher = this.selectedTeacher;
    const classes = this.dataManager.getClasses().filter(c => c.teacherId === teacher.id);
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horários - ${teacher.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .teacher-info { margin-bottom: 20px; }
          .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          .schedule-table th { background-color: #f5f5f5; }
          .occupied { background-color: #e3f2fd; }
          .class-summary { margin-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Grade de Horários</h1>
          <h2>${teacher.name}</h2>
          <p>${teacher.specialty} | ${teacher.email}</p>
        </div>
        
        <div class="teacher-info">
          <p><strong>Carga Horária:</strong> ${this.calculateWorkload(classes)}h / ${teacher.maxWorkload}h</p>
          <p><strong>Total de Turmas:</strong> ${classes.length}</p>
        </div>
        
        ${this.generatePDFScheduleTable(classes)}
        
        <div class="class-summary">
          <h3>Resumo das Turmas</h3>
          ${classes.map(cls => `
            <p><strong>${cls.name}</strong> - ${cls.room}/${cls.building} - ${cls.startTime}-${cls.endTime} (${cls.days.join(', ')})</p>
          `).join('')}
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  }

  generatePDFScheduleTable(classes) {
    const hours = [];
    for (let i = 7; i <= 22; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return `
      <table class="schedule-table">
        <thead>
          <tr>
            <th>Horário</th>
            ${days.map(day => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${hours.map(hour => `
            <tr>
              <td><strong>${hour}</strong></td>
              ${days.map(day => {
                const classInSlot = this.findClassInSlot(classes, day, hour);
                return `
                  <td class="${classInSlot ? 'occupied' : ''}">
                    ${classInSlot ? `${classInSlot.name}<br><small>${classInSlot.room}</small>` : ''}
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  attachEventListeners() {
    const teacherSelect = this.container.querySelector('#teacherSelect');
    if (teacherSelect) {
      teacherSelect.addEventListener('change', (e) => {
        const teacherId = e.target.value;
        if (teacherId) {
          this.selectedTeacher = this.dataManager.getTeachers().find(t => t.id === teacherId);
        } else {
          this.selectedTeacher = null;
        }
        this.updateView();
      });
    }

    const exportBtn = this.container.querySelector('#exportPdfBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToPDF();
      });
    }

    // Edit class buttons
    this.container.querySelectorAll('.edit-class-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const classId = e.target.getAttribute('data-class-id');
        this.editClass(classId);
      });
    });
  }

  editClass(classId) {
    const classToEdit = this.dataManager.getClasses().find(c => c.id === classId);
    if (classToEdit) {
      // Trigger class edit modal
      const event = new CustomEvent('editClass', { detail: { classId } });
      document.dispatchEvent(event);
    }
  }
}
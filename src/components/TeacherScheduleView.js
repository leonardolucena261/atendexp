export class TeacherScheduleView {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.selectedTeacher = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'teacher-schedule-view';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const teachers = this.dataManager.getTeachers();
    const selectedTeacher = this.selectedTeacher ? 
      teachers.find(t => t.id === this.selectedTeacher) : null;

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Horários dos Professores</h2>
          <p>Visualize e gerencie os horários de cada professor</p>
        </div>
        <div class="header-actions">
          ${selectedTeacher ? `
            <button class="btn btn-secondary" id="exportPdfBtn">
              <span>📄</span>
              Exportar PDF
            </button>
          ` : ''}
        </div>
      </div>

      <div class="content-section">
        <div class="filter-section">
          <select id="teacherFilter" class="filter-select">
            <option value="">Selecione um professor</option>
            ${teachers.map(teacher => 
              `<option value="${teacher.id}" ${this.selectedTeacher === teacher.id ? 'selected' : ''}>
                ${teacher.name} - ${teacher.specialty}
              </option>`
            ).join('')}
          </select>
        </div>

        ${selectedTeacher ? this.renderTeacherSchedule(selectedTeacher) : `
          <div class="empty-state">
            <h3>Selecione um professor</h3>
            <p>Escolha um professor para visualizar seus horários</p>
          </div>
        `}
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#teacherFilter').addEventListener('change', (e) => {
      this.selectedTeacher = e.target.value || null;
      this.renderContent();
    });

    if (selectedTeacher) {
      const exportBtn = this.container.querySelector('#exportPdfBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.exportToPDF(selectedTeacher);
        });
      }
    }
  }

  renderTeacherSchedule(teacher) {
    const classes = this.dataManager.getClassesByTeacher(teacher.id);
    const periods = this.dataManager.getPeriods();
    const currentWorkload = classes.reduce((total, cls) => total + (cls.workload || 0), 0);
    const workloadPercentage = Math.min((currentWorkload / teacher.maxWorkload) * 100, 100);
    
    let workloadStatus = 'normal';
    if (workloadPercentage > 100) {
      workloadStatus = 'exceeded';
    } else if (workloadPercentage > 85) {
      workloadStatus = 'high';
    }

    // Create weekly schedule grid
    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const timeSlots = this.generateTimeSlots();
    
    let scheduleGrid = `
      <div class="schedule-grid" id="scheduleGrid">
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
          <div class="schedule-cell ${classInSlot ? 'occupied' : 'free'}" 
               ${classInSlot ? `data-class-id="${classInSlot.id}"` : ''}>
            ${classInSlot ? `
              <div class="class-info">
                <div class="class-name">${classInSlot.name}</div>
                <div class="class-room">${this.getRoomName(classInSlot.roomId, this.dataManager.getRooms(), this.dataManager.getBuildings())}</div>
                <div class="class-students">${classInSlot.enrolledStudents} alunos</div>
                <button class="edit-class-btn" title="Editar turma">✏️</button>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      scheduleGrid += `</div>`;
    });

    scheduleGrid += `</div>`;

    // Group classes by period
    const classesByPeriod = {};
    periods.forEach(period => {
      classesByPeriod[period.id] = classes.filter(cls => cls.periodId === period.id);
    });

    const scheduleContent = `
      <div class="teacher-schedule-main">
        <div class="teacher-summary">
          <div class="teacher-info-card">
            <div class="teacher-avatar">👨‍🏫</div>
            <div class="teacher-details">
              <h3>${teacher.name}</h3>
              <p class="teacher-specialty">${teacher.specialty}</p>
              <p class="teacher-contact">${teacher.email} • ${teacher.phone}</p>
            </div>
          </div>
          
          <div class="workload-summary">
            <div class="workload-header">
              <span class="label">Carga Horária:</span>
              <span class="workload-status ${workloadStatus}">
                ${workloadStatus === 'exceeded' ? '⚠️ Excedida' : 
                  workloadStatus === 'high' ? '⚡ Quase lotada' : '✅ Adequada'}
              </span>
            </div>
            <div class="workload-bar">
              <div class="workload-fill ${workloadStatus}" style="width: ${workloadPercentage}%"></div>
            </div>
            <div class="workload-text">
              ${currentWorkload}h/${teacher.maxWorkload}h (${Math.round(workloadPercentage)}%) • ${classes.length} turmas
            </div>
          </div>
        </div>
        
        <div class="schedule-container">
          <h4>📅 Grade de Horários</h4>
          ${scheduleGrid}
        </div>
        
        <div class="classes-summary">
          <h4>📚 Turmas por Período</h4>
          ${periods.map(period => {
            const periodClasses = classesByPeriod[period.id] || [];
            return periodClasses.length > 0 ? `
              <div class="period-section">
                <h5>${period.name} (${period.year})</h5>
                <div class="period-classes">
                  ${periodClasses.map(cls => {
                    const room = this.dataManager.getRooms().find(r => r.id === cls.roomId);
                    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
                    return `
                      <div class="class-summary-card" data-class-id="${cls.id}">
                        <div class="class-summary-header">
                          <h6>${cls.name}</h6>
                          <button class="btn-icon edit-class-btn" title="Editar turma">✏️</button>
                        </div>
                        <div class="class-summary-details">
                          <span class="detail-item">🕐 ${cls.startTime} - ${cls.endTime}</span>
                          <span class="detail-item">📅 ${cls.weekDays.join(', ')}</span>
                          <span class="detail-item">🏢 ${room?.name} - ${building?.name}</span>
                          <span class="detail-item">👥 ${cls.enrolledStudents} alunos</span>
                          <span class="detail-item">⏱️ ${cls.workload}h</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : '';
          }).join('')}
          
          ${classes.length === 0 ? `
            <div class="empty-classes">
              <p>Este professor ainda não possui turmas cadastradas</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add event listeners for editing classes
    setTimeout(() => {
      this.addEditClassListeners();
    }, 100);

    return scheduleContent;
  }

  addEditClassListeners() {
    const editButtons = this.container.querySelectorAll('.edit-class-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const classCard = button.closest('[data-class-id]');
        if (classCard) {
          const classId = classCard.dataset.classId;
          this.editClass(classId);
        }
      });
    });
  }

  editClass(classId) {
    const classData = this.dataManager.getClasses().find(c => c.id === classId);
    if (classData) {
      // Import ClassManager dynamically to avoid circular dependencies
      import('./ClassManager.js').then(({ ClassManager }) => {
        const classManager = new ClassManager(this.dataManager);
        classManager.showClassModal(classData);
        
        // Refresh view after modal closes
        setTimeout(() => {
          this.renderContent();
        }, 1000);
      });
    }
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

  getRoomName(roomId) {
  getRoomName(roomId, rooms, buildings) {
    const room = rooms.find(r => r.id === roomId);
    const building = buildings.find(b => b.id === room?.buildingId);
    return `${room?.name} - ${building?.name}`;
  }

  exportToPDF(teacher) {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    const classes = this.dataManager.getClassesByTeacher(teacher.id);
    const periods = this.dataManager.getPeriods();
    const currentWorkload = classes.reduce((total, cls) => total + (cls.workload || 0), 0);

    // Group classes by period
    const classesByPeriod = {};
    periods.forEach(period => {
      classesByPeriod[period.id] = classes.filter(cls => cls.periodId === period.id);
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horários - ${teacher.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
          .teacher-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          .schedule-table th { background: #6366f1; color: white; }
          .occupied { background: #e0f2fe; }
          .class-info { font-size: 10px; line-height: 1.2; }
          .period-section { margin-bottom: 20px; }
          .period-title { background: #6366f1; color: white; padding: 10px; margin: 0; }
          .class-item { background: #f8fafc; margin: 5px 0; padding: 10px; border-left: 4px solid #6366f1; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cidade do Saber - Horários do Professor</h1>
          <h2>${teacher.name}</h2>
          <p>${teacher.specialty} • ${teacher.email} • ${teacher.phone}</p>
        </div>

        <div class="teacher-info">
          <h3>Resumo da Carga Horária</h3>
          <p><strong>Total:</strong> ${currentWorkload}h de ${teacher.maxWorkload}h</p>
          <p><strong>Turmas ativas:</strong> ${classes.length}</p>
          <p><strong>Data de geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <h3>Grade de Horários</h3>
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Horário</th>
              <th>Segunda</th>
              <th>Terça</th>
              <th>Quarta</th>
              <th>Quinta</th>
              <th>Sexta</th>
              <th>Sábado</th>
              <th>Domingo</th>
            </tr>
          </thead>
          <tbody>
            ${this.generateTimeSlots().map(timeSlot => `
              <tr>
                <td><strong>${timeSlot}</strong></td>
                ${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => {
                  const classInSlot = this.findClassInTimeSlot(classes, day, timeSlot);
                  return `
                    <td class="${classInSlot ? 'occupied' : ''}">
                      ${classInSlot ? `
                        <div class="class-info">
                          <strong>${classInSlot.name}</strong><br>
                          ${this.getRoomName(classInSlot.roomId, this.dataManager.getRooms(), this.dataManager.getBuildings())}<br>
                          ${classInSlot.enrolledStudents} alunos
                        </div>
                      ` : ''}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Detalhes das Turmas por Período</h3>
        ${periods.map(period => {
          const periodClasses = classesByPeriod[period.id] || [];
          return periodClasses.length > 0 ? `
            <div class="period-section">
              <h4 class="period-title">${period.name} (${period.year})</h4>
              ${periodClasses.map(cls => {
                const room = this.dataManager.getRooms().find(r => r.id === cls.roomId);
                const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
                return `
                  <div class="class-item">
                    <strong>${cls.name}</strong><br>
                    Horário: ${cls.startTime} - ${cls.endTime}<br>
                    Dias: ${cls.weekDays.join(', ')}<br>
                    Local: ${room?.name} - ${building?.name}<br>
                    Alunos: ${cls.enrolledStudents} • Carga: ${cls.workload}h
                  </div>
                `;
              }).join('')}
            </div>
          ` : '';
        }).join('')}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
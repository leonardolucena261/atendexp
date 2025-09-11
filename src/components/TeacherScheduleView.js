import { Modal } from './Modal.js';

export class TeacherScheduleView {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.selectedTeacher = null;
    this.container = document.createElement('div');
    this.container.className = 'teacher-schedule-main';
  }

  render() {
    this.renderContent();
    return this.container;
  }

  renderContent() {
    const teachers = this.dataManager.getTeachers();
    
    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>📅 Horários dos Professores</h2>
          <p>Visualize e gerencie os horários e escalas dos professores</p>
        </div>
        <div class="header-actions">
          <select id="teacherSelect" class="filter-select">
            <option value="">Selecione um professor</option>
            ${teachers.map(teacher => `
              <option value="${teacher.id}" ${this.selectedTeacher?.id === teacher.id ? 'selected' : ''}>
                ${teacher.name} - ${teacher.specialty}
              </option>
            `).join('')}
          </select>
          ${this.selectedTeacher ? `
            <button id="printScheduleBtn" class="btn btn-secondary">
              🖨️ Imprimir Horário
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
      <div class="content-section">
        <div class="empty-state">
          <div class="empty-icon">👨‍🏫</div>
          <h3>Selecione um professor</h3>
          <p>Escolha um professor no menu acima para visualizar sua escala de horários</p>
        </div>
      </div>
    `;
  }

  renderTeacherSchedule() {
    const teacher = this.selectedTeacher;
    const classes = this.dataManager.getClassesByTeacher(teacher.id);
    const enrichedClasses = this.enrichClassesData(classes);
    const currentWorkload = this.calculateWorkload(enrichedClasses);
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
      <div class="teacher-summary">
        <div class="teacher-info-card">
          <div class="teacher-avatar">${teacher.name.charAt(0).toUpperCase()}</div>
          <div class="teacher-details">
            <h3>${teacher.name}</h3>
            <p class="teacher-specialty">${teacher.specialty}</p>
            <p class="teacher-contact">📧 ${teacher.email} | 📞 ${teacher.phone}</p>
          </div>
        </div>
        
        <div class="workload-summary">
          <h4>📊 Carga Horária</h4>
          <div class="workload-header">
            <span class="workload-text">${currentWorkload}h / ${teacher.maxWorkload}h</span>
            <span class="workload-status ${workloadStatus}">
              ${statusIcon} ${statusText}
            </span>
          </div>
          <div class="workload-bar">
            <div class="workload-fill ${workloadStatus}" style="width: ${workloadPercentage}%"></div>
          </div>
          <p><strong>Turmas ativas:</strong> ${classes.length}</p>
        </div>
      </div>

      <div class="schedule-container">
        <h4>📅 Escala Semanal de Horários</h4>
        ${this.renderWeeklySchedule(enrichedClasses)}
      </div>

      <div class="classes-summary">
        <h4>📚 Resumo das Turmas (${classes.length})</h4>
        ${this.renderClassesSummary(enrichedClasses)}
      </div>
    `;
  }

  enrichClassesData(classes) {
    return classes.map(cls => {
      const room = this.dataManager.getRooms().find(r => r.id === cls.roomId);
      const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
      const period = this.dataManager.getPeriods().find(p => p.id === cls.periodId);
      
      return {
        ...cls,
        room: room?.name || 'Sala não encontrada',
        building: building?.name || 'Prédio não encontrado',
        period: period?.name || 'Período não encontrado',
        periodYear: period?.year || new Date().getFullYear()
      };
    });
  }

  renderWeeklySchedule(classes) {
    const timeSlots = this.generateTimeSlots();
    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    return `
      <div class="schedule-grid">
        <div class="schedule-header">
          <div class="time-column">Horário</div>
          ${weekDays.map(day => `<div class="day-column">${day}</div>`).join('')}
        </div>
        ${timeSlots.map(timeSlot => `
          <div class="schedule-row">
            <div class="time-slot">${timeSlot}</div>
            ${weekDays.map(day => {
              const classInSlot = this.findClassInTimeSlot(classes, day, timeSlot);
              return `
                <div class="schedule-cell ${classInSlot ? 'occupied' : 'free'}">
                  ${classInSlot ? `
                    <div class="class-info">
                      <div class="class-name">${classInSlot.name}</div>
                      <div class="class-room">${classInSlot.room}</div>
                      <div class="class-students">${classInSlot.enrolledStudents} alunos</div>
                      <button class="edit-class-btn" data-class-id="${classInSlot.id}" title="Editar turma">✏️</button>
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
      ${Object.entries(classesByPeriod).map(([periodKey, periodClasses]) => `
        <div class="period-section">
          <h5>${periodKey}</h5>
          <div class="period-classes">
            ${periodClasses.map(cls => `
              <div class="class-summary-card">
                <div class="class-summary-header">
                  <h6>${cls.name}</h6>
                  <button class="btn-icon edit-class-btn" data-class-id="${cls.id}" title="Editar turma">✏️</button>
                </div>
                <div class="class-summary-details">
                  <span class="detail-item">📍 ${cls.room} - ${cls.building}</span>
                  <span class="detail-item">🕐 ${cls.startTime} - ${cls.endTime}</span>
                  <span class="detail-item">📅 ${cls.weekDays.join(', ')}</span>
                  <span class="detail-item">👥 ${cls.enrolledStudents} alunos</span>
                  <span class="detail-item">⏱️ ${cls.workload}h</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;
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

  groupClassesByPeriod(classes) {
    return classes.reduce((groups, cls) => {
      const key = `${cls.period} (${cls.periodYear})`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(cls);
      return groups;
    }, {});
  }

  calculateWorkload(classes) {
    return classes.reduce((total, cls) => total + (cls.workload || 0), 0);
  }

  printSchedule() {
    if (!this.selectedTeacher) return;
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!printWindow) {
      alert('🚫 Pop-up bloqueado!\n\nPor favor, permita pop-ups para este site e tente novamente para imprimir o horário.');
      return;
    }
    
    const teacher = this.selectedTeacher;
    const classes = this.dataManager.getClassesByTeacher(teacher.id);
    const enrichedClasses = this.enrichClassesData(classes);
    const currentWorkload = this.calculateWorkload(enrichedClasses);
    
    // Gerar conteúdo HTML otimizado para impressão
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Horário do Professor - ${teacher.name}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            color: #333;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 25px; 
            border-bottom: 2px solid #6366f1;
            padding-bottom: 15px;
          }
          
          .header h1 {
            color: #6366f1;
            margin: 0 0 8px 0;
            font-size: 24px;
          }
          
          .header h2 {
            margin: 0 0 8px 0;
            font-size: 20px;
            color: #1e293b;
          }
          
          .header p {
            margin: 4px 0;
            font-size: 14px;
          }
          
          .teacher-info { 
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .teacher-info h3 {
            margin-top: 0;
            margin-bottom: 8px;
            color: #1e293b;
            font-size: 16px;
          }
          
          .teacher-info p {
            margin: 4px 0;
            font-size: 13px;
          }
          
          .schedule-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            font-size: 10px;
            table-layout: fixed;
          }
          
          .schedule-table th, .schedule-table td { 
            border: 1px solid #e2e8f0; 
            padding: 4px; 
            text-align: center; 
            vertical-align: middle;
            word-wrap: break-word;
          }
          
          .schedule-table th { 
            background-color: #6366f1; 
            color: white;
            font-weight: bold;
            font-size: 11px;
          }
          
          .time-header {
            background-color: #8b5cf6 !important;
            font-weight: bold;
            width: 60px;
          }
          
          .day-header {
            width: calc((100% - 60px) / 7);
          }
          
          .occupied { 
            background-color: #dbeafe; 
            font-size: 9px;
            line-height: 1.2;
            padding: 2px;
          }
          
          .class-name {
            font-weight: bold;
            margin-bottom: 1px;
            font-size: 9px;
          }
          
          .class-details {
            font-size: 8px;
            color: #64748b;
            line-height: 1.1;
          }
          
          .summary-section { 
            margin-top: 20px; 
            page-break-inside: avoid;
          }
          
          .summary-section h3 {
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 12px;
            font-size: 16px;
          }
          
          .class-item {
            margin-bottom: 8px;
            padding: 8px;
            background: #f1f5f9;
            border-radius: 4px;
            font-size: 11px;
          }
          
          .class-item strong {
            color: #6366f1;
          }
          
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
          
          @media print { 
            body { 
              margin: 0;
              padding: 10px;
              font-size: 11px;
            }
            .header { page-break-after: avoid; }
            .schedule-table { page-break-inside: avoid; }
            .summary-section { page-break-before: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Horário do Professor</h1>
          <h2>${teacher.name}</h2>
          <p><strong>${teacher.specialty}</strong></p>
          <p>📧 ${teacher.email} | 📞 ${teacher.phone}</p>
        </div>
        
        <div class="teacher-info">
          <div>
            <h3>📊 Resumo da Carga Horária</h3>
            <p><strong>Carga Horária Total:</strong> ${currentWorkload}h de ${teacher.maxWorkload}h (${Math.round((currentWorkload / teacher.maxWorkload) * 100)}%)</p>
            <p><strong>Total de Turmas:</strong> ${classes.length}</p>
          </div>
          <div>
            <h3>📄 Informações do Documento</h3>
            <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p><strong>Sistema:</strong> Cidade do Saber</p>
          </div>
        </div>
        
        <h3>📅 Grade Semanal de Horários</h3>
        ${this.generatePrintScheduleTable(enrichedClasses)}
        
        <div class="summary-section">
          <h3>📚 Detalhamento das Turmas</h3>
          ${enrichedClasses.map(cls => `
            <div class="class-item">
              <p><strong>${cls.name}</strong></p>
              <p>📍 <strong>Local:</strong> ${cls.room} - ${cls.building} | 🕐 <strong>Horário:</strong> ${cls.startTime} - ${cls.endTime}</p>
              <p>📅 <strong>Dias:</strong> ${cls.weekDays.join(', ')} | 👥 <strong>Alunos:</strong> ${cls.enrolledStudents} | ⏱️ <strong>Carga:</strong> ${cls.workload}h</p>
              <p>📚 <strong>Período:</strong> ${cls.period} (${cls.periodYear})</p>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>Documento gerado pelo Sistema Administrativo - Cidade do Saber</p>
          <p>Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Aguardar carregamento e focar na janela antes de imprimir
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Fechar janela após impressão (opcional)
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }, 1000);
  }

  generatePrintScheduleTable(classes) {
    const timeSlots = this.generateTimeSlots();
    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    return `
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="time-header">Horário</th>
            ${weekDays.map(day => `<th class="day-header">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${timeSlots.map(timeSlot => `
            <tr>
              <td class="time-header"><strong>${timeSlot}</strong></td>
              ${weekDays.map(day => {
                const classInSlot = this.findClassInTimeSlot(classes, day, timeSlot);
                return `
                  <td class="${classInSlot ? 'occupied' : ''}">
                    ${classInSlot ? `
                      <div class="class-name">${classInSlot.name}</div>
                      <div class="class-details">
                        ${classInSlot.room}<br>${classInSlot.enrolledStudents} alunos
                      </div>
                    ` : ''}
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
        this.renderContent();
      });
    }

    const printBtn = this.container.querySelector('#printScheduleBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printSchedule();
      });
    }

    // Botões de editar turma
    this.container.querySelectorAll('.edit-class-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const classId = e.target.getAttribute('data-class-id');
        this.editClass(classId);
      });
    });
  }

  editClass(classId) {
    const classToEdit = this.dataManager.getClasses().find(c => c.id === classId);
    if (!classToEdit) return;

    // Importar e usar o ClassManager para abrir o modal de edição
    import('./ClassManager.js').then(({ ClassManager }) => {
      const classManager = new ClassManager(this.dataManager);
      classManager.showClassModal(classToEdit);
      
      // Atualizar a visualização após fechar o modal
      const checkForUpdates = setInterval(() => {
        if (!document.querySelector('.modal-overlay')) {
          clearInterval(checkForUpdates);
          this.renderContent(); // Atualizar a escala
        }
      }, 500);
    });
  }

  // Método para atualizar a visualização quando uma turma for modificada
  refreshSchedule() {
    if (this.selectedTeacher) {
      this.renderContent();
    }
  }
}
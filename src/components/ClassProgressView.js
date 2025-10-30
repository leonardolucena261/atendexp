import { Modal } from './Modal.js';

export class ClassProgressView {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.selectedClass = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'class-progress-view';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const classes = this.dataManager.getClasses();
    const coursesWithModules = this.getClassesWithCourseInfo(classes);

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>📈 Progressão das Turmas</h2>
          <p>Acompanhe o progresso das turmas ao longo dos cursos</p>
        </div>
      </div>

      <div class="content-section">
        <div class="filter-section">
          <select id="classFilter" class="filter-select">
            <option value="">Selecione uma turma</option>
            ${classes.map(cls => {
              const room = this.dataManager.getRooms().find(r => r.id === cls.roomId);
              const period = this.dataManager.getPeriods().find(p => p.id === cls.periodId);
              return `<option value="${cls.id}">
                ${cls.name} - ${period?.name} (${period?.year})
              </option>`;
            }).join('')}
          </select>
        </div>
        
        ${this.selectedClass ? this.renderClassProgress() : this.renderEmptyState()}
      </div>
    `;

    this.attachEventListeners();
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>Selecione uma turma</h3>
        <p>Escolha uma turma no menu acima para visualizar sua progressão no curso</p>
      </div>
    `;
  }

  renderClassProgress() {
    const classData = this.selectedClass;
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const currentModule = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const allModules = this.dataManager.getModulesByCourse(classData.courseId);
    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);
    const teacher = this.dataManager.getTeachers().find(t => t.id === classData.teacherId);

    if (!course || !currentModule) {
      return `
        <div class="error-state">
          <h3>⚠️ Erro</h3>
          <p>Esta turma não está vinculada a um curso ou módulo válido.</p>
        </div>
      `;
    }

    const sortedModules = allModules.sort((a, b) => a.order - b.order);
    const currentModuleIndex = sortedModules.findIndex(m => m.id === currentModule.id);
    const progressPercentage = ((currentModuleIndex + 1) / sortedModules.length) * 100;
    const completedWorkload = sortedModules.slice(0, currentModuleIndex + 1)
      .reduce((total, module) => total + module.workload, 0);
    const totalWorkload = sortedModules.reduce((total, module) => total + module.workload, 0);

    return `
      <div class="class-progress-container">
        <div class="class-summary">
          <div class="class-info-card">
            <h3>${classData.name}</h3>
            <div class="class-details">
              <p><strong>📚 Curso:</strong> ${course.name}</p>
              <p><strong>📍 Local:</strong> ${room?.name} - ${building?.name}</p>
              <p><strong>👨‍🏫 Professor:</strong> ${teacher?.name || 'Não atribuído'}</p>
              <p><strong>📅 Período:</strong> ${period?.name} (${period?.year})</p>
              <p><strong>👥 Alunos:</strong> ${classData.enrolledStudents}</p>
            </div>
          </div>
          
          <div class="progress-summary">
            <h4>📊 Progresso Geral</h4>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
              </div>
              <div class="progress-text">
                ${Math.round(progressPercentage)}% concluído
              </div>
            </div>
            <div class="progress-stats">
              <div class="stat">
                <strong>Módulo Atual:</strong> ${currentModuleIndex + 1} de ${sortedModules.length}
              </div>
              <div class="stat">
                <strong>Carga Horária:</strong> ${completedWorkload}h de ${totalWorkload}h
              </div>
            </div>
          </div>
        </div>

        <div class="course-timeline">
          <h4>🗓️ Linha do Tempo do Curso</h4>
          <div class="timeline">
            ${sortedModules.map((module, index) => {
              const isCompleted = index < currentModuleIndex;
              const isCurrent = index === currentModuleIndex;
              const isPending = index > currentModuleIndex;
              
              let statusClass = 'pending';
              let statusIcon = '⏳';
              let statusText = 'Pendente';
              
              if (isCompleted) {
                statusClass = 'completed';
                statusIcon = '✅';
                statusText = 'Concluído';
              } else if (isCurrent) {
                statusClass = 'current';
                statusIcon = '🎯';
                statusText = 'Em Andamento';
              }

              return `
                <div class="timeline-item ${statusClass}">
                  <div class="timeline-marker">
                    <span class="timeline-icon">${statusIcon}</span>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h5>${module.name}</h5>
                      <span class="timeline-status ${statusClass}">${statusText}</span>
                    </div>
                    <p class="timeline-description">${module.description}</p>
                    <div class="timeline-details">
                      <span class="timeline-workload">⏱️ ${module.workload}h</span>
                      <span class="timeline-order">📋 Ordem: ${module.order}</span>
                    </div>
                    ${isCurrent ? `
                      <div class="timeline-actions">
                        <button class="btn btn-primary advance-btn" data-class-id="${classData.id}" data-current-module="${module.id}">
                          ➡️ Avançar para Próximo Módulo
                        </button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="class-history">
          <h4>📋 Histórico da Turma</h4>
          <div class="history-item">
            <div class="history-date">${new Date(classData.createdAt).toLocaleDateString('pt-BR')}</div>
            <div class="history-content">
              <strong>Turma criada</strong> - Iniciada no módulo "${currentModule.name}"
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getClassesWithCourseInfo(classes) {
    return classes.map(cls => {
      const course = this.dataManager.getCourses().find(c => c.id === cls.courseId);
      const module = this.dataManager.getCourseModules().find(m => m.id === cls.moduleId);
      return {
        ...cls,
        course,
        module
      };
    });
  }

  attachEventListeners() {
    const classFilter = this.container.querySelector('#classFilter');
    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        const classId = e.target.value;
        if (classId) {
          this.selectedClass = this.dataManager.getClasses().find(c => c.id === classId);
        } else {
          this.selectedClass = null;
        }
        this.renderContent();
      });
    }

    // Advance button
    const advanceBtn = this.container.querySelector('.advance-btn');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', (e) => {
        const classId = e.target.getAttribute('data-class-id');
        const currentModuleId = e.target.getAttribute('data-current-module');
        this.showAdvanceModal(classId, currentModuleId);
      });
    }
  }

  showAdvanceModal(classId, currentModuleId) {
    const classData = this.dataManager.getClasses().find(c => c.id === classId);
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const allModules = this.dataManager.getModulesByCourse(classData.courseId);
    const sortedModules = allModules.sort((a, b) => a.order - b.order);
    const currentModuleIndex = sortedModules.findIndex(m => m.id === currentModuleId);
    const nextModule = sortedModules[currentModuleIndex + 1];

    if (!nextModule) {
      alert('🎉 Parabéns! Esta turma já concluiu todos os módulos do curso.');
      return;
    }

    const modalContent = `
      <div class="advance-modal">
        <div class="advance-info">
          <h4>➡️ Avançar Turma para Próximo Módulo</h4>
          <p><strong>Turma:</strong> ${classData.name}</p>
          <p><strong>Curso:</strong> ${course.name}</p>
          <p><strong>Próximo Módulo:</strong> ${nextModule.name}</p>
          <p><strong>Carga Horária:</strong> ${nextModule.workload}h</p>
        </div>
        
        <div class="advance-options">
          <h5>Como deseja proceder?</h5>
          <div class="option-group">
            <label class="option-item">
              <input type="radio" name="advanceOption" value="update" checked>
              <div class="option-content">
                <strong>Atualizar turma atual</strong>
                <p>A turma atual será atualizada para o próximo módulo</p>
              </div>
            </label>
            <label class="option-item">
              <input type="radio" name="advanceOption" value="create">
              <div class="option-content">
                <strong>Criar nova turma</strong>
                <p>Uma nova turma será criada para o próximo módulo</p>
              </div>
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelAdvanceBtn">Cancelar</button>
          <button type="button" class="btn btn-primary" id="confirmAdvanceBtn">Confirmar Avanço</button>
        </div>
      </div>
    `;

    const modal = new Modal('Avançar Turma', modalContent);
    document.body.appendChild(modal.render());

    document.getElementById('confirmAdvanceBtn').addEventListener('click', () => {
      const selectedOption = document.querySelector('input[name="advanceOption"]:checked').value;
      this.advanceClass(classId, nextModule, selectedOption);
      modal.close();
    });

    document.getElementById('cancelAdvanceBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  advanceClass(classId, nextModule, option) {
    const classData = this.dataManager.getClasses().find(c => c.id === classId);
    
    if (option === 'update') {
      // Update current class
      this.dataManager.updateClass(classId, {
        moduleId: nextModule.id,
        workload: nextModule.workload
      });
      
      alert('✅ Turma avançada com sucesso para o próximo módulo!');
    } else {
      // Create new class
      const newClassData = {
        ...classData,
        name: `${classData.name} - ${nextModule.name}`,
        moduleId: nextModule.id,
        workload: nextModule.workload,
        enrolledStudents: classData.enrolledStudents
      };
      
      delete newClassData.id;
      delete newClassData.createdAt;
      
      this.dataManager.addClass(newClassData);
      
      alert('✅ Nova turma criada com sucesso para o próximo módulo!');
    }
    
    this.renderContent();
  }
}
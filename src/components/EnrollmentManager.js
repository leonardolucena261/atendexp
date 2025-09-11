import { Modal } from './Modal.js';

export class EnrollmentManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.selectedPeriod = null;
    this.selectedClass = null;
    this.selectedStatus = '';
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'enrollment-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const periods = this.dataManager.getPeriods();
    const classes = this.dataManager.getClasses();
    const enrollments = this.getFilteredEnrollments();

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Gerenciamento de Matrículas</h2>
          <p>Matricule alunos nas turmas e gerencie as matrículas</p>
        </div>
        <button class="btn btn-primary" id="addEnrollmentBtn">
          <span>➕</span>
          Nova Matrícula
        </button>
      </div>

      <div class="content-section">
        <div class="filter-section">
          <select id="periodFilter" class="filter-select">
            <option value="">Todos os períodos</option>
            ${periods.map(period => 
              `<option value="${period.id}" ${this.selectedPeriod === period.id ? 'selected' : ''}>
                ${period.name} (${period.year})
              </option>`
            ).join('')}
          </select>
          <select id="classFilter" class="filter-select">
            <option value="">Todas as turmas</option>
            ${classes.map(cls => 
              `<option value="${cls.id}" ${this.selectedClass === cls.id ? 'selected' : ''}>
                ${cls.name}
              </option>`
            ).join('')}
          </select>
          <select id="statusFilter" class="filter-select">
            <option value="">Todos os status</option>
            <option value="active" ${this.selectedStatus === 'active' ? 'selected' : ''}>Ativa</option>
            <option value="completed" ${this.selectedStatus === 'completed' ? 'selected' : ''}>Concluída</option>
            <option value="cancelled" ${this.selectedStatus === 'cancelled' ? 'selected' : ''}>Cancelada</option>
          </select>
          <div class="filter-info">
            <span>📊 ${enrollments.length} matrícula${enrollments.length !== 1 ? 's' : ''} encontrada${enrollments.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div class="enrollments-grid" id="enrollmentsGrid">
          ${this.renderEnrollments(enrollments)}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addEnrollmentBtn').addEventListener('click', () => {
      this.showEnrollmentModal();
    });

    // Add filter listeners
    this.container.querySelector('#periodFilter').addEventListener('change', (e) => {
      this.selectedPeriod = e.target.value || null;
      this.renderContent();
    });

    this.container.querySelector('#classFilter').addEventListener('change', (e) => {
      this.selectedClass = e.target.value || null;
      this.renderContent();
    });

    this.container.querySelector('#statusFilter').addEventListener('change', (e) => {
      this.selectedStatus = e.target.value || null;
      this.renderContent();
    });

    // Add event listeners for enrollment cards
    this.addEnrollmentEventListeners(enrollments);
  }

  renderEnrollments(enrollments) {
    if (enrollments.length === 0) {
      return `
        <div class="empty-state">
          <h3>Nenhuma matrícula encontrada</h3>
          <p>Cadastre a primeira matrícula para começar</p>
        </div>
      `;
    }

    return enrollments.map(enrollment => this.renderEnrollmentCard(enrollment)).join('');
  }

  renderEnrollmentCard(enrollment) {
    const student = this.dataManager.getStudents().find(s => s.id === enrollment.studentId);
    const classData = this.dataManager.getClasses().find(c => c.id === enrollment.classId);
    const course = this.dataManager.getCourses().find(c => c.id === classData?.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData?.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData?.periodId);
    const room = this.dataManager.getRooms().find(r => r.id === classData?.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);

    const statusColors = {
      active: 'success',
      completed: 'info',
      cancelled: 'error'
    };

    const statusLabels = {
      active: 'Ativa',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };

    const statusIcons = {
      active: '✅',
      completed: '🎓',
      cancelled: '❌'
    };

    return `
      <div class="enrollment-card" data-enrollment-id="${enrollment.id}">
        <div class="enrollment-header">
          <div class="enrollment-info">
            <h3>${student?.name || 'Aluno não encontrado'}</h3>
            <p class="class-name">${classData?.name || 'Turma não encontrada'}</p>
          </div>
          <div class="enrollment-actions">
            <button class="btn-icon edit-btn" title="Editar matrícula">✏️</button>
            <button class="btn-icon delete-btn" title="Cancelar matrícula">🗑️</button>
          </div>
        </div>
        <div class="enrollment-details">
          <div class="enrollment-status">
            <span class="status-badge ${statusColors[enrollment.status]}">
              ${statusIcons[enrollment.status]} ${statusLabels[enrollment.status]}
            </span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Curso:</span>
            <span class="value">${course?.name || 'N/A'}</span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Módulo:</span>
            <span class="value">${module?.name || 'N/A'}</span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Período:</span>
            <span class="value">${period?.name} (${period?.year})</span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Local:</span>
            <span class="value">${room?.name} - ${building?.name}</span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Horário:</span>
            <span class="value">${classData?.startTime} - ${classData?.endTime}</span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Dias:</span>
            <span class="value">${classData?.weekDays?.join(', ') || 'N/A'}</span>
          </div>
          <div class="enrollment-detail">
            <span class="label">Data da Matrícula:</span>
            <span class="value">${new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="student-contact">
            <div class="enrollment-detail">
              <span class="label">Email:</span>
              <span class="value">${student?.email || 'N/A'}</span>
            </div>
            <div class="enrollment-detail">
              <span class="label">Telefone:</span>
              <span class="value">${student?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showEnrollmentModal(enrollment = null) {
    const isEdit = enrollment !== null;
    const title = isEdit ? 'Editar Matrícula' : 'Nova Matrícula';
    
    const students = this.dataManager.getStudents().filter(s => s.status === 'active');
    const classes = this.dataManager.getClasses();
    const periods = this.dataManager.getPeriods();

    const formHtml = `
      <form id="enrollmentForm" class="modal-form">
        <div class="form-group">
          <label for="enrollmentStudent">Aluno</label>
          <select id="enrollmentStudent" required ${isEdit ? 'disabled' : ''}>
            <option value="">Selecione o aluno</option>
            ${students.map(student => 
              `<option value="${student.id}" ${enrollment?.studentId === student.id ? 'selected' : ''}>
                ${student.name} - ${student.email}
              </option>`
            ).join('')}
          </select>
          ${isEdit ? `<input type="hidden" id="hiddenStudentId" value="${enrollment.studentId}">` : ''}
        </div>
        
        <div class="form-group">
          <label for="enrollmentPeriod">Período Letivo</label>
          <select id="enrollmentPeriod" required>
            <option value="">Selecione o período</option>
            ${periods.map(period => 
              `<option value="${period.id}">
                ${period.name} (${period.year})
              </option>`
            ).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="enrollmentClass">Turma</label>
          <select id="enrollmentClass" required>
            <option value="">Primeiro selecione um período</option>
          </select>
        </div>
        
        <div class="class-info" id="classInfo" style="display: none;">
          <h4>Informações da Turma</h4>
          <div id="classDetails"></div>
        </div>
        
        <div class="form-group">
          <label for="enrollmentStatus">Status da Matrícula</label>
          <select id="enrollmentStatus" required>
            <option value="active" ${enrollment?.status === 'active' ? 'selected' : ''}>Ativa</option>
            <option value="completed" ${enrollment?.status === 'completed' ? 'selected' : ''}>Concluída</option>
            <option value="cancelled" ${enrollment?.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Atualizar' : 'Matricular'}
          </button>
        </div>
      </form>
    `;

    const modal = new Modal(title, formHtml);
    document.body.appendChild(modal.render());

    // Handle period selection change
    document.getElementById('enrollmentPeriod').addEventListener('change', (e) => {
      const periodId = e.target.value;
      const classSelect = document.getElementById('enrollmentClass');
      
      if (periodId) {
        const periodClasses = classes.filter(cls => cls.periodId === periodId);
        classSelect.innerHTML = `
          <option value="">Selecione a turma</option>
          ${periodClasses.map(cls => {
            const availableSpots = this.dataManager.getAvailableSpots(cls.id);
            return `<option value="${cls.id}" ${enrollment?.classId === cls.id ? 'selected' : ''}>
              ${cls.name} (${availableSpots} vagas disponíveis)
            </option>`;
          }).join('')}
        `;
      } else {
        classSelect.innerHTML = '<option value="">Primeiro selecione um período</option>';
      }
      
      // Clear class info
      document.getElementById('classInfo').style.display = 'none';
    });

    // Handle class selection change
    document.getElementById('enrollmentClass').addEventListener('change', (e) => {
      const classId = e.target.value;
      const classInfo = document.getElementById('classInfo');
      const classDetails = document.getElementById('classDetails');
      
      if (classId) {
        const classData = classes.find(c => c.id === classId);
        const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
        const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
        const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
        const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
        const availableSpots = this.dataManager.getAvailableSpots(classId);
        
        classDetails.innerHTML = `
          <div class="class-detail-grid">
            <div class="detail-item">
              <strong>Curso:</strong> ${course?.name || 'N/A'}
            </div>
            <div class="detail-item">
              <strong>Módulo:</strong> ${module?.name || 'N/A'}
            </div>
            <div class="detail-item">
              <strong>Local:</strong> ${room?.name} - ${building?.name}
            </div>
            <div class="detail-item">
              <strong>Horário:</strong> ${classData.startTime} - ${classData.endTime}
            </div>
            <div class="detail-item">
              <strong>Dias:</strong> ${classData.weekDays.join(', ')}
            </div>
            <div class="detail-item">
              <strong>Vagas disponíveis:</strong> ${availableSpots}
            </div>
          </div>
        `;
        
        classInfo.style.display = 'block';
      } else {
        classInfo.style.display = 'none';
      }
    });

    // Set initial values if editing
    if (isEdit) {
      const classData = classes.find(c => c.id === enrollment.classId);
      if (classData) {
        document.getElementById('enrollmentPeriod').value = classData.periodId;
        document.getElementById('enrollmentPeriod').dispatchEvent(new Event('change'));
        setTimeout(() => {
          document.getElementById('enrollmentClass').value = enrollment.classId;
          document.getElementById('enrollmentClass').dispatchEvent(new Event('change'));
        }, 100);
      }
    }

    // Handle form submission
    document.getElementById('enrollmentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEnrollmentData(enrollment?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  saveEnrollmentData(enrollmentId = null) {
    const studentId = enrollmentId ? 
      document.getElementById('hiddenStudentId')?.value || document.getElementById('enrollmentStudent').value :
      document.getElementById('enrollmentStudent').value;
    const classId = document.getElementById('enrollmentClass').value;
    const status = document.getElementById('enrollmentStatus').value;

    // Check if student is already enrolled in this class
    if (!enrollmentId && this.dataManager.isStudentEnrolled(studentId, classId)) {
      alert('Este aluno já está matriculado nesta turma.');
      return;
    }

    // Check available spots
    const availableSpots = this.dataManager.getAvailableSpots(classId);
    if (!enrollmentId && availableSpots <= 0) {
      alert('Esta turma não possui vagas disponíveis.');
      return;
    }

    const enrollmentData = {
      studentId,
      classId,
      status,
      enrollmentDate: enrollmentId ? undefined : new Date().toISOString()
    };

    if (enrollmentId) {
      this.dataManager.updateEnrollment(enrollmentId, enrollmentData);
    } else {
      this.dataManager.addEnrollment(enrollmentData);
    }

    this.renderContent();
  }

  addEnrollmentEventListeners(enrollments) {
    enrollments.forEach(enrollment => {
      const card = this.container.querySelector(`[data-enrollment-id="${enrollment.id}"]`);
      if (card) {
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            this.showEnrollmentModal(enrollment);
          });
        }
        
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            this.deleteEnrollment(enrollment.id);
          });
        }
      }
    });
  }

  getFilteredEnrollments() {
    let enrollments = this.dataManager.getEnrollments();
    
    if (this.selectedPeriod) {
      const periodClasses = this.dataManager.getClasses().filter(c => c.periodId === this.selectedPeriod);
      const classIds = periodClasses.map(c => c.id);
      enrollments = enrollments.filter(e => classIds.includes(e.classId));
    }
    
    if (this.selectedClass) {
      enrollments = enrollments.filter(e => e.classId === this.selectedClass);
    }
    
    if (this.selectedStatus) {
      enrollments = enrollments.filter(e => e.status === this.selectedStatus);
    }
    
    return enrollments;
  }

  deleteEnrollment(enrollmentId) {
    if (confirm('Tem certeza que deseja cancelar esta matrícula? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteEnrollment(enrollmentId);
      this.renderContent();
    }
  }
}
import { Modal } from './Modal.js';

export class StudentManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.nameFilter = '';
    this.statusFilter = '';
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'student-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const allStudents = this.dataManager.getStudents();
    const students = this.getFilteredStudents(allStudents);

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Gerenciamento de Alunos</h2>
          <p>Cadastre e gerencie os alunos da Cidade do Saber</p>
        </div>
        <button class="btn btn-primary" id="addStudentBtn">
          <span>➕</span>
          Novo Aluno
        </button>
      </div>

      <div class="content-section">
        <div class="filter-section">
          <input 
            type="text" 
            id="nameFilter" 
            class="filter-select" 
            placeholder="🔍 Buscar por nome ou email..."
            value="${this.nameFilter}"
            style="min-width: 300px;"
          >
          <select id="statusFilter" class="filter-select">
            <option value="">Todos os status</option>
            <option value="active" ${this.statusFilter === 'active' ? 'selected' : ''}>Ativo</option>
            <option value="inactive" ${this.statusFilter === 'inactive' ? 'selected' : ''}>Inativo</option>
            <option value="suspended" ${this.statusFilter === 'suspended' ? 'selected' : ''}>Suspenso</option>
          </select>
          <div class="filter-info">
            <span>📊 ${students.length} aluno${students.length !== 1 ? 's' : ''} encontrado${students.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="students-grid" id="studentsGrid">
          ${students.map(student => this.renderStudentCard(student)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addStudentBtn').addEventListener('click', () => {
      this.showStudentModal();
    });

    // Add filter listeners
    this.container.querySelector('#nameFilter').addEventListener('input', (e) => {
      this.nameFilter = e.target.value;
      this.updateStudentsList();
    });

    this.container.querySelector('#statusFilter').addEventListener('change', (e) => {
      this.statusFilter = e.target.value;
      this.renderContent();
    });

    // Add event listeners for student cards
    students.forEach(student => {
      const card = this.container.querySelector(`[data-student-id="${student.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showStudentModal(student);
      });

      card.querySelector('.enrollments-btn').addEventListener('click', () => {
        this.showStudentEnrollments(student);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteStudent(student.id);
      });
    });
  }

  updateStudentsList() {
    const allStudents = this.dataManager.getStudents();
    const students = this.getFilteredStudents(allStudents);
    
    const studentsGrid = this.container.querySelector('#studentsGrid');
    const filterInfo = this.container.querySelector('.filter-info span');
    
    studentsGrid.innerHTML = students.map(student => this.renderStudentCard(student)).join('');
    filterInfo.textContent = `📊 ${students.length} aluno${students.length !== 1 ? 's' : ''} encontrado${students.length !== 1 ? 's' : ''}`;
    
    // Re-add event listeners for student cards
    students.forEach(student => {
      const card = this.container.querySelector(`[data-student-id="${student.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showStudentModal(student);
      });

      card.querySelector('.enrollments-btn').addEventListener('click', () => {
        this.showStudentEnrollments(student);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteStudent(student.id);
      });
    });
  }

  renderStudentCard(student) {
    const enrollments = this.dataManager.getEnrollmentsByStudent(student.id);
    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    
    const statusColors = {
      active: 'success',
      inactive: 'warning',
      suspended: 'error'
    };

    const statusLabels = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso'
    };

    const statusIcons = {
      active: '✅',
      inactive: '⏸️',
      suspended: '⚠️'
    };

    const age = this.calculateAge(student.birthDate);

    return `
      <div class="student-card" data-student-id="${student.id}">
        <div class="student-header">
          <h3>${student.name}</h3>
          <div class="student-actions">
            <button class="btn-icon edit-btn" title="Editar aluno">✏️</button>
            <button class="btn-icon enrollments-btn" title="Ver matrículas">📚</button>
            <button class="btn-icon delete-btn" title="Excluir aluno">🗑️</button>
          </div>
        </div>
        <div class="student-info">
          <div class="student-status">
            <span class="status-badge ${statusColors[student.status]}">
              ${statusIcons[student.status]} ${statusLabels[student.status]}
            </span>
          </div>
          <div class="student-detail">
            <span class="label">Email:</span>
            <span class="value">${student.email}</span>
          </div>
          <div class="student-detail">
            <span class="label">Telefone:</span>
            <span class="value">${student.phone}</span>
          </div>
          <div class="student-detail">
            <span class="label">Idade:</span>
            <span class="value">${age} anos</span>
          </div>
          <div class="student-detail">
            <span class="label">CPF:</span>
            <span class="value">${student.cpf}</span>
          </div>
          <div class="student-detail">
            <span class="label">Endereço:</span>
            <span class="value">${student.address.street}, ${student.address.neighborhood}</span>
          </div>
          <div class="student-detail">
            <span class="label">Cidade:</span>
            <span class="value">${student.address.city} - ${student.address.state}</span>
          </div>
          <div class="student-detail">
            <span class="label">Contato de Emergência:</span>
            <span class="value">${student.emergencyContact.name} (${student.emergencyContact.relationship})</span>
          </div>
          <div class="student-detail">
            <span class="label">Telefone de Emergência:</span>
            <span class="value">${student.emergencyContact.phone}</span>
          </div>
          <div class="enrollments-summary">
            <div class="enrollments-header">
              <span class="label">📚 Matrículas:</span>
              <span class="enrollments-count">${activeEnrollments.length} ativa${activeEnrollments.length !== 1 ? 's' : ''}</span>
            </div>
            ${activeEnrollments.length > 0 ? `
              <div class="enrollments-list">
                ${activeEnrollments.slice(0, 3).map(enrollment => {
                  const classData = this.dataManager.getClasses().find(c => c.id === enrollment.classId);
                  return `
                    <div class="enrollment-item">
                      <span class="class-name">${classData?.name || 'Turma não encontrada'}</span>
                    </div>
                  `;
                }).join('')}
                ${activeEnrollments.length > 3 ? `
                  <div class="enrollment-item more">
                    +${activeEnrollments.length - 3} mais...
                  </div>
                ` : ''}
              </div>
            ` : `
              <div class="no-enrollments">
                <p>Nenhuma matrícula ativa</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  showStudentModal(student = null) {
    const isEdit = student !== null;
    const title = isEdit ? 'Editar Aluno' : 'Novo Aluno';

    const formHtml = `
      <form id="studentForm" class="modal-form">
        <div class="form-group">
          <label for="studentName">Nome Completo</label>
          <input 
            type="text" 
            id="studentName" 
            value="${student?.name || ''}" 
            placeholder="Nome completo do aluno"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="studentEmail">Email</label>
            <input 
              type="email" 
              id="studentEmail" 
              value="${student?.email || ''}" 
              placeholder="aluno@email.com"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="studentPhone">Telefone</label>
            <input 
              type="tel" 
              id="studentPhone" 
              value="${student?.phone || ''}" 
              placeholder="(11) 99999-9999"
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="studentBirthDate">Data de Nascimento</label>
            <input 
              type="date" 
              id="studentBirthDate" 
              value="${student?.birthDate || ''}" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="studentCpf">CPF</label>
            <input 
              type="text" 
              id="studentCpf" 
              value="${student?.cpf || ''}" 
              placeholder="000.000.000-00"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="studentStreet">Endereço</label>
          <input 
            type="text" 
            id="studentStreet" 
            value="${student?.address?.street || ''}" 
            placeholder="Rua, número"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="studentNeighborhood">Bairro</label>
            <input 
              type="text" 
              id="studentNeighborhood" 
              value="${student?.address?.neighborhood || ''}" 
              placeholder="Bairro"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="studentZipCode">CEP</label>
            <input 
              type="text" 
              id="studentZipCode" 
              value="${student?.address?.zipCode || ''}" 
              placeholder="00000-000"
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="studentCity">Cidade</label>
            <input 
              type="text" 
              id="studentCity" 
              value="${student?.address?.city || ''}" 
              placeholder="Cidade"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="studentState">Estado</label>
            <select id="studentState" required>
              <option value="">Selecione o estado</option>
              <option value="SP" ${student?.address?.state === 'SP' ? 'selected' : ''}>São Paulo</option>
              <option value="RJ" ${student?.address?.state === 'RJ' ? 'selected' : ''}>Rio de Janeiro</option>
              <option value="MG" ${student?.address?.state === 'MG' ? 'selected' : ''}>Minas Gerais</option>
              <option value="RS" ${student?.address?.state === 'RS' ? 'selected' : ''}>Rio Grande do Sul</option>
              <option value="PR" ${student?.address?.state === 'PR' ? 'selected' : ''}>Paraná</option>
              <option value="SC" ${student?.address?.state === 'SC' ? 'selected' : ''}>Santa Catarina</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="emergencyName">Nome do Contato de Emergência</label>
          <input 
            type="text" 
            id="emergencyName" 
            value="${student?.emergencyContact?.name || ''}" 
            placeholder="Nome completo"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="emergencyPhone">Telefone de Emergência</label>
            <input 
              type="tel" 
              id="emergencyPhone" 
              value="${student?.emergencyContact?.phone || ''}" 
              placeholder="(11) 99999-9999"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="emergencyRelationship">Parentesco</label>
            <select id="emergencyRelationship" required>
              <option value="">Selecione o parentesco</option>
              <option value="Pai" ${student?.emergencyContact?.relationship === 'Pai' ? 'selected' : ''}>Pai</option>
              <option value="Mãe" ${student?.emergencyContact?.relationship === 'Mãe' ? 'selected' : ''}>Mãe</option>
              <option value="Esposo(a)" ${student?.emergencyContact?.relationship === 'Esposo(a)' ? 'selected' : ''}>Esposo(a)</option>
              <option value="Filho(a)" ${student?.emergencyContact?.relationship === 'Filho(a)' ? 'selected' : ''}>Filho(a)</option>
              <option value="Irmão(ã)" ${student?.emergencyContact?.relationship === 'Irmão(ã)' ? 'selected' : ''}>Irmão(ã)</option>
              <option value="Outro" ${student?.emergencyContact?.relationship === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="studentStatus">Status</label>
          <select id="studentStatus" required>
            <option value="active" ${student?.status === 'active' ? 'selected' : ''}>Ativo</option>
            <option value="inactive" ${student?.status === 'inactive' ? 'selected' : ''}>Inativo</option>
            <option value="suspended" ${student?.status === 'suspended' ? 'selected' : ''}>Suspenso</option>
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

    const modal = new Modal(title, formHtml);
    document.body.appendChild(modal.render());

    // Handle form submission
    document.getElementById('studentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveStudentData(student?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  showStudentEnrollments(student) {
    const enrollments = this.dataManager.getEnrollmentsByStudent(student.id);
    
    const enrollmentsList = enrollments.map(enrollment => {
      const classData = this.dataManager.getClasses().find(c => c.id === enrollment.classId);
      const course = this.dataManager.getCourses().find(c => c.id === classData?.courseId);
      const module = this.dataManager.getCourseModules().find(m => m.id === classData?.moduleId);
      const period = this.dataManager.getPeriods().find(p => p.id === classData?.periodId);
      
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

      return `
        <div class="enrollment-card">
          <div class="enrollment-header">
            <h4>${classData?.name || 'Turma não encontrada'}</h4>
            <span class="status-badge ${statusColors[enrollment.status]}">
              ${statusLabels[enrollment.status]}
            </span>
          </div>
          <div class="enrollment-details">
            <p><strong>Curso:</strong> ${course?.name || 'N/A'}</p>
            <p><strong>Módulo:</strong> ${module?.name || 'N/A'}</p>
            <p><strong>Período:</strong> ${period?.name} (${period?.year})</p>
            <p><strong>Data da Matrícula:</strong> ${new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      `;
    }).join('');

    const modalContent = `
      <div class="student-enrollments">
        <div class="student-info">
          <h4>${student.name}</h4>
          <p>Total de matrículas: ${enrollments.length}</p>
        </div>
        
        <div class="enrollments-list">
          ${enrollments.length > 0 ? enrollmentsList : `
            <div class="empty-enrollments">
              <p>Este aluno não possui matrículas cadastradas.</p>
            </div>
          `}
        </div>
      </div>
    `;

    const modal = new Modal(`Matrículas - ${student.name}`, modalContent);
    document.body.appendChild(modal.render());
  }

  saveStudentData(studentId = null) {
    const studentData = {
      name: document.getElementById('studentName').value,
      email: document.getElementById('studentEmail').value,
      phone: document.getElementById('studentPhone').value,
      birthDate: document.getElementById('studentBirthDate').value,
      cpf: document.getElementById('studentCpf').value,
      address: {
        street: document.getElementById('studentStreet').value,
        neighborhood: document.getElementById('studentNeighborhood').value,
        city: document.getElementById('studentCity').value,
        state: document.getElementById('studentState').value,
        zipCode: document.getElementById('studentZipCode').value
      },
      emergencyContact: {
        name: document.getElementById('emergencyName').value,
        phone: document.getElementById('emergencyPhone').value,
        relationship: document.getElementById('emergencyRelationship').value
      },
      status: document.getElementById('studentStatus').value
    };

    if (studentId) {
      this.dataManager.updateStudent(studentId, studentData);
    } else {
      this.dataManager.addStudent(studentData);
    }

    this.renderContent();
  }

  getFilteredStudents(students) {
    let filtered = students;
    
    // Filter by name/email
    if (this.nameFilter.trim()) {
      const searchTerm = this.nameFilter.toLowerCase().trim();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by status
    if (this.statusFilter) {
      filtered = filtered.filter(student => student.status === this.statusFilter);
    }
    
    return filtered;
  }

  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  deleteStudent(studentId) {
    const enrollments = this.dataManager.getEnrollmentsByStudent(studentId);
    if (enrollments.length > 0) {
      alert('Não é possível excluir este aluno pois existem matrículas vinculadas a ele.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteStudent(studentId);
      this.renderContent();
    }
  }
}
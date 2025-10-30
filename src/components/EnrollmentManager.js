import { Modal } from './Modal.js';

export class EnrollmentManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.currentStep = 1;
    this.enrollmentData = {
      password: null,
      classData: null,
      student: null
    };
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'enrollment-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>📝 Sistema de Matrículas</h2>
          <p>Realize matrículas através do código da senha</p>
        </div>
      </div>

      <div class="enrollment-wizard">
        <div class="wizard-steps">
          <div class="step ${this.currentStep === 1 ? 'active' : this.currentStep > 1 ? 'completed' : ''}">
            <div class="step-number">1</div>
            <div class="step-label">Código da Senha</div>
          </div>
          <div class="step ${this.currentStep === 2 ? 'active' : this.currentStep > 2 ? 'completed' : ''}">
            <div class="step-number">2</div>
            <div class="step-label">Selecionar Aluno</div>
          </div>
          <div class="step ${this.currentStep === 3 ? 'active' : ''}">
            <div class="step-number">3</div>
            <div class="step-label">Confirmação</div>
          </div>
        </div>

        <div class="wizard-content">
          ${this.renderCurrentStep()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.renderPasswordStep();
      case 2:
        return this.renderStudentStep();
      case 3:
        return this.renderConfirmationStep();
      default:
        return this.renderPasswordStep();
    }
  }

  renderPasswordStep() {
    return `
      <div class="step-content">
        <div class="step-header">
          <h3>🎫 Informe o Código da Senha</h3>
          <p>Digite o código da senha para identificar a vaga da turma</p>
        </div>
        
        <div class="password-form">
          <div class="form-group">
            <label for="passwordCode">Código da Senha</label>
            <input 
              type="text" 
              id="passwordCode" 
              placeholder="Ex: ABC12345"
              maxlength="8"
              style="text-transform: uppercase; font-size: 1.5rem; text-align: center; letter-spacing: 2px;"
            >
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-primary" id="validatePasswordBtn">
              🔍 Validar Código
            </button>
          </div>
          
          <div id="passwordResult" class="password-result" style="display: none;"></div>
        </div>
      </div>
    `;
  }

  renderStudentStep() {
    const students = this.dataManager.getStudents().filter(s => s.status === 'active');
    
    return `
      <div class="step-content">
        <div class="step-header">
          <h3>👨‍🎓 Selecionar Aluno</h3>
          <p>Pesquise e selecione o aluno que ocupará a vaga</p>
        </div>
        
        <div class="class-info-card">
          <h4>${this.enrollmentData.classData.name}</h4>
          <div class="class-details">
            <span>📍 ${this.enrollmentData.classData.roomName} - ${this.enrollmentData.classData.buildingName}</span>
            <span>🕐 ${this.enrollmentData.classData.startTime} - ${this.enrollmentData.classData.endTime}</span>
            <span>📅 ${this.enrollmentData.classData.weekDays.join(', ')}</span>
          </div>
        </div>
        
        <div class="student-search">
          <div class="search-form">
            <input 
              type="text" 
              id="studentSearch" 
              placeholder="🔍 Buscar por nome, email ou CPF..."
              class="search-input"
            >
          </div>
          
          <div class="students-list" id="studentsList">
            ${this.renderStudentsList(students)}
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="backToPasswordBtn">
            ← Voltar
          </button>
          <button type="button" class="btn btn-primary" id="selectStudentBtn" disabled>
            Continuar →
          </button>
        </div>
      </div>
    `;
  }

  renderStudentsList(students, searchTerm = '') {
    let filteredStudents = students;
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.cpf.includes(search)
      );
    }

    if (filteredStudents.length === 0) {
      return `
        <div class="empty-students">
          <p>${searchTerm ? 'Nenhum aluno encontrado para a pesquisa.' : 'Nenhum aluno ativo cadastrado.'}</p>
        </div>
      `;
    }

    return filteredStudents.map(student => {
      const age = this.calculateAge(student.birthDate);
      return `
        <div class="student-card" data-student-id="${student.id}">
          <div class="student-info">
            <h4>${student.name}</h4>
            <div class="student-details">
              <span>📧 ${student.email}</span>
              <span>📞 ${student.phone}</span>
              <span>🎂 ${age} anos</span>
              <span>📄 ${student.cpf}</span>
            </div>
            <div class="student-address">
              📍 ${student.address.street}, ${student.address.neighborhood} - ${student.address.city}/${student.address.state}
            </div>
          </div>
          <div class="student-actions">
            <button class="btn btn-primary select-student-btn" data-student-id="${student.id}">
              Selecionar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderConfirmationStep() {
    const student = this.enrollmentData.student;
    const classData = this.enrollmentData.classData;
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);

    return `
      <div class="step-content">
        <div class="step-header">
          <h3>✅ Confirmação da Matrícula</h3>
          <p>Revise os dados e confirme a matrícula</p>
        </div>
        
        <div class="confirmation-details">
          <div class="confirmation-section">
            <h4>👨‍🎓 Dados do Aluno</h4>
            <div class="confirmation-card">
              <p><strong>Nome:</strong> ${student.name}</p>
              <p><strong>Email:</strong> ${student.email}</p>
              <p><strong>Telefone:</strong> ${student.phone}</p>
              <p><strong>CPF:</strong> ${student.cpf}</p>
              <p><strong>Endereço:</strong> ${student.address.street}, ${student.address.neighborhood} - ${student.address.city}/${student.address.state}</p>
            </div>
          </div>
          
          <div class="confirmation-section">
            <h4>📚 Dados da Turma</h4>
            <div class="confirmation-card">
              <p><strong>Turma:</strong> ${classData.name}</p>
              <p><strong>Curso:</strong> ${course?.name || 'N/A'}</p>
              <p><strong>Módulo:</strong> ${module?.name || 'N/A'}</p>
              <p><strong>Período:</strong> ${period?.name} (${period?.year})</p>
              <p><strong>Local:</strong> ${classData.roomName} - ${classData.buildingName}</p>
              <p><strong>Horário:</strong> ${classData.startTime} - ${classData.endTime}</p>
              <p><strong>Dias:</strong> ${classData.weekDays.join(', ')}</p>
              <p><strong>Carga Horária:</strong> ${classData.workload}h</p>
            </div>
          </div>
          
          <div class="confirmation-section">
            <h4>🎫 Dados da Senha</h4>
            <div class="confirmation-card">
              <p><strong>Código:</strong> ${this.enrollmentData.password.code}</p>
              <p><strong>Gerada em:</strong> ${new Date(this.enrollmentData.password.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="backToStudentBtn">
            ← Voltar
          </button>
          <button type="button" class="btn btn-primary" id="confirmEnrollmentBtn">
            ✅ Confirmar Matrícula
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Step 1: Password validation
    const validateBtn = this.container.querySelector('#validatePasswordBtn');
    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        this.validatePassword();
      });
    }

    const passwordInput = this.container.querySelector('#passwordCode');
    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
      
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.validatePassword();
        }
      });
    }

    // Step 2: Student selection
    const studentSearch = this.container.querySelector('#studentSearch');
    if (studentSearch) {
      studentSearch.addEventListener('input', (e) => {
        this.searchStudents(e.target.value);
      });
    }

    const backToPasswordBtn = this.container.querySelector('#backToPasswordBtn');
    if (backToPasswordBtn) {
      backToPasswordBtn.addEventListener('click', () => {
        this.goToStep(1);
      });
    }

    const selectStudentBtn = this.container.querySelector('#selectStudentBtn');
    if (selectStudentBtn) {
      selectStudentBtn.addEventListener('click', () => {
        this.goToStep(3);
      });
    }

    // Student selection buttons
    this.container.querySelectorAll('.select-student-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.getAttribute('data-student-id');
        this.selectStudent(studentId);
      });
    });

    // Step 3: Confirmation
    const backToStudentBtn = this.container.querySelector('#backToStudentBtn');
    if (backToStudentBtn) {
      backToStudentBtn.addEventListener('click', () => {
        this.goToStep(2);
      });
    }

    const confirmBtn = this.container.querySelector('#confirmEnrollmentBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmEnrollment();
      });
    }
  }

  validatePassword() {
    const passwordCode = this.container.querySelector('#passwordCode').value.trim();
    const resultDiv = this.container.querySelector('#passwordResult');
    
    if (!passwordCode) {
      this.showPasswordResult('error', '⚠️ Por favor, informe o código da senha.');
      return;
    }

    // Find password
    const password = this.dataManager.passwords.find(p => p.code === passwordCode);
    
    if (!password) {
      this.showPasswordResult('error', '❌ Código da senha não encontrado.');
      return;
    }

    if (password.isUsed) {
      this.showPasswordResult('error', '⚠️ Esta senha já foi utilizada.');
      return;
    }

    // Get class data
    const classData = this.dataManager.getClasses().find(c => c.id === password.classId);
    if (!classData) {
      this.showPasswordResult('error', '❌ Turma não encontrada.');
      return;
    }

    // Get additional class info
    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
    
    const enrichedClassData = {
      ...classData,
      roomName: room?.name || 'N/A',
      buildingName: building?.name || 'N/A'
    };

    // Store data and proceed
    this.enrollmentData.password = password;
    this.enrollmentData.classData = enrichedClassData;
    
    this.showPasswordResult('success', `✅ Senha válida! Turma: ${classData.name}`);
    
    setTimeout(() => {
      this.goToStep(2);
    }, 1500);
  }

  showPasswordResult(type, message) {
    const resultDiv = this.container.querySelector('#passwordResult');
    resultDiv.className = `password-result ${type}`;
    resultDiv.innerHTML = `<p>${message}</p>`;
    resultDiv.style.display = 'block';
  }

  searchStudents(searchTerm) {
    const students = this.dataManager.getStudents().filter(s => s.status === 'active');
    const studentsList = this.container.querySelector('#studentsList');
    studentsList.innerHTML = this.renderStudentsList(students, searchTerm);
    
    // Re-attach event listeners for new buttons
    this.container.querySelectorAll('.select-student-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.getAttribute('data-student-id');
        this.selectStudent(studentId);
      });
    });
  }

  selectStudent(studentId) {
    const student = this.dataManager.getStudents().find(s => s.id === studentId);
    if (!student) return;

    // Check if student is already enrolled in this class
    if (this.dataManager.isStudentEnrolled(studentId, this.enrollmentData.classData.id)) {
      alert('⚠️ Este aluno já está matriculado nesta turma.');
      return;
    }

    this.enrollmentData.student = student;
    
    // Update UI
    this.container.querySelectorAll('.student-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    const selectedCard = this.container.querySelector(`[data-student-id="${studentId}"]`);
    selectedCard.classList.add('selected');
    
    const continueBtn = this.container.querySelector('#selectStudentBtn');
    continueBtn.disabled = false;
  }

  confirmEnrollment() {
    try {
      // Create enrollment
      const enrollmentData = {
        studentId: this.enrollmentData.student.id,
        classId: this.enrollmentData.classData.id,
        status: 'active',
        enrollmentDate: new Date().toISOString()
      };

      const enrollment = this.dataManager.addEnrollment(enrollmentData);
      
      // Mark password as used
      this.dataManager.usePassword(this.enrollmentData.password.id, this.enrollmentData.student.id);
      
      // Update class enrolled students count
      const currentClass = this.dataManager.getClasses().find(c => c.id === this.enrollmentData.classData.id);
      if (currentClass) {
        this.dataManager.updateClass(currentClass.id, {
          enrolledStudents: currentClass.enrolledStudents + 1
        });
      }

      // Show success and generate receipts
      this.showSuccessModal(enrollment);
      
    } catch (error) {
      alert('❌ Erro ao confirmar matrícula. Tente novamente.');
      console.error('Enrollment error:', error);
    }
  }

  showSuccessModal(enrollment) {
    const modalContent = `
      <div class="enrollment-success">
        <div class="success-header">
          <h3>🎉 Matrícula Realizada com Sucesso!</h3>
          <p>A matrícula foi confirmada e os comprovantes estão prontos para impressão.</p>
        </div>
        
        <div class="enrollment-summary">
          <div class="summary-item">
            <strong>Aluno:</strong> ${this.enrollmentData.student.name}
          </div>
          <div class="summary-item">
            <strong>Turma:</strong> ${this.enrollmentData.classData.name}
          </div>
          <div class="summary-item">
            <strong>Data da Matrícula:</strong> ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        <div class="receipt-actions">
          <button class="btn btn-primary" id="printSecretaryReceiptBtn">
            🖨️ Imprimir Comprovante da Secretaria
          </button>
          <button class="btn btn-primary" id="printStudentReceiptBtn">
            🖨️ Imprimir Guia do Aluno
          </button>
        </div>
        
        <div class="form-actions">
          <button class="btn btn-secondary" id="newEnrollmentBtn">
            ➕ Nova Matrícula
          </button>
          <button class="btn btn-primary" id="closeSuccessBtn">
            Fechar
          </button>
        </div>
      </div>
    `;

    const modal = new Modal('Matrícula Confirmada', modalContent);
    document.body.appendChild(modal.render());

    // Print buttons
    document.getElementById('printSecretaryReceiptBtn').addEventListener('click', () => {
      this.printSecretaryReceipt(enrollment);
    });

    document.getElementById('printStudentReceiptBtn').addEventListener('click', () => {
      this.printStudentReceipt(enrollment);
    });

    document.getElementById('newEnrollmentBtn').addEventListener('click', () => {
      modal.close();
      this.resetWizard();
    });

    document.getElementById('closeSuccessBtn').addEventListener('click', () => {
      modal.close();
      this.resetWizard();
    });
  }

  printSecretaryReceipt(enrollment) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('🚫 Pop-up bloqueado! Permita pop-ups para imprimir.');
      return;
    }

    const student = this.enrollmentData.student;
    const classData = this.enrollmentData.classData;
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprovante de Matrícula - Secretaria</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; padding: 20px; 
            font-size: 12px; line-height: 1.4;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #6366f1; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #6366f1; 
            margin: 0 0 10px 0; 
            font-size: 24px;
          }
          .header h2 { 
            margin: 0 0 5px 0; 
            font-size: 18px; 
            color: #1e293b;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 15px; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px;
          }
          .section h3 { 
            color: #6366f1; 
            margin-top: 0; 
            margin-bottom: 15px; 
            font-size: 16px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
          }
          .info-item { 
            margin-bottom: 8px;
          }
          .info-item strong { 
            color: #1e293b;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 10px; 
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          .enrollment-id {
            background: #f1f5f9;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 20px;
          }
          @media print { 
            body { margin: 0; padding: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 COMPROVANTE DE MATRÍCULA</h1>
          <h2>RELATÓRIO INTERNO - SECRETARIA DE CURSOS</h2>
          <p><strong>Cidade do Saber - Sistema Administrativo</strong></p>
        </div>
        
        <div class="enrollment-id">
          ID da Matrícula: ${enrollment.id}
        </div>
        
        <div class="section">
          <h3>👨‍🎓 Dados do Aluno</h3>
          <div class="info-grid">
            <div>
              <div class="info-item"><strong>Nome:</strong> ${student.name}</div>
              <div class="info-item"><strong>Email:</strong> ${student.email}</div>
              <div class="info-item"><strong>Telefone:</strong> ${student.phone}</div>
              <div class="info-item"><strong>CPF:</strong> ${student.cpf}</div>
            </div>
            <div>
              <div class="info-item"><strong>Endereço:</strong> ${student.address.street}</div>
              <div class="info-item"><strong>Bairro:</strong> ${student.address.neighborhood}</div>
              <div class="info-item"><strong>Cidade:</strong> ${student.address.city}/${student.address.state}</div>
              <div class="info-item"><strong>CEP:</strong> ${student.address.zipCode}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>📚 Dados do Curso e Turma</h3>
          <div class="info-grid">
            <div>
              <div class="info-item"><strong>Curso:</strong> ${course?.name || 'N/A'}</div>
              <div class="info-item"><strong>Módulo/Etapa:</strong> ${module?.name || 'N/A'}</div>
              <div class="info-item"><strong>Turma:</strong> ${classData.name}</div>
              <div class="info-item"><strong>Período Letivo:</strong> ${period?.name} (${period?.year})</div>
            </div>
            <div>
              <div class="info-item"><strong>Local:</strong> ${classData.roomName} - ${classData.buildingName}</div>
              <div class="info-item"><strong>Horário:</strong> ${classData.startTime} - ${classData.endTime}</div>
              <div class="info-item"><strong>Dias da Semana:</strong> ${classData.weekDays.join(', ')}</div>
              <div class="info-item"><strong>Carga Horária:</strong> ${classData.workload}h</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>🎫 Dados da Matrícula</h3>
          <div class="info-grid">
            <div>
              <div class="info-item"><strong>Código da Senha:</strong> ${this.enrollmentData.password.code}</div>
              <div class="info-item"><strong>Data da Matrícula:</strong> ${new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}</div>
              <div class="info-item"><strong>Horário da Matrícula:</strong> ${new Date(enrollment.enrollmentDate).toLocaleTimeString('pt-BR')}</div>
            </div>
            <div>
              <div class="info-item"><strong>Status:</strong> Ativa</div>
              <div class="info-item"><strong>Responsável:</strong> Sistema Administrativo</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>📞 Contato de Emergência</h3>
          <div class="info-grid">
            <div>
              <div class="info-item"><strong>Nome:</strong> ${student.emergencyContact.name}</div>
              <div class="info-item"><strong>Telefone:</strong> ${student.emergencyContact.phone}</div>
            </div>
            <div>
              <div class="info-item"><strong>Parentesco:</strong> ${student.emergencyContact.relationship}</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Documento gerado automaticamente pelo Sistema Administrativo - Cidade do Saber</strong></p>
          <p>Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p>Este documento comprova o ato de matrícula para fins administrativos internos</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
  }

  printStudentReceipt(enrollment) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('🚫 Pop-up bloqueado! Permita pop-ups para imprimir.');
      return;
    }

    const student = this.enrollmentData.student;
    const classData = this.enrollmentData.classData;
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Guia do Aluno Matriculado</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 15mm; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; padding: 20px; 
            font-size: 13px; line-height: 1.5;
          }
          .header { 
            text-align: center; 
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 26px;
          }
          .header h2 { 
            margin: 0 0 5px 0; 
            font-size: 18px; 
            opacity: 0.9;
          }
          .welcome-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #6366f1;
          }
          .welcome-section h3 {
            color: #6366f1;
            margin-top: 0;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 20px; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px;
            background: white;
          }
          .section h3 { 
            color: #6366f1; 
            margin-top: 0; 
            margin-bottom: 15px; 
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
          }
          .info-item { 
            margin-bottom: 10px;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
          }
          .info-item strong { 
            color: #1e293b;
            display: block;
            margin-bottom: 2px;
          }
          .schedule-highlight {
            background: #dbeafe;
            border: 2px solid #6366f1;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 15px 0;
          }
          .schedule-highlight h4 {
            color: #6366f1;
            margin: 0 0 10px 0;
          }
          .important-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .important-info h4 {
            color: #92400e;
            margin-top: 0;
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 11px; 
            color: #64748b;
            border-top: 2px solid #6366f1;
            padding-top: 15px;
          }
          @media print { 
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 GUIA DO ALUNO</h1>
          <h2>Cidade do Saber</h2>
          <p>Comprovante de Matrícula</p>
        </div>
        
        <div class="welcome-section">
          <h3>🎉 Parabéns, ${student.name.split(' ')[0]}!</h3>
          <p>Sua matrícula foi realizada com sucesso. Este documento contém todas as informações importantes sobre seu curso.</p>
        </div>
        
        <div class="section">
          <h3>👨‍🎓 Seus Dados</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Nome Completo:</strong>
              ${student.name}
            </div>
            <div class="info-item">
              <strong>Email:</strong>
              ${student.email}
            </div>
            <div class="info-item">
              <strong>Telefone:</strong>
              ${student.phone}
            </div>
            <div class="info-item">
              <strong>CPF:</strong>
              ${student.cpf}
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>📚 Informações do Curso</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Curso:</strong>
              ${course?.name || 'N/A'}
            </div>
            <div class="info-item">
              <strong>Módulo/Etapa Atual:</strong>
              ${module?.name || 'N/A'}
            </div>
            <div class="info-item">
              <strong>Turma:</strong>
              ${classData.name}
            </div>
            <div class="info-item">
              <strong>Período Letivo:</strong>
              ${period?.name} (${period?.year})
            </div>
            <div class="info-item">
              <strong>Carga Horária do Módulo:</strong>
              ${classData.workload} horas
            </div>
            <div class="info-item">
              <strong>Data da Matrícula:</strong>
              ${new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        
        <div class="schedule-highlight">
          <h4>📅 Seus Horários de Aula</h4>
          <p><strong>Local:</strong> ${classData.roomName} - ${classData.buildingName}</p>
          <p><strong>Horário:</strong> ${classData.startTime} às ${classData.endTime}</p>
          <p><strong>Dias da Semana:</strong> ${classData.weekDays.join(', ')}</p>
        </div>
        
        <div class="important-info">
          <h4>📋 Informações Importantes</h4>
          <ul>
            <li><strong>Pontualidade:</strong> Chegue sempre 10 minutos antes do horário de início</li>
            <li><strong>Frequência:</strong> É obrigatória a presença em pelo menos 75% das aulas</li>
            <li><strong>Material:</strong> Consulte seu professor sobre materiais necessários</li>
            <li><strong>Certificado:</strong> Será emitido ao final do curso mediante aprovação</li>
          </ul>
        </div>
        
        <div class="section">
          <h3>📞 Contato de Emergência</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Nome:</strong>
              ${student.emergencyContact.name}
            </div>
            <div class="info-item">
              <strong>Telefone:</strong>
              ${student.emergencyContact.phone}
            </div>
            <div class="info-item">
              <strong>Parentesco:</strong>
              ${student.emergencyContact.relationship}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Cidade do Saber - Transformando vidas através da educação</strong></p>
          <p>📧 contato@cidadedosaber.com | 📞 (11) 1234-5678</p>
          <p>Documento emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p><em>Guarde este documento - ele comprova sua matrícula</em></p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
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

  goToStep(step) {
    this.currentStep = step;
    this.renderContent();
  }

  resetWizard() {
    this.currentStep = 1;
    this.enrollmentData = {
      password: null,
      classData: null,
      student: null
    };
    this.renderContent();
  }
}
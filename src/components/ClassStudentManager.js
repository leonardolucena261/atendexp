import { Modal } from './Modal.js';

export class ClassStudentManager {
  constructor(dataManager, classId) {
    this.dataManager = dataManager;
    this.classId = classId;
    this.container = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'class-student-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const classData = this.dataManager.getClasses().find(c => c.id === this.classId);
    if (!classData) {
      this.container.innerHTML = `
        <div class="error-state">
          <h3>❌ Turma não encontrada</h3>
          <p>A turma solicitada não existe ou foi removida.</p>
        </div>
      `;
      return;
    }

    const enrollments = this.dataManager.getEnrollmentsByClass(this.classId);
    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    const students = activeEnrollments.map(enrollment => {
      const student = this.dataManager.getStudents().find(s => s.id === enrollment.studentId);
      return {
        ...student,
        enrollmentId: enrollment.id,
        enrollmentDate: enrollment.enrollmentDate
      };
    }).filter(Boolean);

    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);
    const teacher = this.dataManager.getTeachers().find(t => t.id === classData.teacherId);
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const availableSpots = room ? room.capacity - students.length : 0;

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>👥 ${classData.name}</h2>
          <p>Gerenciamento de alunos matriculados</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" id="backToClassesBtn">
            ← Voltar para Turmas
          </button>
          <button class="btn btn-primary" id="printStudentsListBtn">
            🖨️ Imprimir Lista
          </button>
          <button class="btn btn-primary" id="printAttendanceListBtn">
            📋 Imprimir Frequência
          </button>
        </div>
      </div>

      <div class="class-info-section">
        <div class="class-info-grid">
          <div class="info-card">
            <h3>📚 Informações do Curso</h3>
            <div class="info-details">
              <div class="info-item">
                <span class="label">Curso:</span>
                <span class="value">${course?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Módulo/Etapa:</span>
                <span class="value">${module?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Período:</span>
                <span class="value">${period?.name} (${period?.year})</span>
              </div>
              <div class="info-item">
                <span class="label">Professor:</span>
                <span class="value">${teacher?.name || 'Não atribuído'}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>📍 Informações da Turma</h3>
            <div class="info-details">
              <div class="info-item">
                <span class="label">Local:</span>
                <span class="value">${room?.name} - ${building?.name}</span>
              </div>
              <div class="info-item">
                <span class="label">Horário:</span>
                <span class="value">${classData.startTime} - ${classData.endTime}</span>
              </div>
              <div class="info-item">
                <span class="label">Dias:</span>
                <span class="value">${classData.weekDays.join(', ')}</span>
              </div>
              <div class="info-item">
                <span class="label">Carga Horária:</span>
                <span class="value">${classData.workload}h</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>📊 Estatísticas</h3>
            <div class="info-details">
              <div class="info-item">
                <span class="label">Alunos Matriculados:</span>
                <span class="value">${students.length}</span>
              </div>
              <div class="info-item">
                <span class="label">Capacidade da Sala:</span>
                <span class="value">${room?.capacity || 0}</span>
              </div>
              <div class="info-item">
                <span class="label">Vagas Disponíveis:</span>
                <span class="value">${availableSpots}</span>
              </div>
              <div class="info-item">
                <span class="label">Taxa de Ocupação:</span>
                <span class="value">${room ? Math.round((students.length / room.capacity) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h3>📋 Lista de Alunos Matriculados</h3>
          <div class="section-stats">
            ${students.length} aluno${students.length !== 1 ? 's' : ''} matriculado${students.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div class="students-table-container" id="studentsTableContainer">
          ${students.length > 0 ? `
            <div class="students-table">
              <div class="table-header">
                <div class="header-cell">#</div>
                <div class="header-cell">Nome</div>
                <div class="header-cell">Email</div>
                <div class="header-cell">Telefone</div>
                <div class="header-cell">Data Matrícula</div>
                <div class="header-cell">Ações</div>
              </div>
              ${students.map((student, index) => `
                <div class="table-row" data-student-id="${student.id}">
                  <div class="table-cell">${index + 1}</div>
                  <div class="table-cell">
                    <div class="student-name">${student.name}</div>
                    <div class="student-cpf">CPF: ${student.cpf}</div>
                  </div>
                  <div class="table-cell">${student.email}</div>
                  <div class="table-cell">${student.phone}</div>
                  <div class="table-cell">
                    ${new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div class="table-cell">
                    <button class="btn-icon cancel-enrollment-btn" 
                            data-enrollment-id="${student.enrollmentId}" 
                            data-student-name="${student.name}"
                            title="Cancelar matrícula">
                      ❌
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-students">
              <div class="empty-icon">👨‍🎓</div>
              <h3>Nenhum aluno matriculado</h3>
              <p>Esta turma ainda não possui alunos matriculados.</p>
            </div>
          `}
        </div>
      </div>
    `;

    this.attachEventListeners(classData, students);
  }

  attachEventListeners(classData, students) {
    // Back button
    const backBtn = this.container.querySelector('#backToClassesBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Trigger navigation back to classes
        if (window.adminSystem) {
          window.adminSystem.handleNavigation('classes');
        }
      });
    }

    // Print button
    const printBtn = this.container.querySelector('#printStudentsListBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printStudentsList(classData, students);
      });
    }

    // Print attendance button
    const printAttendanceBtn = this.container.querySelector('#printAttendanceListBtn');
    if (printAttendanceBtn) {
      printAttendanceBtn.addEventListener('click', () => {
        this.showAttendanceDateModal(classData, students);
      });
    }

    // Cancel enrollment buttons
    students.forEach(student => {
      const cancelBtn = this.container.querySelector(`[data-enrollment-id="${student.enrollmentId}"]`);
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          const studentName = cancelBtn.getAttribute('data-student-name');
          if (confirm(`Tem certeza que deseja cancelar a matrícula de ${studentName}?\n\nEsta ação irá:\n• Remover o aluno da turma\n• Reativar a senha utilizada na matrícula\n• Liberar a vaga para outro aluno`)) {
            this.cancelEnrollment(student.enrollmentId, classData);
          }
        });
      }
    });
  }

  printStudentsList(classData, students) {
    if (students.length === 0) {
      alert('Nenhum aluno matriculado para imprimir.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!printWindow) {
      alert('🚫 Pop-up bloqueado!\n\nPor favor, permita pop-ups para este site e tente novamente.');
      return;
    }

    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);
    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
    const teacher = this.dataManager.getTeachers().find(t => t.id === classData.teacherId);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Alunos - ${classData.name}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
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
            font-size: 18px;
            color: #1e293b;
          }
          
          .class-info { 
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .class-info h3 {
            margin-top: 0;
            margin-bottom: 8px;
            color: #1e293b;
            font-size: 14px;
          }
          
          .class-info p {
            margin: 4px 0;
            font-size: 12px;
          }
          
          .students-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
          }
          
          .students-table th, .students-table td { 
            border: 1px solid #e2e8f0; 
            padding: 8px; 
            text-align: left; 
            vertical-align: top;
          }
          
          .students-table th { 
            background-color: #6366f1; 
            color: white;
            font-weight: bold;
            font-size: 11px;
          }
          
          .students-table td {
            font-size: 10px;
          }
          
          .student-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .student-cpf {
            color: #64748b;
            font-size: 9px;
          }
          
          .summary { 
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
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
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Lista de Alunos Matriculados</h1>
          <h2>${classData.name}</h2>
        </div>
        
        <div class="class-info">
          <div>
            <h3>📚 Informações do Curso</h3>
            <p><strong>Curso:</strong> ${course?.name || 'N/A'}</p>
            <p><strong>Módulo:</strong> ${module?.name || 'N/A'}</p>
            <p><strong>Período:</strong> ${period?.name} (${period?.year})</p>
            <p><strong>Professor:</strong> ${teacher?.name || 'Não atribuído'}</p>
          </div>
          <div>
            <h3>📍 Informações da Turma</h3>
            <p><strong>Local:</strong> ${room?.name} - ${building?.name}</p>
            <p><strong>Horário:</strong> ${classData.startTime} - ${classData.endTime}</p>
            <p><strong>Dias:</strong> ${classData.weekDays.join(', ')}</p>
            <p><strong>Carga Horária:</strong> ${classData.workload}h</p>
          </div>
        </div>
        
        <table class="students-table">
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 30%">Nome Completo</th>
              <th style="width: 15%">CPF</th>
              <th style="width: 25%">Email</th>
              <th style="width: 15%">Telefone</th>
              <th style="width: 10%">Data Matrícula</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <div class="student-name">${student.name}</div>
                </td>
                <td>${student.cpf}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>${new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <p><strong>Total de Alunos Matriculados:</strong> ${students.length}</p>
          <p><strong>Capacidade da Sala:</strong> ${room?.capacity || 0} alunos</p>
          <p><strong>Vagas Disponíveis:</strong> ${Math.max(0, (room?.capacity || 0) - students.length)} vagas</p>
        </div>
        
        <div class="footer">
          <p>Documento gerado pelo Sistema Administrativo - Cidade do Saber</p>
          <p>Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }, 1000);
  }

  showAttendanceDateModal(classData, students) {
    const today = new Date().toISOString().split('T')[0];
    
    const modalContent = `
      <div class="attendance-date-modal">
        <div class="modal-header">
          <h4>📋 Lista de Frequência</h4>
          <p>Selecione a data para verificação da frequência</p>
        </div>
        
        <div class="date-form">
          <div class="form-group">
            <label for="attendanceDate">Data da Verificação:</label>
            <input 
              type="date" 
              id="attendanceDate" 
              value="${today}"
              max="${today}"
              required
            >
          </div>
          
          <div class="class-info-summary">
            <h5>${classData.name}</h5>
            <p>${students.length} aluno${students.length !== 1 ? 's' : ''} matriculado${students.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelAttendanceBtn">Cancelar</button>
          <button type="button" class="btn btn-primary" id="generateAttendanceBtn">Gerar Lista</button>
        </div>
      </div>
    `;

    const modal = new Modal('Lista de Frequência', modalContent);
    document.body.appendChild(modal.render());

    document.getElementById('generateAttendanceBtn').addEventListener('click', () => {
      const selectedDate = document.getElementById('attendanceDate').value;
      if (selectedDate) {
        this.printAttendanceList(classData, students, selectedDate);
        modal.close();
      } else {
        alert('Por favor, selecione uma data.');
      }
    });

    document.getElementById('cancelAttendanceBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  printAttendanceList(classData, students, attendanceDate) {
    if (students.length === 0) {
      alert('Nenhum aluno matriculado para gerar lista de frequência.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!printWindow) {
      alert('🚫 Pop-up bloqueado!\n\nPor favor, permita pop-ups para este site e tente novamente.');
      return;
    }

    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);
    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
    const teacher = this.dataManager.getTeachers().find(t => t.id === classData.teacherId);
    const formattedDate = new Date(attendanceDate).toLocaleDateString('pt-BR');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Frequência - ${classData.name}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
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
            border-bottom: 3px solid #6366f1;
            padding-bottom: 15px;
          }
          
          .header h1 {
            color: #6366f1;
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 0 0 8px 0;
            font-size: 18px;
            color: #1e293b;
          }
          
          .date-highlight {
            background: #dbeafe;
            border: 2px solid #6366f1;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            margin: 15px 0;
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
          }
          
          .class-info { 
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .class-info h3 {
            margin-top: 0;
            margin-bottom: 8px;
            color: #1e293b;
            font-size: 14px;
          }
          
          .class-info p {
            margin: 4px 0;
            font-size: 12px;
          }
          
          .attendance-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          
          .attendance-table th, .attendance-table td { 
            border: 2px solid #374151; 
            padding: 12px 8px; 
            text-align: left; 
            vertical-align: middle;
          }
          
          .attendance-table th { 
            background-color: #6366f1; 
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
          
          .attendance-table td {
            font-size: 11px;
            height: 50px;
          }
          
          .student-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .student-info {
            color: #64748b;
            font-size: 10px;
          }
          
          .signature-cell {
            text-align: center;
            width: 120px;
            position: relative;
          }
          
          .signature-line {
            border-bottom: 1px solid #374151;
            height: 30px;
            margin: 5px 0;
          }
          
          .signature-label {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
          }
          
          .teacher-section {
            margin-top: 30px;
            padding: 20px;
            border: 2px solid #6366f1;
            border-radius: 8px;
            background: #f8fafc;
          }
          
          .teacher-section h3 {
            color: #6366f1;
            margin-top: 0;
            margin-bottom: 15px;
          }
          
          .teacher-signature {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 20px;
          }
          
          .signature-field {
            text-align: center;
          }
          
          .signature-field .line {
            border-bottom: 2px solid #374151;
            height: 40px;
            margin-bottom: 8px;
          }
          
          .signature-field label {
            font-weight: bold;
            font-size: 11px;
          }
          
          .instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 11px;
          }
          
          .instructions h4 {
            color: #92400e;
            margin-top: 0;
            margin-bottom: 10px;
          }
          
          .instructions ul {
            margin: 0;
            padding-left: 20px;
          }
          
          .instructions li {
            margin-bottom: 5px;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          
          @media print { 
            body { 
              margin: 0;
              padding: 10px;
              font-size: 11px;
            }
            .attendance-table td {
              height: 45px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 LISTA DE FREQUÊNCIA</h1>
          <h2>${classData.name}</h2>
        </div>
        
        <div class="date-highlight">
          📅 Data da Verificação: ${formattedDate}
        </div>
        
        <div class="class-info">
          <div>
            <h3>📚 Informações do Curso</h3>
            <p><strong>Curso:</strong> ${course?.name || 'N/A'}</p>
            <p><strong>Módulo:</strong> ${module?.name || 'N/A'}</p>
            <p><strong>Período:</strong> ${period?.name} (${period?.year})</p>
            <p><strong>Professor:</strong> ${teacher?.name || 'Não atribuído'}</p>
          </div>
          <div>
            <h3>📍 Informações da Turma</h3>
            <p><strong>Local:</strong> ${room?.name} - ${building?.name}</p>
            <p><strong>Horário:</strong> ${classData.startTime} - ${classData.endTime}</p>
            <p><strong>Dias:</strong> ${classData.weekDays.join(', ')}</p>
            <p><strong>Total de Alunos:</strong> ${students.length}</p>
          </div>
        </div>
        
        <table class="attendance-table">
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 35%">Nome do Aluno</th>
              <th style="width: 15%">Presente</th>
              <th style="width: 15%">Ausente</th>
              <th style="width: 30%">Assinatura do Aluno</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, index) => `
              <tr>
                <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                <td>
                  <div class="student-name">${student.name}</div>
                  <div class="student-info">CPF: ${student.cpf}</div>
                </td>
                <td class="signature-cell">
                  <div style="width: 20px; height: 20px; border: 2px solid #374151; margin: 0 auto;"></div>
                </td>
                <td class="signature-cell">
                  <div style="width: 20px; height: 20px; border: 2px solid #374151; margin: 0 auto;"></div>
                </td>
                <td class="signature-cell">
                  <div class="signature-line"></div>
                  <div class="signature-label">Assinatura</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="instructions">
          <h4>📋 Instruções para Preenchimento:</h4>
          <ul>
            <li><strong>Presente/Ausente:</strong> Marque com "X" a situação do aluno</li>
            <li><strong>Assinatura do Aluno:</strong> O próprio aluno deve assinar quando presente</li>
            <li><strong>Registro do Professor:</strong> Caso o aluno não assine, o professor deve registrar a frequência abaixo</li>
            <li><strong>Observações:</strong> Anote justificativas de faltas quando necessário</li>
          </ul>
        </div>
        
        <div class="teacher-section">
          <h3>👨‍🏫 Registro do Professor</h3>
          <p><strong>Para alunos que não assinaram ou casos especiais:</strong></p>
          
          <div style="margin: 20px 0;">
            <label style="font-weight: bold;">Observações e Justificativas:</label>
            <div style="border: 1px solid #374151; height: 80px; margin-top: 5px;"></div>
          </div>
          
          <div class="teacher-signature">
            <div class="signature-field">
              <div class="line"></div>
              <label>Assinatura do Professor</label>
            </div>
            <div class="signature-field">
              <div class="line"></div>
              <label>Data: ${formattedDate}</label>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Cidade do Saber - Sistema de Controle de Frequência</strong></p>
          <p>Lista gerada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p><em>Este documento deve ser arquivado para controle acadêmico</em></p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }, 1000);
  }

  cancelEnrollment(enrollmentId, classData) {
    try {
      // Get enrollment data
      const enrollment = this.dataManager.getEnrollments().find(e => e.id === enrollmentId);
      if (!enrollment) {
        alert('❌ Matrícula não encontrada.');
        return;
      }

      // Find the password used for this enrollment
      const password = this.dataManager.passwords.find(p => 
        p.classId === classData.id && 
        p.studentId === enrollment.studentId && 
        p.isUsed === true
      );

      // Cancel enrollment
      this.dataManager.deleteEnrollment(enrollmentId);

      // Reactivate password if found
      if (password) {
        password.isUsed = false;
        password.usedAt = null;
        password.studentId = null;
        this.dataManager.savePasswords();
      }

      // Update class enrolled students count
      const currentClass = this.dataManager.getClasses().find(c => c.id === classData.id);
      if (currentClass && currentClass.enrolledStudents > 0) {
        this.dataManager.updateClass(currentClass.id, {
          enrolledStudents: currentClass.enrolledStudents - 1
        });
      }

      alert('✅ Matrícula cancelada com sucesso!\n\nA senha foi reativada e a vaga está disponível novamente.');
      
      // Refresh the view
      this.renderContent();
      
    } catch (error) {
      alert('❌ Erro ao cancelar matrícula. Tente novamente.');
      console.error('Cancel enrollment error:', error);
    }
  }
}
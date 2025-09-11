import { Modal } from './Modal.js';

export class ClassManager {
  constructor(dataManager, buildingFilter = null) {
    this.dataManager = dataManager;
    this.buildingFilter = buildingFilter;
    this.container = null;
    this.selectedPeriod = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'class-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const periods = this.dataManager.getPeriods();
    const buildings = this.dataManager.getBuildings();
    const filterBuilding = buildings.find(b => b.id === this.buildingFilter);
    const pageTitle = this.buildingFilter 
      ? `Turmas - ${filterBuilding?.name || 'Prédio'}`
      : 'Gerenciamento de Turmas';

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>${pageTitle}</h2>
          <p>Gerencie as turmas e horários das aulas</p>
        </div>
        <button class="btn btn-primary" id="addClassBtn">
          <span>➕</span>
          Nova Turma
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
          ${!this.buildingFilter ? `
            <select id="buildingFilter" class="filter-select">
              <option value="">Todos os prédios</option>
              ${buildings.map(building => 
                `<option value="${building.id}">${building.name}</option>`
              ).join('')}
            </select>
          ` : ''}
        </div>
        <div class="classes-grid" id="classesGrid">
          ${this.renderClasses()}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addClassBtn').addEventListener('click', () => {
      this.showClassModal();
    });

    this.container.querySelector('#periodFilter').addEventListener('change', (e) => {
      this.selectedPeriod = e.target.value || null;
      this.renderContent();
    });

    if (!this.buildingFilter) {
      this.container.querySelector('#buildingFilter').addEventListener('change', (e) => {
        this.buildingFilter = e.target.value || null;
        this.renderContent();
      });
    }

    // Add event listeners for class cards
    this.addClassEventListeners();
  }
  renderClasses() {
    const classes = this.getFilteredClasses();

    if (classes.length === 0) {
      return `
        <div class="empty-state">
          <h3>Nenhuma turma encontrada</h3>
          <p>Cadastre a primeira turma para começar</p>
        </div>
      `;
    }

    return classes.map(cls => this.renderClassCard(cls)).join('');
  }

  renderClassCard(classData) {
    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const building = this.dataManager.getBuildings().find(b => b.id === room?.buildingId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);
    const teacher = this.dataManager.getTeachers().find(t => t.id === classData.teacherId);
    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    
    const capacityPercentage = room ? Math.min((classData.enrolledStudents / room.capacity) * 100, 100) : 0;
    let statusClass = 'normal';
    let statusIcon = '✅';
    let statusText = 'Adequada';
    
    if (capacityPercentage > 100) {
      statusClass = 'exceeded';
      statusIcon = '⚠️';
      statusText = 'Excedida';
    } else if (capacityPercentage > 85) {
      statusClass = 'high';
      statusIcon = '⚡';
      statusText = 'Quase lotada';
    }

    return `
      <div class="class-card" data-class-id="${classData.id}">
        <div class="class-header">
          <h3>${classData.name}</h3>
          <div class="class-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon passwords-btn" title="Gerenciar senhas">🎫</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="class-info">
          <div class="class-detail">
            <span class="label">Curso:</span>
            <span class="value">${course?.name || 'N/A'}</span>
          </div>
          <div class="class-detail">
            <span class="label">Módulo/Etapa:</span>
            <span class="value">${module?.name || 'N/A'}</span>
          </div>
          <div class="class-detail">
            <span class="label">Período:</span>
            <span class="value">${period?.name || 'N/A'} (${period?.year || 'N/A'})</span>
          </div>
          <div class="class-detail">
            <span class="label">Local:</span>
            <span class="value">${room?.name || 'N/A'} - ${building?.name || 'N/A'}</span>
          </div>
          <div class="class-detail">
            <span class="label">Professor:</span>
            <span class="value">${teacher?.name || 'Não atribuído'}</span>
          </div>
          <div class="class-detail">
            <span class="label">Carga Horária:</span>
            <span class="value">${classData.workload}h</span>
          </div>
          <div class="class-detail">
            <span class="label">Horário:</span>
            <span class="value">${classData.startTime} - ${classData.endTime}</span>
          </div>
          <div class="class-detail">
            <span class="label">Dias:</span>
            <span class="value">${classData.weekDays.join(', ')}</span>
          </div>
          <div class="class-detail">
            <span class="label">Turno:</span>
            <span class="value">${classData.shift}</span>
          </div>
          <div class="capacity-section">
            <div class="capacity-header">
              <span class="label">Ocupação:</span>
              <span class="capacity-status ${statusClass}">
                ${statusIcon} ${statusText}
              </span>
            </div>
            <div class="capacity-bar">
              <div class="capacity-fill ${statusClass}" style="width: ${capacityPercentage}%"></div>
            </div>
            <div class="capacity-text">
              ${classData.enrolledStudents}/${room?.capacity || 0} alunos (${Math.round(capacityPercentage)}%)
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showPhotosCarousel(room) {
    // Simulated photos - in a real app, these would come from the database
    const photos = [
      'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];

    const carouselContent = `
      <div class="photo-carousel">
        <div class="carousel-container">
          <div class="carousel-slides" id="carouselSlides">
            ${photos.map((photo, index) => `
              <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <img src="${photo}" alt="Foto da ${room.name}" />
              </div>
            `).join('')}
          </div>
          <button class="carousel-btn prev" id="prevBtn">‹</button>
          <button class="carousel-btn next" id="nextBtn">›</button>
        </div>
        <div class="carousel-indicators">
          ${photos.map((_, index) => `
            <button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
          `).join('')}
        </div>
        <div class="photo-info">
          <p>📷 ${photos.length} fotos disponíveis</p>
          <p>Última atualização: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    `;

    const modal = new Modal(`Fotos - ${room.name}`, carouselContent);
    document.body.appendChild(modal.render());

    // Carousel functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentSlide = index;
    };

    document.getElementById('prevBtn').addEventListener('click', () => {
      const newIndex = currentSlide === 0 ? photos.length - 1 : currentSlide - 1;
      showSlide(newIndex);
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      const newIndex = currentSlide === photos.length - 1 ? 0 : currentSlide + 1;
      showSlide(newIndex);
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance slides
    setInterval(() => {
      const newIndex = currentSlide === photos.length - 1 ? 0 : currentSlide + 1;
      showSlide(newIndex);
    }, 5000);
  }

  showClassModal(classData = null) {
    const isEdit = classData !== null;
    const title = isEdit ? 'Editar Turma' : 'Nova Turma';
    const periods = this.dataManager.getPeriods();
    const rooms = this.dataManager.getRooms();
    const buildings = this.dataManager.getBuildings();
    const teachers = this.dataManager.getTeachers();
    const courses = this.dataManager.getCourses();

    const periodOptions = periods.map(period => 
      `<option value="${period.id}" ${classData?.periodId === period.id ? 'selected' : ''}>
        ${period.name} (${period.year})
      </option>`
    ).join('');

    const roomOptions = rooms.map(room => {
      const building = buildings.find(b => b.id === room.buildingId);
      return `<option value="${room.id}" ${classData?.roomId === room.id ? 'selected' : ''}>
        ${room.name} - ${building?.name || 'N/A'}
      </option>`;
    }).join('');

    const teacherOptions = teachers.map(teacher => 
      {
        const specialties = this.dataManager.getSpecialties();
        const teacherSpecialties = (teacher.specialties || [])
          .map(specId => specialties.find(s => s.id === specId)?.name)
          .filter(Boolean)
          .join(', ') || 'Sem especialidade';
        
        return `<option value="${teacher.id}" ${classData?.teacherId === teacher.id ? 'selected' : ''}>
          ${teacher.name} - ${teacherSpecialties}
        </option>`;
      }
    ).join('');

    const courseOptions = courses.map(course => 
      `<option value="${course.id}" ${classData?.courseId === course.id ? 'selected' : ''}>
        ${course.name}
      </option>`
    ).join('');

    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const selectedDays = classData?.weekDays || [];

    const formHtml = `
      <form id="classForm" class="modal-form">
        <div class="form-group">
          <label for="className">Nome da Turma</label>
          <input 
            type="text" 
            id="className" 
            value="${classData?.name || ''}" 
            placeholder="Ex: Dança Contemporânea - Iniciante"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classPeriod">Período Letivo</label>
            <select id="classPeriod" required>
              <option value="">Selecione o período</option>
              ${periodOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label for="classRoom">Sala</label>
            <select id="classRoom" required>
              <option value="">Selecione a sala</option>
              ${roomOptions}
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classCourse">Curso</label>
            <select id="classCourse" required>
              <option value="">Selecione o curso</option>
              ${courseOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label for="classModule">Módulo/Etapa</label>
            <select id="classModule" required>
              <option value="">Primeiro selecione um curso</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="classTeacher">Professor</label>
          <select id="classTeacher" required>
            <option value="">Selecione o professor</option>
            ${teacherOptions}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classShift">Turno</label>
            <select id="classShift" required>
              <option value="">Selecione o turno</option>
              <option value="Matutino" ${classData?.shift === 'Matutino' ? 'selected' : ''}>Matutino</option>
              <option value="Vespertino" ${classData?.shift === 'Vespertino' ? 'selected' : ''}>Vespertino</option>
              <option value="Noturno" ${classData?.shift === 'Noturno' ? 'selected' : ''}>Noturno</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="classStartTime">Horário de Início</label>
            <input 
              type="time" 
              id="classStartTime" 
              value="${classData?.startTime || '08:00'}" 
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classEndTime">Horário de Término</label>
            <input 
              type="time" 
              id="classEndTime" 
              value="${classData?.endTime || '10:00'}" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="enrolledStudents">Alunos Matriculados</label>
            <input 
              type="number" 
              id="enrolledStudents" 
              value="${classData?.enrolledStudents || 0}" 
              min="0"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>Dias da Semana</label>
          <div class="checkbox-group">
            ${weekDays.map(day => `
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  value="${day}" 
                  ${selectedDays.includes(day) ? 'checked' : ''}
                >
                <span class="checkbox-label">${day}</span>
              </label>
            `).join('')}
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

    // Handle course selection change
    document.getElementById('classCourse').addEventListener('change', (e) => {
      const courseId = e.target.value;
      const moduleSelect = document.getElementById('classModule');
      
      if (courseId) {
        const modules = this.dataManager.getModulesByCourse(courseId);
        const sortedModules = modules.sort((a, b) => a.order - b.order);
        
        moduleSelect.innerHTML = `
          <option value="">Selecione o módulo</option>
          ${sortedModules.map(module => 
            `<option value="${module.id}" ${classData?.moduleId === module.id ? 'selected' : ''}>
              ${module.name} (${module.workload}h)
            </option>`
          ).join('')}
        `;
      } else {
        moduleSelect.innerHTML = '<option value="">Primeiro selecione um curso</option>';
      }
    });

    // Trigger course change if editing
    if (classData?.courseId) {
      document.getElementById('classCourse').dispatchEvent(new Event('change'));
    }
    // Handle form submission
    const formElement = document.getElementById('classForm');
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveClassData(classData?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  addClassEventListeners() {
    const classes = this.getFilteredClasses();
    classes.forEach(classItem => {
      const card = this.container.querySelector(`[data-class-id="${classItem.id}"]`);
      if (card) {
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        if (editBtn) {
          editBtn.removeEventListener('click', this.handleEditClick);
          this.handleEditClick = () => this.showClassModal(classItem);
          editBtn.addEventListener('click', this.handleEditClick);
        }
        
        const passwordsBtn = card.querySelector('.passwords-btn');
        if (passwordsBtn) {
          passwordsBtn.removeEventListener('click', this.handlePasswordsClick);
          this.handlePasswordsClick = () => this.showPasswordsModal(classItem);
          passwordsBtn.addEventListener('click', this.handlePasswordsClick);
        }
        
        if (deleteBtn) {
          deleteBtn.removeEventListener('click', this.handleDeleteClick);
          this.handleDeleteClick = () => this.deleteClass(classItem.id);
          deleteBtn.addEventListener('click', this.handleDeleteClick);
        }
      }
    });
  }

  getFilteredClasses() {
    let classes = this.dataManager.getClasses();
    
    if (this.selectedPeriod) {
      classes = classes.filter(cls => cls.periodId === this.selectedPeriod);
    }
    
    if (this.buildingFilter) {
      const rooms = this.dataManager.getRoomsByBuilding(this.buildingFilter);
      const roomIds = rooms.map(r => r.id);
      classes = classes.filter(cls => roomIds.includes(cls.roomId));
    }
    
    return classes;
  }

  saveClassData(classId = null) {
    const name = document.getElementById('className').value;
    const courseId = document.getElementById('classCourse').value;
    const moduleId = document.getElementById('classModule').value;
    const periodId = document.getElementById('classPeriod').value;
    const roomId = document.getElementById('classRoom').value;
    const teacherId = document.getElementById('classTeacher').value;
    const shift = document.getElementById('classShift').value;
    const startTime = document.getElementById('classStartTime').value;
    const endTime = document.getElementById('classEndTime').value;
    const enrolledStudents = parseInt(document.getElementById('enrolledStudents').value);
    
    const weekDays = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);

    // Get workload from selected module
    const selectedModule = this.dataManager.getCourseModules().find(m => m.id === moduleId);
    const workload = selectedModule ? selectedModule.workload : 40;
    // Validar conflito de horários
    if (this.hasScheduleConflict(roomId, weekDays, startTime, endTime, classId)) {
      alert('⚠️ Conflito de horário detectado!\n\nJá existe uma turma cadastrada nesta sala no mesmo horário e dia da semana.\n\nPor favor, escolha um horário vago ou uma sala diferente.');
      return;
    }

    // Validar conflito de horários do professor
    if (this.hasTeacherScheduleConflict(teacherId, periodId, weekDays, startTime, endTime, classId)) {
      alert('⚠️ Conflito de horário do professor detectado!\n\nO professor já possui uma turma no mesmo período letivo, horário e dia da semana.\n\nPor favor, escolha um horário vago ou outro professor.');
      return;
    }
    const classData = {
      name,
      courseId,
      moduleId,
      periodId,
      roomId,
      workload,
      shift,
      startTime,
      endTime,
      enrolledStudents,
      weekDays,
      teacherId,
      createdAt: classId ? undefined : new Date().toISOString()
    };

    if (classId) {
      this.dataManager.updateClass(classId, classData);
    } else {
      this.dataManager.addClass(classData);
    }

    // Notificar atualização da escala de horários
    this.notifyScheduleUpdate();

    this.renderContent();
  }

  notifyScheduleUpdate() {
    // Disparar evento customizado para atualizar a visualização de horários
    const event = new CustomEvent('scheduleUpdated');
    document.dispatchEvent(event);
  }

  hasScheduleConflict(roomId, weekDays, startTime, endTime, excludeClassId = null) {
    const existingClasses = this.dataManager.getClassesByRoom(roomId);
    
    for (const existingClass of existingClasses) {
      // Pular a própria turma se estiver editando
      if (excludeClassId && existingClass.id === excludeClassId) {
        continue;
      }
      
      // Verificar se há sobreposição de dias da semana
      const hasCommonDay = weekDays.some(day => existingClass.weekDays.includes(day));
      
      if (hasCommonDay) {
        // Verificar se há sobreposição de horários
        const newStart = this.timeToMinutes(startTime);
        const newEnd = this.timeToMinutes(endTime);
        const existingStart = this.timeToMinutes(existingClass.startTime);
        const existingEnd = this.timeToMinutes(existingClass.endTime);
        
        // Verificar sobreposição: novo horário começa antes do existente terminar
        // E novo horário termina depois do existente começar
        if (newStart < existingEnd && newEnd > existingStart) {
          return true;
        }
      }
    }
    
    return false;
  }

  hasTeacherScheduleConflict(teacherId, periodId, weekDays, startTime, endTime, excludeClassId = null) {
    const teacherClasses = this.dataManager.getClassesByTeacher(teacherId);
    
    for (const existingClass of teacherClasses) {
      // Pular a própria turma se estiver editando
      if (excludeClassId && existingClass.id === excludeClassId) {
        continue;
      }
      
      // Verificar se é o mesmo período letivo
      if (existingClass.periodId !== periodId) {
        continue;
      }
      
      // Verificar se há sobreposição de dias da semana
      const hasCommonDay = weekDays.some(day => existingClass.weekDays.includes(day));
      
      if (hasCommonDay) {
        // Verificar se há sobreposição de horários
        const newStart = this.timeToMinutes(startTime);
        const newEnd = this.timeToMinutes(endTime);
        const existingStart = this.timeToMinutes(existingClass.startTime);
        const existingEnd = this.timeToMinutes(existingClass.endTime);
        
        // Verificar sobreposição
        if (newStart < existingEnd && newEnd > existingStart) {
          return true;
        }
      }
    }
    
    return false;
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  showPasswordsModal(classData) {
    const passwords = this.dataManager.getPasswordsByClass(classData.id);
    const room = this.dataManager.getRooms().find(r => r.id === classData.roomId);
    const availableSpots = room ? room.capacity - classData.enrolledStudents : 0;
    const unusedPasswords = passwords.filter(p => !p.isUsed);

    const modalContent = `
      <div class="passwords-manager">
        <div class="passwords-header">
          <div class="class-info">
            <h4>${classData.name}</h4>
            <p>Capacidade: ${classData.enrolledStudents}/${room?.capacity || 0} • Vagas disponíveis: ${availableSpots}</p>
            <p>Senhas não utilizadas: ${unusedPasswords.length}</p>
          </div>
          <div class="password-actions">
            <input type="number" id="passwordQuantity" min="1" max="${availableSpots}" value="1" placeholder="Qtd">
            <button class="btn btn-primary" id="generatePasswordsBtn" ${availableSpots <= 0 ? 'disabled' : ''}>
              <span>🎫</span>
              Gerar Senhas
            </button>
          </div>
        </div>
        
        <div class="passwords-list" id="passwordsList">
          ${passwords.length > 0 ? `
            <div class="passwords-actions-bar">
              <button class="btn btn-secondary" id="printPasswordsBtn">
                🖨️ Imprimir Todas
              </button>
              <button class="btn btn-secondary" id="printUnusedBtn">
                🖨️ Imprimir Não Utilizadas
              </button>
            </div>
            ${passwords.map(password => `
              <div class="password-card ${password.isUsed ? 'used' : 'available'}" data-password-id="${password.id}">
                <div class="password-header">
                  <div class="password-code">${password.code}</div>
                  <div class="password-status">
                    ${password.isUsed ? '✅ Utilizada' : '🎫 Disponível'}
                  </div>
                  ${!password.isUsed ? `
                    <button class="btn-icon delete-password-btn" title="Excluir senha">🗑️</button>
                  ` : ''}
                </div>
                <div class="password-details">
                  <div class="qr-code-preview" data-qr="${password.qrCode}">
                    📱 QR Code
                  </div>
                  <div class="password-info">
                    <p><strong>Criada em:</strong> ${new Date(password.createdAt).toLocaleDateString('pt-BR')}</p>
                    ${password.isUsed ? `
                      <p><strong>Utilizada em:</strong> ${new Date(password.usedAt).toLocaleDateString('pt-BR')}</p>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          ` : `
            <div class="empty-passwords">
              <p>Nenhuma senha gerada para esta turma.</p>
            </div>
          `}
        </div>
      </div>
    `;

    const modal = new Modal(`Senhas - ${classData.name}`, modalContent);
    document.body.appendChild(modal.render());

    // Generate passwords button
    const generateBtn = document.getElementById('generatePasswordsBtn');
    if (generateBtn && !generateBtn.disabled) {
      generateBtn.addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('passwordQuantity').value) || 1;
        if (quantity > availableSpots) {
          alert(`Não é possível gerar ${quantity} senhas. Apenas ${availableSpots} vagas disponíveis.`);
          return;
        }
        
        this.dataManager.generatePasswordsForClass(classData.id, quantity);
        modal.close();
        setTimeout(() => this.showPasswordsModal(classData), 100);
      });
    }

    // Print buttons
    const printAllBtn = document.getElementById('printPasswordsBtn');
    if (printAllBtn) {
      printAllBtn.addEventListener('click', () => {
        this.printPasswords(classData, passwords);
      });
    }

    const printUnusedBtn = document.getElementById('printUnusedBtn');
    if (printUnusedBtn) {
      printUnusedBtn.addEventListener('click', () => {
        this.printPasswords(classData, unusedPasswords);
      });
    }

    // Delete password buttons
    passwords.forEach(password => {
      if (!password.isUsed) {
        const deleteBtn = document.querySelector(`[data-password-id="${password.id}"] .delete-password-btn`);
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir esta senha?')) {
              this.dataManager.deletePassword(password.id);
              modal.close();
              setTimeout(() => this.showPasswordsModal(classData), 100);
            }
          });
        }
      }
    });
  }

  printPasswords(classData, passwords) {
    if (passwords.length === 0) {
      alert('Nenhuma senha para imprimir.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('🚫 Pop-up bloqueado!\n\nPor favor, permita pop-ups para este site e tente novamente.');
      return;
    }

    const course = this.dataManager.getCourses().find(c => c.id === classData.courseId);
    const module = this.dataManager.getCourseModules().find(m => m.id === classData.moduleId);
    const period = this.dataManager.getPeriods().find(p => p.id === classData.periodId);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Senhas de Matrícula - ${classData.name}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 15px;
          }
          
          .header h1 {
            color: #6366f1;
            margin: 0 0 5px 0;
            font-size: 18px;
          }
          
          .header h2 {
            margin: 0 0 5px 0;
            font-size: 16px;
            color: #1e293b;
          }
          
          .passwords-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .password-ticket {
            border: 2px dashed #6366f1;
            padding: 15px;
            border-radius: 8px;
            background: #f8fafc;
            page-break-inside: avoid;
            text-align: center;
          }
          
          .ticket-header {
            background: #6366f1;
            color: white;
            padding: 8px;
            margin: -15px -15px 10px -15px;
            border-radius: 6px 6px 0 0;
            font-weight: bold;
          }
          
          .password-code {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin: 10px 0;
            letter-spacing: 2px;
            border: 1px solid #6366f1;
            padding: 8px;
            border-radius: 4px;
            background: white;
          }
          
          .qr-placeholder {
            width: 80px;
            height: 80px;
            border: 2px solid #6366f1;
            margin: 10px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #6366f1;
            background: white;
          }
          
          .ticket-info {
            font-size: 10px;
            color: #64748b;
            margin-top: 10px;
            line-height: 1.4;
          }
          
          .instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 10px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 11px;
          }
          
          @media print {
            body { font-size: 11px; }
            .passwords-grid { gap: 10px; }
            .password-ticket { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎫 Senhas de Matrícula</h1>
          <h2>${classData.name}</h2>
          <p><strong>Curso:</strong> ${course?.name || 'N/A'} | <strong>Módulo:</strong> ${module?.name || 'N/A'}</p>
          <p><strong>Período:</strong> ${period?.name} (${period?.year}) | <strong>Horário:</strong> ${classData.startTime} - ${classData.endTime}</p>
        </div>
        
        <div class="passwords-grid">
          ${passwords.map(password => `
            <div class="password-ticket">
              <div class="ticket-header">
                SENHA DE MATRÍCULA
              </div>
              <div class="password-code">${password.code}</div>
              <div class="qr-placeholder">
                QR CODE<br>
                📱
              </div>
              <div class="ticket-info">
                <p><strong>Turma:</strong> ${classData.name}</p>
                <p><strong>Dias:</strong> ${classData.weekDays.join(', ')}</p>
                <p><strong>Gerada em:</strong> ${new Date(password.createdAt).toLocaleDateString('pt-BR')}</p>
                <p><strong>Status:</strong> ${password.isUsed ? 'UTILIZADA' : 'DISPONÍVEL'}</p>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="instructions">
          <h4>📋 Instruções:</h4>
          <p>1. Cada senha corresponde a uma vaga na turma</p>
          <p>2. Escaneie o QR Code ou use o código para realizar a matrícula</p>
          <p>3. Cada senha pode ser utilizada apenas uma vez</p>
          <p>4. Guarde esta senha até completar a matrícula</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #64748b;">
          Documento gerado pelo Sistema Administrativo - Cidade do Saber<br>
          Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
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

  deleteClass(classId) {
    if (confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteClass(classId);
      this.renderContent();
    }
  }
}
import { Modal } from './Modal.js';

export class CourseManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
    this.selectedCourse = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'course-manager';

    this.renderContent();
    return this.container;
  }

  renderContent() {
    const courses = this.dataManager.getCourses();

    this.container.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h2>Gerenciamento de Cursos</h2>
          <p>Cadastre e gerencie os cursos e seus módulos/etapas</p>
        </div>
        <button class="btn btn-primary" id="addCourseBtn">
          <span>➕</span>
          Novo Curso
        </button>
      </div>

      <div class="content-section">
        <div class="courses-grid" id="coursesGrid">
          ${courses.map(course => this.renderCourseCard(course)).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#addCourseBtn').addEventListener('click', () => {
      this.showCourseModal();
    });

    // Add event listeners for course cards
    courses.forEach(course => {
      const card = this.container.querySelector(`[data-course-id="${course.id}"]`);
      
      card.querySelector('.edit-btn').addEventListener('click', () => {
        this.showCourseModal(course);
      });

      card.querySelector('.modules-btn').addEventListener('click', () => {
        this.showModulesModal(course);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        this.deleteCourse(course.id);
      });
    });
  }

  renderCourseCard(course) {
    const modules = this.dataManager.getModulesByCourse(course.id);
    const totalWorkload = modules.reduce((total, module) => total + (module.workload || 0), 0);
    
    return `
      <div class="course-card" data-course-id="${course.id}">
        <div class="course-header">
          <h3>${course.name}</h3>
          <div class="course-actions">
            <button class="btn-icon edit-btn" title="Editar curso">✏️</button>
            <button class="btn-icon modules-btn" title="Gerenciar módulos">📚</button>
            <button class="btn-icon delete-btn" title="Excluir curso">🗑️</button>
          </div>
        </div>
        <div class="course-info">
          <div class="course-detail">
            <span class="label">Categoria:</span>
            <span class="value">${course.category}</span>
          </div>
          <div class="course-detail">
            <span class="label">Duração:</span>
            <span class="value">${course.duration}</span>
          </div>
          <div class="course-detail">
            <span class="label">Módulos/Etapas:</span>
            <span class="value">${modules.length} módulo${modules.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="course-detail">
            <span class="label">Carga Horária Total:</span>
            <span class="value">${totalWorkload}h</span>
          </div>
          <div class="course-description">
            <p>${course.description}</p>
          </div>
          ${modules.length > 0 ? `
            <div class="modules-preview">
              <h4>📚 Módulos do Curso:</h4>
              ${modules.sort((a, b) => a.order - b.order).map(module => `
                <div class="module-item">
                  <div class="module-name">${module.name}</div>
                  <div class="module-details">
                    <span class="module-order">Ordem: ${module.order}</span>
                    <span class="module-workload">${module.workload}h</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-modules">
              <p>Nenhum módulo cadastrado. Clique em 📚 para adicionar módulos.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  showCourseModal(course = null) {
    const isEdit = course !== null;
    const title = isEdit ? 'Editar Curso' : 'Novo Curso';

    const formHtml = `
      <form id="courseForm" class="modal-form">
        <div class="form-group">
          <label for="courseName">Nome do Curso</label>
          <input 
            type="text" 
            id="courseName" 
            value="${course?.name || ''}" 
            placeholder="Ex: Dança Contemporânea Completo"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="courseDescription">Descrição</label>
          <textarea 
            id="courseDescription" 
            placeholder="Descrição detalhada do curso..."
            rows="3"
            required
          >${course?.description || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="courseCategory">Categoria</label>
            <select id="courseCategory" required>
              <option value="">Selecione a categoria</option>
              <option value="Cultura" ${course?.category === 'Cultura' ? 'selected' : ''}>Cultura</option>
              <option value="Educação" ${course?.category === 'Educação' ? 'selected' : ''}>Educação</option>
              <option value="Esporte" ${course?.category === 'Esporte' ? 'selected' : ''}>Esporte</option>
              <option value="Tecnologia" ${course?.category === 'Tecnologia' ? 'selected' : ''}>Tecnologia</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="courseDuration">Duração Estimada</label>
            <input 
              type="text" 
              id="courseDuration" 
              value="${course?.duration || ''}" 
              placeholder="Ex: 6 meses, 1 ano"
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
    document.getElementById('courseForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCourseData(course?.id);
      modal.close();
    });

    // Handle cancel
    document.getElementById('cancelBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  showModulesModal(course) {
    const modules = this.dataManager.getModulesByCourse(course.id);
    const totalWorkload = modules.reduce((total, module) => total + (module.workload || 0), 0);

    const modalContent = `
      <div class="modules-manager">
        <div class="modules-header">
          <div class="course-info">
            <h4>${course.name}</h4>
            <p>Total: ${modules.length} módulo${modules.length !== 1 ? 's' : ''} • ${totalWorkload}h</p>
          </div>
          <button class="btn btn-primary" id="addModuleBtn">
            <span>➕</span>
            Novo Módulo
          </button>
        </div>
        
        <div class="modules-list" id="modulesList">
          ${modules.length > 0 ? `
            ${modules.sort((a, b) => a.order - b.order).map(module => `
              <div class="module-card" data-module-id="${module.id}">
                <div class="module-header">
                  <div class="module-info">
                    <h5>${module.name}</h5>
                    <span class="module-order">Ordem: ${module.order}</span>
                  </div>
                  <div class="module-actions">
                    <button class="btn-icon edit-module-btn" title="Editar módulo">✏️</button>
                    <button class="btn-icon delete-module-btn" title="Excluir módulo">🗑️</button>
                  </div>
                </div>
                <div class="module-details">
                  <p>${module.description}</p>
                  <div class="module-workload">
                    <strong>Carga Horária:</strong> ${module.workload}h
                  </div>
                </div>
              </div>
            `).join('')}
          ` : `
            <div class="empty-modules">
              <p>Nenhum módulo cadastrado para este curso.</p>
            </div>
          `}
        </div>
      </div>
    `;

    const modal = new Modal(`Módulos - ${course.name}`, modalContent);
    document.body.appendChild(modal.render());

    // Add module button
    document.getElementById('addModuleBtn').addEventListener('click', () => {
      this.showModuleModal(course);
    });

    // Module action buttons
    modules.forEach(module => {
      const moduleCard = document.querySelector(`[data-module-id="${module.id}"]`);
      
      moduleCard.querySelector('.edit-module-btn').addEventListener('click', () => {
        this.showModuleModal(course, module);
      });

      moduleCard.querySelector('.delete-module-btn').addEventListener('click', () => {
        this.deleteModule(module.id, course);
      });
    });
  }

  showModuleModal(course, module = null) {
    const isEdit = module !== null;
    const title = isEdit ? 'Editar Módulo' : 'Novo Módulo';
    const existingModules = this.dataManager.getModulesByCourse(course.id);
    const nextOrder = Math.max(...existingModules.map(m => m.order), 0) + 1;

    const formHtml = `
      <form id="moduleForm" class="modal-form">
        <div class="form-group">
          <label for="moduleName">Nome do Módulo/Etapa</label>
          <input 
            type="text" 
            id="moduleName" 
            value="${module?.name || ''}" 
            placeholder="Ex: Módulo 1 - Fundamentos"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="moduleDescription">Descrição</label>
          <textarea 
            id="moduleDescription" 
            placeholder="Descrição do conteúdo do módulo..."
            rows="3"
            required
          >${module?.description || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="moduleOrder">Ordem</label>
            <input 
              type="number" 
              id="moduleOrder" 
              value="${module?.order || nextOrder}" 
              min="1"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="moduleWorkload">Carga Horária (horas)</label>
            <input 
              type="number" 
              id="moduleWorkload" 
              value="${module?.workload || 40}" 
              min="1"
              required
            >
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelModuleBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    `;

    const modal = new Modal(title, formHtml);
    document.body.appendChild(modal.render());

    // Handle form submission
    document.getElementById('moduleForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveModuleData(course.id, module?.id);
      modal.close();
      // Refresh modules modal
      setTimeout(() => this.showModulesModal(course), 100);
    });

    // Handle cancel
    document.getElementById('cancelModuleBtn').addEventListener('click', () => {
      modal.close();
    });
  }

  saveCourseData(courseId = null) {
    const name = document.getElementById('courseName').value;
    const description = document.getElementById('courseDescription').value;
    const category = document.getElementById('courseCategory').value;
    const duration = document.getElementById('courseDuration').value;

    const courseData = {
      name,
      description,
      category,
      duration,
      createdAt: courseId ? undefined : new Date().toISOString()
    };

    if (courseId) {
      this.dataManager.updateCourse(courseId, courseData);
    } else {
      this.dataManager.addCourse(courseData);
    }

    this.renderContent();
  }

  saveModuleData(courseId, moduleId = null) {
    const name = document.getElementById('moduleName').value;
    const description = document.getElementById('moduleDescription').value;
    const order = parseInt(document.getElementById('moduleOrder').value);
    const workload = parseInt(document.getElementById('moduleWorkload').value);

    const moduleData = {
      courseId,
      name,
      description,
      order,
      workload,
      createdAt: moduleId ? undefined : new Date().toISOString()
    };

    if (moduleId) {
      this.dataManager.updateCourseModule(moduleId, moduleData);
    } else {
      this.dataManager.addCourseModule(moduleData);
    }
  }

  deleteCourse(courseId) {
    const modules = this.dataManager.getModulesByCourse(courseId);
    if (modules.length > 0) {
      if (!confirm('Este curso possui módulos cadastrados. Tem certeza que deseja excluir o curso e todos os seus módulos? Esta ação não pode ser desfeita.')) {
        return;
      }
    } else {
      if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
        return;
      }
    }

    this.dataManager.deleteCourse(courseId);
    this.renderContent();
  }

  deleteModule(moduleId, course) {
    if (confirm('Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.')) {
      this.dataManager.deleteCourseModule(moduleId);
    }
  }
}
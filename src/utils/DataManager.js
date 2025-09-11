export class DataManager {
  constructor() {
    this.buildings = this.loadBuildings();
    this.rooms = this.loadRooms();
    this.classes = this.loadClasses();
    this.periods = this.loadPeriods();
    this.teachers = this.loadTeachers();
    this.specialties = this.loadSpecialties();
    this.courses = this.loadCourses();
    this.courseModules = this.loadCourseModules();
  }

  // Building methods
  getBuildings() {
    return this.buildings;
  }

  addBuilding(buildingData) {
    const building = {
      id: this.generateId(),
      ...buildingData,
      createdAt: new Date().toISOString()
    };
    
    this.buildings.push(building);
    this.saveBuildings();
    return building;
  }

  updateBuilding(id, buildingData) {
    const index = this.buildings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.buildings[index] = { ...this.buildings[index], ...buildingData };
      this.saveBuildings();
    }
  }

  deleteBuilding(id) {
    this.buildings = this.buildings.filter(b => b.id !== id);
    // Also delete all rooms in this building
    this.rooms = this.rooms.filter(r => r.buildingId !== id);
    this.saveBuildings();
    this.saveRooms();
  }

  // Room methods
  getRooms() {
    return this.rooms;
  }

  getRoomsByBuilding(buildingId) {
    return this.rooms.filter(room => room.buildingId === buildingId);
  }

  addRoom(roomData) {
    const room = {
      id: this.generateId(),
      ...roomData,
      createdAt: new Date().toISOString()
    };
    
    this.rooms.push(room);
    this.saveRooms();
    return room;
  }

  updateRoom(id, roomData) {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index !== -1) {
      this.rooms[index] = { ...this.rooms[index], ...roomData };
      this.saveRooms();
    }
  }

  deleteRoom(id) {
    this.rooms = this.rooms.filter(r => r.id !== id);
    this.saveRooms();
  }

  // Class methods
  getClasses() {
    return this.classes;
  }

  getClassesByRoom(roomId) {
    return this.classes.filter(cls => cls.roomId === roomId);
  }

  getClassesByPeriod(periodId) {
    return this.classes.filter(cls => cls.periodId === periodId);
  }

  addClass(classData) {
    const classItem = {
      id: this.generateId(),
      ...classData,
      createdAt: new Date().toISOString()
    };
    
    this.classes.push(classItem);
    this.saveClasses();
    return classItem;
  }

  updateClass(id, classData) {
    const index = this.classes.findIndex(c => c.id === id);
    if (index !== -1) {
      this.classes[index] = { ...this.classes[index], ...classData };
      this.saveClasses();
    }
  }

  deleteClass(id) {
    this.classes = this.classes.filter(c => c.id !== id);
    this.saveClasses();
  }

  // Period methods
  getPeriods() {
    return this.periods;
  }

  addPeriod(periodData) {
    const period = {
      id: this.generateId(),
      ...periodData,
      createdAt: new Date().toISOString()
    };
    
    this.periods.push(period);
    this.savePeriods();
    return period;
  }

  updatePeriod(id, periodData) {
    const index = this.periods.findIndex(p => p.id === id);
    if (index !== -1) {
      this.periods[index] = { ...this.periods[index], ...periodData };
      this.savePeriods();
    }
  }

  deletePeriod(id) {
    this.periods = this.periods.filter(p => p.id !== id);
    this.savePeriods();
  }

  // Teacher methods
  getTeachers() {
    return this.teachers;
  }

  addTeacher(teacherData) {
    const teacher = {
      id: this.generateId(),
      ...teacherData,
      createdAt: new Date().toISOString()
    };
    
    this.teachers.push(teacher);
    this.saveTeachers();
    return teacher;
  }

  updateTeacher(id, teacherData) {
    const index = this.teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.teachers[index] = { ...this.teachers[index], ...teacherData };
      this.saveTeachers();
    }
  }

  deleteTeacher(id) {
    this.teachers = this.teachers.filter(t => t.id !== id);
    // Remove teacher from classes
    this.classes = this.classes.map(cls => ({
      ...cls,
      teacherId: cls.teacherId === id ? null : cls.teacherId
    }));
    this.saveTeachers();
    this.saveClasses();
  }

  getClassesByTeacher(teacherId) {
    return this.classes.filter(cls => cls.teacherId === teacherId);
  }

  // Specialty methods
  getSpecialties() {
    return this.specialties;
  }

  addSpecialty(specialtyData) {
    const specialty = {
      id: this.generateId(),
      ...specialtyData,
      createdAt: new Date().toISOString()
    };
    
    this.specialties.push(specialty);
    this.saveSpecialties();
    return specialty;
  }

  updateSpecialty(id, specialtyData) {
    const index = this.specialties.findIndex(s => s.id === id);
    if (index !== -1) {
      this.specialties[index] = { ...this.specialties[index], ...specialtyData };
      this.saveSpecialties();
    }
  }

  deleteSpecialty(id) {
    this.specialties = this.specialties.filter(s => s.id !== id);
    this.saveSpecialties();
  }

  // Course methods
  getCourses() {
    return this.courses;
  }

  addCourse(courseData) {
    const course = {
      id: this.generateId(),
      ...courseData,
      createdAt: new Date().toISOString()
    };
    
    this.courses.push(course);
    this.saveCourses();
    return course;
  }

  updateCourse(id, courseData) {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...courseData };
      this.saveCourses();
    }
  }

  deleteCourse(id) {
    this.courses = this.courses.filter(c => c.id !== id);
    // Also delete all modules for this course
    this.courseModules = this.courseModules.filter(m => m.courseId !== id);
    this.saveCourses();
    this.saveCourseModules();
  }

  // Course Module methods
  getCourseModules() {
    return this.courseModules;
  }

  getModulesByCourse(courseId) {
    return this.courseModules.filter(module => module.courseId === courseId);
  }

  addCourseModule(moduleData) {
    const module = {
      id: this.generateId(),
      ...moduleData,
      createdAt: new Date().toISOString()
    };
    
    this.courseModules.push(module);
    this.saveCourseModules();
    return module;
  }

  updateCourseModule(id, moduleData) {
    const index = this.courseModules.findIndex(m => m.id === id);
    if (index !== -1) {
      this.courseModules[index] = { ...this.courseModules[index], ...moduleData };
      this.saveCourseModules();
    }
  }

  deleteCourseModule(id) {
    this.courseModules = this.courseModules.filter(m => m.id !== id);
    this.saveCourseModules();
  }

  // Get course with calculated total workload
  getCourseWithWorkload(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    const modules = this.getModulesByCourse(courseId);
    const totalWorkload = modules.reduce((total, module) => total + (module.workload || 0), 0);

    return {
      ...course,
      modules,
      totalWorkload
    };
  }

  // Storage methods
  loadBuildings() {
    const stored = localStorage.getItem('cidade_saber_buildings');
    return stored ? JSON.parse(stored) : this.getDefaultBuildings();
  }

  saveBuildings() {
    localStorage.setItem('cidade_saber_buildings', JSON.stringify(this.buildings));
  }

  loadRooms() {
    const stored = localStorage.getItem('cidade_saber_rooms');
    return stored ? JSON.parse(stored) : this.getDefaultRooms();
  }

  saveRooms() {
    localStorage.setItem('cidade_saber_rooms', JSON.stringify(this.rooms));
  }

  loadClasses() {
    const stored = localStorage.getItem('cidade_saber_classes');
    return stored ? JSON.parse(stored) : this.getDefaultClasses();
  }

  saveClasses() {
    localStorage.setItem('cidade_saber_classes', JSON.stringify(this.classes));
  }

  loadPeriods() {
    const stored = localStorage.getItem('cidade_saber_periods');
    return stored ? JSON.parse(stored) : this.getDefaultPeriods();
  }

  savePeriods() {
    localStorage.setItem('cidade_saber_periods', JSON.stringify(this.periods));
  }

  loadTeachers() {
    const stored = localStorage.getItem('cidade_saber_teachers');
    return stored ? JSON.parse(stored) : this.getDefaultTeachers();
  }

  saveTeachers() {
    localStorage.setItem('cidade_saber_teachers', JSON.stringify(this.teachers));
  }

  loadSpecialties() {
    const stored = localStorage.getItem('cidade_saber_specialties');
    return stored ? JSON.parse(stored) : this.getDefaultSpecialties();
  }

  saveSpecialties() {
    localStorage.setItem('cidade_saber_specialties', JSON.stringify(this.specialties));
  }

  loadCourses() {
    const stored = localStorage.getItem('cidade_saber_courses');
    return stored ? JSON.parse(stored) : this.getDefaultCourses();
  }

  saveCourses() {
    localStorage.setItem('cidade_saber_courses', JSON.stringify(this.courses));
  }

  loadCourseModules() {
    const stored = localStorage.getItem('cidade_saber_course_modules');
    return stored ? JSON.parse(stored) : this.getDefaultCourseModules();
  }

  saveCourseModules() {
    localStorage.setItem('cidade_saber_course_modules', JSON.stringify(this.courseModules));
  }

  // Default data
  getDefaultBuildings() {
    return [
      {
        id: '1',
        name: 'Prédio Principal',
        description: 'Prédio principal com salas administrativas e de aula',
        floors: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Centro Cultural',
        description: 'Espaço dedicado às atividades culturais e artísticas',
        floors: 2,
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultRooms() {
    return [
      {
        id: '1',
        name: 'Sala 101',
        buildingId: '1',
        floor: 1,
        capacity: 30,
        type: 'Educação',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Auditório',
        buildingId: '2',
        floor: 1,
        capacity: 100,
        type: 'Cultura',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Sala de Dança',
        buildingId: '2',
        floor: 2,
        capacity: 25,
        type: 'Cultura',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultClasses() {
    return [
      {
        id: '1',
        name: 'Dança Contemporânea - Iniciante',
        courseId: '1',
        moduleId: '1',
        periodId: '1',
        roomId: '3',
        teacherId: '1',
        workload: 40,
        shift: 'Vespertino',
        startTime: '14:00',
        endTime: '16:00',
        weekDays: ['Segunda', 'Quarta', 'Sexta'],
        enrolledStudents: 20,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Matemática Básica',
        courseId: '2',
        moduleId: '4',
        periodId: '1',
        roomId: '1',
        teacherId: '2',
        workload: 30,
        shift: 'Matutino',
        startTime: '08:00',
        endTime: '10:00',
        weekDays: ['Segunda', 'Terça', 'Quinta'],
        enrolledStudents: 25,
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultPeriods() {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: '1',
        name: '1º Semestre',
        year: currentYear,
        division: 'Semestral',
        startDate: `${currentYear}-02-01`,
        endDate: `${currentYear}-07-31`,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: '2º Semestre',
        year: currentYear,
        division: 'Semestral',
        startDate: `${currentYear}-08-01`,
        endDate: `${currentYear}-12-15`,
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultTeachers() {
    return [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria.silva@cidadedosaber.com',
        phone: '(11) 99999-1111',
        specialties: ['1', '2'], // IDs das especialidades
        maxWorkload: 40,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao.santos@cidadedosaber.com',
        phone: '(11) 99999-2222',
        specialties: ['3'], // IDs das especialidades
        maxWorkload: 44,
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultSpecialties() {
    return [
      {
        id: '1',
        name: 'Dança Contemporânea',
        description: 'Ensino de dança contemporânea e expressão corporal',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Ballet Clássico',
        description: 'Técnicas clássicas de ballet',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Matemática',
        description: 'Ensino de matemática básica e avançada',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Música',
        description: 'Teoria musical e prática instrumental',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Teatro',
        description: 'Artes cênicas e interpretação',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultCourses() {
    return [
      {
        id: '1',
        name: 'Dança Contemporânea Completo',
        description: 'Curso completo de dança contemporânea do básico ao avançado',
        category: 'Cultura',
        duration: '12 meses',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Matemática Fundamental',
        description: 'Curso de matemática básica e fundamental',
        category: 'Educação',
        duration: '8 meses',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultCourseModules() {
    return [
      {
        id: '1',
        courseId: '1',
        name: 'Módulo 1 - Fundamentos',
        description: 'Introdução aos fundamentos da dança contemporânea',
        order: 1,
        workload: 40,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        courseId: '1',
        name: 'Módulo 2 - Técnicas Intermediárias',
        description: 'Desenvolvimento de técnicas intermediárias',
        order: 2,
        workload: 60,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        courseId: '1',
        name: 'Módulo 3 - Técnicas Avançadas',
        description: 'Aperfeiçoamento e técnicas avançadas',
        order: 3,
        workload: 80,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        courseId: '2',
        name: 'Unidade 1 - Aritmética Básica',
        description: 'Operações fundamentais e conceitos básicos',
        order: 1,
        workload: 30,
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        courseId: '2',
        name: 'Unidade 2 - Álgebra Elementar',
        description: 'Introdução à álgebra e equações',
        order: 2,
        workload: 40,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Utility methods
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
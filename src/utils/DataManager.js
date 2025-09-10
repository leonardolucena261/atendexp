export class DataManager {
  constructor() {
    this.buildings = this.loadBuildings();
    this.rooms = this.loadRooms();
    this.classes = this.loadClasses();
    this.periods = this.loadPeriods();
    this.teachers = this.loadTeachers();
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
        periodId: '1',
        roomId: '3',
        teacherId: '1',
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
        periodId: '1',
        roomId: '1',
        teacherId: '2',
        teacherId: '2',
        workload: 60,
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
        specialty: 'Dança Contemporânea',
        maxWorkload: 40,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao.santos@cidadedosaber.com',
        phone: '(11) 99999-2222',
        specialty: 'Matemática',
        maxWorkload: 44,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Utility methods
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
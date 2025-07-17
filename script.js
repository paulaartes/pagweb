// Datos de estudiantes (ejemplo - modifica con tus datos reales)
const studentsData = [
  { id: 1, name: 'Youssef', photo: 'Youssef.png' },
  { id: 2, name: 'Reda', photo: 'Reda.png' },
  // Agrega los demás 23 estudiantes aquí...
];

// Variables globales
let placedStudents = 0;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  createStudentPhotos();
  setupEventListeners();
  handleResize();
});

// Crea los elementos de estudiantes
function createStudentPhotos() {
  const studentsPanel = document.getElementById('studentsPanel');
  studentsPanel.innerHTML = '';

  studentsData.forEach(student => {
    const studentElement = document.createElement('div');
    studentElement.className = 'student-container';
    studentElement.dataset.studentId = student.id;
    studentElement.draggable = true;
    studentElement.tabIndex = 0;

    const img = document.createElement('img');
    img.src = `img/${student.photo}`;
    img.alt = student.name;
    img.className = 'student-img';

    const nameLabel = document.createElement('span');
    nameLabel.className = 'student-name';
    nameLabel.textContent = student.name;

    studentElement.appendChild(img);
    studentElement.appendChild(nameLabel);
    studentsPanel.appendChild(studentElement);

    // Eventos de drag
    studentElement.addEventListener('dragstart', dragStart);
  });
}

// Configura eventos
function setupEventListeners() {
  // Botones de reinicio
  document.getElementById('resetSchool').addEventListener('click', () => resetBuilding('school'));
  document.getElementById('resetHouse').addEventListener('click', () => resetBuilding('house'));

  // Dropzones existentes en HTML
  document.querySelectorAll('.dropzone').forEach(zone => {
    zone.addEventListener('dragover', allowDrop);
    zone.addEventListener('drop', drop);
    zone.addEventListener('dragenter', dragEnter);
    zone.addEventListener('dragleave', dragLeave);
  });
}

// Funciones de Drag & Drop
function allowDrop(ev) {
  ev.preventDefault();
}

function dragStart(ev) {
  const studentElement = ev.currentTarget;
  ev.dataTransfer.setData('text/plain', studentElement.dataset.studentId);
  studentElement.classList.add('dragging');
}

function dragEnter(ev) {
  if (ev.target.classList.contains('dropzone')) {
    ev.target.classList.add('highlight');
  }
}

function dragLeave(ev) {
  if (ev.target.classList.contains('dropzone')) {
    ev.target.classList.remove('highlight');
  }
}

function drop(ev) {
  ev.preventDefault();
  ev.target.classList.remove('highlight');

  const studentId = ev.dataTransfer.getData('text/plain');
  const studentElement = document.querySelector(`[data-student-id="${studentId}"]`);
  const studentsPanel = document.getElementById('studentsPanel');

  // Si la zona ya tiene un estudiante
  const existingStudent = ev.target.querySelector('.student-container');
  if (existingStudent) {
    studentsPanel.appendChild(existingStudent);
    placedStudents--;
  }

  // Mover el estudiante
  ev.target.appendChild(studentElement);
  placedStudents++;
  updateCounter();
}

// Reinicia estudiantes de un edificio
function resetBuilding(building) {
  const studentsPanel = document.getElementById('studentsPanel');
  const dropzones = document.querySelectorAll(`.dropzone[data-building="${building}"]`);
  let studentsRemoved = 0;

  dropzones.forEach(zone => {
    const student = zone.querySelector('.student-container');
    if (student) {
      studentsPanel.appendChild(student);
      studentsRemoved++;
    }
  });

  placedStudents -= studentsRemoved;
  updateCounter();
}

// Actualiza el contador
function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}

// Responsive
function handleResize() {
  const buildings = document.querySelectorAll('.building');
  const scale = window.innerWidth < 768 ? 0.9 : 1;
  
  buildings.forEach(building => {
    building.style.transform = `scale(${scale})`;
  });
}

window.addEventListener('resize', handleResize);

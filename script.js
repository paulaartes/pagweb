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

function createStudentPhotos() {
  const studentsPanel = document.getElementById('studentsPanel');
  studentsPanel.innerHTML = '';

  studentsData.forEach(student => {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'student-img-container';
    imgContainer.draggable = true;
    imgContainer.dataset.studentId = student.id;

    const img = document.createElement('img');
    img.src = `img/${student.photo}`; // Usa el nombre personalizado
    img.alt = student.name;
    img.className = 'student-img';

    imgContainer.appendChild(img);
    studentsPanel.appendChild(imgContainer);

    imgContainer.addEventListener('dragstart', dragStart);
  });
}

// Configurar eventos (igual que antes)
function setupEventListeners() {
  document.getElementById('resetSchool').addEventListener('click', () => resetBuilding('school'));
  document.getElementById('resetHouse').addEventListener('click', () => resetBuilding('house'));

  document.querySelectorAll('.dropzone').forEach(zone => {
    zone.addEventListener('dragover', allowDrop);
    zone.addEventListener('drop', drop);
    zone.addEventListener('dragenter', dragEnter);
    zone.addEventListener('dragleave', dragLeave);
  });
}

// Funciones de Drag & Drop (igual que antes)
function allowDrop(ev) { ev.preventDefault(); }

function dragStart(ev) {
  const studentId = ev.currentTarget.dataset.studentId;
  ev.dataTransfer.setData('text/plain', studentId);
  ev.currentTarget.classList.add('dragging');
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

  // Devolver estudiante existente al panel
  const existingStudent = ev.target.querySelector('.student-img-container');
  if (existingStudent) resetElementToPanel(existingStudent);

  // Clonar y ajustar tamaño
  const clonedElement = studentElement.cloneNode(true);
  clonedElement.classList.remove('dragging');
  const img = clonedElement.querySelector('img');
  img.className = 'dropped-img';
  img.style.width = `${ev.target.offsetWidth}px`;
  
  ev.target.innerHTML = '';
  ev.target.appendChild(clonedElement);
  
  placedStudents++;
  updateCounter();
}

// Funciones auxiliares (igual que antes)
function resetBuilding(building) {
  const studentsPanel = document.getElementById('studentsPanel');
  const dropzones = document.querySelectorAll(`.dropzone[data-building="${building}"]`);
  let studentsRemoved = 0;

  dropzones.forEach(zone => {
    const student = zone.querySelector('.student-img-container');
    if (student) {
      resetElementToPanel(student);
      studentsRemoved++;
    }
  });

  placedStudents -= studentsRemoved;
  updateCounter();
}

function resetElementToPanel(element) {
  const studentsPanel = document.getElementById('studentsPanel');
  const img = element.querySelector('img');
  img.className = 'student-img';
  img.style.width = '';
  studentsPanel.appendChild(element);
}

function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}

function handleResize() {
  const buildings = document.querySelectorAll('.building');
  const scale = window.innerWidth < 768 ? 0.9 : 1;
  buildings.forEach(building => {
    building.style.transform = `scale(${scale})`;
  });
}

window.addEventListener('resize', handleResize);

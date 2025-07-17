// Configuración
const TOTAL_STUDENTS = 25;
let placedStudents = 0;

// Datos de estudiantes (ejemplo - reemplaza con tus datos reales)
const studentsData = [
  { id: 1, name: 'Youssef', photo: 'Youssef.png' },
  { id: 2, name: 'Reda', photo: 'Reda.png' },
  // Agrega los demás estudiantes aquí...
];

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
  createStudentPhotos();
  setupEventListeners();
  handleResize(); // Ajuste inicial para responsive
});

function createStudentPhotos() {
  const studentsPanel = document.getElementById('studentsPanel');
  studentsPanel.innerHTML = ''; // Limpiar panel primero

  studentsData.forEach(student => {
    const studentContainer = document.createElement('div');
    studentContainer.className = 'student-container';
    studentContainer.dataset.studentId = student.id;
    studentContainer.tabIndex = 0; 

    const img = document.createElement('img');
    img.src = `img/${student.photo}`;
    img.alt = student.name;
    img.className = 'draggable';
    img.draggable = true;
    img.addEventListener('dragstart', dragStart);

    const nameLabel = document.createElement('span');
    nameLabel.className = 'student-name';
    nameLabel.textContent = student.name;

    studentContainer.appendChild(img);
    studentContainer.appendChild(nameLabel);
    studentsPanel.appendChild(studentContainer);
  });
}

function setupEventListeners() {
  document.getElementById('resetSchool').addEventListener('click', () => resetBuilding('school'));
  document.getElementById('resetHouse').addEventListener('click', () => resetBuilding('house'));
  
  // Eventos para dropzones existentes en el HTML
  document.querySelectorAll('.dropzone').forEach(dropzone => {
    dropzone.addEventListener('dragover', allowDrop);
    dropzone.addEventListener('drop', drop);
    dropzone.addEventListener('dragenter', dragEnter);
    dropzone.addEventListener('dragleave', dragLeave);
  });
}

// Funciones de drag and drop
function allowDrop(ev) {
  ev.preventDefault();
}

function dragStart(ev) {
  // Guardamos tanto el ID como el nombre del estudiante
  const studentContainer = ev.target.closest('.student-container');
  ev.dataTransfer.setData("text/plain", JSON.stringify({
    id: studentContainer.dataset.studentId,
    elementId: studentContainer.id || `temp-${Date.now()}`,
    name: studentContainer.querySelector('.student-name').textContent
  }));
  ev.target.classList.add('dragging');
}

function dragEnter(ev) {
  ev.preventDefault();
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
  
  const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
  const studentsPanel = document.getElementById('studentsPanel');
  
  // Si la zona ya tiene un estudiante, lo devolvemos al panel
  const existingStudent = ev.target.querySelector('.student-container');
  if (existingStudent) {
    studentsPanel.appendChild(existingStudent);
    placedStudents--;
  }
  
  // Buscamos el estudiante arrastrado (puede ser del panel o de otra dropzone)
  let draggedElement = document.querySelector(`.student-container[data-student-id="${data.id}"]`);
  
  // Si no lo encontramos (puede ser de otra dropzone), creamos uno nuevo
  if (!draggedElement) {
    draggedElement = createStudentElement(data);
  }
  
  // Colocar el nuevo estudiante
  ev.target.appendChild(draggedElement);
  draggedElement.querySelector('.draggable').classList.remove('dragging');
  
  // Actualizar contador
  placedStudents++;
  updateCounter();
}

function createStudentElement(studentData) {
  const student = studentsData.find(s => s.id == studentData.id) || studentData;
  
  const container = document.createElement('div');
  container.className = 'student-container';
  container.dataset.studentId = student.id;

  const img = document.createElement('img');
  img.src = `img/${student.photo}`;
  img.alt = student.name;
  img.className = 'draggable';
  img.draggable = true;
  img.addEventListener('dragstart', dragStart);

  const nameLabel = document.createElement('span');
  nameLabel.className = 'student-name';
  nameLabel.textContent = student.name;

  container.appendChild(img);
  container.appendChild(nameLabel);
  
  return container;
}

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

function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}

// Responsive design
function handleResize() {
  const buildings = document.querySelectorAll('.building');
  const windowWidth = window.innerWidth;
  
  if (windowWidth < 768) {
    buildings.forEach(building => {
      building.style.transform = 'scale(0.9)';
    });
  } else {
    buildings.forEach(building => {
      building.style.transform = 'scale(1)';
    });
  }
}

window.addEventListener('resize', handleResize);

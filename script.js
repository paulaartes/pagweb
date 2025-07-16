// Configuración
const TOTAL_STUDENTS = 25;
let placedStudents = 0;

// Posiciones de los dropzones
const dropzonePositions = {
  school: [
    // Fila 1
    { top: 275, left: 78 }, { top: 275, left: 131 }, { top: 275, left: 186 },
    { top: 275, left: 240 }, { top: 275, left: 283 }, { top: 275, left: 326 },
    { top: 275, left: 380 }, { top: 275, left: 433 }, { top: 275, left: 487 },
    // Fila 2
    { top: 325, left: 78 }, { top: 325, left: 131 }, { top: 325, left: 186 },
    { top: 325, left: 240 }, { top: 325, left: 283 }, { top: 325, left: 326 },
    { top: 325, left: 380 }, { top: 325, left: 433 }, { top: 325, left: 487 },
    // Fila 3
    { top: 377, left: 78 }, { top: 377, left: 131 }, { top: 377, left: 186 },
    { top: 377, left: 380 }, { top: 377, left: 433 }, { top: 377, left: 487 },
    // Fila 4
    { top: 427, left: 78 }, { top: 427, left: 131 }, { top: 427, left: 186 },
    { top: 427, left: 380 }, { top: 427, left: 433 }, { top: 427, left: 487 }
  ],
  house: [
    // Fila 1
    { top: 153, left: 85 }, { top: 153, left: 135 }, { top: 153, left: 183 },
    { top: 153, left: 230 }, { top: 153, left: 275 },
    // Fila 2
    { top: 210, left: 85 }, { top: 210, left: 135 }, { top: 210, left: 183 },
    { top: 210, left: 230 }, { top: 210, left: 275 },
    // Fila 3
    { top: 270, left: 85 }, { top: 270, left: 135 },
    { top: 270, left: 230 }, { top: 270, left: 275 }
  ]
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
  initializeDropzones();
  createStudentPhotos();
  setupEventListeners();
});

function initializeDropzones() {
  const school = document.getElementById('school');
  const house = document.getElementById('house');

  // Crear dropzones para la escuela
  dropzonePositions.school.forEach(pos => {
    const dropzone = createDropzone(pos, 'school');
    school.appendChild(dropzone);
  });

  // Crear dropzones para la casa
  dropzonePositions.house.forEach(pos => {
    const dropzone = createDropzone(pos, 'house');
    house.appendChild(dropzone);
  });
}

function createDropzone(position, building) {
  const dropzone = document.createElement('div');
  dropzone.className = 'dropzone';
  dropzone.style.top = `${position.top}px`;
  dropzone.style.left = `${position.left}px`;
  dropzone.setAttribute('data-building', building);
  
  dropzone.addEventListener('dragover', allowDrop);
  dropzone.addEventListener('drop', drop);
  dropzone.addEventListener('dragenter', dragEnter);
  dropzone.addEventListener('dragleave', dragLeave);
  
  return dropzone;
}

function createStudentPhotos() {
  const studentsPanel = document.getElementById('studentsPanel');
  
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const img = document.createElement('img');
    img.src = `img/student${i}.jpg`;
    img.id = `student-${i}`;
    img.className = 'draggable';
    img.draggable = true;
    img.addEventListener('dragstart', dragStart);
    
    studentsPanel.appendChild(img);
  }
}

function setupEventListeners() {
  document.getElementById('resetSchool').addEventListener('click', () => resetBuilding('school'));
  document.getElementById('resetHouse').addEventListener('click', () => resetBuilding('house'));
}

// Funciones de drag and drop
function allowDrop(ev) {
  ev.preventDefault();
}

function dragStart(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.target.classList.add('dragging');
}

function dragEnter(ev) {
  ev.preventDefault();
  ev.target.classList.add('highlight');
}

function dragLeave(ev) {
  ev.target.classList.remove('highlight');
}

function drop(ev) {
  ev.preventDefault();
  ev.target.classList.remove('highlight');
  
  const data = ev.dataTransfer.getData("text/plain");
  const draggedElement = document.getElementById(data);
  const studentsPanel = document.getElementById('studentsPanel');
  
  // Si la zona ya tiene un estudiante, lo devolvemos al panel
  const existingStudent = ev.target.querySelector('.draggable');
  if (existingStudent) {
    studentsPanel.appendChild(existingStudent);
    placedStudents--;
  }
  
  // Si estamos moviendo un estudiante que ya estaba colocado
  if (draggedElement.parentElement.classList.contains('dropzone')) {
    placedStudents--;
  }
  
  // Colocar el nuevo estudiante
  ev.target.appendChild(draggedElement);
  draggedElement.classList.remove('dragging');
  
  // Actualizar contador
  placedStudents++;
  updateCounter();
}

function resetBuilding(building) {
  const studentsPanel = document.getElementById('studentsPanel');
  const dropzones = document.querySelectorAll(`.dropzone[data-building="${building}"]`);
  let studentsRemoved = 0;
  
  dropzones.forEach(zone => {
    const student = zone.querySelector('.draggable');
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

// Ajustar para dispositivos móviles
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
handleResize(); // Ejecutar al cargar

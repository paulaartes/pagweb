// Configuración
const TOTAL_STUDENTS = 25;
let placedStudents = 0;

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar dropzones
  document.querySelectorAll('.dropzone').forEach(zone => {
    zone.addEventListener('dragover', allowDrop);
    zone.addEventListener('drop', drop);
    zone.addEventListener('dragenter', dragEnter);
    zone.addEventListener('dragleave', dragLeave);
  });
  
  // Crear fotos de estudiantes
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
  
  // Botones de reinicio
  document.getElementById('resetSchool').addEventListener('click', () => resetBuilding('school'));
  document.getElementById('resetHouse').addEventListener('click', () => resetBuilding('house'));
  
  // Ajustar posiciones iniciales
  updateDropzonePositions();
});

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

// Actualizar posiciones de los dropzones al cambiar el tamaño de la pantalla
function updateDropzonePositions() {
  const school = document.getElementById('school');
  const house = document.getElementById('house');
  
  // Escala las posiciones basadas en el tamaño actual
  const schoolWidth = school.offsetWidth;
  const schoolHeight = school.offsetHeight;
  const houseWidth = house.offsetWidth;
  const houseHeight = house.offsetHeight;
  
  // Las posiciones ya están en porcentajes en el HTML, no necesitamos recalcular
}

function adjustImages() {
  // Para la escuela
  document.querySelectorAll('#school .dropzone .draggable').forEach(img => {
    img.style.objectFit = 'cover';
  });
  
  // Para la casa
  document.querySelectorAll('#house .dropzone .draggable').forEach(img => {
    img.style.objectFit = 'cover';
  });
}

// Ejecutar al cargar y al redimensionar
window.addEventListener('load', adjustImages);
window.addEventListener('resize', adjustImages);

// Escuchar cambios de tamaño de ventana
window.addEventListener('resize', updateDropzonePositions);

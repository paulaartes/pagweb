// Configuración
const TOTAL_STUDENTS = 25;
let placedStudents = 0;

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  // Ajustar escala inicial
  adjustScale();
  
  // Asegurar que todos los dropzones mantengan su aspecto
  const allDropzones = document.querySelectorAll('.dropzone');
  
  allDropzones.forEach(dropzone => {
    // Establecer tamaño fijo según el edificio
    if(dropzone.parentElement.id === 'school') {
      dropzone.style.width = '30px';
      dropzone.style.height = '30px';
    } else {
      dropzone.style.width = '35px';
      dropzone.style.height = '35px';
    }
    
    // Añadir transform para centrado preciso
    dropzone.style.transform = 'translate(-50%, -50%)';
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

function adjustScale() {
    const school = document.getElementById('school');
    const house = document.getElementById('house');
    const windowWidth = window.innerWidth;
    
    // Factor de escala basado en ancho de ventana
    const scale = Math.min(1, windowWidth / 1000);
    
    school.style.transform = `scale(${scale})`;
    house.style.transform = `scale(${scale})`;
    
    // Actualizar posiciones después de escalar
    updateDropzonePositions();
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

function handleImageSizing() {
  // Restaurar tamaño original al devolver al panel
  document.querySelectorAll('.students-panel .draggable').forEach(img => {
    img.style.width = '';
    img.style.height = '';
  });
  
  // Asegurar tamaño correcto en dropzones
  document.querySelectorAll('.dropzone .draggable').forEach(img => {
    img.style.width = '100%';
    img.style.height = '100%';
  });
}

// Event listeners combinados
window.addEventListener('load', function() {
  adjustImages();
  adjustScale();
});

window.addEventListener('resize', function() {
  adjustScale();
  updateDropzonePositions();
  adjustImages();
});

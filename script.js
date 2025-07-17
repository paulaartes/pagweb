// Datos de estudiantes (ejemplo - modifica con tus datos reales)
const studentsData = [
  { id: 1, name: 'Youssef', photo: 'Youssef.png' },
  { id: 2, name: 'Reda', photo: 'Reda.png' },
  { id: 3, name: 'Youssif', photo: 'Youssif.png' },
  { id: 4, name: 'Mariam', photo: 'Mariam.png' },
  { id: 5, name: 'Aaron', photo: 'Aaron.png' },
  { id: 6, name: 'Liam', photo: 'Liam.png' },
  { id: 7, name: 'Adam', photo: 'Adam.png' },
  { id: 8, name: 'Sofia', photo: 'Sofia.png' },
  { id: 9, name: 'Varvara', photo: 'Varvara.png' },
  { id: 10, name: 'Jose-Antonio', photo: 'Jose-Antonio.png' },
  { id: 11, name: 'Paula', photo: 'Paula.png' },
  { id: 12, name: 'Imran', photo: 'Imran.png' },
  { id: 13, name: 'Soundous', photo: 'Soundous.png' },
  { id: 14, name: 'Aya', photo: 'Aya.png' },
  { id: 15, name: 'Nour', photo: 'Nour.png' },
  { id: 16, name: 'Manuel', photo: 'Manuel.png' },
  { id: 17, name: 'Asenat', photo: 'Asenat.png' },
  { id: 18, name: 'Amira-Njimi', photo: 'Amira-Njimi.png' },
  { id: 19, name: 'Sif', photo: 'Sif.png' },
  { id: 20, name: 'Chloe', photo: 'Chloe.png' },
  { id: 21, name: 'Amira-Richa', photo: 'Amira-Richa.png' },
  { id: 22, name: 'Mohamed', photo: 'Mohamed.png' },
  { id: 23, name: 'Barkwende', photo: 'Barkwende.png' },
  { id: 24, name: 'Lola', photo: 'Lola.png' },
  { id: 25, name: 'Yassin', photo: 'Yassin.png' },
  
];

// Variables globales
let placedStudents = 0;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  createStudentPhotos();
  setupEventListeners();
  handleResize(); // Inicializar el responsive al cargar
});

// Crear panel de estudiantes
function createStudentPhotos() {
  const studentsPanel = document.getElementById('studentsPanel');
  studentsPanel.innerHTML = '';

  studentsData.forEach(student => {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'student-img-container';
    imgContainer.draggable = true;
    imgContainer.dataset.studentId = student.id;

    const img = document.createElement('img');
    img.src = `img/${student.photo}`;
    img.alt = student.name;
    img.className = 'student-img';

    imgContainer.appendChild(img);
    studentsPanel.appendChild(imgContainer);

    imgContainer.addEventListener('dragstart', dragStart);
  });
}

// Configurar eventos
function setupEventListeners() {
  document.querySelectorAll('.dropzone').forEach(zone => {
    zone.addEventListener('dragover', allowDrop);
    zone.addEventListener('drop', drop);
    zone.addEventListener('dragenter', dragEnter);
    zone.addEventListener('dragleave', dragLeave);
  });

  document.getElementById('resetSchool').addEventListener('click', () => resetBuilding('school'));
  document.getElementById('resetHouse').addEventListener('click', () => resetBuilding('house'));

  window.addEventListener('resize', handleResize); // Escuchar cambios de tamaño
}

// Funciones de Drag & Drop
function allowDrop(ev) {
  ev.preventDefault();
}

function dragStart(ev) {
  ev.dataTransfer.setData('text/plain', ev.currentTarget.dataset.studentId);
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

  // Si la zona ya tiene un estudiante, lo devolvemos al panel
  const existingStudent = ev.target.querySelector('.student-img-container');
  if (existingStudent) {
    document.getElementById('studentsPanel').appendChild(existingStudent);
    placedStudents--;
  }

  // Movemos el elemento y ajustamos tamaño
  const img = studentElement.querySelector('img');
  img.className = 'dropped-img';
  img.style.width = `${ev.target.offsetWidth}px`;
  
  ev.target.innerHTML = '';
  ev.target.appendChild(studentElement);
  
  placedStudents++;
  updateCounter();
}

// Reiniciar edificio
function resetBuilding(building) {
  const studentsPanel = document.getElementById('studentsPanel');
  const dropzones = document.querySelectorAll(`.dropzone[data-building="${building}"]`);
  let studentsRemoved = 0;

  dropzones.forEach(zone => {
    const student = zone.querySelector('.student-img-container');
    if (student) {
      const img = student.querySelector('img');
      img.className = 'student-img';
      img.style.width = '';
      studentsPanel.appendChild(student);
      studentsRemoved++;
    }
  });

  placedStudents -= studentsRemoved;
  updateCounter();
}

// Responsive: Ajustar tamaño de edificios
function handleResize() {
  const buildings = document.querySelectorAll('.building');
  const scale = window.innerWidth < 768 ? 0.9 : 1;
  buildings.forEach(building => {
    building.style.transform = `scale(${scale})`;
    building.style.transformOrigin = 'top center'; // Punto de origen del escalado
  });
}

// Actualizar contador
function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}

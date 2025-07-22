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
  document.getElementById('Guardar').addEventListener('click', Guardar);

  window.addEventListener('resize', handleResize);
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
  
  if (!existingStudent) {
    placedStudents++;
  }
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
  const isTouchScreen = 'ontouchstart' in window;
  const screenWidth = window.innerWidth;
  
  // Ajustes para diferentes dispositivos
  let scale;
  if (isTouchScreen) {
    scale = screenWidth < 1024 ? 0.85 : 1;
  } else {
    scale = screenWidth < 768 ? 0.9 : 1;
  }

  buildings.forEach(building => {
    building.style.transform = `scale(${scale})`;
    building.style.transformOrigin = 'top center';
  });
}

// Actualizar contador
function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}

// ===== Funciones para Notion ===== //

// Guardar datos en Notion
async function Guardar() {
  try {
    // Mostrar mensaje de carga
    const saveButton = document.getElementById('Guardar');
    saveButton.disabled = true;
    saveButton.textContent = 'Guardando...';
    
    // 1. Recopilar datos de asistencia
    const attendanceData = collectAttendanceData();
    
    // 2. Preparar datos para Notion
    const notionData = prepareNotionData(attendanceData);
    
    // 3. Enviar a Notion
    const response = await sendToNotionAPI(notionData);
    
    // 4. Mostrar feedback al usuario
    if (response.ok) {
      alert('✅ Asistencia guardada correctamente en Notion!');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar en Notion');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al guardar en Notion: ' + error.message);
  } finally {
    // Restaurar el botón
    const saveButton = document.getElementById('Guardar');
    saveButton.disabled = false;
    saveButton.textContent = 'Salvar en Notion';
  }
}

// Recopilar datos de asistencia
function collectAttendanceData() {
  const presentStudents = [];
  const absentStudents = [];
  const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  // Obtener estudiantes en la escuela (presentes)
  const schoolZones = document.querySelectorAll('.dropzone[data-building="school"]');
  schoolZones.forEach(zone => {
    const studentElement = zone.querySelector('.student-img-container');
    if (studentElement) {
      const studentId = studentElement.dataset.studentId;
      const student = studentsData.find(s => s.id == studentId);
      if (student) presentStudents.push(student.name);
    }
  });
  
  // Obtener estudiantes en casa (ausentes)
  const houseZones = document.querySelectorAll('.dropzone[data-building="house"]');
  houseZones.forEach(zone => {
    const studentElement = zone.querySelector('.student-img-container');
    if (studentElement) {
      const studentId = studentElement.dataset.studentId;
      const student = studentsData.find(s => s.id == studentId);
      if (student) absentStudents.push(student.name);
    }
  });
  
  // Los que no están en ningún lugar se consideran ausentes
  studentsData.forEach(student => {
    if (!presentStudents.includes(student.name)) {
      absentStudents.push(student.name);
    }
  });
  
  return {
    date: currentDate,
    present: presentStudents,
    absent: absentStudents,
    totalPresent: presentStudents.length,
    totalAbsent: absentStudents.length
  };
}

// Preparar datos para Notion (ajusta según tu base de datos)
function prepareNotionData(attendanceData) {
  return {
    parent: { database_id: "237069f42b1480a99bb6ff24555bb342" },
    properties: {
      "Fecha 1": {
        date: {
          start: attendanceData.date
        }
      },
      "Estudiantes Presentes": {
        rich_text: [
          {
            text: {
              content: attendanceData.present.join(', ')
            }
          }
        ]
      },
      "Estudiantes Ausentes": {
        rich_text: [
          {
            text: {
              content: attendanceData.absent.join(', ')
            }
          }
        ]
      },
      "Nombre": {
        title: [
          {
            text: {
              content: `Asistencia ${attendanceData.date}`
            }
          }
        ]
      },
    }
  };
}


// Enviar datos a la API de Notion
async function sendToNotionAPI(data) {
  // IMPORTANTE: Reemplaza estos valores con tus credenciales reales
  const NOTION_API_KEY = 'ntn_k1777609492509ovQMDXl1KmWJmnfMrCkSSbiakI5I81rN'; // Tu API key de Notion
  const NOTION_VERSION = '2022-06-28';
  
  return fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify(data)
  });
}

// Actualizar contador
function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}

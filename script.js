
// Configuración de Firebase 
const firebaseConfig = {
  apiKey: "AIzaSyDP8yvq19Z74rARviA8HlTggnIwHEaPLTY",
  authDomain: "asistencia-alumnos-71d0e.firebaseapp.com",
  projectId: "asistencia-alumnos-71d0e",
  storageBucket: "asistencia-alumnos-71d0e.firebasestorage.app",
  messagingSenderId: "56629959322",
  appId: "1:56629959322:web:7875a224dd6971ddde1d23",
  measurementId: "G-7WQ1PD3418"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Datos de estudiantes (ejemplo - modifica con tus datos reales)
const studentsData = [
  { id: 1, name: 'Youssef', photo: 'Youssef.png' },
  { id: 2, name: 'Youssif', photo: 'Youssif.png' },
  { id: 3, name: 'Mariam', photo: 'Mariam.png' },
  { id: 4, name: 'Aaron', photo: 'Aaron.png' },
  { id: 5, name: 'Liam', photo: 'Liam.png' },
  { id: 6, name: 'Adam', photo: 'Adam.png' },
  { id: 7, name: 'Sofia', photo: 'Sofia.png' },
  { id: 8, name: 'Varvara', photo: 'Varvara.png' },
  { id: 9, name: 'Jose-Antonio', photo: 'Jose-Antonio.png' },
  { id: 10, name: 'Paula', photo: 'Paula.png' },
  { id: 11, name: 'Imran', photo: 'Imran.png' },
  { id: 12, name: 'Soundous', photo: 'Soundous.png' },
  { id: 13, name: 'Nour', photo: 'Nour.png' },
  { id: 14, name: 'Manuel', photo: 'Manuel.png' },
  { id: 15, name: 'Asenat', photo: 'Asenat.png' },
  { id: 16, name: 'Amira-Njimi', photo: 'Amira-Njimi.png' },
  { id: 17, name: 'Sif', photo: 'Sif.png' },
  { id: 18, name: 'Chloe', photo: 'Chloe.png' },
  { id: 19, name: 'Amira-Richa', photo: 'Amira-Richa.png' },
  { id: 20, name: 'Mohamed', photo: 'Mohamed.png' },
  { id: 21, name: 'Barkwende', photo: 'Barkwende.png' },
  { id: 22, name: 'Lola', photo: 'Lola.png' },
  { id: 23, name: 'Yassin', photo: 'Yassin.png' },
  { id: 24, name: 'Reda', photo: 'Reda.png' },
  { id: 25, name: 'María-del-Carmen', photo: 'María-del-Carmen.png' },
  { id: 26, name: 'Afaf', photo: 'Afaf.png' },
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
  if (!studentsPanel) {
    console.error("ERROR: No se encontró el elemento con ID 'studentsPanel'");
    return;
  }
  studentsPanel.innerHTML = '';

  studentsData.forEach(student => {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'student-img-container';
    imgContainer.draggable = true;
    imgContainer.dataset.studentId = student.id;
    imgContainer.title = student.name; // Tooltip con el nombre

    const img = document.createElement('img');
    const imagePath = `img/${student.photo}`;
    img.src = imagePath;
    img.alt = student.name;
    img.className = 'student-img';
    
    // Manejo de errores mejorado
    img.onerror = function() {
      console.error(`Error al cargar: ${imagePath}`);
      this.src = 'img/placeholder.png'; // Imagen de respaldo
      this.alt = `${student.name} (no disponible)`;
    };

    imgContainer.appendChild(img);
    studentsPanel.appendChild(imgContainer);

    // Verifica que el evento se asigna correctamente
    imgContainer.addEventListener('dragstart', dragStart);
    console.log(`Imagen creada para: ${student.name}`, img); // Depuración
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


// ===== Funciones para Firebase ===== //

// Guardar datos en Firebase
async function saveToFirebase() {
  const attendanceData = collectAttendanceData();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Guardar en Firestore (sintaxis correcta)
    await db.collection("attendance").doc(today).set(attendanceData);
    
    // Mensaje de confirmación
    showMessage('Asistencia guardada correctamente', 'success');
    console.log('Datos guardados:', attendanceData);
  } catch (error) {
    showMessage(`Error al guardar: ${error.message}`, 'error');
    console.error('Error al guardar:', error);
  }
}

// Recopilar datos de asistencia
function collectAttendanceData() {
  const presentStudents = []; // Solo almacenará nombres
  const absentStudents = [];  // Solo almacenará nombres
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Estudiantes en la escuela (presentes) - solo nombres
  document.querySelectorAll('.dropzone[data-building="school"] .student-img-container').forEach(studentElement => {
    const studentId = studentElement.dataset.studentId;
    const student = studentsData.find(s => s.id == studentId);
    if (student) presentStudents.push(student.name); // Solo el nombre
  });
  
  // Estudiantes en casa (ausentes) - solo nombres
  document.querySelectorAll('.dropzone[data-building="house"] .student-img-container').forEach(studentElement => {
    const studentId = studentElement.dataset.studentId;
    const student = studentsData.find(s => s.id == studentId);
    if (student) absentStudents.push(student.name); // Solo el nombre
  });
  
  // Estudiantes no colocados (ausentes) - solo nombres
  studentsData.forEach(student => {
    const isPresent = presentStudents.includes(student.name);
    const isAbsent = absentStudents.includes(student.name);
    if (!isPresent && !isAbsent) {
      absentStudents.push(student.name); // Solo el nombre
    }
  });
  
  return {
    Fecha: currentDate,
    Presentes: presentStudents,  // Array de strings (nombres)
    Ausentes: absentStudents,    // Array de strings (nombres)
    totalPresentes: presentStudents.length,
    totalAusentes: absentStudents.length,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };
}

// Mostrar mensajes
function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  messageDiv.className = type; // 'success' o 'error'
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Cargar asistencia de un día específico (opcional)
function loadAttendance(date) {
  database.ref(`attendance/${date}`).once('value')
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Limpiar dropzones
        document.querySelectorAll('.dropzone img').forEach(img => img.remove());
        
        // Colocar presentes en la escuela
        data.present.forEach(student => {
          const studentElement = document.querySelector(`[data-student-id="${student.id}"]`);
          const dropzone = findEmptyDropzone('school');
          if (studentElement && dropzone) {
            const img = studentElement.querySelector('img');
            img.className = 'dropped-img';
            img.style.width = `${dropzone.offsetWidth}px`;
            dropzone.appendChild(studentElement);
          }
        });
        
        // Colocar ausentes en casa
        data.absent.forEach(student => {
          const studentElement = document.querySelector(`[data-student-id="${student.id}"]`);
          const dropzone = findEmptyDropzone('house');
          if (studentElement && dropzone) {
            const img = studentElement.querySelector('img');
            img.className = 'dropped-img';
            img.style.width = `${dropzone.offsetWidth}px`;
            dropzone.appendChild(studentElement);
          }
        });
        
        placedStudents = data.present.length + data.absent.length;
        updateCounter();
        showMessage(`Asistencia del ${date} cargada`, 'success');
      } else {
        showMessage(`No hay datos para ${date}`, 'info');
      }
    })
    .catch((error) => {
      showMessage(`Error al cargar: ${error.message}`, 'error');
    });
}

// Función auxiliar para encontrar dropzone vacío
function findEmptyDropzone(building) {
  const dropzones = document.querySelectorAll(`#${building} .dropzone`);
  for (const dropzone of dropzones) {
    if (dropzone.children.length === 0) {
      return dropzone;
    }
  }
  return null;
}

// Prueba de conexión
function testConnection() {
  // Usamos Firestore en lugar de Realtime Database
  const testRef = db.collection("connection_tests").doc("test");
  
  testRef.set({
    timestamp: new Date(),
    message: "Conexión exitosa"
  }).then(() => {
    console.log("Conexión a Firestore funciona correctamente");
    
    // Opcional: Eliminar el documento de prueba (si realmente es necesario)
    testRef.delete().then(() => {
      console.log("Documento de prueba eliminado");
    });
    
  }).catch((error) => {
    console.error("Error de conexión a Firestore:", error);
  });
}

// Llama a la función al cargar
document.addEventListener('DOMContentLoaded', testConnection);
  
// Actualizar contador
function updateCounter() {
  document.getElementById('totalCounter').textContent = placedStudents;
}
document.getElementById('Guardar').addEventListener('click', saveToFirebase);

// Configuración Firebase (REMPLAZA con tus datos)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP8yvq19Z74rARviA8HlTggnIwHEaPLTY",
  authDomain: "asistencia-alumnos-71d0e.firebaseapp.com",
  projectId: "asistencia-alumnos-71d0e",
  storageBucket: "asistencia-alumnos-71d0e.firebasestorage.app",
  messagingSenderId: "56629959322",
  appId: "1:56629959322:web:7875a224dd6971ddde1d23",
  measurementId: "G-7WQ1PD3418"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let fechaActual = new Date().toLocaleDateString('es-ES');

// Cargar fechas disponibles al iniciar
function cargarFechas() {
    const select = document.getElementById('fecha-select');
    select.innerHTML = '<option value="">-- Selecciona fecha --</option>';

    db.collection("asistencia")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            const fechasUnicas = new Set();

            querySnapshot.forEach((doc) => {
                if (doc.data().timestamp) {
                    const fecha = doc.data().timestamp.toDate();
                    const fechaFormateada = fecha.toLocaleDateString('es-ES');
                    fechasUnicas.add(fechaFormateada);
                }
            });

            fechasUnicas.forEach(fecha => {
                const option = document.createElement('option');
                option.value = fecha;
                option.textContent = fecha;
                if (fecha === fechaActual) option.selected = true;
                select.appendChild(option);
            });

            // Cargar asistencia de la fecha actual por defecto
            if (fechasUnicas.size > 0) {
                cargarAsistencia(fechaActual);
            }
        });
}

// Funciones de arrastre
function permitirSoltar(ev) {
    ev.preventDefault();
}

function arrastrar(ev) {
    ev.dataTransfer.setData("text", ev.target.getAttribute('data-nombre'));
}

function soltar(ev) {
    ev.preventDefault();
    const nombre = ev.dataTransfer.getData("text");
    const estado = ev.target.id;
    
    // Resaltar foto
    const fotos = document.querySelectorAll('.foto');
    fotos.forEach(foto => {
        if (foto.getAttribute('data-nombre') === nombre) {
            foto.style.border = estado === 'presente' ? '3px solid #4CAF50' : '3px solid #f44336';
        }
    });
}

// Cargar asistencia de una fecha específica
function cargarAsistencia(fecha) {
    if (!fecha) return;

    // Limpiar casillas
    document.getElementById('presente').innerHTML = '<h2>Presente ✅</h2>';
    document.getElementById('ausente').innerHTML = '<h2>Ausente ❌</h2>';

    // Convertir fecha a rango de timestamps
    const inicioDia = new Date(fecha.split('/').reverse().join('-'));
    inicioDia.setHours(0, 0, 0, 0);
    
    const finDia = new Date(inicioDia);
    finDia.setHours(23, 59, 59, 999);

    // Consultar Firebase
    db.collection("asistencia")
        .where("timestamp", ">=", inicioDia)
        .where("timestamp", "<=", finDia)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const casilla = document.getElementById(data.estado);
                
                // Mostrar foto
                const fotoOriginal = document.querySelector(`[data-nombre="${data.nombre}"]`);
                if (fotoOriginal) {
                    const fotoClone = fotoOriginal.cloneNode(true);
                    fotoClone.style.border = data.estado === 'presente' ? '3px solid #4CAF50' : '3px solid #f44336';
                    casilla.appendChild(fotoClone);
                }
            });
        });
}

// Guardar asistencia en Firebase
function guardarAsistencia() {
    const fechaSelect = document.getElementById('fecha-select');
    const fecha = fechaSelect.value || fechaActual;

    if (!fecha) {
        alert("Selecciona una fecha primero");
        return;
    }

    const inicioDia = new Date(fecha.split('/').reverse().join('-'));
    inicioDia.setHours(0, 0, 0, 0);

    // Borrar registros antiguos de esta fecha
    db.collection("asistencia")
        .where("timestamp", ">=", inicioDia)
        .get()
        .then((querySnapshot) => {
            const batch = db.batch();
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            return batch.commit();
        })
        .then(() => {
            // Guardar nuevos registros
            const batch = db.batch();
            const presentes = document.querySelectorAll('#presente .foto');
            const ausentes = document.querySelectorAll('#ausente .foto');

            presentes.forEach(foto => {
                const ref = db.collection("asistencia").doc();
                batch.set(ref, {
                    nombre: foto.getAttribute('data-nombre'),
                    estado: 'presente',
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(inicioDia))
                });
            });

            ausentes.forEach(foto => {
                const ref = db.collection("asistencia").doc();
                batch.set(ref, {
                    nombre: foto.getAttribute('data-nombre'),
                    estado: 'ausente',
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(inicioDia))
                });
            });

            return batch.commit();
        })
        .then(() => {
            alert("Asistencia guardada correctamente");
            cargarFechas(); // Actualizar desplegable
        })
        .catch(error => {
            console.error("Error al guardar:", error);
            alert("Error al guardar la asistencia");
        });
}

// Inicializar al cargar la página
window.onload = function() {
    cargarFechas();
};

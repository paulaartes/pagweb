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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let fechaActual = new Date().toLocaleDateString('es-ES');

// ======================
// FUNCIONES PRINCIPALES
// ======================

/**
 * Carga las fechas disponibles desde Firestore
 */
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
                if (fecha === fechaActual) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            if (fechasUnicas.size > 0) {
                cargarAsistencia(fechaActual);
            }
        })
        .catch(error => {
            console.error("Error cargando fechas:", error);
        });
}

/**
 * Permite soltar elementos en las zonas de arrastre
 */
function permitirSoltar(ev) {
    ev.preventDefault();
}

/**
 * Maneja el inicio del arrastre de una foto
 */
function arrastrar(ev) {
    ev.dataTransfer.setData("text", ev.target.getAttribute('data-nombre'));
}

/**
 * Maneja el evento de soltar una foto en una casilla
 */
function soltar(ev) {
    ev.preventDefault();
    const nombre = ev.dataTransfer.getData("text");
    const estado = ev.target.id;
    
    // Buscar la foto ORIGINAL (no clonar si ya existe en una casilla)
    const fotoOriginal = document.querySelector(`.foto[data-nombre="${nombre}"]:not(#presente .foto, #ausente .foto)`);
    
    if (!fotoOriginal) return; // Si ya está en una casilla, no hacer nada

    const contenedor = fotoOriginal.parentElement.cloneNode(true);
    const foto = contenedor.querySelector('.foto');
    
    // Añadir botón de borrado si no existe
    if (!contenedor.querySelector('.btn-borrar')) {
        const boton = document.createElement('button');
        boton.className = 'btn-borrar';
        boton.innerHTML = '✕';
        boton.onclick = function() { borrarFoto(this); };
        contenedor.appendChild(boton);
    }
    
    foto.style.border = estado === 'presente' ? '3px solid #2ecc71' : '3px solid #e74c3c';
    ev.target.appendChild(contenedor);
}

/**
 * Borra una foto individual de las casillas
 */
function borrarFoto(boton) {
    const contenedor = boton.parentElement;
    contenedor.remove(); // Elimina directamente el contenedor
    
    // No es necesario restaurar la foto original, ya que trabajamos con clones
}

/**
 * Limpia todas las selecciones
 */
function limpiarTodo() {
    document.querySelectorAll('#presente .foto-container, #ausente .foto-container').forEach(contenedor => {
        contenedor.remove(); // Elimina directamente los contenedores
    });
    
    console.log("Selección limpiada");
}

/**
 * Guarda la asistencia en Firestore
 */
function guardarAsistencia() {
    const fecha = document.getElementById('fecha-select').value || fechaActual;
    if (!fecha) {
        alert("⚠️ Selecciona una fecha primero");
        return;
    }

    const inicioDia = new Date(fecha.split('/').reverse().join('-'));
    inicioDia.setHours(0, 0, 0, 0);

    // Preparar batch de operaciones
    const batch = db.batch();
    
    // 1. Eliminar registros existentes para esta fecha
    db.collection("asistencia")
        .where("timestamp", ">=", inicioDia)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // 2. Añadir nuevos registros
            const presentes = document.querySelectorAll('#presente .foto');
            const ausentes = document.querySelectorAll('#ausente .foto');

            presentes.forEach(foto => {
                const ref = db.collection("asistencia").doc();
                batch.set(ref, {
                    nombre: foto.getAttribute('data-nombre'),
                    estado: 'presente',
                    timestamp: firebase.firestore.Timestamp.fromDate(inicioDia)
                });
            });

            ausentes.forEach(foto => {
                const ref = db.collection("asistencia").doc();
                batch.set(ref, {
                    nombre: foto.getAttribute('data-nombre'),
                    estado: 'ausente',
                    timestamp: firebase.firestore.Timestamp.fromDate(inicioDia)
                });
            });

            return batch.commit();
        })
        .then(() => {
            alert("✅ Asistencia guardada correctamente");
            cargarFechas(); // Actualizar el desplegable
        })
        .catch(error => {
            console.error("Error al guardar:", error);
            alert("❌ Error al guardar la asistencia");
        });
}

/**
 * Carga la asistencia de una fecha específica
 */
function cargarAsistencia(fecha) {
    if (!fecha) return;

    // Limpiar casillas
    document.getElementById('presente').innerHTML = '<h2><i class="fas fa-check-circle"></i> Presentes</h2>';
    document.getElementById('ausente').innerHTML = '<h2><i class="fas fa-times-circle"></i> Ausentes</h2>';

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
                const fotoOriginal = document.querySelector(`.foto[data-nombre="${data.nombre}"]`);
                
                if (fotoOriginal) {
                    const contenedor = fotoOriginal.parentElement.cloneNode(true);
                    const foto = contenedor.querySelector('.foto');
                    foto.style.border = data.estado === 'presente' ? '3px solid #2ecc71' : '3px solid #e74c3c';
                    foto.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    casilla.appendChild(contenedor);
                }
            });
        })
        .catch(error => {
            console.error("Error cargando asistencia:", error);
        });
}

/**
 * Muestra el historial completo en una tabla
 */
function mostrarDatos() {
    const contenedor = document.getElementById('tabla-datos');
    contenedor.innerHTML = '<h2><i class="fas fa-history"></i> Historial Completo</h2>';

    db.collection("asistencia")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                contenedor.innerHTML += '<p>No hay registros aún</p>';
                return;
            }

            let tabla = `
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const fecha = data.timestamp.toDate().toLocaleDateString('es-ES');
                const estadoIcon = data.estado === 'presente' ? 
                    '<i class="fas fa-check-circle" style="color:#2ecc71"></i>' : 
                    '<i class="fas fa-times-circle" style="color:#e74c3c"></i>';
                
                tabla += `
                    <tr>
                        <td>${data.nombre}</td>
                        <td>${estadoIcon} ${data.estado}</td>
                        <td>${fecha}</td>
                    </tr>
                `;
            });

            tabla += "</tbody></table>";
            contenedor.innerHTML += tabla;
        })
        .catch(error => {
            console.error("Error cargando historial:", error);
            contenedor.innerHTML += '<p>Error al cargar el historial</p>';
        });
}

// ======================
// INICIALIZACIÓN
// ======================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Cargar fechas disponibles
    cargarFechas();
    
    // Añadir botones de borrado a todas las fotos iniciales
    document.querySelectorAll('.foto').forEach(foto => {
        if (!foto.parentElement.querySelector('.btn-borrar')) {
            const boton = document.createElement('button');
            boton.className = 'btn-borrar';
            boton.innerHTML = '✕';
            boton.onclick = function() { borrarFoto(this); };
            foto.parentElement.appendChild(boton);
        }
    });
});

// Configuración Firebase (REMPLAZA con tus datos)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP8yvq19Z74rARviA8HlTggnIwHEaPLTY",
  authDomain: "asistencia-alumnos-71d0e.firebaseapp.com",
  projectId: "asistencia-alumnos-71d0e",
  storageBucket: "asistencia-alumnos-71d0e.appspot.com", 
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
async function cargarFechas() {
    const select = document.getElementById('fecha-select');
    select.innerHTML = '<option value="">-- Selecciona fecha --</option>';

    try {
        const snapshot = await db.collection('asistencia').get();
        const fechas = snapshot.docs.map(doc => {
            const [year, month, day] = doc.id.split('-');
            return `${day}/${month}/${year}`;
        });

        fechas.sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));
        
        fechas.forEach(fecha => {
            const option = document.createElement('option');
            option.value = fecha;
            option.textContent = fecha;
            if (fecha === fechaActual) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        if (fechas.length > 0) {
            cargarAsistencia(fechaActual);
        }
    } catch (error) {
        console.error("Error cargando fechas:", error);
    }
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
    const estado = ev.target.closest('.casilla').id;
    
    // Buscar la foto ORIGINAL (no clonar si ya existe en una casilla)
    const fotoOriginal = document.querySelector(`.foto[data-nombre="${nombre}"]:not(#contenedor-presente .foto, #contenedor-ausente .foto)`);
    
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
    ev.target.closest('.contenedor-fotos-drop').appendChild(contenedor);
}

/**
 * Borra una foto individual de las casillas
 */
function borrarFoto(boton) {
    const contenedor = boton.parentElement;
    contenedor.remove(); // Elimina directamente el contenedor
}

/**
 * Limpia todas las selecciones
 */
function limpiarTodo() {
    document.querySelectorAll('#contenedor-presente .foto-container, #contenedor-ausente .foto-container').forEach(contenedor => {
        contenedor.remove(); // Elimina directamente los contenedores
    });
}

/**
 * Guarda la asistencia en Firestore
 */
async function guardarAsistencia() {
    const fecha = document.getElementById('fecha-select').value || fechaActual;
    if (!fecha) {
        alert("⚠️ Selecciona una fecha primero");
        return;
    }

    try {
        // Formatear fecha como YYYY-MM-DD para el documento
        const [day, month, year] = fecha.split('/');
        const fechaFormateada = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        const batch = db.batch();
        const fechaRef = db.collection('asistencia').doc(fechaFormateada);
        
        // Limpiar datos anteriores
        const presentesSnapshot = await fechaRef.collection('presentes').get();
        const ausentesSnapshot = await fechaRef.collection('ausentes').get();
        
        presentesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        ausentesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Añadir nuevos registros
        document.querySelectorAll('#contenedor-presente .foto').forEach(foto => {
            const ref = fechaRef.collection('presentes').doc();
            batch.set(ref, {
                nombre: foto.getAttribute('data-nombre'),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        document.querySelectorAll('#contenedor-ausente .foto').forEach(foto => {
            const ref = fechaRef.collection('ausentes').doc();
            batch.set(ref, {
                nombre: foto.getAttribute('data-nombre'),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        alert("✅ Asistencia guardada correctamente");
        cargarFechas();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert(`❌ Error al guardar: ${error.message}`);
    }
}

/**
 * Carga la asistencia de una fecha específica
 */
async function cargarAsistencia(fecha) {
    if (!fecha) return;

    // Limpiar casillas
    document.getElementById('contenedor-presente').innerHTML = '';
    document.getElementById('contenedor-ausente').innerHTML = '';

    try {
        const [day, month, year] = fecha.split('/');
        const fechaFormateada = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const fechaRef = db.collection('asistencia').doc(fechaFormateada);

        // Cargar presentes
        const presentesSnapshot = await fechaRef.collection('presentes').get();
        presentesSnapshot.forEach(doc => {
            const nombre = doc.data().nombre;
            const fotoOriginal = document.querySelector(`.foto[data-nombre="${nombre}"]`);
            if (fotoOriginal) {
                const contenedor = fotoOriginal.parentElement.cloneNode(true);
                const foto = contenedor.querySelector('.foto');
                foto.style.border = '3px solid #2ecc71';
                document.getElementById('contenedor-presente').appendChild(contenedor);
            }
        });

        // Cargar ausentes
        const ausentesSnapshot = await fechaRef.collection('ausentes').get();
        ausentesSnapshot.forEach(doc => {
            const nombre = doc.data().nombre;
            const fotoOriginal = document.querySelector(`.foto[data-nombre="${nombre}"]`);
            if (fotoOriginal) {
                const contenedor = fotoOriginal.parentElement.cloneNode(true);
                const foto = contenedor.querySelector('.foto');
                foto.style.border = '3px solid #e74c3c';
                document.getElementById('contenedor-ausente').appendChild(contenedor);
            }
        });
    } catch (error) {
        console.error("Error cargando asistencia:", error);
    }
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
                const fecha = new Date(doc.id.split('-').join('/')).toLocaleDateString('es-ES');
                
                // Obtener presentes y ausentes
                if (data.presentes) {
                    data.presentes.forEach(presente => {
                        tabla += `
                            <tr>
                                <td>${presente.nombre}</td>
                                <td><i class="fas fa-check-circle" style="color:#2ecc71"></i> Presente</td>
                                <td>${fecha}</td>
                            </tr>
                        `;
                    });
                }
                
                if (data.ausentes) {
                    data.ausentes.forEach(ausente => {
                        tabla += `
                            <tr>
                                <td>${ausente.nombre}</td>
                                <td><i class="fas fa-times-circle" style="color:#e74c3c"></i> Ausente</td>
                                <td>${fecha}</td>
                            </tr>
                        `;
                    });
                }
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
    // Configurar eventos
    document.getElementById('btnGuardar').addEventListener('click', guardarAsistencia);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarTodo);
    document.getElementById('fecha-select').addEventListener('change', function() {
        cargarAsistencia(this.value);
    });
    
    // Cargar fechas disponibles
    cargarFechas();
    
    // Cargar fotos de ejemplo (deberías reemplazar esto con tus datos reales)
    const fotosContainer = document.getElementById('fotos');
    const alumnos = [
        { nombre: "Ana López", imagen: "ardilla.jpg" },
        { nombre: "Carlos Ruiz", imagen: "animales.jpg" },
        // Añade más alumnos según necesites
    ];
    
    alumnos.forEach(alumno => {
        const contenedor = document.createElement('div');
        contenedor.className = 'foto-container';
        
        const foto = document.createElement('img');
        foto.className = 'foto';
        foto.src = alumno.imagen;
        foto.setAttribute('data-nombre', alumno.nombre);
        foto.setAttribute('draggable', 'true');
        foto.addEventListener('dragstart', arrastrar);
        foto.alt = alumno.nombre;
        
        const boton = document.createElement('button');
        boton.className = 'btn-borrar';
        boton.innerHTML = '✕';
        boton.addEventListener('click', function() { borrarFoto(this); });
        
        contenedor.appendChild(foto);
        contenedor.appendChild(boton);
        fotosContainer.appendChild(contenedor);
    });
});

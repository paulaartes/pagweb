// Configuración de Firebase (REMPLAZA con tus datos)
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let fechaActual = new Date().toLocaleDateString('es-ES');

// ======================
// FUNCIONES PRINCIPALES
// ======================

// 1. Cargar fechas disponibles desde Firebase
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

            if (fechasUnicas.size > 0) {
                cargarAsistencia(fechaActual);
            }
        });
}

// 2. Funciones de arrastre y soltar
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
    
    // Encontrar el contenedor original
    const fotoOriginal = document.querySelector(`.foto[data-nombre="${nombre}"]`);
    const contenedorOriginal = fotoOriginal.parentElement;
    
    // Clonar el contenedor (con botón de borrar)
    const clone = contenedorOriginal.cloneNode(true);
    const fotoClone = clone.querySelector('.foto');
    
    // Estilizar según el estado
    fotoClone.style.border = estado === 'presente' ? '3px solid #4CAF50' : '3px solid #f44336';
    
    // Añadir a la casilla correspondiente
    ev.target.appendChild(clone);
}

// 3. Borrar foto individualmente
function borrarFoto(boton) {
    const contenedor = boton.parentElement;
    const foto = contenedor.querySelector('.foto');
    const nombre = foto.getAttribute('data-nombre');
    const fecha = document.getElementById('fecha-select').value;

    // Eliminar de Firebase si existe
    if (fecha) {
        const inicioDia = new Date(fecha.split('/').reverse().join('-'));
        inicioDia.setHours(0, 0, 0, 0);
        
        db.collection("asistencia")
            .where("nombre", "==", nombre)
            .where("timestamp", ">=", inicioDia)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => doc.ref.delete());
            });
    }

    // Mover de vuelta al área principal
    document.getElementById('fotos').appendChild(contenedor);
    foto.style.border = '3px solid #ddd';
}

// 4. Guardar asistencia en Firebase
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

// 5. Cargar asistencia por fecha
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
                
                // Buscar foto original
                const fotoOriginal = document.querySelector(`.foto[data-nombre="${data.nombre}"]`);
                if (fotoOriginal) {
                    const contenedor = fotoOriginal.parentElement.cloneNode(true);
                    const fotoClone = contenedor.querySelector('.foto');
                    fotoClone.style.border = data.estado === 'presente' ? '3px solid #4CAF50' : '3px solid #f44336';
                    casilla.appendChild(contenedor);
                }
            });
        });
}

// 6. Mostrar todos los registros (opcional)
function mostrarDatos() {
    const contenedor = document.getElementById('tabla-datos');
    contenedor.innerHTML = '<h2>Historial Completo</h2>';

    db.collection("asistencia")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            let tabla = `
                <table>
                    <tr>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                    </tr>
            `;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const fecha = data.timestamp.toDate().toLocaleDateString('es-ES');
                tabla += `
                    <tr>
                        <td>${data.nombre}</td>
                        <td>${data.estado}</td>
                        <td>${fecha}</td>
                    </tr>
                `;
            });

            tabla += "</table>";
            contenedor.innerHTML += tabla;
        });
}

// ======================
// INICIALIZACIÓN
// ======================
window.onload = function() {
    cargarFechas();
    
    // Configurar botones de borrado en fotos iniciales
    document.querySelectorAll('.foto').forEach(foto => {
        const contenedor = foto.parentElement;
        if (!contenedor.querySelector('.btn-borrar')) {
            const botonBorrar = document.createElement('button');
            botonBorrar.className = 'btn-borrar';
            botonBorrar.innerHTML = '✕';
            botonBorrar.onclick = function() { borrarFoto(this); };
            contenedor.appendChild(botonBorrar);
        }
    });
};
// Inicializar al cargar la página
window.onload = function() {
    cargarFechas();
};

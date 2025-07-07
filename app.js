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

let draggedElement = null;

document.addEventListener("DOMContentLoaded", () => {
  // Preparar los huecos
  crearHuecos("zonaEscuela", 25);
  crearHuecos("zonaCasa", 10);

  // Configurar imágenes arrastrables
  document.querySelectorAll(".animal").forEach(img => {
    img.addEventListener("dragstart", (e) => {
      draggedElement = e.target;
    });
  });
});

function crearHuecos(idZona, cantidad) {
  const zona = document.getElementById(idZona);
  const filas = Math.ceil(Math.sqrt(cantidad));
  const columnas = Math.ceil(cantidad / filas);
  const offsetX = zona.clientWidth / columnas;
  const offsetY = zona.clientHeight / filas;

  let count = 0;
  for (let y = 0; y < filas && count < cantidad; y++) {
    for (let x = 0; x < columnas && count < cantidad; x++) {
      const slot = document.createElement("div");
      slot.classList.add("slot");
      slot.style.left = `${x * offsetX + offsetX / 2 - 32}px`;
      slot.style.top = `${y * offsetY + offsetY / 2 - 32}px`;

      slot.addEventListener("dragover", (e) => e.preventDefault());
      slot.addEventListener("drop", () => {
        if (draggedElement) {
          slot.innerHTML = "";
          const clone = draggedElement.cloneNode(true);
          clone.draggable = false;
          slot.appendChild(clone);
        }
      });

      zona.appendChild(slot);
      count++;
    }
  }
}

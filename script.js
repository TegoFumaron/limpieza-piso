// === Config básica (por si la necesitas en otros sitios) ===
const personas = ["Claudia", "Benjamin", "Nicolas"];
const tareas = ["Baño", "Salón, pasillo y lavadora", "Cocina y basuras"];

// === Helpers ===
async function cargarJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  return await res.json();
}

function parseSemana(semanaStr) {
  // "DD/MM/YYYY — DD/MM/YYYY"
  const [inicioStr, finStr] = semanaStr.split("—").map(s => s.trim());
  const [dI, mI, yI] = inicioStr.split("/").map(Number);
  const [dF, mF, yF] = finStr.split("/").map(Number);
  // Date: meses base 0
  const inicio = new Date(yI, mI - 1, dI, 0, 0, 0);
  const fin = new Date(yF, mF - 1, dF, 23, 59, 59);
  return { inicio, fin };
}

function esHoyDentro({ inicio, fin }, hoy = new Date()) {
  return hoy >= inicio && hoy <= fin;
}

// === Render “Esta semana” + descripción de tareas ===
async function mostrarAsignaciones() {
  const contenedor = document.getElementById("asignaciones");
  const descripcion = document.getElementById("descripcion-tareas");

  const [dataTareas, semanas] = await Promise.all([
    cargarJSON("data/tareas.json"),
    cargarJSON("data/semanas_generadasv2.json"),
  ]);

  const hoy = new Date();

  // Buscar semana actual (la que ya empezó y aún no terminó)
  let semanaActualEntrada =
    semanas.find(s => esHoyDentro(parseSemana(s.semana), hoy)) ||
    // Si no hay exacta (por ejemplo, reloj del sistema), coger la última que ya empezó
    semanas
      .filter(s => parseSemana(s.semana).inicio <= hoy)
      .sort((a, b) => parseSemana(b.semana).inicio - parseSemana(a.semana).inicio)[0] ||
    // Fallback: la más reciente del JSON
    semanas[semanas.length - 1];

  const asignacionesActual = semanaActualEntrada.asignaciones;

  // Reset UI
  contenedor.innerHTML = "";
  descripcion.innerHTML = "";
  descripcion.classList.remove("mostrar");

  let tareaActiva = null;

  // Pintar 3 cajas en el orden definido por "tareas"
  tareas.forEach(tarea => {
    const persona = asignacionesActual[tarea] || "-";
    const box = document.createElement("div");
    box.className = "tarea-box";
    box.innerHTML = `
      <h3>${tarea}</h3>
      <p>${persona}</p>
    `;

    box.addEventListener("click", () => {
      // Toggle de la descripción
      if (tareaActiva === tarea) {
        descripcion.innerHTML = "";
        descripcion.classList.remove("mostrar");
        tareaActiva = null;
        return;
      }
      tareaActiva = tarea;
      descripcion.innerHTML = `
        <h4>${tarea}</h4>
        <ul>${(dataTareas[tarea] || []).map(item => `<li>${item}</li>`).join("")}</ul>
      `;
      descripcion.classList.add("mostrar");
    });

    contenedor.appendChild(box);
  });

  // Una vez pintado “esta semana”, pintamos el historial
  mostrarHistorial(semanas, semanaActualEntrada.semana);
}

// === Render del historial (cronológico, más reciente primero) ===
function mostrarHistorial(semanas, semanaActualStr) {
  const contenedor = document.getElementById("historial-semanas");
  contenedor.innerHTML = "";

  const hoy = new Date();

  // Orden: más reciente primero por fecha de inicio
  const ordenadas = [...semanas].sort(
    (a, b) => parseSemana(b.semana).inicio - parseSemana(a.semana).inicio
  );

  // Filtrar: mostrar solo semanas que ya empezaron (incluye la semana en curso)
  const visibles = ordenadas.filter(s => parseSemana(s.semana).inicio <= hoy);

  visibles.forEach(sem => {
    const semanaDiv = document.createElement("div");
    semanaDiv.className = "semana-item";
    if (sem.semana === semanaActualStr) {
      semanaDiv.classList.add("actual"); // 🟡 la CSS ya la pinta amarilla
    }

    semanaDiv.innerHTML = `<h2>${sem.semana}</h2>`;

    const lista = document.createElement("ul");
    // Aseguramos el orden de tareas dentro de la semana
    tareas.forEach(tarea => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="tarea">${tarea}</span>
        <span class="persona">${sem.asignaciones[tarea]}</span>
      `;
      lista.appendChild(li);
    });

    semanaDiv.appendChild(lista);
    contenedor.appendChild(semanaDiv);
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  mostrarAsignaciones().catch(err => {
    console.error("Error inicializando la página:", err);
  });

  // Ocultar flechas al empezar a hacer scroll (por si aún no lo tenías)
  const arrows = document.querySelectorAll(".scroll-arrows");
  const onScrollHideArrows = () => {
    const y = window.scrollY || window.pageYOffset;
    arrows.forEach(a => (a.style.opacity = y > 10 ? "0" : "1"));
  };
  window.addEventListener("scroll", onScrollHideArrows, { passive: true });
  onScrollHideArrows();
});

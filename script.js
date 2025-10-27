const personas = ["Claudia", "Benjamin", "Nicolas"];
const tareas = ["Baño", "Salón, pasillo y lavadora", "Cocina y basuras"];

const historial = [
  {
    semana: "27/10/2025 — 02/11/2025",
    asignaciones: {
      "Baño": "Claudia",
      "Salón, pasillo y lavadora": "Nicolas",
      "Cocina y basuras": "Benjamin"
    }
  },
  {
    semana: "20/10/2025 — 26/10/2025",
    asignaciones: {
      "Baño": "Benjamin",
      "Salón, pasillo y lavadora": "Benjamin",
      "Cocina y basuras": "Benjamin"
    }
  },
  {
    semana: "13/10/2025 — 19/10/2025",
    asignaciones: {
      "Baño": "Benjamin",
      "Salón, pasillo y lavadora": "Claudia",
      "Cocina y basuras": "Nicolas"
    }
  }
];

async function cargarTareas() {
  const res = await fetch("data/tareas.json");
  return await res.json();
}

async function mostrarAsignaciones() {
  const contenedor = document.getElementById("asignaciones");
  const descripcion = document.getElementById("descripcion-tareas");
  const data = await cargarTareas();

  const semanaActual = {
    "Baño": "Nicolas",
    "Salón, pasillo y lavadora": "Claudia",
    "Cocina y basuras": "Benjamin"
  };

  contenedor.innerHTML = "";
  descripcion.innerHTML = "";
  descripcion.classList.remove("mostrar");

  let tareaActiva = null;

  for (const tarea in semanaActual) {
    const persona = semanaActual[tarea];
    const box = document.createElement("div");
    box.className = "tarea-box";
    box.innerHTML = `
      <h3>${tarea}</h3>
      <p>${persona}</p>
    `;

    box.addEventListener("click", () => {
      if (tareaActiva === tarea) {
        descripcion.innerHTML = "";
        descripcion.classList.remove("mostrar");
        tareaActiva = null;
        return;
      }

      tareaActiva = tarea;
      descripcion.innerHTML = `
        <h4>${tarea}</h4>
        <ul>${data[tarea].map(item => `<li>${item}</li>`).join("")}</ul>
      `;
      descripcion.classList.add("mostrar");
    });

    contenedor.appendChild(box);
  }

  mostrarHistorial();
}

function mostrarHistorial() {
  const contenedor = document.getElementById("historial-semanas");
  contenedor.innerHTML = "";

  // 🟩 Ordenar: más reciente primero
  const historialOrdenado = [...historial].sort((a, b) => {
    const fechaA = new Date(a.semana.split("—")[0].trim().split("/").reverse().join("-"));
    const fechaB = new Date(b.semana.split("—")[0].trim().split("/").reverse().join("-"));
    return fechaB - fechaA;
  });

  // 🕒 Semana actual
  const hoy = new Date();
  const semanaActual = historialOrdenado.find(h => {
    const [inicioStr, finStr] = h.semana.split("—").map(s => s.trim());
    const inicio = new Date(inicioStr.split("/").reverse().join("-"));
    const fin = new Date(finStr.split("/").reverse().join("-"));
    return hoy >= inicio && hoy <= fin;
  });

  historialOrdenado.forEach(semana => {
    const semanaDiv = document.createElement("div");
    semanaDiv.className = "semana-item";

    // 🟡 Resaltar si es la semana actual
    if (semanaActual && semana.semana === semanaActual.semana) {
      semanaDiv.classList.add("actual");
    }

    semanaDiv.innerHTML = `<h2>${semana.semana}</h2>`;

    const lista = document.createElement("ul");
    for (const tarea in semana.asignaciones) {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="tarea">${tarea}</span>
        <span class="persona">${semana.asignaciones[tarea]}</span>
      `;
      lista.appendChild(li);
    }

    semanaDiv.appendChild(lista);
    contenedor.appendChild(semanaDiv);
  });
}

mostrarAsignaciones();

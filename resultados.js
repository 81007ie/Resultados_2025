const CSV_RESUMEN_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";

console.log("📊 Chart.js cargado correctamente.");

// ======================================================================
// FUNCIÓN PARA ELIMINAR CACHE DE GOOGLE SHEETS
// ======================================================================
function noCache(url) {
  return `${url}&t=${Date.now()}`;
}

// ======================================================================
// CSV PARSER ROBUSTO
// ======================================================================
function parseCSV(text) {
  console.log("📥 Parseando CSV…");
  return text
    .trim()
    .split("\n")
    .map(line => {
      const parts = [];
      let inside = false, cur = "";
      for (let ch of line) {
        if (ch === '"') inside = !inside;
        else if (ch === "," && !inside) { parts.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      parts.push(cur.trim());
      return parts;
    });
}

// ======================================================================
// COLORES LISTAS
// ======================================================================
const coloresListas = [
  "#1e88e5", "#ffb300", "#43a047", "#e53935",
  "#8e24aa", "#00acc1"
];

let resumenChartInstance = null;
let gradosChartInstance = null;
let ganadorActual = null;

// ======================================================================
// 1️⃣ GRÁFICO RESUMEN — TOTAL DE VOTOS POR LISTA
// ======================================================================
async function drawResumenChart() {
  console.log("\n==============================");
  console.log("🔄 Actualizando gráfico RESUMEN…");
  console.log("==============================");

  try {
    const url = noCache(CSV_RESUMEN_BASE);
    console.log("🔗 Fetch URL:", url);

    const res = await fetch(url);
    console.log("📥 Estado FETCH:", res.status);

    const csv = await res.text();
    const parsed = parseCSV(csv);

    const rows = parsed.filter(r => r.length >= 2 && r[0]).slice(1);

    const labels = rows.map(r => r[0]);
    const values = rows.map(r => Number(r[1]));

    const maxVotos = Math.max(...values);
    ganadorActual = labels[values.indexOf(maxVotos)] ?? null;

    if (resumenChartInstance) resumenChartInstance.destroy();

    const ctx = document.getElementById("resumenChart").getContext("2d");

    resumenChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Votos",
          data: values,
          backgroundColor: coloresListas,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });

  } catch (err) {
    console.error("❌ ERROR RESUMEN:", err);
    document.getElementById("resumen_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando datos del resumen.</p>";
  }

  // 🔁 Actualización cada 30 segundos
  setTimeout(drawResumenChart, 30000);
}

// ======================================================================
// 2️⃣ GRÁFICO POR GRADOS — PARTICIPACIÓN
// ======================================================================
async function drawGradosChart() {
  console.log("\n==============================");
  console.log("🔄 Actualizando gráfico GRADOS…");
  console.log("==============================");

  try {
    const url = noCache(CSV_ANALISIS_BASE);
    const res = await fetch(url);
    const csv = await res.text();

    const rows = parseCSV(csv);

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);
    const valores = rows.slice(1).map(r =>
      r.slice(1).map(v => Number(v))
    );

    if (gradosChartInstance) gradosChartInstance.destroy();

    const ctx = document.getElementById("gradosChart").getContext("2d");

    gradosChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: grados,
        datasets: listas.map((lista, i) => ({
          label: lista,
          data: valores.map(v => v[i]),
          backgroundColor: coloresListas[i % coloresListas.length]
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { position: "top" } }
      }
    });

  } catch (err) {
    console.error("❌ ERROR GRADOS:", err);
    document.getElementById("grados_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando participación por grado.</p>";
  }

  // 🔁 Actualización cada 30 segundos
  setTimeout(drawGradosChart, 30000);
}

// ===============================
// 🎉 CONFETI CONTROL
// ===============================
let confetiInterval = null;

// Lluvia de confeti continua
function iniciarConfeti() {
  detenerConfeti(); // Reiniciar si ya había un intervalo activo

  confetiInterval = setInterval(() => {
    confetti({
      particleCount: 60,     // Más partículas
      spread: 80,            // Más dispersión
      startVelocity: 30,     // Velocidad inicial más suave
      gravity: 0.9,          // Caen hasta abajo
      scalar: 1.4,           // Confeti más grande
      ticks: 300,            // Dura más en pantalla
      origin: { y: 0 }       // Caen desde arriba (lluvia)
    });
  }, 500); // cada 0.5s cae más confeti
}

// Detener confeti cuando se cierre el modal
function detenerConfeti() {
  if (confetiInterval) {
    clearInterval(confetiInterval);
    confetiInterval = null;
  }
}

// ===============================
// ⭐ MOSTRAR GANADOR
// ===============================
function mostrarGanador() {
  if (!ganadorActual) return alert("⚠️ Aún no hay ganador.");

  document.getElementById("winnerName").innerHTML = `🏆 ${ganadorActual}`;
  document.getElementById("winnerModal").style.display = "flex";

  iniciarConfeti(); // 🎉 Activar confeti continuo
}

// ===============================
// ❌ CERRAR GANADOR
// ===============================
function cerrarGanador() {
  document.getElementById("winnerModal").style.display = "none";
  detenerConfeti(); // Detener confeti al cerrar
}

// ======================================================================
// 🚀 INICIO
// ======================================================================
drawResumenChart();
drawGradosChart();

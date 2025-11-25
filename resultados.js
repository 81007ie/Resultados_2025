const CSV_RESUMEN_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";

console.log("📊 Chart.js cargado correctamente.");

// ==============================
// FUNCIÓN PARA ELIMINAR CACHE
// ==============================
function noCache(url) {
  return `${url}&t=${Date.now()}`;
}

// ==============================
// CSV PARSER ROBUSTO
// ==============================
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

// ==============================
// COLORES LISTAS
// ==============================
const coloresListas = [
  "#1e88e5", "#ffb300", "#43a047", "#e53935",
  "#8e24aa", "#00acc1"
];

let resumenChartInstance = null;
let gradosChartInstance = null;
let ganadorActual = null;

// ✨ Confeti
let confettiInterval = null;

// ==============================
// GRÁFICO RESUMEN
// ==============================
async function drawResumenChart() {
  try {
    const url = noCache(CSV_RESUMEN_BASE);
    const res = await fetch(url);
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
    document.getElementById("resumenChart").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando datos del resumen.</p>";
  }

  setTimeout(drawResumenChart, 30000);
}

// ==============================
// GRÁFICO GRADOS
// ==============================
async function drawGradosChart() {
  try {
    const url = noCache(CSV_ANALISIS_BASE);
    const res = await fetch(url);
    const csv = await res.text();
    const rows = parseCSV(csv);

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);
    const valores = rows.slice(1).map(r => r.slice(1).map(v => Number(v)));

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
    document.getElementById("gradosChart").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando participación por grado.</p>";
  }

  setTimeout(drawGradosChart, 30000);
}

// ==============================
// MOSTRAR GANADOR CON CONFETI LLUVIA
// ==============================
function mostrarGanador() {
  if (!ganadorActual) return alert("⚠️ Aún no hay ganador.");

  document.getElementById("winnerName").innerHTML = `🏆 ${ganadorActual}`;
  document.getElementById("winnerModal").style.display = "flex";

  // 🔥 Confeti vertical hasta abajo
  if (confettiInterval) clearInterval(confettiInterval);

  confettiInterval = setInterval(() => {
    confetti({
      particleCount: 8 + Math.floor(Math.random() * 12),
      angle: 90,             // vertical
      spread: 40,
      origin: { x: Math.random(), y: 0 },
      colors: coloresListas,
      ticks: 200,            // duración larga para que llegue al fondo
      gravity: 0.5,
      scalar: 0.7 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.5
    });
    // partículas pequeñas adicionales
    confetti({
      particleCount: 12 + Math.floor(Math.random() * 15),
      angle: 90,
      spread: 60,
      origin: { x: Math.random(), y: 0 },
      colors: coloresListas,
      ticks: 180,
      gravity: 0.6,
      scalar: 0.4 + Math.random() * 0.4,
      drift: (Math.random() - 0.5)
    });
  }, 200);
}

// ==============================
// CERRAR GANADOR
// ==============================
function cerrarGanador() {
  document.getElementById("winnerModal").style.display = "none";

  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}

// ==============================
// INICIO
// ==============================
drawResumenChart();
drawGradosChart();

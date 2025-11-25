// ======================================================================
//  CONFIG – LINKS CSV
// ======================================================================
const CSV_RESUMEN =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";

console.log("📊 Chart.js cargado correctamente.");


// ======================================================================
//  CSV PARSER ROBUSTO
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
    const res = await fetch(CSV_RESUMEN, { cache: "no-store" });
    console.log("📥 Estado FETCH:", res.status);

    const csv = await res.text();
    const parsed = parseCSV(csv);

    console.log("📄 CSV primeras líneas:\n",
      csv.split("\n").slice(0, 4).join("\n")
    );

    const rows = parsed.filter(r => r.length >= 2 && r[0]).slice(1);

    const labels = rows.map(r => r[0]);
    const values = rows.map(r => Number(r[1]));

    const maxVotos = Math.max(...values);
    ganadorActual = labels[values.indexOf(maxVotos)] ?? null;

    console.log("📋 Etiquetas:", labels);
    console.log("📊 Valores:", values);
    console.log("🏆 Ganador:", ganadorActual);

    // EXTRA: Si ya existe el gráfico → lo destruye (Chart.js lo requiere)
    if (resumenChartInstance) resumenChartInstance.destroy();

    const ctx = document.getElementById("resumenChart").getContext("2d");

    resumenChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Votos",
          data: values,
          backgroundColor: labels.map((_, i) => coloresListas[i % coloresListas.length]),
          borderColor: "#0b2e57",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 400 },
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        }
      }
    });

  } catch (err) {
    console.error("❌ ERROR RESUMEN:", err);
    document.getElementById("resumen_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando datos del resumen.</p>";
  }

  setTimeout(drawResumenChart, 3500);
}


// ======================================================================
// 2️⃣ GRÁFICO POR GRADOS — PARTICIPACIÓN
// ======================================================================
async function drawGradosChart() {
  console.log("\n==============================");
  console.log("🔄 Actualizando gráfico GRADOS…");
  console.log("==============================");

  try {
    const res = await fetch(CSV_ANALISIS, { cache: "no-store" });
    const csv = await res.text();

    console.log("📄 CSV ANALISIS primeras líneas:\n",
      csv.split("\n").slice(0, 4).join("\n")
    );

    const rows = parseCSV(csv);

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);
    const valores = rows.slice(1).map(r =>
      r.slice(1).map(v => Number(v))
    );

    console.log("📋 Listas:", listas);
    console.log("📋 Grados:", grados);
    console.log("📊 Valores:", valores);

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
        animation: { duration: 400 },
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    });

  } catch (err) {
    console.error("❌ ERROR GRADOS:", err);
    document.getElementById("grados_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando participación por grado.</p>";
  }

  setTimeout(drawGradosChart, 3500);
}


// ======================================================================
// ⭐ MOSTRAR GANADOR
// ======================================================================
function mostrarGanador() {
  if (!ganadorActual) return alert("⚠️ Aún no hay ganador.");

  document.getElementById("winnerName").innerHTML = `🏆 ${ganadorActual}`;
  document.getElementById("winnerModal").style.display = "flex";
}

function cerrarGanador() {
  document.getElementById("winnerModal").style.display = "none";
}


// ======================================================================
// 🚀 INICIO
// ======================================================================
drawResumenChart();
drawGradosChart();

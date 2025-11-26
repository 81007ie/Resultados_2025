// ===============================
// URLs de los CSV
// ===============================
const CSV_RESUMEN_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";

// ===============================
// UTILIDADES
// ===============================
function noCache(url) {
  return `${url}&t=${Date.now()}`;
}

function parseCSV(text) {
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

const coloresListas = [
  "#1e88e5", "#ffb300", "#43a047",
  "#e53935", "#8e24aa", "#00acc1"
];

let resumenChartInstance = null;
let gradosChartInstance = null;
let ganadorActual = null;

// ===============================
// GRÁFICO RESUMEN
// ===============================
async function drawResumenChart() {
  try {
    const res = await fetch(noCache(CSV_RESUMEN_BASE));
    const rows = parseCSV(await res.text()).slice(1);

    const labels = rows.map(r => r[0]);
    const values = rows.map(r => Number(r[1]));

    ganadorActual = labels[values.indexOf(Math.max(...values))];

    if (resumenChartInstance) resumenChartInstance.destroy();

    const ctx = document.getElementById("resumenChart").getContext("2d");

    resumenChartInstance = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ data: values, backgroundColor: coloresListas }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (err) { console.error(err); }

  setTimeout(drawResumenChart, 30000);
}

// ===============================
// GRÁFICO POR GRADOS
// ===============================
async function drawGradosChart() {
  try {
    const res = await fetch(noCache(CSV_ANALISIS_BASE));
    const rows = parseCSV(await res.text());

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);
    const valores = rows.slice(1).map(r => r.slice(1).map(Number));

    if (gradosChartInstance) gradosChartInstance.destroy();

    const ctx = document.getElementById("gradosChart").getContext("2d");

    gradosChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: grados,
        datasets: listas.map((l, i) => ({
          label: l,
          data: valores.map(v => v[i]),
          backgroundColor: coloresListas[i]
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  } catch (err) { console.error(err); }

  setTimeout(drawGradosChart, 30000);
}

// ===============================
// 🎉 CONFETI — lluvia en toda pantalla
// ===============================
let confetiInterval = null;

// Usamos el canvas fijo del HTML
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiBack = confetti.create(confettiCanvas, { resize: true });

function iniciarConfeti() {
  detenerConfeti();

  confetiInterval = setInterval(() => {
    confettiBack({
      particleCount: 70,
      spread: 90,
      startVelocity: 40,
      gravity: 1.0,
      ticks: 300,
      origin: { x: Math.random(), y: 0 }
    });
  }, 400);
}

function detenerConfeti() {
  if (confetiInterval) clearInterval(confetiInterval);
  confetiInterval = null;
}

// ===============================
// MODAL GANADOR
// ===============================
function mostrarGanador() {
  if (!ganadorActual) return;
  document.getElementById("winnerName").innerText = `🏆 ${ganadorActual}`;
  document.getElementById("winnerModal").style.display = "flex";
  iniciarConfeti();
}

function cerrarGanador() {
  document.getElementById("winnerModal").style.display = "none";
  detenerConfeti();
}

// ===============================
// INICIAR
// ===============================
drawResumenChart();
drawGradosChart();

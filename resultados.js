// ===============================
// URLs de los CSV públicos
// ===============================
const CSV_RESUMEN =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";


// ===============================
// Cargar Google Charts
// ===============================
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawResumenChart);
google.charts.setOnLoadCallback(drawGradosChart);


// ===============================
// Función convertir CSV → Matriz
// ===============================
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map((row) => row.split(","));
}


// ===============================
// 1️⃣ GRÁFICO — VOTOS POR LISTA (Barras Verticales)
// ===============================
async function fetchResumenData() {
  try {
    const response = await fetch(CSV_RESUMEN);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // Ej: [["Lista 1", "10"], ["Lista 2", "20"]...]
    return rows.map((r) => [r[0], Number(r[1])]);
  } catch (err) {
    console.error("Error leyendo CSV resumen:", err);
    document.getElementById("resumen_chart_div").innerHTML =
      '<p style="color:red;text-align:center;">⚠️ Error cargando datos del resumen.</p>';
    return null;
  }
}

async function drawResumenChart() {
  const resumen = await fetchResumenData();
  if (!resumen) return;

  const data = google.visualization.arrayToDataTable([
    ["Lista", "Votos"],
    ...resumen,
  ]);

  const options = {
    title: "Total de Votos por Lista",
    legend: { position: "none" },
    vAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "75%", height: "80%" },
    colors: ["#1e3c72"],
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("resumen_chart_div")
  );
  chart.draw(data, options);

  setTimeout(drawResumenChart, 15000);
}


// ===============================
// 2️⃣ GRÁFICO — PARTICIPACIÓN POR GRADO (Barras Verticales)
// ===============================
async function fetchAnalisisData() {
  try {
    const response = await fetch(CSV_ANALISIS);
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (err) {
    console.error("Error leyendo CSV análisis:", err);
    document.getElementById("pastel_grados_div").innerHTML =
      '<p style="color:red;text-align:center;">⚠️ Error cargando análisis por grados.</p>';
    return null;
  }
}

async function drawGradosChart() {
  const raw = await fetchAnalisisData();
  if (!raw) return;

  const grados = [
    "1° Primaria",
    "2° Primaria",
    "3° Primaria",
    "4° Primaria",
    "5° Primaria",
    "6° Primaria",
  ];

  const matriz = [["Grado", "Total Votos"]];

  raw.forEach((fila, i) => {
    const total = fila.reduce((s, v) => s + Number(v), 0);
    matriz.push([grados[i], total]);
  });

  const data = google.visualization.arrayToDataTable(matriz);

  const options = {
    title: "Participación por Grado",
    legend: { position: "none" },
    vAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "75%", height: "80%" },
    colors: ["#00AEEF"],
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("pastel_grados_div")
  );
  chart.draw(data, options);

  setTimeout(drawGradosChart, 15000);
}

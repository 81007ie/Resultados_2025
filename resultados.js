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
google.charts.load("current", { packages: ["corechart", "bar"] });
google.charts.setOnLoadCallback(drawResumenChart);
google.charts.setOnLoadCallback(drawGradosChart);

// ===============================
// Convertir CSV → Matriz
// ===============================
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map((row) => row.split(","));
}

// ===============================
// Colores para cada lista/grado
// ===============================
const coloresListas = ["#1e88e5", "#ffb300", "#43a047", "#e53935", "#8e24aa", "#00acc1"];

// =====================================================================================
// 1️⃣ GRÁFICO RESUMEN — VOTOS POR LISTA (Barras)
// =====================================================================================
async function fetchResumenData() {
  try {
    const response = await fetch(CSV_RESUMEN);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // La primera fila es encabezado: "Lista,Total Votos"
    return rows.slice(1).map((r) => [r[0], Number(r[1])]);
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

  const maxVotos = Math.max(...resumen.map((x) => x[1]));

  const dataArray = [["Lista", "Votos", { role: "style" }, { role: "annotation" }]];

  resumen.forEach((item, index) => {
    const esGanador = item[1] === maxVotos;
    const color = coloresListas[index % coloresListas.length];

    dataArray.push([
      item[0],
      item[1],
      esGanador
        ? `color: ${color}; stroke-color: #000; stroke-width: 3`
        : `color: ${color}`,
      item[1],
    ]);
  });

  const data = google.visualization.arrayToDataTable(dataArray);

  const options = {
    title: "Total de Votos por Lista",
    legend: { position: "none" },
    animation: { startup: true, duration: 1000, easing: "out" },
    bar: { groupWidth: "65%" },
    hAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "80%", height: "75%" },
    annotations: { textStyle: { fontSize: 14, bold: true, color: "#333" } },
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("resumen_chart_div")
  );
  chart.draw(data, options);

  setTimeout(drawResumenChart, 5000);
}

// =====================================================================================
// 2️⃣ GRÁFICO PARTICIPACIÓN POR GRADO (Barras)
// =====================================================================================
async function fetchAnalisisData() {
  try {
    const response = await fetch(CSV_ANALISIS);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // La primera fila contiene los nombres de las listas
    const encabezado = rows[0].slice(1); // ["Lista 1: ...", "Lista 2: ..."]
    const datos = rows.slice(1); // filas de grados

    // Convertir a totales por grado sumando columnas
    const totalesPorGrado = datos.map((fila) =>
      fila.slice(1).reduce((suma, val) => suma + Number(val), 0)
    );

    return { grados: datos.map(r => r[0]), totales: totalesPorGrado, encabezado };
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

  const { grados, totales } = raw;
  const maxTotal = Math.max(...totales);

  const matriz = [["Grado", "Total Votos", { role: "style" }, { role: "annotation" }]];

  totales.forEach((total, i) => {
    const esGanador = total === maxTotal;
    const color = coloresListas[i % coloresListas.length];

    matriz.push([
      grados[i],
      total,
      esGanador
        ? `color: ${color}; stroke-color: #000; stroke-width: 3`
        : `color: ${color}`,
      total,
    ]);
  });

  const data = google.visualization.arrayToDataTable(matriz);

  const options = {
    title: "Participación por Grado",
    legend: { position: "none" },
    animation: { startup: true, duration: 1000, easing: "out" },
    bar: { groupWidth: "70%" },
    hAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "80%", height: "75%" },
    annotations: { textStyle: { fontSize: 14, bold: true, color: "#333" } },
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("pastel_grados_div")
  );
  chart.draw(data, options);

  setTimeout(drawGradosChart, 5000);
}

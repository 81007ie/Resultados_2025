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

// =====================================================================================
// 1️⃣ GRÁFICO RESUMEN — VOTOS POR LISTA (Barras) + Hover + Números + Barra Ganadora
// =====================================================================================

async function fetchResumenData() {
  try {
    const response = await fetch(CSV_RESUMEN);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

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

  // Obtener la barra ganadora
  const maxVotos = Math.max(...resumen.map((x) => x[1]));

  const dataArray = [
    ["Lista", "Votos", { role: "style" }, { role: "annotation" }]
  ];

  resumen.forEach((item) => {
    const esGanador = item[1] === maxVotos;

    dataArray.push([
      item[0],
      item[1],
      esGanador
        ? "color: #FFA726; stroke-color: #E65100; stroke-width: 3" // Barra destacada
        : "color: #1e3c72",
      item[1] // Número encima
    ]);
  });

  const data = google.visualization.arrayToDataTable(dataArray);

  const options = {
    title: "Total de Votos por Lista",
    legend: { position: "none" },
    animation: { startup: true, duration: 800, easing: "out" },
    bar: { groupWidth: "65%" },
    focusTarget: "category",
    hAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "80%", height: "75%" },
    annotations: {
      textStyle: { fontSize: 14, bold: true, color: "#333" }
    }
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("resumen_chart_div")
  );
  chart.draw(data, options);

  setTimeout(drawResumenChart, 5000);
}

// =====================================================================================
// 2️⃣ GRÁFICO PARTICIPACIÓN POR GRADO (Barras)
//      – Hover + Números + Barra Ganadora
// =====================================================================================

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
    "6° Primaria"
  ];

  const matriz = [["Grado", "Total Votos", { role: "style" }, { role: "annotation" }]];

  // Crear totales por grado
  const totales = raw.map((fila) =>
    fila.reduce((s, v) => s + Number(v), 0)
  );

  const maxTotal = Math.max(...totales);

  totales.forEach((total, i) => {
    const esGanador = total === maxTotal;

    matriz.push([
      grados[i],
      total,
      esGanador
        ? "color: #66BB6A; stroke-color: #1B5E20; stroke-width: 3"
        : "color: #00AEEF",
      total
    ]);
  });

  const data = google.visualization.arrayToDataTable(matriz);

  const options = {
    title: "Participación por Grado",
    legend: { position: "none" },
    animation: { startup: true, duration: 800, easing: "out" },
    bar: { groupWidth: "70%" },
    focusTarget: "category",
    vAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "80%", height: "75%" },
    annotations: {
      textStyle: { fontSize: 14, bold: true, color: "#333" }
    }
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("pastel_grados_div")
  );
  chart.draw(data, options);

  setTimeout(drawGradosChart, 5000);
}

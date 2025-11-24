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
// Colores para listas
// ===============================
const coloresListas = ["#1e88e5", "#ffb300", "#43a047", "#e53935", "#8e24aa", "#00acc1"];

let resumenChart, resumenDataTable;
let gradosChart, gradosDataTable;

// ===============================
// 1️⃣ GRÁFICO RESUMEN — VOTOS POR LISTA
// ===============================
async function drawResumenChart() {
  try {
    const response = await fetch(CSV_RESUMEN);
    const csvText = await response.text();
    const rows = parseCSV(csvText).slice(1);

    const nuevosVotos = rows.map(r => [r[0], Number(r[1])]);
    const maxVotos = Math.max(...nuevosVotos.map(x => x[1]));

    if (!resumenDataTable) {
      resumenDataTable = new google.visualization.DataTable();
      resumenDataTable.addColumn('string', 'Lista');
      resumenDataTable.addColumn('number', 'Votos');
      resumenDataTable.addColumn({ type: 'string', role: 'style' });
      resumenDataTable.addColumn({ type: 'string', role: 'annotation' });

      nuevosVotos.forEach((item, index) => {
        const color = coloresListas[index % coloresListas.length];
        const estilo = item[1] === maxVotos ? 
          `color:${color}; stroke-color:#000; stroke-width:3` : 
          `color:${color}`;

        resumenDataTable.addRow([item[0], item[1], estilo, item[1]]);
      });

      resumenChart = new google.visualization.ColumnChart(
        document.getElementById("resumen_chart_div")
      );
      resumenChart.draw(resumenDataTable, getResumenOptions());
    } else {
      nuevosVotos.forEach((item, index) => {
        resumenDataTable.setValue(index, 1, item[1]);
        resumenDataTable.setValue(index, 3, item[1]);

        const color = coloresListas[index % coloresListas.length];
        const estilo = item[1] === maxVotos ? 
          `color:${color}; stroke-color:#000; stroke-width:3` : 
          `color:${color}`;

        resumenDataTable.setValue(index, 2, estilo);
      });

      resumenChart.draw(resumenDataTable, getResumenOptions());
    }
  } catch (err) {
    document.getElementById("resumen_chart_div").innerHTML =
      '<p style="color:red;text-align:center;">⚠️ Error cargando datos del resumen.</p>';
  }

  setTimeout(drawResumenChart, 5000);
}

function getResumenOptions() {
  return {
    title: "Total de Votos por Lista",
    legend: { position: "none" },
    animation: { startup: true, duration: 800, easing: "out" },
    bar: { groupWidth: "65%" },
    hAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "80%", height: "75%" },
    annotations: { textStyle: { fontSize: 14, bold: true, color: "#333" } }
  };
}

// ===============================
// 2️⃣ GRÁFICO — PARTICIPACIÓN POR GRADO (Barras agrupadas)
// ===============================
async function drawGradosChart() {
  try {
    const response = await fetch(CSV_ANALISIS);
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);
    const datos = rows.slice(1).map(r => r.slice(1).map(v => Number(v)));

    if (!gradosDataTable) {
      gradosDataTable = new google.visualization.DataTable();

      gradosDataTable.addColumn("string", "Grado");
      listas.forEach(lista => gradosDataTable.addColumn("number", lista));
      listas.forEach(() => gradosDataTable.addColumn({ type: "string", role: "style" }));

      datos.forEach((fila, i) => {
        const filaData = [grados[i]];
        const filaStyles = [];

        fila.forEach((voto, j) => {
          filaData.push(voto);
          filaStyles.push(`color:${coloresListas[j % coloresListas.length]}`);
        });

        gradosDataTable.addRow([...filaData, ...filaStyles]);
      });

      gradosChart = new google.visualization.ColumnChart(
        document.getElementById("pastel_grados_div")
      );
      gradosChart.draw(gradosDataTable, getGradosOptions());

    } else {
      datos.forEach((fila, i) => {
        const maxVotos = Math.max(...fila);

        fila.forEach((voto, j) => {
          gradosDataTable.setValue(i, 1 + j, voto);

          const styleIndex = 1 + listas.length + j;
          const estilo =
            voto === maxVotos
              ? `color:${coloresListas[j]}; stroke-color:#000; stroke-width:3`
              : `color:${coloresListas[j]}`;

          gradosDataTable.setValue(i, styleIndex, estilo);
        });
      });

      gradosChart.draw(gradosDataTable, getGradosOptions());
    }
  } catch (err) {
    document.getElementById("pastel_grados_div").innerHTML =
      '<p style="color:red;text-align:center;">⚠️ Error cargando análisis por grados.</p>';
  }

  setTimeout(drawGradosChart, 5000);
}

function getGradosOptions() {
  return {
    title: "Participación por Grado",
    legend: { position: "top" },
    animation: { startup: true, duration: 800, easing: "out" },
    bar: { groupWidth: "70%" },
    hAxis: { title: "Grado" },
    vAxis: { title: "Votos", minValue: 0 },
    chartArea: { width: "80%", height: "75%" }
  };
}

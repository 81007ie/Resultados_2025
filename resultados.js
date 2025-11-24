// ===============================
// URLs de los CSV
// ===============================
const CSV_RESUMEN =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";


// ===============================
// Cargar Google Charts
// ===============================
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(() => {
  drawResumenChart();
  drawGradosChart();
});


// ===============================
// CSV Parser ROBUSTO
// ===============================
function parseCSV(text) {
  const lines = text.trim().split("\n");
  return lines.map((line) => {
    let result = [];
    let current = "";
    let insideQuotes = false;

    for (let char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}


// ===============================
// COLORES LISTAS
// ===============================
const coloresListas = [
  "#1e88e5", "#ffb300", "#43a047", "#e53935",
  "#8e24aa", "#00acc1"
];

let resumenChart, resumenDataTable;
let gradosChart, gradosDataTable;


// ===================================================================
// 1️⃣ GRÁFICO RESUMEN — Total de votos por lista
// ===================================================================
async function drawResumenChart() {
  try {
    const csv = await (await fetch(CSV_RESUMEN)).text();
    const rows = parseCSV(csv).slice(1);

    const votos = rows
      .filter(r => r[0] && r[1])
      .map(r => [r[0], Number(r[1])]);

    const maxVotos = Math.max(...votos.map(v => v[1]));

    if (!resumenDataTable) {
      resumenDataTable = new google.visualization.DataTable();
      resumenDataTable.addColumn("string", "Lista");
      resumenDataTable.addColumn("number", "Votos");
      resumenDataTable.addColumn({ type: "string", role: "style" });
      resumenDataTable.addColumn({ type: "string", role: "annotation" });

      votos.forEach((v, i) => {
        let color = coloresListas[i % coloresListas.length];
        let style =
          v[1] === maxVotos
            ? `color:${color}; stroke-color:#FFD700; stroke-width:6;`
            : `color:${color};`;

        resumenDataTable.addRow([v[0], v[1], style, v[1]]);
      });

      resumenChart = new google.visualization.ColumnChart(
        document.getElementById("resumen_chart_div")
      );

      resumenChart.draw(resumenDataTable, getResumenOptions());

    } else {
      votos.forEach((v, i) => {
        resumenDataTable.setValue(i, 1, v[1]);
        resumenDataTable.setValue(i, 3, v[1]);

        let color = coloresListas[i % coloresListas.length];
        let style =
          v[1] === maxVotos
            ? `color:${color}; stroke-color:#FFD700; stroke-width:6;`
            : `color:${color}`;

        resumenDataTable.setValue(i, 2, style);
      });

      resumenChart.draw(resumenDataTable, getResumenOptions());
    }

  } catch (err) {
    document.getElementById("resumen_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando datos del resumen.</p>";
  }

  setTimeout(drawResumenChart, 3000);
}

function getResumenOptions() {
  return {
    legend: "none",
    animation: { duration: 500, easing: "out" },
    bar: { groupWidth: "70%" },
    chartArea: { width: "80%", height: "70%" },
    hAxis: { title: "Listas" },
    vAxis: { title: "Votos" },
  };
}



// ===================================================================
// 2️⃣ GRÁFICO AGRUPADO — Votos por grado
// ===================================================================
async function drawGradosChart() {
  try {
    const csv = await (await fetch(CSV_ANALISIS)).text();
    const rows = parseCSV(csv);

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);
    const datos = rows.slice(1).map(r => r.slice(1).map(Number));

    if (!gradosDataTable) {
      gradosDataTable = new google.visualization.DataTable();
      gradosDataTable.addColumn("string", "Grado");

      listas.forEach(lista => gradosDataTable.addColumn("number", lista));

      datos.forEach((fila, index) => {
        gradosDataTable.addRow([grados[index], ...fila]);
      });

      gradosChart = new google.visualization.ColumnChart(
        document.getElementById("grados_chart_div")
      );

      gradosChart.draw(gradosDataTable, getGradosOptions());

    } else {
      datos.forEach((fila, index) => {
        fila.forEach((voto, j) => {
          gradosDataTable.setValue(index, j + 1, voto);
        });
      });

      gradosChart.draw(gradosDataTable, getGradosOptions());
    }

  } catch (err) {
    document.getElementById("grados_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando participación por grado.</p>";
  }

  setTimeout(drawGradosChart, 3000);
}


function getGradosOptions() {
  return {
    legend: { position: "top" },
    bar: { groupWidth: "70%" },
    animation: { duration: 400, easing: "out" },
    chartArea: { left: 60, width: "88%", height: "70%" },
    hAxis: { title: "Grados" },
    vAxis: { title: "Votos" },
  };
}

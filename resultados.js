const CSV_RESUMEN =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";

const CSV_ANALISIS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(() => {
  drawResumenChart();
  drawGradosChart();
});


// ===============================
// CSV Parser ROBUSTO
// ===============================
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


// ===============================
// COLORES LISTAS
// ===============================
const coloresListas = [
  "#1e88e5", "#ffb300", "#43a047", "#e53935",
  "#8e24aa", "#00acc1"
];

let resumenDataTable;
let resumenChart;
let ganadorActual = null;


// ===================================================================
// 1️⃣ GRÁFICO RESUMEN — FIX COMPLETO
// ===================================================================
async function drawResumenChart() {
  console.log("🔄 Actualizando gráfico RESUMEN…");

  try {
    const res = await fetch(CSV_RESUMEN);
    console.log("📥 Fetch status CSV_RESUMEN:", res.status);

    const csv = await res.text();
    console.log("📄 CSV recibido (primeras líneas):\n", csv.split("\n").slice(0,4).join("\n"));

    const parsed = parseCSV(csv);
    console.log("🔍 CSV parseado:", parsed);

    const rows = parsed
      .filter(r => r.length >= 2 && r[0].trim() !== "")
      .slice(1);

    console.log("📌 Filas usadas:", rows);

    const votos = rows.map(r => [r[0], Math.round(Number(r[1]))]);
    console.log("📊 Votos procesados:", votos);

    const maxVotos = Math.max(...votos.map(v => v[1]));
    const ganador = votos.find(v => v[1] === maxVotos)?.[0];
    ganadorActual = ganador;
    console.log("🏆 Ganador detectado:", ganador);

    // ===========================
    // CREAR TABLA SI NO EXISTE
    // ===========================
    if (!resumenDataTable) {
      resumenDataTable = new google.visualization.DataTable();
      resumenDataTable.addColumn("string", "Lista");
      resumenDataTable.addColumn("number", "Votos");
      resumenDataTable.addColumn({ type: "string", role: "style" });
      resumenDataTable.addColumn({ type: "string", role: "annotation" }); // <-- STRING OBLIGATORIO

      votos.forEach((v, i) => {
        const color = coloresListas[i % coloresListas.length];
        const style =
          v[1] === maxVotos
            ? `color:${color}; stroke-color:#FFD700; stroke-width:6;`
            : `color:${color}`;

        resumenDataTable.addRow([
          v[0],
          v[1],
          style,
          String(v[1]) // <-- FIX CRÍTICO
        ]);
      });

      resumenChart = new google.visualization.ColumnChart(
        document.getElementById("resumen_chart_div")
      );

    } else {
      // ===========================
      // ACTUALIZAR TABLA EXISTENTE
      // ===========================
      votos.forEach((v, i) => {
        const color = coloresListas[i % coloresListas.length];
        const style =
          v[1] === maxVotos
            ? `color:${color}; stroke-color:#FFD700; stroke-width:6;`
            : `color:${color}`;

        resumenDataTable.setValue(i, 1, v[1]);
        resumenDataTable.setValue(i, 2, style);
        resumenDataTable.setValue(i, 3, String(v[1])); // <-- FIX CRÍTICO
      });
    }

    resumenChart.draw(resumenDataTable, {
      legend: "none",
      animation: { duration: 350, easing: "out" },
      bar: { groupWidth: "65%" },
      chartArea: { width: "80%", height: "75%" },
      hAxis: { title: "Listas" },
      vAxis: { title: "Votos" }
    });

  } catch (err) {
    console.error("❌ ERROR GRAVE EN RESUMEN:", err);
    document.getElementById("resumen_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando datos del resumen.</p>";
  }

  setTimeout(drawResumenChart, 3500);
}





// ===================================================================
// 2️⃣ GRÁFICO POR GRADOS — (ya funcionaba OK)
// ===================================================================
let gradosDataTable;
let gradosChart;

async function drawGradosChart() {
  console.log("🔄 Actualizando gráfico POR GRADOS…");

  try {
    const res = await fetch(CSV_ANALISIS);
    console.log("📥 Fetch status CSV_ANALISIS:", res.status);

    const csv = await res.text();
    console.log("📄 CSV ANALISIS recibido:\n", csv.split("\n").slice(0,4).join("\n"));

    const rows = parseCSV(csv);
    console.log("🔍 CSV ANALISIS parseado:", rows);

    const listas = rows[0].slice(1);
    const grados = rows.slice(1).map(r => r[0]);

    const datos = rows.slice(1).map(r =>
      r.slice(1).map(v => Math.round(Number(v)))
    );

    console.log("📊 Datos por grado:", datos);

    if (!gradosDataTable) {
      gradosDataTable = new google.visualization.DataTable();
      gradosDataTable.addColumn("string", "Grado");
      listas.forEach(lista => gradosDataTable.addColumn("number", lista));

      datos.forEach((fila, i) => {
        gradosDataTable.addRow([grados[i], ...fila]);
      });

      gradosChart = new google.visualization.ColumnChart(
        document.getElementById("grados_chart_div")
      );

    } else {
      datos.forEach((fila, i) => {
        fila.forEach((voto, j) => {
          gradosDataTable.setValue(i, j + 1, voto);
        });
      });
    }

    gradosChart.draw(gradosDataTable, {
      legend: { position: "top" },
      bar: { groupWidth: "70%" },
      animation: { duration: 350, easing: "out" },
      chartArea: { width: "88%", height: "70%" },
      hAxis: { title: "Grados" },
      vAxis: { title: "Votos" }
    });

    console.log("✅ Gráfico GRADOS dibujado correctamente");

  } catch (err) {
    console.error("❌ ERROR en GRADOS:", err);
    document.getElementById("grados_chart_div").innerHTML =
      "<p style='color:red;text-align:center'>⚠️ Error cargando participación por grado.</p>";
  }

  setTimeout(drawGradosChart, 3500);
}


// ===================================================================
// ⭐ GANADOR
// ===================================================================
function mostrarGanador() {
  if (!ganadorActual) {
    alert("⚠️ El ganador aún no está disponible.");
    return;
  }

  document.getElementById("winnerName").innerHTML =
    `🏆 ${ganadorActual}`;

  document.getElementById("winnerModal").style.display = "flex";
}

function cerrarGanador() {
  document.getElementById("winnerModal").style.display = "none";
}

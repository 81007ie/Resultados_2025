
const CSV_RESUMEN = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1215585848&single=true&output=csv";
const CSV_ANALISIS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcaBIoYeJQDOMRnrmXWro6B4bGEEB1jjs5zKrwrly-hoCE1kSX_0AR_cqLTWCg2uXaDpYkCIsOfBps/pub?gid=1597888877&single=true&output=csv";

// ===============================
// Cargar Google Charts
// ===============================
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawResumenChart);
google.charts.setOnLoadCallback(drawGradosChart);

// ===============================
// Función para convertir CSV → Array
// ===============================

function parseCSV(text) {
    return text
        .trim()
        .split("\n")
        .map(row => row.split(","));
}


// ===============================
// 1️⃣ GRÁFICO RESUMEN (Barras)
// ===============================

async function fetchResumenData() {
    try {
        const response = await fetch(CSV_RESUMEN);
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // rows → Ej: [["Lista 1","50"],["Lista 2","30"],...]

        return rows.map(r => [r[0], Number(r[1])]);
    } 
    catch (err) {
        console.error("Error leyendo CSV del resumen:", err);
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
        ...resumen
    ]);

    const options = {
        title: "Total de Votos por Lista",
        legend: { position: "none" },
        hAxis: { title: "Votos", minValue: 0 },
        chartArea: { width: "75%", height: "80%" },
        colors: ["#1e3c72"]
    };

    const chart = new google.visualization.BarChart(
        document.getElementById("resumen_chart_div")
    );
    chart.draw(data, options);

    setTimeout(drawResumenChart, 15000);
}


// ===============================
// 2️⃣ GRÁFICO ANÁLISIS POR GRADO (Pastel / Donut)
// ===============================

async function fetchAnalisisData() {
    try {
        const response = await fetch(CSV_ANALISIS);
        const csvText = await response.text();
        const rows = parseCSV(csvText);

        // rows → 6 filas × 4 columnas de votos
        return rows;
    }
    catch (err) {
        console.error("Error leyendo CSV del análisis:", err);
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

    const matriz = [["Grado", "Total Votos"]];

    // Sumar cada fila
    raw.forEach((fila, i) => {
        const total = fila.reduce((s, v) => s + Number(v), 0);
        matriz.push([grados[i], total]);
    });

    const data = google.visualization.arrayToDataTable(matriz);

    const options = {
        title: "Distribución de la Participación por Grado",
        pieHole: 0.4,
        legend: { position: "right" },
        chartArea: { width: "100%", height: "90%" },
        colors: ["#6EC1E4", "#00AEEF", "#1e3c72", "#E53935", "#FBC02D", "#9E9E9E"]
    };

    const chart = new google.visualization.PieChart(
        document.getElementById("pastel_grados_div")
    );
    chart.draw(data, options);

    setTimeout(drawGradosChart, 15000);
}

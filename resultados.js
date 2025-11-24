const APPS_SCRIPT_URL_BASE = 'https://script.google.com/macros/s/AKfycbywyq82mVwxNkEyvJtKFqTbmbaMFDs7IH1uBSRCjXg-g_3zRurOWwDDJhtsn1p1vqBo/exec';

// Cargar Google Charts
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawResumenChart);
google.charts.setOnLoadCallback(drawGradosChart);

/* ==========================================================
   1. GRÁFICO DE RESUMEN POR LISTA
   ========================================================== */
async function fetchResumenData() {
    try {
        const response = await fetch(`${APPS_SCRIPT_URL_BASE}?type=resumen`);
        if (!response.ok) throw new Error(response.status);

        const raw = await response.json();
        return raw.map(row => [row[0], Number(row[1])]);

    } catch (err) {
        console.error("Error en resumen:", err);
        document.getElementById('resumen_chart_div').innerHTML =
            '<p style="text-align:center;color:red;">⚠️ Error al cargar datos</p>';
        return null;
    }
}

async function drawResumenChart() {
    const rows = await fetchResumenData();
    if (!rows) return;

    const data = google.visualization.arrayToDataTable([
        ['Lista', 'Votos'],
        ...rows
    ]);

    const options = {
        title: 'Total de Votos por Lista',
        legend: 'none',
        hAxis: { title: 'Votos', minValue: 0 },
        vAxis: { textStyle: { fontSize: 16 } },
        chartArea: { width: '75%', height: '85%' },
        animation: { duration: 900, startup: true },
        colors: ['#1e3c72']
    };

    const chart = new google.visualization.BarChart(
        document.getElementById('resumen_chart_div')
    );
    chart.draw(data, options);

    setTimeout(drawResumenChart, 15000);
}

/* ==========================================================
   2. GRÁFICO DE PASTEL POR GRADO
   ========================================================== */

async function fetchAnalisisData() {
    try {
        const response = await fetch(`${APPS_SCRIPT_URL_BASE}?type=analisis`);
        if (!response.ok) throw new Error(response.status);
        return await response.json();

    } catch (err) {
        console.error("Error en análisis:", err);
        document.getElementById('pastel_grados_div').innerHTML =
            '<p style="text-align:center;color:red;">⚠️ Error al cargar datos</p>';
        return null;
    }
}

async function drawGradosChart() {
    const raw = await fetchAnalisisData();
    if (!raw) return;

    const grados = ['1°', '2°', '3°', '4°', '5°', '6°'];
    const rows = raw.map((row, i) => [
        grados[i] + " Primaria",
        row.reduce((a, b) => a + Number(b), 0)
    ]);

    const data = google.visualization.arrayToDataTable([
        ['Grado', 'Votos'],
        ...rows
    ]);

    const options = {
        title: 'Distribución de Participación por Grado',
        pieHole: 0.4,
        legend: { position: 'right' },
        chartArea: { width: '90%', height: '90%' },
        animation: { duration: 900, startup: true },
        colors: ['#6EC1E4', '#00AEEF', '#1e3c72', '#E53935', '#FBC02D', '#9E9E9E']
    };

    const chart = new google.visualization.PieChart(
        document.getElementById('pastel_grados_div')
    );

    chart.draw(data, options);

    setTimeout(drawGradosChart, 15000);
}

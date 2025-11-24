// =============================================
// 🚀 CARGA GOOGLE CHARTS
// =============================================
google.charts.load("current", { packages: ["corechart", "bar"] });
google.charts.setOnLoadCallback(inicializarDashboard);

// Guardamos data previa para evitar re-dibujos innecesarios
let ultimaDataResumen = "";
let ultimaDataGrados = "";

// =============================================
// 🟦 FUNCIÓN PRINCIPAL
// =============================================
function inicializarDashboard() {
    cargarDatos();
    setInterval(cargarDatos, 5000); // Actualiza solo si hay cambios
}

// =============================================
// 📥 OBTENER DATOS DEL SERVIDOR
// =============================================
async function cargarDatos() {
    try {
        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbxMuZpPGy1OixpIYqmqhB3hqzO522V5MTF42Kw1F-yxpWBUQMwkhS31G1mLqvrw1-Wp/exec"
        );
        const data = await response.json();

        const jsonResumen = JSON.stringify(data.resumen);
        const jsonGrados = JSON.stringify(data.grados);

        if (jsonResumen !== ultimaDataResumen) {
            ultimaDataResumen = jsonResumen;
            dibujarGraficoResumen(data.resumen);
        }

        if (jsonGrados !== ultimaDataGrados) {
            ultimaDataGrados = jsonGrados;
            dibujarGraficoGrados(data.grados);
        }

    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

// =============================================
// 📊 GRAFICO 1 — VOTOS POR LISTA (barras)
// =============================================
function dibujarGraficoResumen(resumen) {
    const datos = [
        ["Lista", "Votos", { role: "style" }, { role: "annotation" }]
    ];

    const colores = ["#1e3c72", "#00AEEF", "#7DD3FC", "#2563EB", "#3B82F6"];

    // 📌 Encontrar la lista ganadora
    const maxVotos = Math.max(...resumen.map(l => l.votos));

    resumen.forEach((item, i) => {
        const esGanador = item.votos === maxVotos;

        const estilo = esGanador
            ? "color: #FFD700; stroke-color: #b88a00; stroke-width: 3; opacity: 1" // 🎉 Barra ganadora
            : `color: ${colores[i % colores.length]}`;

        datos.push([
            item.lista,
            item.votos,
            estilo,
            item.votos
        ]);
    });

    const data = google.visualization.arrayToDataTable(datos);

    const options = {
        animation: {
            startup: true,
            duration: 900,
            easing: "out"
        },
        legend: { position: "none" },
        bar: { groupWidth: "65%" },
        hAxis: { title: "Votos", minValue: 0 },
        chartArea: { width: "80%", height: "70%" },

        // ⭐ Hover suave
        focusTarget: "category",

        annotations: {
            textStyle: {
                fontSize: 14,
                bold: true,
                color: "#333"
            }
        }
    };

    const chart = new google.visualization.ColumnChart(
        document.getElementById("resumen_chart_div")
    );
    chart.draw(data, options);
}

// =============================================
// 📊 GRAFICO 2 — VOTOS POR GRADO (barras)
// =============================================
function dibujarGraficoGrados(grados) {
    const datos = [
        ["Grado", "Votos", { role: "style" }, { role: "annotation" }]
    ];

    const colores = ["#1e3c72", "#00AEEF", "#7DD3FC", "#2563EB"];

    // 📌 Encontrar grado con mayor voto
    const maxVotos = Math.max(...grados.map(g => g.votos));

    grados.forEach((g, i) => {
        const esGanador = g.votos === maxVotos;

        const estilo = esGanador
            ? "color: #FFD700; stroke-color: #b88a00; stroke-width: 3; opacity: 1" // 🎉 Barra ganadora
            : `color: ${colores[i % colores.length]}`;

        datos.push([
            g.grado,
            g.votos,
            estilo,
            g.votos
        ]);
    });

    const data = google.visualization.arrayToDataTable(datos);

    const options = {
        animation: {
            startup: true,
            duration: 900,
            easing: "out"
        },
        legend: { position: "none" },
        bar: { groupWidth: "70%" },
        hAxis: { title: "Votos", minValue: 0 },
        chartArea: { width: "80%", height: "70%" },
        focusTarget: "category",

        annotations: {
            textStyle: {
                fontSize: 14,
                bold: true,
                color: "#333"
            }
        }
    };

    const chart = new google.visualization.ColumnChart(
        document.getElementById("pastel_grados_div")
    );
    chart.draw(data, options);
}

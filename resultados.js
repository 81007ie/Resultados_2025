
const APPS_SCRIPT_URL_BASE = 'https://script.google.com/macros/s/AKfycbzedUkwOkcNUxVhOXKCZ4cI4SYfhmr1xnYjU6xCs5YYKbKTRn2PvZaxe43KqsyraDMN/exec';

// Cargar las librerías necesarias de Google Charts
google.charts.load('current', {'packages':['corechart']});

// Establecer los callbacks para ambos gráficos
google.charts.setOnLoadCallback(drawResumenChart);
google.charts.setOnLoadCallback(drawGradosChart); // Nuevo callback

// =======================================================
// GRÁFICO 1: RESUMEN (BARRAS GRANDES) -> ?type=resumen
// =======================================================

async function fetchResumenData() {
    const url = `${APPS_SCRIPT_URL_BASE}?type=resumen`; 
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const rawData = await response.json();
        // [ ["Lista 1", 50], ["Lista 2", 30], ... ]
        return rawData.map(row => [row[0], Number(row[1])]);

    } catch (error) {
        console.error("Error al obtener datos de resumen:", error);
        document.getElementById('resumen_chart_div').innerHTML = '<p style="text-align: center; color: red;">⚠️ Error al cargar el resumen de votos.</p>';
        return null; 
    }
}

async function drawResumenChart() {
    const dataMatrix = await fetchResumenData();

    if (!dataMatrix) return;
    
    // 1. Preparar la tabla de datos
    const headers = [['Lista', 'Total de Votos']];
    const data = google.visualization.arrayToDataTable(headers.concat(dataMatrix));

    // 2. Opciones del Gráfico
    const options = {
        title: 'Total de Votos por Lista',
        // Hacerlo GRANDE y horizontal
        hAxis: {
            title: 'Votos',
            minValue: 0,
            format: '0' // Asegurar que los votos sean números enteros
        },
        vAxis: {
            title: 'Lista',
            textStyle: { fontSize: 16 }
        },
        legend: { position: 'none' },
        chartArea: {width: '75%', height: '85%'},
        animation: { duration: 1000, easing: 'out', startup: true },
        colors: ['#1e3c72'], // Color principal (azul oscuro)
    };

    // 3. Dibujar
    const chart = new google.visualization.BarChart(document.getElementById('resumen_chart_div'));
    chart.draw(data, options);
    
    // 4. Actualizar
    setTimeout(drawResumenChart, 15000); 
}


// =======================================================
// GRÁFICO 2: ANÁLISIS POR GRADOS (PASTEL PEQUEÑO) -> ?type=analisis
// =======================================================

async function fetchAnalisisData() {
    // Llama a la matriz de datos por grados
    const url = `${APPS_SCRIPT_URL_BASE}?type=analisis`; 
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();

    } catch (error) {
        console.error("Error al obtener datos de análisis detallado:", error);
        document.getElementById('pastel_grados_div').innerHTML = '<p style="text-align: center; color: red;">⚠️ Error al cargar el detalle por grados.</p>';
        return null; 
    }
}

async function drawGradosChart() {
    const rawData = await fetchAnalisisData();

    if (!rawData) return;
    
    // Asumimos que los grados son: Primero 1° a Sexto 6° (6 filas)
    const grades = ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'];
    
    const dataArray = [['Grado', 'Total Votos']];

    // Iteramos sobre las filas de la matriz (B2:E7) para SUMAR los votos de cada grado
    for (let i = 0; i < rawData.length; i++) {
        const totalVotosPorGrado = rawData[i].reduce((sum, current) => sum + Number(current), 0);
        dataArray.push([grades[i], totalVotosPorGrado]);
    }
    
    const data = google.visualization.arrayToDataTable(dataArray);

    // 2. Opciones del Gráfico de Torta/Pastel
    const options = {
        title: 'Distribución de la Participación por Grado',
        pieHole: 0.4, // Gráfico de donut, más moderno
        is3D: false,
        legend: { position: 'right', alignment: 'center' },
        chartArea: {width: '100%', height: '90%'},
        animation: { duration: 1000, easing: 'out', startup: true },
        // Colores personalizados
        colors: ['#6EC1E4', '#00AEEF', '#1e3c72', '#E53935', '#FBC02D', '#9E9E9E'], 
    };

    // 3. Dibujar
    const chart = new google.visualization.PieChart(document.getElementById('pastel_grados_div'));
    chart.draw(data, options);
    
    // 4. Actualizar
    setTimeout(drawGradosChart, 15000); 
}
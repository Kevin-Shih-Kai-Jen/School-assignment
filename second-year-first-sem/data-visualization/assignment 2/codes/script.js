const GRAPH_AMOUNT = 10;

// Define a global theme for Vega-Lite that matches the CSS
const vegaTheme = {
    background: "transparent",
    title: {
        font: "Rajdhani",
        fontSize: 20,
        fontWeight: 600,
        color: "#ffae00",
        anchor: "start",
        offset: 20
    },
    axis: {
        labelFont: "Inter",
        titleFont: "Rajdhani",
        gridColor: "rgba(255, 255, 255, 0.1)",
        tickColor: "rgba(255, 255, 255, 0.2)",
        labelColor: "#94a3b8",
        titleColor: "#f1f5f9",
        domainColor: "rgba(255, 255, 255, 0.2)",
        grid: true
    },
    legend: {
        labelFont: "Inter",
        titleFont: "Rajdhani",
        labelColor: "#94a3b8",
        titleColor: "#f1f5f9"
    },
    view: {
        stroke: "transparent"
    },
    range: {
        category: ["#ffae00", "#00bfff", "#f87171", "#34d399", "#a78bfa"],
        heatmap: ["#0b0e14", "#ffae00"]
    },
    // Specific contrast fixes for dark mode
    boxplot: {
        box: { fill: "#1a1f2e", stroke: "#f1f5f9" },
        median: { stroke: "#ffae00", strokeWidth: 2 },
        whisker: { stroke: "#f1f5f9" },
        outliers: { fill: "#f1f5f9", stroke: "transparent" }
    },
    bar: {
        cornerRadius: 4,
        fill: "#00bfff"
    },
    line: {
        strokeWidth: 3,
        stroke: "#00bfff"
    },
    point: {
        filled: true,
        size: 80
    }
};

for (let i = 1; i <= GRAPH_AMOUNT; i++) {
    const id = `#graph_${i}`;
    const data_path = `./chart_json/graph${i}.json`;

    const el = document.querySelector(id);
    if (!el) continue;

    el.innerHTML = '';
    
    vegaEmbed(id, data_path, { 
        config: vegaTheme,
        actions: false,
        width: "container" // Ensure responsive container width
    })
    .then(result => {
        console.log(`Loaded Graph ${i}`);
    })
    .catch(err => {
        console.error(`Error loading Graph ${i}:`, err);
    });
}

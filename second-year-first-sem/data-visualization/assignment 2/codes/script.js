const GRAPH_AMOUNT = 10

for (let i = 1; i < GRAPH_AMOUNT + 1; i++){
    const id = `#graph_${i}`
    const data_path = `./chart_json/graph${i}.json`

    document.querySelector(id).innerHTML = '';
    
    vegaEmbed(id, data_path)
    .then(result => {
        console.log("Successfully load the graph");
    })
    .catch(console.error);
}

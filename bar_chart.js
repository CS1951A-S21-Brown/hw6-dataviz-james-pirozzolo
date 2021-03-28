let width = 900
    height = 350;

const margin = {top: 40, right: 100, bottom: 40, left: 175};

let svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width)     // HINT: width
    .attr("height", height)     // HINT: height
    .attr("float", "left")
    .append("g")
    .attr("transform", 'translate(250, 40)')    // HINT: transform
    .attr("width", width-margin.left-margin.right-200);

let percentile_chart = d3.select("#slider-cont").append("rect")
    .attr("x", 0)
    .attr("y", 0)
    //.attr("color", "black")
    .attr("background-color", "#ffffff");

svg.append("text")
    .attr("transform", "translate(300, 300)")       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .style("color", "#e0f2e9")
    .text("Count");

svg.append("text")
    .attr("transform", "translate(-200, 30)")       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle")
    .style("color", "#e0f2e9")
    .text("Game");


let y_axis_label = svg.append("g");

let x = d3.scaleLinear()
    .range([0, width-margin.left-margin.right]);

let y = d3.scaleBand()
    .range([0, height-margin.top-margin.bottom])
    .padding(0.1);  // Improves readability

function setData(year) {
    d3.csv("data/video_games.csv").then(function(data) {  
        percentiles=getSalesPercentiles(data, year);
        document.getElementById("#yr").innerText="Sales Percentiles in " + year;
        document.getElementById("#25").innerText="25th percentile: " + percentiles['one'].toFixed(2) + " million";
        document.getElementById("#50").innerText="50th percentile: " + percentiles['two'].toFixed(2) + " million";
        document.getElementById("#75").innerText="75th percentile: " + percentiles['three'].toFixed(2) + " million";
        document.getElementById("#90").innerText="90th percentile: " + percentiles['four'].toFixed(2) + " million";
        document.getElementById("#99").innerText="99th percentile: " + percentiles['five'].toFixed(2) + " million";
    });
    

    d3.csv("data/video_games.csv").then(function(data) {
        data = cleanData(data, year)

        x.domain([0, d3.max(data, function(d) { return d.value})]);
        y.domain(data.map(function(d) { return d.key }));
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.key }))
            .range(d3.quantize(d3.interpolateHcl("#A17C6B", "#CEB5A7"), 10));

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        var popup = d3.select("body").append("div").attr("class", "popup");
        let bars = svg.selectAll("rect").data(data);

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d.key) })
            .attr("x", x(0))
            .attr("y", function(d) { return y(d.key) })               // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function(d) { return d.value * 7 })
            .attr("height",  y.bandwidth());  
        
        bars.exit().remove();

        svg.selectAll("rect")
            .on("mousemove", function(d) {
                popup
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .style("color", "#5B7B7A")
                    .html("Global Sales: "+d.value.toFixed(2)+" million");
            })
            .on("mouseout", function(d){ popup.style("display", "none");});

    })
}

function cleanData(data, year) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    filtered = data.filter(function(d) { return d.Year == year })
    var groupedByName = d3.nest()
        .key(d => { return d.Name })
        .rollup(v => d3.sum(v, d => d.Global_Sales))
        .entries(filtered)
        .sort((a, b)=>{ return b.value - a.value });
    return groupedByName.slice(0, 10);
}

function getSalesPercentiles(data, year) {
    filtered = data.filter(function(d) { return d.Year == year })
    var groupedByName = d3.nest()
        .key(d => {return d.Name })
        .rollup(v => d3.sum(v, d => d.Global_Sales))
        .entries(filtered)
        .sort((a, b) => {return b.value - a.value } );

    let n = groupedByName.length
    return {"one": groupedByName[Math.round(0.75*n)].value, "two": groupedByName[Math.round(0.5*n)].value, "three": groupedByName[Math.round(0.25*n)].value, "four": groupedByName[Math.round(0.1*n)].value, "five": groupedByName[Math.round(0.01*n)].value };
    
}

setData(2006);
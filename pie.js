
// append the svg object to the div called 'my_dataviz'
var svg3 = d3.select("#pie")
  .append("svg")
    .attr("width", 1000)
    .attr("height", 500)
  .append("g")
    .attr("transform", "translate(650,250)");

function drawPie(genre) {
    d3.csv("data/video_games.csv").then(function(data) {
        genres = getAllGenres(data);
        console.log(genres);
        data = getGenreData(data, genre);

        var pie = d3.pie()
            .value((d) => { return d.value })
            .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) ;
        
        var pie_build = pie(d3.entries(data));

        var u = svg3.selectAll("path").data(pie_build);

        u
            .enter()
            .append('path')
            .merge(u)
            .transition()
            .duration(1000)
            .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(200)
            )
            .attr('fill', '#A17C6B')
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 1)

        u.exit().remove();
        var popup = d3.select("body").append("div").attr("class", "popup");
        svg3.selectAll("path")
            .on("mousemove", function(d) {
                popup
                    .style("left", d3.event.pageX - 50 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .style("color", "#5B7B7A")
                    .html(d.data.key + ': global ' + genre.toLowerCase() + ' sales: '+ d.value.toFixed(2) + ' million');
            })
            .on("mouseout", function(d){ popup.style("display", "none");});

    })


}

// Initialize the plot with the first dataset
drawPie("Sports")

function getGenreData(data, genre) {
    var filtered = data.filter((d) => { return d.Genre == genre});

    var groupedByPublisher = d3.nest()
        .key(d => {return d.Publisher})
        .rollup(v => d3.sum(v, d => d.Global_Sales))
        .entries(filtered)
        .sort((a, b) => { return b.value - a.value } )
        .slice(0,10);

    console.log(groupedByPublisher);
    ret = {};
    for(var i in groupedByPublisher) ret[groupedByPublisher[i]['key']] = groupedByPublisher[i]['value'];
    return ret

}

function getAllGenres(data) {
    var genres = d3.nest().key(d => {return d.Genre}).entries(data);
    console.log(genres)
    ret = [];
    for(var i in genres) ret.push(genres[i].key);
    return ret
}
let svg_map = d3.select("#map")
    .append("svg")
    .attr("width", width)     // HINT: width
    .attr("height", height)     // HINT: height
    .attr("transform", "translate(200, 50)")
    .attr("margin", "5%");

var projection = d3.geoMercator()
  .center([0, 20])
  .translate([width/2, height/2]);
var path = d3.geoPath().projection(projection);

var countries=d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")

let load_csv = d3.csv("data/video_games.csv").then(function(data) { return genreClean(data);});

//because I need both countries and csv data I asynchronously load them with a promise (makes all data thenable)
Promise.all([countries, load_csv]).then(function(data) {
    genre_data = data[1];
    var popup = d3.select("body").append("div").attr("class", "popup");

  let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
    popup
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .style("color", "#5B7B7A")
        .text((a) => {
                let eu_codes = ["AUT", "BEL", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "IRL", "ITA", "LVA", "LTU", "LUX", "MLT", "NLD", "POL", "PRT", "ROU", "SVK", "SVN", "ESP", "SWE"];
                if (d['id'] == "USA" || d.id == "CAN" || d.id == "MEX") {
                    return "North America's Favorite Genre: " + genre_data[0].na;
                }
                else if (eu_codes.includes(d.id)) {
                    return "Europe's Favorite Genre: " + genre_data[0].eu;
                }
                else if (d.id == "JPN") {
                    return "Japan's Favorite Genre: " + genre_data[0].jpn
                }
                else {
                    return "Rest of the world's Favorite Genre: " + genre_data[0].rest
                }
            }
        );  
  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
    popup
        .style('display', 'none')
  }

  // Draw the map
  svg_map.append("g")
    .selectAll("path")
    .data(data[0].features)
    .enter()
    .append("path")
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .attr("fill", "#A17C6B")
      .style("stroke", "black")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
    })
 

function genreClean(data) {
    //need to accumulate data into four regions - NA, EU, JPN, Rest
    var NA_groupedByGenre = d3.nest()
        .key((d)=>{return d.Genre})
        .rollup((v)=>d3.sum(v, d=>{return d.NA_Sales}))
        .entries(data)
        .sort((a, b)=>{ return b.value - a.value });
    var EU_groupedByGenre = d3.nest()
        .key((d)=>{return d.Genre})
        .rollup((v)=>d3.sum(v, d=>{return d.EU_Sales}))
        .entries(data)
        .sort((a, b)=>{ return b.value - a.value });
    var JPN_groupedByGenre = d3.nest()
        .key((d)=>{return d.Genre})
        .rollup((v)=>d3.sum(v, d=>{return d.JPN_Sales}))
        .entries(data)
        .sort((a, b)=>{ return b.value - a.value });
    var Rest_groupedByGenre = d3.nest()
        .key((d)=>{return d.Genre})
        .rollup((v)=>d3.sum(v, d=>{return d.Other_Sales}))
        .entries(data)
        .sort((a, b)=>{ return b.value - a.value });

    var to_return = [{'na': NA_groupedByGenre[0]['key'], 'eu': EU_groupedByGenre[0]['key'], 'jpn': JPN_groupedByGenre[0]['key'], 'rest': Rest_groupedByGenre[0]['key']}];
    return to_return;
    
    
}
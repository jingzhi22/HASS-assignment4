

let width = 1000, height = 600;
let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Map and projection
var path = d3.geoPath();

// Data and color scale
var numScale = [10000, 30000, 50000, 70000, 90000];
const colorScale = d3.scaleThreshold()
	.domain(numScale)
	.range(d3.schemeOrRd[6]);

Promise.all([
    d3.json("sgmap.json"), 
    d3.csv("population2021.csv")
]).then(data => {

    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[20, 20], [980, 580]], data[0]);
    let geopath = d3.geoPath().projection(projection);

    // define tooltip
    var Tooltip = d3.select("body").append("div")
        .attr("class", "Tooltip")
        .style("opacity", 0);
    
    // Define mouseOvers
    let mouseOver = function(event, d){
        Tooltip.transition()
            .style("opacity", .9);
        Tooltip.html(
            "Name: " + d.properties["Subzone Name"].toUpperCase() + "<br/>" +
            "Popoulation: " + popDict[d.properties["Subzone Name"].toUpperCase()]
            )
        .style("left", (event.pageX + 30) + "px")
        .style("top", (event.pageY - 20) + "px");
    }

    let mouseLeave = function(d){
        Tooltip.transition()
            .style("opacity", 0);
    }

    // Do some data cleanup for easy referencing
    var popDict = {};
    for(var i = 0; i < 332; i++){
      popDict[data[1][i].Subzone.toUpperCase()] = Math.round(data[1][i].Population);
    }
    
    svg.append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
          .attr("d", geopath)
          .attr("fill", function(d) { 
            return colorScale(popDict[d.properties["Subzone Name"].toUpperCase()])
          })
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)

    for(var i = 0; i < 6; i++){
      svg.append("circle")
        .attr("cx",850)
        .attr("cy",450 + i*25)
        .attr("r", 10)
        .style("fill", d3.schemeOrRd[6][i])
      
      if(i==0){
        svg.append("text")
          .attr("x", 870)
          .attr("y", 450 + i*25)
          .text("p < " + numScale[i])
          .style("font-size", "15px")
          .attr("alignment-baseline","middle")
          .attr("text-anchor", "start")
      }
      else if(i==5){
        svg.append("text")
          .attr("x", 870)
          .attr("y", 450 + i*25)
          .text("p > " + numScale[i-1])
          .style("font-size", "15px")
          .attr("alignment-baseline","middle")
          .attr("text-anchor", "start")
      }
      else{
        svg.append("text")
          .attr("x", 870)
          .attr("y", 450 + i*25)
          .text(numScale[i-1] + " < p < " + numScale[i])
          .style("font-size", "15px")
          .attr("alignment-baseline","middle")
          .attr("text-anchor", "start")
      }
      
    }
})
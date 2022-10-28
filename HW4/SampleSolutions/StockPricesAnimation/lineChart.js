
// Set the dimensions of the canvas / graph
var margin = {top: 50, right: 120, bottom: 100, left: 80},
    width = 700 - margin.left - margin.right,
    height = 370 - margin.top - margin.bottom;

    
// Adds the svg canvas
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

// Parse the date / time
var parseDate = d3.time.format("%x").parse;

// Set the ranges of x-y scales
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define x-y axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(12);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5, "$");


// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

// x grid lines
function gridXaxis() {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
}

// y grid lines
function gridYaxis() {
  return d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
}

// Get the data
d3.csv("apple.csv", function(error, data) {
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.close = +d.close;
    });

    
 // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.close; })]);

  // Draw the x Grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(gridXaxis()
            .tickSize(-height, 0, 0)
            .tickFormat("")
        )

    // Draw the y Grid lines
    svg.append("g")            
        .attr("class", "grid")
        .call(gridYaxis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
        )

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .style("stroke", "red")
        .attr("d", valueline(data))
    .transition()
        .duration(4000)
        .attrTween('d', pathTween);
    
    function pathTween() {
        var interpolate = d3.scale.quantile()
                .domain([0,1])
                .range(d3.range(0, data.length-1));
        return function(t) {
            return valueline(data.slice(0, interpolate(t)));
        };
    }
    
    
    
    svg.append("text")
        .attr("transform", "translate("+(width+3)+","+y(data[0].open)+")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("fill", "red")
        .text("Apple");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".05em")
        .attr("transform", "rotate(-60)" )
        .style("text-anchor", "end")

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -130)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Stock Prices ($)");
    
});




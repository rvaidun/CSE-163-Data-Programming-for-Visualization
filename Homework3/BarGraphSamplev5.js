/* ----------------------------------------------------------------------------
File: BarGraphSample.js
Contructs the Bar Graph using D3
80 characters perline, avoid tabs. Indet at 4 spaces. See google style guide on
JavaScript if needed.
-----------------------------------------------------------------------------*/

// Search "D3 Margin Convention" on Google to understand margins.
// Add comments here in your own words to explain the margins below
// The margins are defined as an object with top, right, bottom, and left properties.
// The margins are used to define the space between the graph and the edges of the svg.
// We set the total width to be the width allocated for the graph - the left margin - the right margin.
// We set the total height to be the height allocated for the graph - the top margin - the bottom margin.
var margin = { top: 10, right: 40, bottom: 150, left: 50 },
  width = 760 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Define SVG. "g" means group SVG elements together.
// Add comments here in your own words to explain this segment of code
// We create an svg element with the width and height defined above.
// We then create a group element within the svg element and translate it by the left and top margins.
// This is done so that the graph is not drawn on top of the margins.
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* --------------------------------------------------------------------
SCALE and AXIS are two different methods of D3. See D3 API Refrence and 
look up SVG AXIS and SCALES. See D3 API Refrence to understand the 
difference between Ordinal vs Linear scale.
----------------------------------------------------------------------*/

// Define X and Y SCALE.
// Add comments in your own words to explain the code below
// We create a linear scale for the x axis and a band scale for the y axis.
// This is similar to a function that maps a value to a position on the axis.
var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);

// same thing as above but for the y axis
var yScale = d3.scaleLinear().range([height, 0]);

// Define X and Y AXIS
// Define tick marks on the y-axis as shown on the output with an interval of 5 and $ sign
var xAxis = d3.axisBottom(xScale);
var yAxis = d3
  .axisLeft(yScale)
  .ticks(5)
  .tickFormat(function (d) {
    // tickFormat is a method of the axis object to format the tick values
    return "$" + d; // Add $ sign to the tick values
  });

/* --------------------------------------------------------------------
To understand how to import data. See D3 API refrence on CSV. Understand
the difference between .csv, .tsv and .json files. To import a .tsv or
.json file use d3.tsv() or d3.json(), respectively.
----------------------------------------------------------------------*/

// data.csv contains the country name(key) and its GDP(value)
// d.key and d.value are very important commands
// You must provide comments here to demonstrate your understanding of these commands

// d.key will be used to label the x-axis
// d.value will be used to label the y-axis
// in this example the x-axis is the country name and the y-axis is the GDP

function rowConverter(data) {
  return {
    key: data.country,
    value: +data.gdp,
  };
}

d3.csv("GDP2022TrillionUSDollars.csv", rowConverter).then(function (data) {
  // Return X and Y SCALES (domain). See Chapter 7:Scales (Scott M.)
  xScale.domain(
    data.map(function (d) {
      return d.key; // key is country name
    })
  );
  yScale.domain([
    0,
    d3.max(data, function (d) {
      return d.value; // value is GDP
    }),
  ]);

  // Creating rectangular bars to represent the data.
  // Add comments to explain the code below
  svg
    .selectAll("rect")
    .data(data) // binds the data to the svg elements
    .enter()
    .append("rect") // creates a rectangle for each data point
    .transition() // adds a transition effect to the bars
    .duration(1000)
    .delay(function (d, i) {
      return i * 200; // adds a delay to each bar
    })
    .attr("x", function (d) {
      return xScale(d.key); // sets the x position of the bar
    })
    .attr("y", function (d) {
      return yScale(d.value); // sets the y position of the bar
    })
    .attr("width", xScale.bandwidth()) // sets the width of the bar
    .attr("height", function (d) {
      return height - yScale(d.value); // sets the height of the bar
    });
  // create increasing to decreasing shade of blue as shown on the output
  svg.selectAll("rect").attr("fill", function (d, i) {
    return "rgb(0, 0, " + Math.round((i * 255) / 10 + 100) + ")";
  });

  // Label the data values(d.value) inside the bars as shown on the output
  svg
    .selectAll("text")
    .data(data) // binds the data to the svg elements
    .enter()
    .append("text")
    .text(function (d) {
      return d.value; // sets the text to the value of the data point
    })
    .attr("x", function (d) {
      return xScale(d.key) + xScale.bandwidth() / 2; // sets the x position of the text
    })
    .attr("y", function (d) {
      return yScale(d.value) + 14; // sets the y position of the text
    })
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .attr("font-family", "sans-serif");

  // Draw xAxis and position the label at -60 degrees as shown on the output
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("dx", "-.8em")
    .attr("dy", ".25em")
    .style("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("transform", "rotate(-60)");

  // Draw yAxis and position the label
  svg.append("g").attr("class", "y axis").call(yAxis);

  // text label for the y axis
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("GDP in Trillion US Dollars");
});

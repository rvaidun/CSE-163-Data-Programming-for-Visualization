// (i) pan+drag, (ii) zoom-in and zoom-out, and (iii) country name/tooltip are all supported

// define variable names
let sdata;
let xdomain,
  ydomain,
  xAxis,
  yAxis,
  xScale,
  yScale,
  gX,
  gY,
  circles,
  countrynames;
// Define Margins for SVG
var margin = { left: 80, right: 80, top: 50, bottom: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// wait for the html to be loaded and then load the csv
document.addEventListener("DOMContentLoaded", () => {
  d3.csv("scatterdata.csv", d3.autoType).then((data) => {
    sdata = data;
    console.log(sdata);
    // get domain for x and y
    xdomain = d3.extent(sdata, (d) => d.gdp);
    ydomain = d3.extent(sdata, (d) => d.ecc);

    drawChart();
  });
});

function drawChart() {
  //Define SVG
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Define Scales
  xScale = d3.scaleLinear().domain(xdomain).range([0, width]);
  yScale = d3.scaleLinear().domain(ydomain).range([height, 0]);
  //   return;

  // define Color Scale
  var colorScale = d3
    .scaleOrdinal()
    .domain(sdata.map((d) => d.country))
    .range(d3.schemeCategory10);
  //Define Tooltip here
  var tooltip = d3.select(".tooltip");
  //Define Axis
  xAxis = d3.axisBottom().scale(xScale).tickPadding(2);
  yAxis = d3.axisLeft().scale(yScale).tickPadding(2);
  // define zoom
  var zoom = d3
    .zoom()
    .scaleExtent([1, 40])
    .translateExtent([
      [-100, -100],
      [width + 200, height + 200],
    ])
    .on("zoom", zoomed);

  //x-axis
  gX = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  gX.append("text")
    .attr("class", "label")
    .attr("y", 30)
    .attr("x", width / 2)
    .style("text-anchor", "middle")
    .style("fill", "black")
    .attr("font-size", "12px")
    .text("GDP (in Trillion US Dollars) in 2010");

  //Y-axis
  gY = svg.append("g").attr("class", "y axis").call(yAxis);
  gY.append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -50)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("font-size", "12px")
    .style("fill", "black")
    .text("Energy Consumption per Capita (in Million BTUs per person)");

  //Draw Scatterplot

  circles = svg
    .selectAll("circle")
    .data(sdata)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.gdp))
    .attr("cy", (d) => yScale(d.ecc)) // y axis has the energy consumption per capita
    .attr("r", (d) => d.ec / 2) // size of the circle is proportional to the energy consumption
    .attr("fill", (d) => colorScale(d.country))
    .attr("opacity", 0.8)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("text-color", "black")
    .on("mouseover", function (d) {
      d3.select(this).attr("fill", "red");
      tooltip.transition().duration(50).style("opacity", 1); // show tooltip when moused over

      //tthtml will contain the content of the tooltip
      var tthtml = "";
      // center align the country name in tthtml
      tthtml += "<center><b>" + d.country + "</b></center>";
      tthtml += "<div>";
      tthtml += `
      <span style="text-align:left;"> Population </span>
      <span style="text-align:center;"> : </span>
        <span style="text-align:right;"> ${d.population} million</span>
        </br>
      `;
      tthtml += `
        <span style="text-align:left;"> GDP </span>
        <span style="text-align:center;"> : </span>
        <span style="text-align:right;"> ${d.gdp} trillion</span>
        `;
      tthtml += `
        <br/>
        <span style="text-align:left;"> ECC </span>
        <span style="text-align:center;"> : </span>
        <span style="text-align:right;"> ${d.ecc} million BTUs</span>
        `;
      tthtml += `
        <br/>
        <span style="text-align:left;"> Total EC </span>
        <span style="text-align:center;"> : </span>
        <span style="text-align:right;"> ${d.ec} trillion BTUs</span>
        `;
      tthtml += "</div>";

      tooltip.html(tthtml);
    })
    .on("mousemove", () => {
      // move tooltip with mouse
      tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", function (d) {
      // hide tooltip when mouse is out of circle
      d3.select(this).attr("fill", colorScale(d.country));
      tooltip.transition().duration(50).style("opacity", 0);
    });

  // add country name to each circle
  countrynames = svg
    .selectAll(".text")
    .data(sdata)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d.gdp))
    .attr("y", (d) => yScale(d.ecc))
    .attr("dx", 10)
    .attr("dy", 5)
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text((d) => d.country);

  // Add three circles corresponding to three different sizes of the “total gdp”
  //     And place them appropriately so that they do not cover the data.
  // Steps to create Legend are:
  // • Append a rectangle to SVG and position the legend box.
  // • Add three circles and position them accordingly
  // • Append text to denote the value of each circle size
  // • Append text to display the legend title

  // This is the rectangle
  svg
    .append("rect")
    .attr("x", width - 100)
    .attr("y", height - 180)
    .attr("width", 180)
    .attr("height", 175)
    .attr("fill", "lightgray")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Circle for 1 Trillion BTUs
  svg
    .append("circle")
    .attr("cx", width - 50)
    .attr("cy", height - 150)
    .attr("r", 1 / 2)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg
    .append("text")
    .attr("x", width - 43)
    .attr("y", height - 147)
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text("1 trillion BTUs");

  // 10 trillion
  svg
    .append("circle")
    .attr("cx", width - 50)
    .attr("cy", height - 130)
    .attr("r", 10 / 2)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg
    .append("text")
    .attr("x", width - 38)
    .attr("y", height - 127)
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text("10 trillion BTUs");

  // 100 trillion
  svg
    .append("circle")
    .attr("cx", width - 45)
    .attr("cy", height - 70)
    .attr("r", 100 / 2)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg
    .append("text")
    .attr("x", width + 5)
    .attr("y", height - 70)
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text("100 trillion BTUs");

  // Legend Title
  svg
    .append("text")
    .attr("x", width - 80)
    .attr("y", height - 10)
    .attr("font-size", "12px")
    .attr("fill", "green")
    .text("Total Energy Consumption");

  //Scale Changes as we Zoom
  d3.select("svg").call(zoom);
  console.log();
}

function zoomed(e) {
  // when svg is zoomed this function runs
  const transform = d3.event.transform;

  // update the x and y axis
  gX.call(xAxis.scale(transform.rescaleX(xScale)));
  gY.call(yAxis.scale(transform.rescaleY(yScale)));

  // update the circles and country names
  circles.attr("transform", transform);
  countrynames.attr("transform", transform);
}

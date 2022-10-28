let bricsdata;
let wbricsdata;
let countrynames = [];
document.addEventListener("DOMContentLoaded", () => {
  d3.csv("BRICSdata.csv", d3.autoType).then((data) => {
    // loaded data
    var parseTime = d3.timeParse("%Y");
    bricsdata = data;
    console.log(bricsdata);
    console.log("data loaded");
    wbricsdata = bricsdata.map((country) => {
      let new_data = {};
      let n;
      values = [];
      Object.keys(country).forEach((key) => {
        if (key != "Country Name") {
          n = +key;
          if (country[key] != null && n >= 2000 && n <= 2014)
            values.push({ year: parseTime(key), value: country[key] });
        } else {
          new_data["Country Name"] = country[key];
          countrynames.push(country[key]);
        }
      });
      new_data["values"] = values;
      return new_data;
    });
    console.log(wbricsdata);
    drawChart();
  });
});

const drawChart = () => {
  // remove everything in the #dataviz div
  d3.select("#dataviz").selectAll("*").remove();
  var margin = { top: 30, right: 200, bottom: 90, left: 90 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var color = d3.scaleOrdinal().domain(countrynames).range(d3.schemeCategory10);

  // append the svg object to the body of the page
  var svg = d3
    .select("#dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // X axis is scale of years from 1971 to 2014
  var x = d3
    .scaleTime()
    .domain([new Date(2000, 0, 1), new Date(2014, 0, 1)])
    .range([0, width]);

  // create an xaxis grid
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .attr("stroke", "grey")
    .attr("stroke-opacity", 0.3)
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

  // Add Y axis. Use Extent to get the min and max of the data
  var y = d3
    .scaleLinear()
    .domain([
      d3.min(bricsdata.map((country) => d3.min(Object.values(country)))),
      d3.max(bricsdata.map((country) => d3.max(Object.values(country)))),
    ])
    .range([height, 0]);

  // create a yaxis grid
  svg
    .append("g")
    .attr("class", "grid")
    .attr("stroke", "grey")
    .attr("stroke-opacity", 0.3)
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  svg.append("g").call(d3.axisLeft(y));

  // Add the lines
  // animate the line from left to right
  const transitionPath = d3.transition().ease(d3.easeSin).duration(2500);

  svg
    .selectAll(".line")
    .data(wbricsdata)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (d) => color(d["Country Name"]))
    .attr("stroke-width", 2)

    // add a transition to the lines
    .attr("d", (d) =>
      d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.value))(d.values)
    )
    .call(transition);

  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width - 400)
    .attr("y", height + 40)
    .text("Year");

  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -45)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Energy Consumption per Capita in Million BTUs per person");

  svg
    .selectAll("mydots")
    .data(countrynames)
    .enter()
    .append("circle")
    .attr("cx", width + 10)
    .attr("cy", function (d, i) {
      return 100 + i * 25;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) {
      return color(d);
    });

  // Add one dot in the legend for each name.
  svg
    .selectAll("mylabels")
    .data(countrynames)
    .enter()
    .append("text")
    .attr("x", width + 20)
    .attr("y", function (d, i) {
      return 100 + i * 25;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
      return color(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Energy Consumption vs Year");
};

function transition(path) {
  path
    .transition()
    .duration(1000)
    .attrTween("stroke-dasharray", tweenDash)
    .on("end", () => {
      d3.select(this).call(transition);
    });
}
function tweenDash() {
  const l = this.getTotalLength(),
    i = d3.interpolateString("0," + l, l + "," + l);
  console.log("l is ", l);
  return function (t) {
    return i(t);
  };
}

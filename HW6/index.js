// This is code from this link: https://bl.ocks.org/vasturiano/12da9071095fbd4df434e60d52d2d58d
// Starting code makes the sunburst chart already zoomable
// Using this json: https://www.anychart.com/products/anychart/gallery/Sunburst_Charts/Coffee_Flavour_Wheel.php
// Used Arad Levin's, alevin4@ucsc.edu, help on parsing the new json file
// Used Ernest Jinian's, ejinian@ucsc.edu,  help on knowing the syntax for d3 version 4.
// Most of which involved changing d.data.attribute to d.data.treeDataItemData.attribute

// setting svg size
const width = window.innerWidth,
  height = window.innerHeight,
  maxRadius = Math.min(width, height) / 2 - 5;

const formatNumber = d3.format(",d");

const x = d3
  .scaleLinear()
  .range([0, 2 * Math.PI])
  .clamp(true);

const y = d3.scaleSqrt().range([maxRadius * 0.1, maxRadius]);

const color = d3.scaleOrdinal(d3.schemeCategory20);

const partition = d3.partition();

const arc = d3
  .arc()
  .startAngle((d) => x(d.x0))
  .endAngle((d) => x(d.x1))
  .innerRadius((d) => Math.max(0, y(d.y0)))
  .outerRadius((d) => Math.max(0, y(d.y1)));

// the middleArcLine function is used to draw lines connecting nodes in the same lineage
const middleArcLine = (d) => {
  const halfPi = Math.PI / 2;
  const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
  const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

  const middleAngle = (angles[1] + angles[0]) / 2;
  const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
  if (invertDirection) {
    angles.reverse();
  }

  const path = d3.path();
  path.arc(0, 0, r, angles[0], angles[1], invertDirection);
  return path.toString();
};

// the textFits function determines whether or not the text will fit within the slice, hides it if it doesn't
const textFits = (d) => {
  const CHAR_SPACE = 6;

  const deltaAngle = x(d.x1) - x(d.x0);
  const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
  const perimeter = r * deltaAngle;

  return d.data.treeDataItemData.name.length * CHAR_SPACE < perimeter - 3;
};

const svg = d3
  .select("body")
  .append("svg")
  .style("width", "100vw")
  .style("height", "100vh")
  .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
  .on("click", () => focusOn());

// getting data from json file
d3.json("coffeedata.json", (error, root) => {
  if (error) throw error;

  // help from Arad Levin, alevin4@ucsc.edu, for this line
  // also for telling me that d.data should be d.data.treeDataItemData
  root = d3.hierarchy(root.chart.treeData);
  root.sum((d) => 100);

  const slice = svg.selectAll("g.slice").data(partition(root).descendants());

  slice.exit().remove();
  var tooltip = d3.select(".tooltip");

  const newSlice = slice
    .enter()
    .append("g")
    .attr("class", "slice")
    // add text
    // .text(d => d.data.treeDataItemData.name)
    .on("click", (d) => {
      d3.event.stopPropagation();
      focusOn(d);
    })
    .on("mouseover", function (d) {
      console.log(d);
      d3.select(this).attr("fill", "red");
      tooltip
        .style("opacity", 1)
        .html(
          "<b>" +
            d.data.treeDataItemData.name +
            "</b>" +
            "<br>" +
            "Value: " +
            d.value +
            "<br>" +
            "Children: " +
            d.children.length +
            "<br>" +
            "Color: " +
            d.data.treeDataItemData.fill +
            "<br>" +
            "Depth: " +
            d.depth +
            "<br>" +
            "ID: " +
            d.data.treeDataItemData.id +
            "<br>"
        );
    })
    .on("mousemove", function (d) {
      tooltip
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 15 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("fill", "black");
      tooltip.style("opacity", 0);
    });

  newSlice
    .append("title")
    .text(
      (d) =>
        d.data.treeDataItemData.name + "\n" + formatNumber(d.treeDataItemData)
    );

  newSlice
    .append("p")
    .attr("class", "main-arc")
    .attr("dy", "10px")
    .attr("display", (d) => (textFits(d) ? null : "none"))
    .text((d) => d.data.treeDataItemData.name);

  newSlice
    .append("path")
    .text((d) => d.data.treeDataItemData.name)
    .attr("class", "main-arc")
    .style("fill", (d) =>
      color((d.children ? d : d.parent).data.treeDataItemData.name)
    )
    .attr("d", arc);

  newSlice
    .append("path")
    .attr("class", "hidden-arc")
    .attr("id", (_, i) => `hiddenArc${i}`)
    .attr("d", middleArcLine);

  const text = newSlice
    .append("text")
    .attr("display", (d) => (textFits(d) ? null : "none"));

  text
    .append("textPath")
    .attr("startOffset", "50%")
    .attr("xlink:href", (_, i) => `#hiddenArc${i}`)
    .text((d) => d.data.treeDataItemData.name);
});

function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
  console.log("focusing");
  console.log(d);

  const transition = svg
    .transition()
    .duration(1000)
    .tween("scale", () => {
      const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
        yd = d3.interpolate(y.domain(), [d.y0, 1]);
      return (t) => {
        x.domain(xd(t));
        y.domain(yd(t));
      };
    });

  transition.selectAll("path.main-arc").attrTween("d", (d) => () => arc(d));

  transition
    .selectAll("path.hidden-arc")
    .attrTween("d", (d) => () => middleArcLine(d));

  transition
    .selectAll("text")
    // call textFits function to determine if text will fit
    .attrTween("display", (d) => () => textFits(d) ? null : "none");

  moveStackToFront(d);

  function moveStackToFront(elD) {
    svg
      .selectAll(".slice")
      .filter((d) => d === elD)
      .each(function (d) {
        this.parentNode.appendChild(this);
        if (d.parent) {
          moveStackToFront(d.parent);
        }
      });
  }
}

// Display tooltip
function toolTipFunc(d) {
  console.log(d);
  if (d) {
    tooltip
      .style("opacity", 1)
      .html("<p>" + d.data.name + "</p>")
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px");
    tooltip
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px");
  }
}

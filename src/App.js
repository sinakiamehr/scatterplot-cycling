import "./App.css";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function App() {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tooltipRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const containerWidth = window.innerWidth * 0.9;
    const width = containerWidth > 800 ? 800 : containerWidth;
    const height = width * 0.6;
    const padding = 50;

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background", "#darkgrey");

    svg.selectAll("*").remove();

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (d) => new Date(d.Year, 0, 1)),
        d3.max(data, (d) => new Date(d.Year, 0, 1)),
      ])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleTime()
      .domain([
        d3.min(
          data,
          (d) =>
            new Date(1970, 0, 1, 0, d.Time.split(":")[0], d.Time.split(":")[1])
        ),
        d3.max(
          data,
          (d) =>
            new Date(1970, 0, 1, 0, d.Time.split(":")[0], d.Time.split(":")[1])
        ),
      ])
      .range([height - padding, padding]);

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("data-xvalue", (d) => new Date(d.Year, 0, 1))
      .attr(
        "data-yvalue",
        (d) =>
          new Date(1970, 0, 1, 0, d.Time.split(":")[0], d.Time.split(":")[1])
      )
      .attr("cx", (d) => xScale(new Date(d.Year, 0, 1)))
      .attr("cy", (d) =>
        yScale(
          new Date(1970, 0, 1, 0, d.Time.split(":")[0], d.Time.split(":")[1])
        )
      )
      .attr("r", 6)
      .attr("fill", (d) => (d.Doping ? "#e74c3c" : "#3498db"))
      .on("mouseover", (event, d) => {
        d3.select(tooltipRef.current)
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px")
          .attr("data-year", new Date(d.Year, 0, 1))
          .html(
            `Year: ${d.Year}<br>Time: ${d.Time}<br>${
              d.Doping ? d.Doping : "No Doping Allegations"
            }`
          );
      })
      .on("mouseout", () => {
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", padding / 2)
      .attr("text-anchor", "middle")
      .attr("id", "title")
      .style("font-weight", "bold")
      .style("font-size", "1.5em")
      .style("fill", "white")
      .text("Tour de France Time vs Year");

    //creating Axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding + 10})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding - 10}, 0)`)
      .call(yAxis);

    //creating legends
    const legend = svg.append("g").attr("id", "legend");

    // Legend for doping allegations
    legend
      .append("circle")
      .attr("cx", width - 160)
      .attr("cy", height / 1.5 - 17)
      .attr("r", 6)
      .attr("fill", "#e74c3c");

    legend
      .append("text")
      .attr("x", width - 150)
      .attr("y", height / 1.5 - 16)
      .text("Doping Allegations")
      .style("font-size", "0.9em")
      .style("fill", "white")
      .attr("alignment-baseline", "middle");

    // Legend for no doping allegations
    legend
      .append("circle")
      .attr("cx", width - 160)
      .attr("cy", height / 1.5 + 11)
      .attr("r", 6)
      .attr("fill", "#3498db");

    legend
      .append("text")
      .attr("x", width - 150)
      .attr("y", height / 1.5 + 14)
      .text("No Doping Allegations")
      .style("font-size", "0.9em")
      .style("fill", "white")
      .attr("alignment-baseline", "middle");
  }, [data]);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Loading...</h1>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>{error}</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          The data below represents the GDP of the USA over the past decade.
        </h1>
        <h2>Hover over the bars to see the GDP values.</h2>
      </header>
      <svg ref={svgRef}></svg>
      {/* Tooltip Element */}
      <div ref={tooltipRef} id="tooltip"></div>
      <footer className="footer">
        <p>
          Coded and Designed by <strong>Sina Kiamehr</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;

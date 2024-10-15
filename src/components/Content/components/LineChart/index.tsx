import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { Container } from "./styles";

interface Stargazer {
  starred_at: Date;
}

interface LineChartProps {
  data: Stargazer[];
  mode: "variation" | "sum";
}

const LineChart: React.FC<LineChartProps> = ({ data, mode }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Prepare the data
    const stargazerData = data.map((node) => ({
      starredAt: new Date(node.starred_at),
    }));

    // Group data by day and count stars
    const groupedData = d3.rollup(
      stargazerData,
      (v) => v.length,
      (d) => d3.timeDay(d.starredAt)
    );

    // Convert grouped data to arrays
    const dates = Array.from(groupedData.keys()).sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const starCounts = Array.from(groupedData.values());

    let lineValues: number[] = [];

    if (mode === "sum") {
      lineValues = starCounts.reduce((acc, count, index) => {
        const previous = acc[index - 1] || 0; // Previous cumulative count
        acc.push(previous + count); // Add current count to previous
        return acc;
      }, [] as number[]);
    }

    if (mode === "variation") {
      lineValues = starCounts;
    }

    // Set up the SVG canvas dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Create a group for the chart elements
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleTime().range([0, width]).domain(d3.extent(dates) as [Date, Date]);
    
    const y =
      mode === "sum"
        ? d3.scaleLinear().range([height, 0]).domain([0, d3.max(lineValues) as number])
        : d3.scaleLog().range([height, 0]).domain([1, d3.max(lineValues) as number]);

    // Draw the line
    const line = d3.line().x((d, i) => x(dates[i])).y((d) => y(d));

    g.append("path")
      .datum(lineValues)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Draw the axes
    g.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    
    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // Define zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10]) // Set zoom scale limits
      .on("zoom", (event) => {
        g.attr("transform", event.transform); // Apply the transform to the group
        // g.select(".x-axis").call(d3.axisBottom(x).scale(event.transform.rescaleX(x))); // Update x-axis
        // g.select(".y-axis").call(d3.axisLeft(y).scale(event.transform.rescaleY(y))); // Update y-axis
      });

   // Call zoom behavior on the svg element
   svg.call(zoom);
    
  }, [data, mode]);

  return (
    <Container>
      <svg ref={svgRef}></svg>
    </Container>
  );
};

export default LineChart;
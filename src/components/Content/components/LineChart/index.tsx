import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface Stargazer {
    starred_at: {
        $date: string;
    };
}

interface LineChartProps {
    data: Stargazer[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        // Prepare the data
        const stargazerData = data.map(node => ({
            starredAt: new Date(node.starred_at.$date)
        }));

        // Group data by day and count stars
        const groupedData = d3.rollup(
            stargazerData,
            v => v.length,
            d => d3.timeDay(d.starredAt)
        );

        // Convert grouped data to arrays
        const dates = Array.from(groupedData.keys()).sort((a, b) => a.getTime() - b.getTime());
        const starCounts = Array.from(groupedData.values());

        // Calculate cumulative counts
        const cumulativeCounts = starCounts.reduce((acc, count, index) => {
            const previous = acc[index - 1] || 0; // Previous cumulative count
            acc.push(previous + count); // Add current count to previous
            return acc;
        }, [] as number[]);

        // Set up the SVG canvas dimensions
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Set up the scales
        const x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(dates) as [Date, Date]);

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(cumulativeCounts) as number]);

        // Draw the line
        const line = d3.line()
            .x((d, i) => x(dates[i]))
            .y(d => y(d));

        svg.append('path')
            .datum(cumulativeCounts)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Draw the axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    }, [data]);

    return <svg ref={svgRef}></svg>;
};

export default LineChart;
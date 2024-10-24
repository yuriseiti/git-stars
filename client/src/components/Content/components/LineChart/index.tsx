import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Container } from "./styles";

interface Stargazer {
  starred_at: Date;
  avatar_url: string;
  name: string;
  login: string;
  followers_count: number;
}

interface LineChartProps {
  data: Stargazer[];
  mode: "variation" | "sum";
}

const LineChartComponent: React.FC<LineChartProps> = ({ data, mode }) => {
  const dateCounts: { [key: string]: number } = {};

  data.forEach((item) => {
    const date = item.starred_at.toISOString().split("T")[0];
    if (!dateCounts[date]) {
      dateCounts[date] = 0;
    }
    dateCounts[date] += 1;
  });

  const chartData = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const processedData = chartData.map((item, index) => ({
    date: item.date,
    totalStargazers: chartData
      .slice(0, index + 1)
      .reduce((sum, current) => sum + current.count, 0),
    newStargazers: item.count,
  }));

  return (
    <Container>
      <LineChart width={600} height={300} data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={mode === "sum" ? "totalStargazers" : "newStargazers"}
          stroke="#8884d8"
        />
      </LineChart>
    </Container>
  );
};

export default LineChartComponent;

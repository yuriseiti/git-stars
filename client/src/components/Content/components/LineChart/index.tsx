import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
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

const LineChartComponent: React.FC<LineChartProps> = ({
  data: rawData,
  mode,
}) => {
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [top, setTop] = useState<number | null>(null);
  const [bottom, setBottom] = useState<number | null>(null);

  const dateCounts: { [key: string]: number } = {};
  rawData.forEach((item) => {
    const date = item.starred_at.toISOString().split("T")[0];
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  const chartData = Object.entries(dateCounts)
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const processedData = chartData.map((item, index) => ({
    date: new Date(item.date).getTime(),
    totalStargazers: chartData
      .slice(0, index + 1)
      .reduce((sum, current) => sum + current.count, 0),
    newStargazers: item.count,
  }));

  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getAxisYDomain = (refData: typeof processedData) => {
    const metric = mode === "sum" ? "totalStargazers" : "newStargazers";
    const [bottom, top] = [
      Math.min(...refData.map((d) => d[metric])),
      Math.max(...refData.map((d) => d[metric])),
    ];
    return [Math.floor(bottom - 1), Math.ceil(top + 1)];
  };

  const zoom = () => {
    if (!refAreaLeft || !refAreaRight) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    let [fromDate, toDate] = [Number(refAreaLeft), Number(refAreaRight)].sort(
      (a, b) => a - b
    );

    const refData = processedData.filter(
      (d) => d.date >= Number(fromDate) && d.date <= Number(toDate)
    );

    if (refData.length > 0) {
      const [bottom, top] = getAxisYDomain(refData);

      setRefAreaLeft(null);
      setRefAreaRight(null);
      setLeft(Number(fromDate));
      setRight(Number(toDate));
      setBottom(bottom);
      setTop(top);
    }
  };

  const zoomOut = () => {
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setLeft(null);
    setRight(null);
    setBottom(null);
    setTop(null);
  };

  const defaultXDomain = [
    Math.min(...processedData.map((d) => d.date)),
    Math.max(...processedData.map((d) => d.date)),
  ];
  const defaultYDomain = getAxisYDomain(processedData);

  const metric = mode === "sum" ? "totalStargazers" : "newStargazers";
  const metricLabel =
    mode === "sum" ? "Total de Stargazers" : "Novos Stargazers";

  return (
    <Container>
      <button onClick={zoomOut}>Resetar zoom</button>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={processedData}
          onMouseDown={(e) =>
            e && e.activeLabel && setRefAreaLeft(e.activeLabel)
          }
          onMouseMove={(e) =>
            refAreaLeft && e && e.activeLabel && setRefAreaRight(e.activeLabel)
          }
          onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            allowDataOverflow={true}
            domain={left && right ? [left, right] : defaultXDomain}
            tickFormatter={formatXAxis}
            type="number"
          />
          <YAxis
            allowDataOverflow={true}
            domain={bottom && top ? [bottom, top] : defaultYDomain}
            type="number"
          />
          <Tooltip
            labelFormatter={(label) => formatXAxis(label)}
            formatter={(value) => [value, metricLabel]}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {refAreaLeft && refAreaRight && (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
              fill="#8884d8"
              fillOpacity={0.3}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default LineChartComponent;

import React, { useState, useMemo } from "react";
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
}

const LineChartComponent: React.FC<LineChartProps> = ({ data: rawData }) => {
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [top, setTop] = useState<number | null>(null);
  const [bottom, setBottom] = useState<number | null>(null);
  const [mode, setMode] = useState<"sum" | "variation">("sum");
  const [group, setGroup] = useState<"day" | "week" | "month" | "year">("day");

  const groupData = (
    data: Stargazer[],
    grouping: "day" | "week" | "month" | "year"
  ) => {
    const counts: { [key: string]: number } = {};

    data.forEach((item) => {
      const date = new Date(item.starred_at);
      let key: string;

      switch (grouping) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(date.setDate(diff));
          key = monday.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        case "year":
          key = `${date.getFullYear()}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processedData = useMemo(() => {
    const groupedData = groupData(rawData, group);

    return groupedData.map((item, index) => ({
      date: new Date(item.date).getTime(),
      totalStargazers: groupedData
        .slice(0, index + 1)
        .reduce((sum, current) => sum + current.count, 0),
      newStargazers: item.count,
    }));
  }, [rawData, group]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (group) {
      case "day":
        return date.toLocaleDateString();
      case "week":
        return `Semana de ${date.toLocaleDateString()}`;
      case "month":
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
        });
      case "year":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
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
    if (!refAreaLeft || !refAreaRight || refAreaLeft === refAreaRight) {
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
  const metricLabel = mode === "sum" ? "Total de Stargazers" : "Novos Stargazers";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Container>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={processedData}
            onMouseDown={(e) =>
              e && e.activeLabel && setRefAreaLeft(e.activeLabel)
            }
            onMouseMove={(e) =>
              refAreaLeft &&
              e &&
              e.activeLabel &&
              setRefAreaRight(e.activeLabel)
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
              tickCount={10}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              allowDataOverflow={true}
              domain={bottom && top ? [bottom, top] : defaultYDomain}
              type="number"
              tickCount={6}
            />
            <Tooltip
              labelFormatter={(label) => formatXAxis(label)}
              formatter={(value) => [value, metricLabel]}
            />
            <Line
              type="monotone"
              animationDuration={500}
              dataKey={metric}
              stroke="#8884d8"
              strokeWidth={2}
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
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: '12px' }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <label>Visualização:</label>
          <select
            id="mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as "sum" | "variation")}
          >
            <option value="sum">Soma</option>
            <option value="variation">Variação</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <label>Agrupar por:</label>
          <select
            id="group-select"
            value={group}
            onChange={(e) =>
              setGroup(e.target.value as "day" | "week" | "month" | "year")
            }
          >
            <option value="day">Dia</option>
            <option value="week">Semana</option>
            <option value="month">Mês</option>
            <option value="year">Ano</option>
          </select>
        </div>
        <button onClick={zoomOut}>Resetar Zoom</button>
      </div>
    </div>
  );
};

export default LineChartComponent;

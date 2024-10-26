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
import {
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  parseISO,
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { Container } from "./styles";

type GroupingType = "day" | "week" | "month" | "year";
type ModeType = "sum" | "variation";

interface Stargazer {
  starred_at: Date;
  avatar_url: string;
  name: string;
  login: string;
  followers_count: number;
}

interface ChartData {
  date: number;
  totalStargazers: number;
  newStargazers: number;
}

interface LineChartProps {
  data: Stargazer[];
}

const GROUP_FORMAT_MAP: Record<GroupingType, (date: Date) => string> = {
  day: (date) => format(date, "dd/MM/yyyy"),
  week: (date) => `Semana de ${format(date, "dd/MM/yyyy")}`,
  month: (date) => format(date, "MMM yyyy"),
  year: (date) => format(date, "yyyy"),
};

const MODE_LABELS: Record<ModeType, string> = {
  sum: "Total de Stargazers",
  variation: "Novos Stargazers",
};

const getDateKey = (date: Date, grouping: GroupingType): string => {
  const dateMap = {
    day: date,
    week: startOfWeek(date),
    month: startOfMonth(date),
    year: startOfYear(date),
  };
  return format(dateMap[grouping], "yyyy-MM-dd");
};

const calculateAxisDomain = (
  data: ChartData[],
  metric: keyof ChartData
): [number, number] => {
  const values = data.map((d) => d[metric] as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [Math.floor(min - 1), Math.ceil(max + 1)];
};

const LineChartComponent: React.FC<LineChartProps> = ({ data: rawData }) => {
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [top, setTop] = useState<number | null>(null);
  const [bottom, setBottom] = useState<number | null>(null);
  const [mode, setMode] = useState<ModeType>("sum");
  const [group, setGroup] = useState<GroupingType>("day");

  const processedData = useMemo(() => {
    const groupedCounts: Record<string, number> = {};

    rawData.forEach((item) => {
      const date = parseISO(item.starred_at.toISOString());
      const key = getDateKey(date, group);
      groupedCounts[key] = (groupedCounts[key] || 0) + 1;
    });

    return Object.entries(groupedCounts)
      .sort((a, b) => parseISO(a[0]).getTime() - parseISO(b[0]).getTime())
      .map(([date, count], index, array) => ({
        date: parseISO(date).getTime(),
        totalStargazers: array
          .slice(0, index + 1)
          .reduce((sum, [, curr]) => sum + curr, 0),
        newStargazers: count,
      }));
  }, [rawData, group]);

  const handleZoom = () => {
    if (!refAreaLeft || !refAreaRight || refAreaLeft === refAreaRight) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    const [fromDate, toDate] = [Number(refAreaLeft), Number(refAreaRight)].sort(
      (a, b) => a - b
    );

    const refData = processedData.filter(
      (d) => d.date >= fromDate && d.date <= toDate
    );

    if (refData.length > 0) {
      const [bottom, top] = calculateAxisDomain(
        refData,
        mode === "sum" ? "totalStargazers" : "newStargazers"
      );
      setRefAreaLeft(null);
      setRefAreaRight(null);
      setLeft(fromDate);
      setRight(toDate);
      setBottom(bottom);
      setTop(top);
    }
  };

  const handleZoomOut = () => {
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setLeft(null);
    setRight(null);
    setBottom(null);
    setTop(null);
  };

  const metricKey = mode === "sum" ? "totalStargazers" : "newStargazers";
  const defaultXDomain = [
    Math.min(...processedData.map((d) => d.date)),
    Math.max(...processedData.map((d) => d.date)),
  ];
  const defaultYDomain = calculateAxisDomain(processedData, metricKey);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: "16px",
      }}
    >
      <Container>
        <ResponsiveContainer>
          <LineChart
            data={processedData}
            onMouseDown={(e) => e?.activeLabel && setRefAreaLeft(e.activeLabel)}
            onMouseMove={(e) =>
              refAreaLeft && e?.activeLabel && setRefAreaRight(e.activeLabel)
            }
            onMouseUp={handleZoom}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              allowDataOverflow
              domain={left && right ? [left, right] : defaultXDomain}
              tickFormatter={(timestamp) =>
                GROUP_FORMAT_MAP[group](new Date(timestamp))
              }
              type="number"
              tickCount={10}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              allowDataOverflow
              domain={bottom && top ? [bottom, top] : defaultYDomain}
              type="number"
              tickCount={6}
            />
            <Tooltip
              labelFormatter={(label) =>
                GROUP_FORMAT_MAP[group](new Date(label))
              }
              formatter={(value) => [value, MODE_LABELS[mode]]}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke="#8884d8"
              strokeWidth={2}
              animationDuration={500}
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

      <Stack direction="row" spacing={2} className="mt-3 justify-center">
        <FormControl size="small" style={{ minWidth: "110px" }}>
          <InputLabel>Visualização</InputLabel>
          <Select
            value={mode}
            label="Visualização"
            onChange={(e: any) => setMode(e.target.value as ModeType)}
          >
            <MenuItem value="sum">Soma</MenuItem>
            <MenuItem value="variation">Variação</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" style={{ minWidth: "110px" }}>
          <InputLabel>Agrupar por</InputLabel>
          <Select
            value={group}
            label="Agrupar por"
            onChange={(e: any) => setGroup(e.target.value as GroupingType)}
          >
            <MenuItem value="day">Dia</MenuItem>
            <MenuItem value="week">Semana</MenuItem>
            <MenuItem value="month">Mês</MenuItem>
            <MenuItem value="year">Ano</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleZoomOut}
          className="min-w-[120px]"
        >
          Resetar Zoom
        </Button>
      </Stack>
    </div>
  );
};

export default LineChartComponent;

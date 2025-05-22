import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { generateChartColors } from "../utils/chartUtils";

const ChartWrapper = ({ title, children }) => (
  <div className="chart-container">
    <h3 className="text-lg font-medium text-gray-300 mb-3">{title}</h3>
    <div className="h-64 w-full">{children}</div>
  </div>
);

const NoChartData = () => (
  <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
    <div className="text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mx-auto text-gray-600 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
      <p className="text-gray-500">No chart data available</p>
    </div>
  </div>
);

const renderChart = (visualization) => {
  const { chart_type, title, data, x_axis, y_axis, colors } = visualization;

  const chartColors = colors || generateChartColors(data.length, "#8b5cf6");

  if (!data || data.length === 0) {
    return <NoChartData />;
  }

  switch (chart_type) {
    case "bar":
      return (
        <ChartWrapper title={title}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={x_axis} tick={{ fill: "#9CA3AF" }} />
              <YAxis tick={{ fill: "#9CA3AF" }} />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ border: "none", borderRadius: "0.375rem" }}
                itemStyle={{ color: "#9CA3AF" }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend wrapperStyle={{ color: "#9CA3AF" }} />
              <Bar
                dataKey={y_axis}
                fill="#8b5cf6"
                activeBar={{ fill: "#6d28d9" }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case "line":
      return (
        <ChartWrapper title={title}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={x_axis} tick={{ fill: "#9CA3AF" }} />
              <YAxis tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.375rem",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend wrapperStyle={{ color: "#9CA3AF" }} />
              <Line
                type="monotone"
                dataKey={y_axis}
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case "pie":
      return (
        <ChartWrapper title={title}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name.length > 4 ? name.slice(0, 4) + "…" : name}: ${(
                    percent * 100
                  ).toFixed(0)}%`
                }
                outerRadius={50}
                fill="#8884d8"
                dataKey={y_axis}
                nameKey={x_axis}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.375rem",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend wrapperStyle={{ color: "#9CA3AF" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case "scatter":
      return (
        <ChartWrapper title={title}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey={x_axis}
                name={x_axis}
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis
                dataKey={y_axis}
                name={y_axis}
                tick={{ fill: "#9CA3AF" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.375rem",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                labelStyle={{ color: "#9CA3AF" }}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Legend wrapperStyle={{ color: "#9CA3AF" }} />
              <Scatter name={title} data={data} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    case "area":
      return (
        <ChartWrapper title={title}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={x_axis} tick={{ fill: "#9CA3AF" }} />
              <YAxis tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.375rem",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend wrapperStyle={{ color: "#9CA3AF" }} />
              <Area
                type="monotone"
                dataKey={y_axis}
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      );

    default:
      return <NoChartData />;
  }
};

const DataVisualization = ({ visualizations }) => {
  const [activeTab, setActiveTab] = useState("all");

  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">
          Data Visualizations
        </h2>
        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <p className="text-gray-500">No visualizations available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get unique chart types for tabs
  const chartTypes = [
    "all",
    ...new Set(visualizations.map((v) => v.chart_type)),
  ];

  // Filter visualizations based on active tab
  const filteredVisualizations =
    activeTab === "all"
      ? visualizations
      : visualizations.filter((v) => v.chart_type === activeTab);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-bold text-white mb-2 sm:mb-0">
          Data Visualizations
        </h2>

        <div className="flex flex-wrap gap-2">
          {chartTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize
                ${
                  activeTab === type
                    ? "bg-violet-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVisualizations.map((visualization, index) => (
          <div key={index} className="col-span-1">
            {renderChart(visualization)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataVisualization;

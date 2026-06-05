"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { getCarePriorityLabel, getItemRiskLevel } from "@/lib/riskLogic";
import { scoreDefinitions, type CariesScores } from "@/types/saliva";

type ResultChartProps = {
  scores: CariesScores;
};

const barColors = {
  low: "#4da989",
  medium: "#e4b667",
  high: "#d76c8b"
};

export function ResultChart({ scores }: ResultChartProps) {
  const chartData = scoreDefinitions.map((definition) => {
    const level = getItemRiskLevel(definition.key, scores);

    return {
      name: definition.shortLabel,
      score: scores[definition.key],
      level
    };
  });

  return (
    <div className="h-[220px] w-full rounded-[22px] bg-gradient-to-br from-white to-skywash-50 p-3 print:h-[130px] print:rounded-xl print:p-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 4, left: -26, bottom: 2 }}>
          <CartesianGrid stroke="#e7eef2" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(23, 56, 101, 0.08)" }}
            formatter={(value) => [getCarePriorityLabel(Number(value)), "判定"]}
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #dbe8ec",
              boxShadow: "0 12px 32px rgba(99, 125, 136, 0.12)"
            }}
          />
          <Bar dataKey="score" radius={[10, 10, 3, 3]} barSize={22}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={barColors[entry.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

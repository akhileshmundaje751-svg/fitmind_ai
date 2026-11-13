import React, { useState } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const MiniSparkline: React.FC<SparklineProps> = ({
  data,
  color = '#10b981',
  height = 40,
  width = 120,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 8) + 4;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((val, idx) => {
        if (idx === data.length - 1) {
          const x = (idx / (data.length - 1)) * (width - 8) + 4;
          const y = height - 4 - ((val - min) / range) * (height - 8);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="3.5"
              fill={color}
              className="animate-pulse"
            />
          );
        }
        return null;
      })}
    </svg>
  );
};

interface AreaChartProps {
  data: { label: string; value: number }[];
  color?: string;
  unit?: string;
  height?: number;
}

export const InteractiveAreaChart: React.FC<AreaChartProps> = ({
  data,
  color = '#10b981',
  unit = '',
  height = 200,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm border border-zinc-800/60 rounded-xl bg-zinc-900/40">
        No historical records available for this period.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const paddingY = (max - min) * 0.15 || 2;
  const chartMin = Math.max(0, min - paddingY);
  const chartMax = max + paddingY;
  const chartRange = chartMax - chartMin || 1;

  const width = 600;
  const paddingX = 40;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - 50;

  const coords = data.map((d, idx) => {
    const x = paddingX + (data.length === 1 ? innerWidth / 2 : (idx / (data.length - 1)) * innerWidth);
    const y = innerHeight - ((d.value - chartMin) / chartRange) * (innerHeight - 20) + 10;
    return { x, y, label: d.label, value: d.value };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `${coords[0].x},${innerHeight + 10} ` + linePoints + ` ${coords[coords.length - 1].x},${innerHeight + 10}`;

  const activePoint = hoverIndex !== null ? coords[hoverIndex] : coords[coords.length - 1];

  return (
    <div className="w-full relative">
      {/* Top summary tooltip */}
      {activePoint && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-xs text-zinc-400">{activePoint.label}</span>
          </div>
          <div className="text-base font-bold text-zinc-100">
            {activePoint.value} {unit}
          </div>
        </div>
      )}

      <div className="relative w-full aspect-[2.6/1] max-h-[240px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={10}
            x2={width - paddingX}
            y2={10}
            stroke="#27272a"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={innerHeight / 2 + 10}
            x2={width - paddingX}
            y2={innerHeight / 2 + 10}
            stroke="#27272a"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={innerHeight + 10}
            x2={width - paddingX}
            y2={innerHeight + 10}
            stroke="#27272a"
          />

          {/* Shaded Area */}
          <polygon
            points={areaPoints}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />

          {/* Smooth Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />

          {/* Interactive touch/hover points */}
          {coords.map((c, idx) => (
            <g
              key={idx}
              className="cursor-pointer group"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Invisible larger hit target */}
              <circle cx={c.x} cy={c.y} r="18" fill="transparent" />
              {/* Visible dot */}
              <circle
                cx={c.x}
                cy={c.y}
                r={hoverIndex === idx ? '6' : '3.5'}
                fill={hoverIndex === idx ? '#fff' : color}
                stroke={color}
                strokeWidth="2"
                className="transition-all duration-150"
              />
              {/* Label at bottom */}
              <text
                x={c.x}
                y={innerHeight + 28}
                textAnchor="middle"
                fontSize="11"
                fill="#71717a"
              >
                {c.label.slice(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

interface MacroDonutProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
  totalCalories: number;
}

export const MacroDonutChart: React.FC<MacroDonutProps> = ({
  proteinG,
  carbsG,
  fatG,
  totalCalories,
}) => {
  const pCal = proteinG * 4;
  const cCal = carbsG * 4;
  const fCal = fatG * 9;
  const sum = pCal + cCal + fCal || 1;

  const pPct = (pCal / sum) * 100;
  const cPct = (cCal / sum) * 100;
  const fPct = (fCal / sum) * 100;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const pOffset = circumference - (pPct / 100) * circumference;
  const cOffset = circumference - (cPct / 100) * circumference;
  const fOffset = circumference - (fPct / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#27272a"
            strokeWidth="10"
          />
          {/* Protein (Emerald) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={pOffset}
            strokeLinecap="round"
          />
          {/* Carbs (Cyan) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#06b6d4"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={cOffset}
            transform={`rotate(${(pPct / 100) * 360} 50 50)`}
          />
          {/* Fat (Amber) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={fOffset}
            transform={`rotate(${((pPct + cPct) / 100) * 360} 50 50)`}
          />
        </svg>

        <div className="absolute text-center">
          <span className="text-lg font-extrabold text-zinc-100">{totalCalories}</span>
          <span className="block text-[10px] text-zinc-400 uppercase tracking-wider">kcal</span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-300 font-medium">Protein</span>
          </div>
          <span className="font-semibold text-zinc-100">{proteinG}g ({Math.round(pPct)}%)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-zinc-300 font-medium">Carbs</span>
          </div>
          <span className="font-semibold text-zinc-100">{carbsG}g ({Math.round(cPct)}%)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-zinc-300 font-medium">Fat</span>
          </div>
          <span className="font-semibold text-zinc-100">{fatG}g ({Math.round(fPct)}%)</span>
        </div>
      </div>
    </div>
  );
};

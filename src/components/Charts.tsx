import React, { useState } from 'react';
import { EquityCurvePoint } from '../utils/calculations';
import { formatCurrency, formatR } from '../translations';

interface EquityChartProps {
  data: EquityCurvePoint[];
  height?: number;
}

export const EquityCurveChart: React.FC<EquityChartProps> = ({ data, height = 240 }) => {
  const [hoverPoint, setHoverPoint] = useState<EquityCurvePoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No equity curve data available
      </div>
    );
  }

  const padding = { top: 20, right: 30, bottom: 30, left: 60 };
  const width = 800; // SVG coordinate system viewBox width

  const equities = data.map(d => d.equity);
  const minEquity = Math.min(...equities);
  const maxEquity = Math.max(...equities);
  const range = maxEquity - minEquity || 1000;
  const yMin = minEquity - range * 0.08;
  const yMax = maxEquity + range * 0.08;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1 || 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return height - padding.bottom - ((val - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.equity)}`).join(' ');
  const areaPoints = `${getX(0)},${height - padding.bottom} ${points} ${getX(data.length - 1)},${height - padding.bottom}`;

  const isOverallProfitable = (data[data.length - 1]?.equity ?? 0) >= (data[0]?.equity ?? 0);
  const strokeColor = isOverallProfitable ? '#10b981' : '#f43f5e';
  const gradientId = isOverallProfitable ? 'equityGreenGrad' : 'equityRedGrad';

  // Calculate 4 y-axis tick marks
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => yMin + ratio * (yMax - yMin));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;
    
    // Find closest data point
    let closestIdx = 0;
    let minDistance = Infinity;
    data.forEach((_, idx) => {
      const px = getX(idx);
      const dist = Math.abs(px - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoverPoint(data[closestIdx]);
    setHoverX(getX(closestIdx));
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
    setHoverX(null);
  };

  return (
    <div className="relative w-full">
      {/* Tooltip Overlay */}
      {hoverPoint && hoverX !== null && (
        <div 
          className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs text-slate-200 transition-all duration-75"
          style={{
            left: `${Math.min(Math.max((hoverX / width) * 100, 15), 85)}%`,
            top: '8px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-center justify-between gap-3 font-semibold pb-1 mb-1 border-b border-slate-800">
            <span className="text-slate-400">{hoverPoint.date}</span>
            <span className="text-slate-100 font-mono font-medium">{hoverPoint.symbol}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
            <span className="text-slate-400">Equity:</span>
            <span className="text-right font-medium text-slate-100">${hoverPoint.equity.toLocaleString()}</span>
            <span className="text-slate-400">Trade P&L:</span>
            <span className={`text-right font-medium ${hoverPoint.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(hoverPoint.pnl)}
            </span>
            <span className="text-slate-400">Net Growth:</span>
            <span className={`text-right font-medium ${hoverPoint.cumPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(hoverPoint.cumPnL)}
            </span>
            {hoverPoint.rMultiple !== 0 && (
              <>
                <span className="text-slate-400">R-Multiple:</span>
                <span className={`text-right font-medium ${hoverPoint.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatR(hoverPoint.rMultiple)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="equityGreenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="90%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="equityRedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="90%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Grid Lines */}
        {yTicks.map((val, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke="currentColor"
              className="text-slate-800"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={getY(val) + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-400 font-mono"
            >
              ${Math.round(val / 1000)}k
            </text>
          </g>
        ))}

        {/* Initial Capital Baseline */}
        {data[0] && (
          <line
            x1={padding.left}
            y1={getY(data[0].equity)}
            x2={width - padding.right}
            y2={getY(data[0].equity)}
            stroke="#64748b"
            strokeDasharray="2 4"
            strokeWidth="1"
            opacity="0.6"
          />
        )}

        {/* Shaded Area */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        {/* Equity Line */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Individual Trade Dots */}
        {data.map((d, i) => {
          if (i === 0) return null;
          const isWin = d.pnl >= 0;
          return (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.equity)}
              r="3.5"
              className={`${isWin ? 'fill-emerald-400 stroke-emerald-950' : 'fill-rose-400 stroke-rose-950'} stroke-2 transition-transform hover:scale-150`}
            />
          );
        })}

        {/* Hover Crosshair indicator */}
        {hoverPoint && hoverX !== null && (
          <g>
            <line
              x1={hoverX}
              y1={padding.top}
              x2={hoverX}
              y2={height - padding.bottom}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle
              cx={hoverX}
              cy={getY(hoverPoint.equity)}
              r="6"
              fill={hoverPoint.pnl >= 0 ? '#10b981' : '#f43f5e'}
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

interface DailyPnLBarProps {
  data: { date: string; netPnL: number; tradesCount: number }[];
  height?: number;
}

export const DailyPnLBarChart: React.FC<DailyPnLBarProps> = ({ data, height = 200 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No daily P&L data</div>;
  }

  // Sort by date ascending
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const maxAbsPnL = Math.max(...sorted.map(d => Math.abs(d.netPnL)), 500);

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 800;
  const chartHeight = height - padding.top - padding.bottom;
  const zeroY = padding.top + chartHeight / 2;

  const barWidth = Math.max(Math.min((width - padding.left - padding.right) / sorted.length - 8, 36), 8);

  return (
    <div className="relative w-full">
      {hoveredIndex !== null && sorted[hoveredIndex] && (
        <div 
          className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-xl text-xs text-slate-200"
          style={{
            left: `${Math.min(Math.max((((hoveredIndex + 0.5) / sorted.length)) * 100, 15), 85)}%`,
            top: '4px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold text-slate-300">{sorted[hoveredIndex].date}</div>
          <div className="flex items-center gap-2 font-mono mt-0.5">
            <span className={sorted[hoveredIndex].netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatCurrency(sorted[hoveredIndex].netPnL)}
            </span>
            <span className="text-slate-400 text-[11px]">({sorted[hoveredIndex].tradesCount} trades)</span>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        {/* Zero baseline */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Top & bottom max labels */}
        <text x={padding.left - 6} y={padding.top + 8} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
          +${Math.round(maxAbsPnL)}
        </text>
        <text x={padding.left - 6} y={zeroY + 3} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">
          $0
        </text>
        <text x={padding.left - 6} y={height - padding.bottom} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
          -${Math.round(maxAbsPnL)}
        </text>

        {sorted.map((item, idx) => {
          const x = padding.left + (idx / sorted.length) * (width - padding.left - padding.right) + 4;
          const isPositive = item.netPnL >= 0;
          const barH = (Math.abs(item.netPnL) / maxAbsPnL) * (chartHeight / 2);
          const y = isPositive ? zeroY - barH : zeroY;

          return (
            <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 3)}
                rx="3"
                className={`transition-all duration-150 cursor-pointer ${
                  isPositive 
                    ? 'fill-emerald-500 hover:fill-emerald-400' 
                    : 'fill-rose-500 hover:fill-rose-400'
                } ${hoveredIndex === idx ? 'opacity-100 brightness-125' : 'opacity-90'}`}
              />
              {/* Short date below zero axis */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-mono"
              >
                {item.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

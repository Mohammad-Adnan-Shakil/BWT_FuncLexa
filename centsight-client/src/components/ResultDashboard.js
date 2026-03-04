import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';

const ResultDashboard = ({ data, recentTrack = [], onNewCheck, darkMode = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);

  const chartData = useMemo(() => {
    if (Array.isArray(data?.chartData) && data.chartData.length > 0) {
      return data.chartData.map((point, idx) => ({
        month: Number.isFinite(point?.month) ? point.month : idx,
        savings: Number(point?.savings ?? 0),
      }));
    }

    const horizon = Number(data?.timeHorizon ?? 12);
    const monthlyDisposable = Number(data?.monthlyDisposable ?? 0);
    const currentSavings = Number(data?.currentSavings ?? 0);

    return Array.from({ length: Math.max(horizon, 1) + 1 }, (_, idx) => ({
      month: idx,
      savings: currentSavings + monthlyDisposable * idx,
    }));
  }, [data]);

  const chartModel = useMemo(() => {
    const width = 920;
    const height = 360;
    const margin = { top: 20, right: 24, bottom: 52, left: 68 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const values = chartData.map((point) => point.savings);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const spread = maxValue - minValue;
    const padding = spread > 0 ? spread * 0.12 : Math.max(Math.abs(maxValue) * 0.15, 1000);

    const domainMin = minValue - padding;
    const domainMax = maxValue + padding;
    const domainRange = domainMax - domainMin || 1;
    const stepX = chartData.length > 1 ? plotWidth / (chartData.length - 1) : 0;

    const points = chartData.map((point, idx) => {
      const x = margin.left + idx * stepX;
      const y = margin.top + ((domainMax - point.savings) / domainRange) * plotHeight;
      return { ...point, x, y };
    });

    const linePath = points
      .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(height - margin.bottom).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - margin.bottom).toFixed(2)} Z`;

    const yTicks = Array.from({ length: 5 }, (_, idx) => {
      const value = domainMin + (idx * domainRange) / 4;
      const y = margin.top + ((domainMax - value) / domainRange) * plotHeight;
      return { value, y };
    });

    return {
      width,
      height,
      margin,
      points,
      linePath,
      areaPath,
      yTicks,
      xMin: margin.left,
      xMax: width - margin.right,
      yBase: height - margin.bottom,
    };
  }, [chartData]);

  const handleDownloadReport = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const left = 48;
    let y = 56;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('CentSight Financial Clarity Report', left, y);
    y += 24;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, left, y);
    y += 24;

    const metricRows = [
      ['Projected Savings', formatCurrency(Number(data?.projectedSavings ?? 0))],
      ['Monthly Disposable', formatCurrency(Number(data?.monthlyDisposable ?? 0))],
      ['Current Savings', formatCurrency(Number(data?.currentSavings ?? 0))],
      ['Planned Expense', formatCurrency(Number(data?.plannedExpense ?? 0))],
      ['Impact Ratio', `${Number(data?.impactRatio ?? 0).toFixed(1)}%`],
      ['Stability', data?.stability ?? 'N/A'],
      ['Time Horizon', `${Number(data?.timeHorizon ?? 0)} months`],
    ];

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Summary Metrics', left, y);
    y += 16;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    metricRows.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, left, y);
      y += 16;
    });

    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('AI Insight', left, y);
    y += 16;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const wrappedInsight = pdf.splitTextToSize(data?.insightText ?? '', 500);
    pdf.text(wrappedInsight, left, y);
    y += wrappedInsight.length * 14 + 12;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Projection Nodes', left, y);
    y += 16;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    chartData.forEach((point) => {
      if (y > 790) {
        pdf.addPage();
        y = 56;
      }
      pdf.text(`Month ${point.month}: ${formatCurrency(point.savings)}`, left, y);
      y += 14;
    });

    pdf.save(`centsight-report-${Date.now()}.pdf`);
  };

  const panelClass = darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const softBgClass = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
  const impactRatio = Number(data?.impactRatio ?? 0).toFixed(1);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="relative grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-cyan-300 text-sm font-semibold tracking-wider uppercase">Financial Clarity Report</p>
            <h2 className="mt-3 text-4xl font-black text-white">Projection Dashboard</h2>
            <p className="mt-3 text-slate-300 text-lg">
              Forward simulation based on your latest inputs with node-wise savings trajectory.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-slate-300 text-sm">Projected Savings</p>
            <p className="mt-1 text-4xl font-extrabold text-white">{formatCurrency(Number(data?.projectedSavings ?? 0))}</p>
            <p className="mt-2 text-sm text-slate-300">Month {Number(data?.timeHorizon ?? 0)} target horizon</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`rounded-2xl border p-6 shadow-xl ${panelClass}`}>
          <h3 className="text-lg font-semibold">Stability Status</h3>
          <div className={`mt-4 rounded-xl bg-gradient-to-r ${data?.badgeColor ?? 'from-slate-500 to-slate-600'} px-5 py-4 text-center text-2xl font-bold text-white`}>
            {data?.stability ?? 'N/A'}
          </div>
          <p className={`mt-4 text-sm ${mutedTextClass}`}>Risk impact ratio: {impactRatio}%</p>
        </div>

        <div className={`rounded-2xl border p-6 shadow-xl ${panelClass}`}>
          <h3 className="text-lg font-semibold">Key Metrics</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className={mutedTextClass}>Monthly Disposable</span><span className="font-bold">{formatCurrency(Number(data?.monthlyDisposable ?? 0))}</span></div>
            <div className="flex items-center justify-between"><span className={mutedTextClass}>Current Savings</span><span className="font-bold">{formatCurrency(Number(data?.currentSavings ?? 0))}</span></div>
            <div className="flex items-center justify-between"><span className={mutedTextClass}>Planned Expense</span><span className="font-bold">{formatCurrency(Number(data?.plannedExpense ?? 0))}</span></div>
            <div className="flex items-center justify-between"><span className={mutedTextClass}>Impact Ratio</span><span className="font-bold">{impactRatio}%</span></div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-6 shadow-xl text-white">
          <h3 className="text-lg font-semibold">AI Insight</h3>
          <p className="mt-3 text-white/90 leading-relaxed">{data?.insightText ?? ''}</p>
          <p className="mt-4 text-sm text-white/80">Updated from latest submission.</p>
        </div>
      </section>

      <section className={`rounded-2xl border p-6 shadow-xl ${panelClass}`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Node-wise Savings Projection</h3>
            <p className={`text-sm ${mutedTextClass}`}>Hover nodes to inspect month-by-month values.</p>
          </div>
          <div className={`rounded-xl border px-3 py-2 text-sm ${softBgClass}`}>
            Horizon: {Number(data?.timeHorizon ?? 0)} months
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${softBgClass}`}>
          <svg viewBox={`0 0 ${chartModel.width} ${chartModel.height}`} className="h-80 w-full">
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>

            {chartModel.yTicks.map((tick) => (
              <g key={`tick-${tick.y}`}>
                <line
                  x1={chartModel.xMin}
                  x2={chartModel.xMax}
                  y1={tick.y}
                  y2={tick.y}
                  stroke={darkMode ? '#334155' : '#e2e8f0'}
                  strokeDasharray="4 5"
                />
                <text
                  x={chartModel.margin.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                  fontSize="11"
                >
                  {formatCurrency(tick.value)}
                </text>
              </g>
            ))}

            <path d={chartModel.areaPath} fill="url(#areaGradient)" />
            <path d={chartModel.linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {chartModel.points.map((point, idx) => (
              <g key={`node-${point.month}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === idx ? 7 : 5}
                  fill={hoveredIndex === idx ? '#0ea5e9' : '#14b8a6'}
                  stroke={darkMode ? '#0f172a' : '#ffffff'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {chartData.length <= 12 && (
                  <text
                    x={point.x}
                    y={chartModel.yBase + 18}
                    textAnchor="middle"
                    fill={darkMode ? '#94a3b8' : '#64748b'}
                    fontSize="11"
                  >
                    M{point.month}
                  </text>
                )}
              </g>
            ))}

            {hoveredIndex !== null && chartModel.points[hoveredIndex] && (
              <g pointerEvents="none">
                <rect
                  x={chartModel.points[hoveredIndex].x - 76}
                  y={chartModel.points[hoveredIndex].y - 56}
                  width="152"
                  height="42"
                  rx="8"
                  fill={darkMode ? '#0f172a' : '#0b1220'}
                  opacity="0.95"
                />
                <text
                  x={chartModel.points[hoveredIndex].x}
                  y={chartModel.points[hoveredIndex].y - 38}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="11"
                >
                  Month {chartModel.points[hoveredIndex].month}
                </text>
                <text
                  x={chartModel.points[hoveredIndex].x}
                  y={chartModel.points[hoveredIndex].y - 22}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="700"
                >
                  {formatCurrency(chartModel.points[hoveredIndex].savings)}
                </text>
              </g>
            )}
          </svg>
        </div>
      </section>

      <section className={`rounded-2xl border p-6 shadow-xl ${panelClass}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Recent Track</h3>
          <p className={`text-sm ${mutedTextClass}`}>Last {Math.min(recentTrack.length, 8)} simulations</p>
        </div>

        {recentTrack.length === 0 ? (
          <p className={`text-sm ${mutedTextClass}`}>No recent values yet. Run your first analysis.</p>
        ) : (
          <div className={`overflow-x-auto rounded-xl border ${softBgClass}`}>
            <table className="min-w-full text-sm">
              <thead>
                <tr className={darkMode ? 'border-b border-slate-700 bg-slate-800/60' : 'border-b border-slate-200 bg-slate-100/70'}>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-right font-semibold">Income</th>
                  <th className="px-4 py-3 text-right font-semibold">Expense</th>
                  <th className="px-4 py-3 text-right font-semibold">Planned</th>
                  <th className="px-4 py-3 text-right font-semibold">Projected</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrack.map((item) => (
                  <tr key={item.id} className={darkMode ? 'border-b border-slate-800' : 'border-b border-slate-100'}>
                    <td className={`px-4 py-3 ${mutedTextClass}`}>{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.monthlyIncome)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.monthlyExpenses)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.plannedExpense)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.projectedSavings)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.stability === 'Stable'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.stability === 'Moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.stability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center justify-center gap-4 pt-1 sm:flex-row">
        <button
          onClick={onNewCheck}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30"
        >
          Run New Analysis
        </button>
        <button
          onClick={handleDownloadReport}
          className={`rounded-xl border px-8 py-4 font-semibold transition-all duration-300 ${
            darkMode
              ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-slate-200 bg-white text-slate-700 hover:shadow-lg'
          }`}
        >
          Download Report
        </button>
      </section>
    </div>
  );
};

export default ResultDashboard;

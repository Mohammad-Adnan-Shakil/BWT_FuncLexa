// components/ResultDashboard.js
import React from 'react';

const ResultDashboard = ({ data, onNewCheck }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Success Animation Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-6 shadow-xl shadow-emerald-200">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-3">Your Financial Clarity Report</h2>
        <p className="text-xl text-slate-500">Here's what our AI predicts for your financial future</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projected Savings - Featured Card */}
        <div className="lg:col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 font-medium mb-2">Projected Savings</p>
              <p className="text-5xl font-bold text-white mb-3">
                {formatCurrency(data.projectedSavings)}
              </p>
              <p className="text-blue-200/70">
                In {data.timeHorizon} months • {formatCurrency(data.monthlyDisposable)}/month disposable
              </p>
            </div>
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-lg">
              <span className="text-4xl">📈</span>
            </div>
          </div>
        </div>

        {/* Stability Badge */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Stability Status</h3>
            <span className="text-3xl">🛡️</span>
          </div>
          <div className={`bg-gradient-to-r ${data.badgeColor} text-white text-2xl font-bold py-4 px-6 rounded-xl text-center shadow-lg`}>
            {data.stability}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Key Metrics</h3>
            <span className="text-3xl">📊</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Monthly Disposable', value: data.monthlyDisposable, icon: '💵' },
              { label: 'Current Savings', value: data.currentSavings, icon: '🏦' },
              { label: 'Planned Expense', value: data.plannedExpense, icon: '💰' },
              { label: 'Impact Ratio', value: `${data.impactRatio.toFixed(1)}%`, icon: '📊' }
            ].map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{metric.icon}</span>
                  <span className="text-slate-600">{metric.label}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {metric.label.includes('Ratio') ? metric.value : formatCurrency(metric.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl p-6 shadow-xl text-white hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">AI Insight</h3>
            <span className="text-3xl">🤖</span>
          </div>
          <p className="text-white/90 leading-relaxed text-lg">
            {data.insightText}
          </p>
          <div className="mt-6 flex items-center text-white/70 text-sm">
            <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            AI-powered analysis • Updated in real-time
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Savings Projection</h3>
          <div className="h-64 flex items-end justify-around">
            {data.chartData.map((point, index) => {
              const maxValue = Math.max(...data.chartData.map(d => d.savings));
              const minValue = Math.min(...data.chartData.map(d => d.savings));
              const height = ((point.savings - minValue) / (maxValue - minValue || 1)) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center w-full max-w-[60px]">
                  <div className="relative w-full group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-teal-400 rounded-t-lg transition-all duration-500 group-hover:from-blue-600 group-hover:to-teal-500"
                      style={{ height: `${Math.max(20, height)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {formatCurrency(point.savings)}
                      </div>
                    </div>
                  </div>
                  <span className="mt-2 text-sm text-slate-500">
                    {point.month === 0 ? 'Now' : `Month ${point.month}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
        <button
          onClick={onNewCheck}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Run New Analysis</span>
        </button>
        
        <button className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold hover:shadow-lg border border-slate-200 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Report</span>
        </button>
      </div>
    </div>
  );
};

export default ResultDashboard;
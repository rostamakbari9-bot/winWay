import React from 'react';
import { Trade, Language } from '../types';
import { translations, formatCurrency, formatR, formatPercent } from '../translations';
import { PerformanceStats, EquityCurvePoint, computeSetupAnalytics, groupTradesByDay } from '../utils/calculations';
import { EquityCurveChart, DailyPnLBarChart } from './Charts';
import { CalendarHeatmap } from './CalendarHeatmap';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Percent, 
  Scale, 
  Flame, 
  ShieldAlert, 
  Activity,
  ArrowRight,
  Eye
} from 'lucide-react';

interface DashboardViewProps {
  trades: Trade[];
  stats: PerformanceStats;
  equityData: EquityCurvePoint[];
  lang: Language;
  onViewTrade: (trade: Trade) => void;
  onNavigateToJournal: () => void;
  onOpenNewTrade: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  stats,
  equityData,
  lang,
  onViewTrade,
  onNavigateToJournal,
  onOpenNewTrade,
  selectedDate,
  onSelectDate,
}) => {
  const t = translations[lang];

  // Top setups
  const topSetups = computeSetupAnalytics(trades).slice(0, 4);

  // Group daily P&L
  const dailyMap = groupTradesByDay(trades);
  const dailyArray = Array.from(dailyMap.values()).map(d => ({
    date: d.date,
    netPnL: d.netPnL,
    tradesCount: d.tradesCount
  }));

  // Recent 5 trades
  const recentTrades = [...trades]
    .sort((a, b) => new Date(`${b.entryDate}T${b.entryTime || '00:00'}`).getTime() - new Date(`${a.entryDate}T${a.entryTime || '00:00'}`).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Net P&L */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.netPnL}</span>
            {stats.netPnL >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono ${stats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(stats.netPnL)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Gross: <span className="font-mono text-emerald-300">+{stats.grossProfit.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.winRate}</span>
            <Percent className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-100">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <span className="text-emerald-400 font-semibold">{stats.winCount}W</span> - <span className="text-rose-400 font-semibold">{stats.lossCount}L</span> - <span className="text-slate-400">{stats.beCount}BE</span>
            </div>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.profitFactor}</span>
            <Scale className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono ${stats.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-slate-100'}`}>
              {stats.profitFactor.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Loss: <span className="font-mono text-rose-300">-{stats.grossLoss.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Avg R-Multiple */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.avgRMultiple}</span>
            <Award className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold font-mono ${stats.avgRMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatR(stats.avgRMultiple)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Expectancy: <span className="font-mono text-slate-300">{formatCurrency(stats.expectancy)}</span>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.currentStreak}</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono flex items-center gap-1">
              <span className={stats.currentStreak.type === 'WIN' ? 'text-emerald-400' : stats.currentStreak.type === 'LOSS' ? 'text-rose-400' : 'text-slate-400'}>
                {stats.currentStreak.count} {stats.currentStreak.type === 'WIN' ? 'Wins' : stats.currentStreak.type === 'LOSS' ? 'Losses' : '-'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Best: <span className="font-mono text-emerald-400">{formatCurrency(stats.bestTrade)}</span>
            </div>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.maxDrawdown}</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
              -{stats.maxDrawdownPct.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              -{formatCurrency(stats.maxDrawdown)}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Cumulative Equity Curve & Daily Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Equity Curve (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                {t.cumulativeEquity}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'fa' ? 'رشد تجمعی حساب در طول زمان همراه با جزئیات هر معامله' : 'Account equity trajectory across closed trades'}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {trades.length} {lang === 'fa' ? 'معامله' : 'trades plotted'}
            </span>
          </div>
          <EquityCurveChart data={equityData} height={230} />
        </div>

        {/* Daily PnL Bar Chart (1 col) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                {t.dailyPerformance}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'fa' ? 'سود یا زیان خالص روزانه' : 'Net daily outcome bars'}
              </p>
            </div>
          </div>
          <DailyPnLBarChart data={dailyArray} height={230} />
        </div>
      </div>

      {/* Row: Monthly Calendar Heatmap & Top Setups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Heatmap (2 cols) */}
        <div className="lg:col-span-2">
          <CalendarHeatmap
            trades={trades}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            lang={lang}
          />
        </div>

        {/* Top Setups & Psychological Discipline widget (1 col) */}
        <div className="space-y-6">
          {/* Top Setups Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <h3 className="font-semibold text-slate-100 text-sm mb-3">
              {t.topSetups}
            </h3>

            <div className="space-y-3">
              {topSetups.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200 truncate max-w-[160px]">{s.setup}</span>
                    <span className={`font-mono font-semibold ${s.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(s.netPnL)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Win Rate: <strong className="text-slate-300">{s.winRate.toFixed(0)}%</strong></span>
                    <span>{s.totalTrades} trades</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discipline Score */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">{t.ruleCompliance}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'fa' ? 'میزان تعهد به استراتژی بدون تخطی' : 'Trades executed strictly according to plan'}
                </p>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {stats.ruleComplianceRate.toFixed(0)}%
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.ruleComplianceRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">{t.recentTrades}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'fa' ? 'آخرین معاملات اجرا شده در ژورنال' : 'Latest positions closed in your ledger'}
            </p>
          </div>

          <button
            onClick={onNavigateToJournal}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>{t.viewAllTrades}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-2.5 px-3">{t.date}</th>
                <th className="py-2.5 px-3">{t.symbol}</th>
                <th className="py-2.5 px-3">{t.type}</th>
                <th className="py-2.5 px-3">{t.setup}</th>
                <th className="py-2.5 px-3 text-right">{t.pnl}</th>
                <th className="py-2.5 px-3 text-right">{t.rMultiple}</th>
                <th className="py-2.5 px-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentTrades.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {tr.entryDate} <span className="text-[11px] text-slate-500">{tr.entryTime}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-100 whitespace-nowrap">
                    {tr.symbol}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tr.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {tr.direction}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300 truncate max-w-[180px]">
                    {tr.setup}
                  </td>
                  <td className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                    tr.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatCurrency(tr.netPnL)}
                  </td>
                  <td className={`py-3 px-3 text-right font-medium whitespace-nowrap ${
                    tr.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatR(tr.rMultiple)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onViewTrade(tr)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title={t.viewDetails}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

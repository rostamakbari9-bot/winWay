import React from 'react';
import { Trade, Language } from '../types';
import { translations, formatCurrency, formatR } from '../translations';
import { 
  computeSetupAnalytics, 
  computeMistakeCostAnalytics, 
  computeSessionAnalytics, 
  computeEmotionAnalytics,
  PerformanceStats
} from '../utils/calculations';
import { 
  AlertTriangle, 
  Target, 
  Clock, 
  HeartHandshake, 
  BarChart2, 
  Scale, 
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface AnalyticsViewProps {
  trades: Trade[];
  stats: PerformanceStats;
  lang: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades, stats, lang }) => {
  const t = translations[lang];

  const setups = computeSetupAnalytics(trades);
  const mistakes = computeMistakeCostAnalytics(trades);
  const sessions = computeSessionAnalytics(trades);
  const emotions = computeEmotionAnalytics(trades);

  // Total cost of all mistakes
  const totalMistakesCost = mistakes.reduce((acc, m) => acc + m.totalCost, 0);

  // Long vs Short stats
  const longTrades = trades.filter(t => t.direction === 'LONG');
  const shortTrades = trades.filter(t => t.direction === 'SHORT');

  const longWins = longTrades.filter(t => t.status === 'WIN' || t.netPnL > 0).length;
  const longWinRate = longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0;
  const longPnL = longTrades.reduce((acc, t) => acc + t.netPnL, 0);

  const shortWins = shortTrades.filter(t => t.status === 'WIN' || t.netPnL > 0).length;
  const shortWinRate = shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0;
  const shortPnL = shortTrades.reduce((acc, t) => acc + t.netPnL, 0);

  // R-Multiple Buckets
  const rBuckets = [
    { label: '< -1R', count: trades.filter(t => (t.rMultiple || 0) < -1).length, color: 'bg-rose-600' },
    { label: '-1R', count: trades.filter(t => (t.rMultiple || 0) >= -1.05 && (t.rMultiple || 0) <= -0.95).length, color: 'bg-rose-500' },
    { label: '0R (BE)', count: trades.filter(t => Math.abs(t.rMultiple || 0) < 0.2).length, color: 'bg-slate-500' },
    { label: '+1R to +2R', count: trades.filter(t => (t.rMultiple || 0) >= 0.2 && (t.rMultiple || 0) < 2).length, color: 'bg-emerald-600' },
    { label: '+2R to +3R', count: trades.filter(t => (t.rMultiple || 0) >= 2 && (t.rMultiple || 0) < 3).length, color: 'bg-emerald-500' },
    { label: '+3R+', count: trades.filter(t => (t.rMultiple || 0) >= 3).length, color: 'bg-emerald-400' },
  ];
  const maxRCount = Math.max(...rBuckets.map(b => b.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner: The Cost of Mistakes (Signature TradeZella Feature) */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/60 border border-rose-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {t.costOfMistakes}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {t.mistakesExplanation}
              </p>
            </div>
          </div>

          <div className="sm:text-right font-mono bg-slate-950/60 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
            <div className="text-xs text-slate-400">{lang === 'fa' ? 'مجموع زیان ناشی از اشتباهات:' : 'Total Cost of Mistakes:'}</div>
            <div className="text-2xl font-bold text-rose-400 mt-0.5">
              -{formatCurrency(totalMistakesCost)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              {lang === 'fa' ? 'حساب بدون این اشتباهات:' : 'Potential P&L without mistakes:'}{' '}
              <strong>{formatCurrency(stats.netPnL + totalMistakesCost)}</strong>
            </div>
          </div>
        </div>

        {/* Mistakes List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {mistakes.map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200 truncate">{m.mistake}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {m.occurrences} {m.occurrences === 1 ? 'violation' : 'violations'}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Cost:</span>
                <span className="text-sm font-bold text-rose-400">-{formatCurrency(m.totalCost)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Strategy Edge Table & Long vs Short */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setups Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                {t.setupsPerformance}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'fa' ? 'میزان سودآوری و نرخ برد هر ستاپ معاملاتی' : 'Analyze your highest edge setups and discard losing strategies'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">{t.setup}</th>
                  <th className="py-2.5 px-3 text-center">{t.totalTrades}</th>
                  <th className="py-2.5 px-3 text-center">{t.winRate}</th>
                  <th className="py-2.5 px-3 text-center">{t.avgRMultiple}</th>
                  <th className="py-2.5 px-3 text-right">{t.pnl}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {setups.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      {s.setup}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400">
                      {s.totalTrades}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={s.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}>
                        {s.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-center font-medium ${s.avgR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatR(s.avgR)}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${s.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(s.netPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Long vs Short Direction Comparison (1 col) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              {t.longVsShort}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              {lang === 'fa' ? 'مقایسه عملکرد پوزیشن‌های لانگ در برابر شورت' : 'Directional bias profitability breakdown'}
            </p>

            <div className="space-y-4">
              {/* Long Stats */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider">{t.long}</span>
                  <span className="font-mono text-slate-400">{longTrades.length} trades</span>
                </div>
                <div className="flex items-center justify-between mt-2 font-mono">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{t.winRate}</span>
                    <span className="font-bold text-emerald-400">{longWinRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">{t.pnl}</span>
                    <span className={`font-bold ${longPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(longPnL)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Short Stats */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-400 uppercase tracking-wider">{t.short}</span>
                  <span className="font-mono text-slate-400">{shortTrades.length} trades</span>
                </div>
                <div className="flex items-center justify-between mt-2 font-mono">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{t.winRate}</span>
                    <span className="font-bold text-slate-200">{shortWinRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">{t.pnl}</span>
                    <span className={`font-bold ${shortPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(shortPnL)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Session Performance & Emotional State Impact & R Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Performance */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-400" />
            {t.sessionPerformance}
          </h3>

          <div className="space-y-3">
            {sessions.map((sess, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{sess.session} Session</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {sess.totalTrades} trades ({sess.winRate.toFixed(0)}% WR)
                  </div>
                </div>
                <div className={`font-mono font-bold text-sm ${sess.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(sess.netPnL)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional Psychology Correlation */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2 mb-3">
            <HeartHandshake className="w-4 h-4 text-pink-400" />
            {t.emotionsImpact}
          </h3>

          <div className="space-y-3">
            {emotions.map((emo, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{emo.emotion}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {emo.totalTrades} trades ({emo.winRate.toFixed(0)}% WR)
                  </div>
                </div>
                <div className={`font-mono font-bold text-sm ${emo.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(emo.netPnL)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* R-Multiple Distribution Histogram */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              {t.rDistribution}
            </h3>

            <div className="space-y-2.5 mt-4">
              {rBuckets.map((bucket, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{bucket.label}</span>
                    <span className="font-bold text-slate-200">{bucket.count} trades</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${bucket.color}`}
                      style={{ width: `${(bucket.count / maxRCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 mt-4">
            {lang === 'fa' 
              ? 'توزیع نشان‌دهنده نسبت‌های ریسک به ریوارد تحقق یافته در عمل است.'
              : 'Asymmetry distribution confirms positive mathematical expectancy.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

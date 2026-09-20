import React, { useState } from 'react';
import { MissedTrade, Language, AssetClass, TradeDirection } from '../types';
import { translations, formatCurrency, formatR } from '../translations';
import { 
  EyeOff, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Check, 
  X,
  BrainCircuit,
  DollarSign
} from 'lucide-react';

interface MissedTradesViewProps {
  missedTrades: MissedTrade[];
  onAddMissedTrade: (trade: MissedTrade) => void;
  onDeleteMissedTrade: (id: string) => void;
  lang: Language;
}

export const MissedTradesView: React.FC<MissedTradesViewProps> = ({
  missedTrades,
  onAddMissedTrade,
  onDeleteMissedTrade,
  lang,
}) => {
  const t = translations[lang];

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('indices');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [setup, setSetup] = useState('ICT Fair Value Gap + Sweep');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [plannedEntry, setPlannedEntry] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [plannedExit, setPlannedExit] = useState<number>(0);
  const [potentialR, setPotentialR] = useState<number>(2.5);
  const [potentialPnL, setPotentialPnL] = useState<number>(1500);
  const [reason, setReason] = useState<MissedTrade['reason']>('Hesitation');
  const [notes, setNotes] = useState('');
  const [chartUrl, setChartUrl] = useState('');

  // Aggregates
  const totalMissedR = missedTrades.reduce((acc, m) => acc + (m.potentialR || 0), 0);
  const totalMissedPnL = missedTrades.reduce((acc, m) => acc + (m.potentialPnL || 0), 0);

  // Primary trigger
  const reasonCounts: Record<string, number> = {};
  missedTrades.forEach(m => {
    reasonCounts[m.reason] = (reasonCounts[m.reason] || 0) + 1;
  });
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Hesitation';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMissed: MissedTrade = {
      id: `mt-${Date.now()}`,
      symbol: symbol.toUpperCase().trim() || 'UNTITLED',
      assetClass,
      direction,
      setup,
      date,
      time,
      plannedEntry: Number(plannedEntry),
      stopLoss: Number(stopLoss),
      plannedExit: Number(plannedExit),
      potentialR: Number(potentialR),
      potentialPnL: Number(potentialPnL),
      reason,
      notes,
      chartUrl: chartUrl.trim() || undefined
    };

    onAddMissedTrade(newMissed);
    setIsModalOpen(false);
    // Reset
    setSymbol('');
    setNotes('');
    setChartUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-900/60 border border-purple-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.missedOpportunitiesTitle}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {t.missedSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all font-sans shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.logMissedTrade}</span>
          </button>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">{t.totalMissedR}</span>
              <span className="text-xl font-bold font-mono text-purple-400 mt-0.5 block">
                {formatR(totalMissedR)}
              </span>
            </div>
            <BrainCircuit className="w-6 h-6 text-purple-400/40" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">{t.totalMissedPnL}</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {formatCurrency(totalMissedPnL)}
              </span>
            </div>
            <DollarSign className="w-6 h-6 text-emerald-400/40" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">{t.topMissedReason}</span>
              <span className="text-base font-bold text-amber-400 mt-1 block">
                {topReason}
              </span>
            </div>
            <AlertCircle className="w-6 h-6 text-amber-400/40" />
          </div>
        </div>
      </div>

      {/* Missed Trades List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <h3 className="font-semibold text-slate-100 text-sm mb-4">
          {lang === 'fa' ? 'لیست فرصت‌های از دست رفته و دلایل روانشناختی' : 'Recorded Missed Setups & Psychological Barriers'}
        </h3>

        {missedTrades.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            {lang === 'fa' ? 'هیچ فرصت از دست رفته‌ای ثبت نشده است.' : 'No missed setups recorded yet. Keep trading your plan!'}
          </div>
        ) : (
          <div className="space-y-3">
            {missedTrades.map(mt => (
              <div 
                key={mt.id}
                className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sm text-slate-100">{mt.symbol}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mt.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {mt.direction}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {mt.date} ({mt.time})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[10px] font-medium">
                      {mt.reason}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-300">
                    Setup: <span className="font-normal text-slate-400">{mt.setup}</span>
                  </div>

                  {mt.notes && (
                    <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-900/60 p-2 rounded-lg">
                      "{mt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-right font-mono">
                    <span className="text-[11px] text-slate-500 block">Missed Potential</span>
                    <div className="text-emerald-400 font-bold text-sm">
                      {formatR(mt.potentialR)} ({formatCurrency(mt.potentialPnL)})
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMissedTrade(mt.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Missed Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100"
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-base">{t.logMissedTrade}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{t.symbol} *</label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    placeholder="e.g. NQ, EUR/USD"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.type}</label>
                  <select
                    value={direction}
                    onChange={e => setDirection(e.target.value as TradeDirection)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="LONG">{t.long}</option>
                    <option value="SHORT">{t.short}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t.setup}</label>
                <input
                  type="text"
                  value={setup}
                  onChange={e => setSetup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{lang === 'fa' ? 'علت عدم ورود' : 'Primary Psychological Reason'} *</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as MissedTrade['reason'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="Hesitation">Hesitation (Second guessing)</option>
                  <option value="Fear of Loss">Fear of Loss (Post-loss trauma)</option>
                  <option value="Distracted">Distracted / Lack of Focus</option>
                  <option value="Away from Desk">Away from Desk</option>
                  <option value="Spread/Limit Missed">Spread / Limit Order Missed</option>
                  <option value="Analysis Paralysis">Analysis Paralysis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Missed Potential R</label>
                  <input
                    type="number"
                    step="0.1"
                    value={potentialR}
                    onChange={e => setPotentialR(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Missed Profit ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={potentialPnL}
                    onChange={e => setPotentialPnL(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{lang === 'fa' ? 'بازتاب روانشناسی و توضیح' : 'Psychological Reflection'}</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Why did you hesitate? What can you tell yourself next time?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold"
                >
                  Save Missed Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

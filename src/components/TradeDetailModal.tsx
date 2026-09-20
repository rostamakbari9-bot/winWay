import React from 'react';
import { Trade } from '../types';
import { translations, formatCurrency, formatR, formatPercent } from '../translations';
import { X, TrendingUp, TrendingDown, CheckCircle2, XCircle, Edit, Trash2, Calendar, Clock, DollarSign, Target, ShieldAlert, HeartPulse } from 'lucide-react';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  lang: 'en' | 'fa';
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  lang
}) => {
  const t = translations[lang];

  if (!isOpen || !trade) return null;

  const isPositive = trade.netPnL >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        dir={lang === 'fa' ? 'rtl' : 'ltr'}
      >
        {/* Banner Header with P&L */}
        <div className={`p-6 border-b ${
          isPositive ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-rose-950/30 border-rose-500/20'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border ${
                trade.direction === 'LONG'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {trade.direction === 'LONG' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-mono tracking-tight text-white">{trade.symbol}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                    trade.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {trade.direction}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                    {trade.assetClass}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trade.entryDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {trade.entryTime} - {trade.exitTime}
                  </span>
                  <span className="text-slate-500 font-medium">({trade.session} Session)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(trade);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title={t.edit}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(t.confirmDelete)) {
                    onDelete(trade.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* KPI Ticker inside header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">{t.pnl}</div>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatCurrency(trade.netPnL)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">{t.rMultiple}</div>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${
                trade.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatR(trade.rMultiple)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">{t.returnPct}</div>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${
                trade.returnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatPercent(trade.returnPercent)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">{t.ruleCompliance}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {trade.followedPlan ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'fa' ? 'رعایت شد' : 'Followed'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 text-sm font-semibold">
                    <XCircle className="w-4 h-4" />
                    {lang === 'fa' ? 'نقض پلن' : 'Violated'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Price Execution Breakdown */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'fa' ? 'کالبدشکافی قیمت و ریسک' : 'Execution & Pricing Data'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{t.entry}</span>
                <span className="font-semibold text-slate-200">{trade.entryPrice}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.exit}</span>
                <span className="font-semibold text-slate-200">{trade.exitPrice}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.stopLoss}</span>
                <span className="font-semibold text-rose-300">{trade.stopLoss}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.takeProfit}</span>
                <span className="font-semibold text-emerald-300">{trade.takeProfit || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.size}</span>
                <span className="font-semibold text-slate-200">{trade.size}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.riskAmount}</span>
                <span className="font-semibold text-amber-300">${trade.riskAmount}</span>
              </div>
            </div>
          </div>

          {/* Strategy & Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                {t.setup}
              </h4>
              <div className="font-semibold text-slate-200 text-sm">{trade.setup}</div>
              <div className="text-xs text-slate-400 mt-1">
                Timeframe: <span className="font-mono text-slate-300">{trade.timeframe}</span> | Session: <span className="text-slate-300">{trade.session}</span>
              </div>
            </div>

            {/* Mistakes */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                {t.mistakes}
              </h4>
              {trade.mistakes && trade.mistakes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {trade.mistakes.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'fa' ? 'معامله تمیز و بدون اشتباه' : 'Flawless trade — no rule violations recorded.'}
                </div>
              )}
            </div>
          </div>

          {/* Emotional Journey */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/60">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-purple-400" />
              {t.psychologyReview}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">{t.preTradeEmotion}</div>
                <div className="font-semibold text-slate-200 mt-0.5">{trade.emotions.pre}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">{t.inTradeEmotion}</div>
                <div className="font-semibold text-slate-200 mt-0.5">{trade.emotions.during}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">{t.postTradeEmotion}</div>
                <div className="font-semibold text-slate-200 mt-0.5">{trade.emotions.post}</div>
              </div>
            </div>
          </div>

          {/* Narrative Notes */}
          {trade.notes && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {lang === 'fa' ? 'یادداشت‌های تحلیلگر' : 'Trade Journal Notes'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                {trade.notes}
              </p>
            </div>
          )}

          {/* Review what went well & what to improve */}
          {(trade.whatWentWell || trade.whatToImprove) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {trade.whatWentWell && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="font-semibold text-emerald-400 block mb-1">{t.whatWentWell}</span>
                  <span className="text-slate-300">{trade.whatWentWell}</span>
                </div>
              )}
              {trade.whatToImprove && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <span className="font-semibold text-amber-400 block mb-1">{t.whatToImprove}</span>
                  <span className="text-slate-300">{trade.whatToImprove}</span>
                </div>
              )}
            </div>
          )}

          {/* Attached Chart image */}
          {trade.chartUrl && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t.chartAttachment}
              </h4>
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-80">
                <img
                  src={trade.chartUrl}
                  alt={`${trade.symbol} Chart`}
                  className="w-full h-auto object-cover"
                  onError={e => {
                    // fallback if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Trade, AssetClass, TradeDirection, TradeStatus, TradingSession, EmotionState } from '../types';
import { translations, formatCurrency } from '../translations';
import { X, Check, AlertCircle, TrendingUp, TrendingDown, Image as ImageIcon, Calculator } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  tradeToEdit?: Trade | null;
  lang: 'en' | 'fa';
}

const COMMON_SETUPS = [
  "ICT Fair Value Gap + Sweep",
  "Asian Range Liquidity Grab",
  "Breakout & Retest",
  "Orderblock Demand",
  "VWAP Mean Reversion",
  "20 EMA Trend Pullback",
  "Range Liquidity Raid",
  "Supply & Demand Reversal"
];

const COMMON_MISTAKES = [
  "FOMO / Chased Entry",
  "Moved Stop Loss Early",
  "Overleveraged Position",
  "Exited Before Target",
  "Revenge Trade After Loss",
  "Traded High-Impact News",
  "Traded Outside Optimal Session",
  "Ignored Higher Timeframe Bias"
];

const EMOTION_OPTIONS: EmotionState[] = [
  "Disciplined",
  "Calm",
  "Confident",
  "Patient",
  "Hesitant",
  "FOMO",
  "Anxious",
  "Rushed",
  "Greedy",
  "Revengeful",
  "Frustrated"
];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tradeToEdit,
  lang
}) => {
  const t = translations[lang];

  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('forex');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [status, setStatus] = useState<TradeStatus>('WIN');
  
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryTime, setEntryTime] = useState('09:30');
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10));
  const [exitTime, setExitTime] = useState('11:00');

  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [size, setSize] = useState<number>(1);
  const [riskAmount, setRiskAmount] = useState<number>(500);
  const [netPnL, setNetPnL] = useState<number>(0);
  const [fees, setFees] = useState<number>(10);
  
  const [setup, setSetup] = useState('ICT Fair Value Gap + Sweep');
  const [session, setSession] = useState<TradingSession>('London');
  const [timeframe, setTimeframe] = useState('5m');
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);

  const [preEmotion, setPreEmotion] = useState<EmotionState>('Calm');
  const [duringEmotion, setDuringEmotion] = useState<EmotionState>('Disciplined');
  const [postEmotion, setPostEmotion] = useState<EmotionState>('Satisfied');

  const [followedPlan, setFollowedPlan] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [chartUrl, setChartUrl] = useState('');
  const [account, setAccount] = useState('Main Account');

  // Populate form if editing
  useEffect(() => {
    if (tradeToEdit) {
      setSymbol(tradeToEdit.symbol);
      setAssetClass(tradeToEdit.assetClass);
      setDirection(tradeToEdit.direction);
      setStatus(tradeToEdit.status);
      setEntryDate(tradeToEdit.entryDate);
      setEntryTime(tradeToEdit.entryTime);
      setExitDate(tradeToEdit.exitDate);
      setExitTime(tradeToEdit.exitTime);
      setEntryPrice(tradeToEdit.entryPrice);
      setExitPrice(tradeToEdit.exitPrice);
      setStopLoss(tradeToEdit.stopLoss);
      setTakeProfit(tradeToEdit.takeProfit || 0);
      setSize(tradeToEdit.size);
      setRiskAmount(tradeToEdit.riskAmount);
      setNetPnL(tradeToEdit.netPnL);
      setFees(tradeToEdit.fees);
      setSetup(tradeToEdit.setup);
      setSession(tradeToEdit.session);
      setTimeframe(tradeToEdit.timeframe);
      setSelectedMistakes(tradeToEdit.mistakes || []);
      setPreEmotion(tradeToEdit.emotions.pre);
      setDuringEmotion(tradeToEdit.emotions.during);
      setPostEmotion(tradeToEdit.emotions.post);
      setFollowedPlan(tradeToEdit.followedPlan);
      setNotes(tradeToEdit.notes || '');
      setWhatWentWell(tradeToEdit.whatWentWell || '');
      setWhatToImprove(tradeToEdit.whatToImprove || '');
      setChartUrl(tradeToEdit.chartUrl || '');
      setAccount(tradeToEdit.account || 'Main Account');
    } else {
      // Default clean state
      setSymbol('XAU/USD');
      setAssetClass('commodities');
      setDirection('LONG');
      setStatus('WIN');
      setEntryDate(new Date().toISOString().slice(0, 10));
      setExitDate(new Date().toISOString().slice(0, 10));
      setEntryPrice(2600);
      setExitPrice(2620);
      setStopLoss(2590);
      setTakeProfit(2630);
      setSize(1);
      setRiskAmount(500);
      setNetPnL(1500);
      setFees(15);
      setSelectedMistakes([]);
      setFollowedPlan(true);
      setNotes('');
      setWhatWentWell('');
      setWhatToImprove('');
      setChartUrl('');
    }
  }, [tradeToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleMistake = (m: string) => {
    setSelectedMistakes(prev => 
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  const handleAutoCalculatePnL = () => {
    if (entryPrice <= 0 || exitPrice <= 0) return;
    let diff = 0;
    if (direction === 'LONG') {
      diff = exitPrice - entryPrice;
    } else {
      diff = entryPrice - exitPrice;
    }

    // Heuristic multiplier for pips / points
    let calc = 0;
    if (assetClass === 'forex') {
      calc = diff * size * 100000;
    } else if (assetClass === 'indices') {
      calc = diff * size * 20; // e.g. NQ $20/pt
    } else if (assetClass === 'commodities') {
      calc = diff * size * 100; // e.g. Gold $100/pt
    } else {
      calc = diff * size;
    }

    const finalPnL = Math.round((calc - fees) * 100) / 100;
    setNetPnL(finalPnL);
    if (finalPnL > 0) setStatus('WIN');
    else if (finalPnL < 0) setStatus('LOSS');
    else setStatus('BE');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const r = riskAmount > 0 ? Number((netPnL / riskAmount).toFixed(2)) : 0;
    const returnPct = riskAmount > 0 ? Number(((netPnL / riskAmount) * 10).toFixed(1)) : 0;

    const newTrade: Trade = {
      id: tradeToEdit ? tradeToEdit.id : `tr-${Date.now()}`,
      symbol: symbol.toUpperCase().trim() || 'UNTITLED',
      assetClass,
      direction,
      status,
      entryDate,
      entryTime,
      exitDate,
      exitTime,
      entryPrice: Number(entryPrice),
      exitPrice: Number(exitPrice),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit) || undefined,
      size: Number(size),
      riskAmount: Number(riskAmount) || 1,
      netPnL: Number(netPnL),
      rMultiple: r,
      returnPercent: returnPct,
      fees: Number(fees) || 0,
      setup,
      session,
      timeframe,
      mistakes: selectedMistakes,
      emotions: {
        pre: preEmotion,
        during: duringEmotion,
        post: postEmotion,
      },
      followedPlan,
      notes,
      whatWentWell,
      whatToImprove,
      chartUrl: chartUrl.trim() || undefined,
      account
    };

    onSave(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        dir={lang === 'fa' ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {direction === 'LONG' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {tradeToEdit ? (lang === 'fa' ? 'ویرایش معامله' : 'Edit Trade') : t.newTrade}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'fa' ? 'ثبت دقیق پارامترهای ورود، خروج، احساسات و انضباط' : 'Capture execution data, psychological state, and lessons learned'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Row 1: Symbol, Asset Class, Direction, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.symbol} *
              </label>
              <input
                type="text"
                required
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                placeholder="e.g. XAU/USD, NQ, BTC/USDT"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'fa' ? 'بازار دارایی' : 'Asset Class'}
              </label>
              <select
                value={assetClass}
                onChange={e => setAssetClass(e.target.value as AssetClass)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="forex">{t.forex}</option>
                <option value="crypto">{t.crypto}</option>
                <option value="indices">{t.indices}</option>
                <option value="stocks">{t.stocks}</option>
                <option value="commodities">{t.commodities}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.type}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    direction === 'LONG'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.long}
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    direction === 'SHORT'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.short}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'fa' ? 'وضعیت نهایی' : 'Outcome Status'}
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TradeStatus)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="WIN">{t.statusWin}</option>
                <option value="LOSS">{t.statusLoss}</option>
                <option value="BE">{t.statusBE}</option>
                <option value="OPEN">{t.statusOpen}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Dates and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'fa' ? 'تاریخ ورود' : 'Entry Date'}
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'fa' ? 'ساعت ورود' : 'Entry Time'}
              </label>
              <input
                type="time"
                value={entryTime}
                onChange={e => setEntryTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'fa' ? 'تاریخ خروج' : 'Exit Date'}
              </label>
              <input
                type="date"
                value={exitDate}
                onChange={e => setExitDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'fa' ? 'ساعت خروج' : 'Exit Time'}
              </label>
              <input
                type="time"
                value={exitTime}
                onChange={e => setExitTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          {/* Row 3: Prices & Position Math */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'fa' ? 'محاسبات مالی و نقاط ورود/خروج' : 'Price Execution & Risk Math'}
              </span>
              <button
                type="button"
                onClick={handleAutoCalculatePnL}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
              >
                {lang === 'fa' ? 'محاسبه خودکار P&L' : 'Auto Calculate P&L'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.entry} *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={entryPrice || ''}
                  onChange={e => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.exit} *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={exitPrice || ''}
                  onChange={e => setExitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.stopLoss} *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={stopLoss || ''}
                  onChange={e => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.takeProfit}</label>
                <input
                  type="number"
                  step="any"
                  value={takeProfit || ''}
                  onChange={e => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.size}</label>
                <input
                  type="number"
                  step="any"
                  value={size || ''}
                  onChange={e => setSize(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.riskAmount} *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={riskAmount || ''}
                  onChange={e => setRiskAmount(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-300"
                />
              </div>
            </div>

            {/* PnL and Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.pnl} ($) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={netPnL}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setNetPnL(val);
                    if (val > 0) setStatus('WIN');
                    else if (val < 0) setStatus('LOSS');
                    else setStatus('BE');
                  }}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-base font-mono font-bold ${
                    netPnL >= 0 ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
                  }`}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {riskAmount > 0 && `Result: ${(netPnL / riskAmount).toFixed(2)}R`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.fees} ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={fees}
                  onChange={e => setFees(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Strategy, Session, Timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.setup}
              </label>
              <input
                list="setups-list"
                value={setup}
                onChange={e => setSetup(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
              <datalist id="setups-list">
                {COMMON_SETUPS.map((s, idx) => (
                  <option key={idx} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.session}
              </label>
              <select
                value={session}
                onChange={e => setSession(e.target.value as TradingSession)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="Asia">Asia Session</option>
                <option value="Overnight">Overnight Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t.timeframe}
              </label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
              >
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
          </div>

          {/* Row 5: Discipline & Mistake Tags */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {lang === 'fa' ? 'اشتباهات مرتکب شده (تأثیر روانی بر حساب)' : 'Execution Mistakes Made'}
              </label>

              {/* Followed Plan Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={followedPlan}
                  onChange={e => setFollowedPlan(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 bg-slate-800"
                />
                <span className={followedPlan ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  {lang === 'fa' ? 'پایبندی کامل به قوانین پلن' : 'Strictly Followed Trade Plan'}
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COMMON_MISTAKES.map((m, idx) => {
                const isSelected = selectedMistakes.includes(m);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleMistake(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Emotional Journey Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.preTradeEmotion}
              </label>
              <select
                value={preEmotion}
                onChange={e => setPreEmotion(e.target.value as EmotionState)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                {EMOTION_OPTIONS.map(emo => (
                  <option key={emo} value={emo}>{emo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.inTradeEmotion}
              </label>
              <select
                value={duringEmotion}
                onChange={e => setDuringEmotion(e.target.value as EmotionState)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                {EMOTION_OPTIONS.map(emo => (
                  <option key={emo} value={emo}>{emo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.postTradeEmotion}
              </label>
              <select
                value={postEmotion}
                onChange={e => setPostEmotion(e.target.value as EmotionState)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                {EMOTION_OPTIONS.map(emo => (
                  <option key={emo} value={emo}>{emo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 7: Notes & Review */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {lang === 'fa' ? 'شرح و تحلیل معامله' : 'Trade Journal & Context Notes'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What was the market doing? What confluence did you see on higher timeframes?"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">
                  {t.whatWentWell}
                </label>
                <input
                  type="text"
                  value={whatWentWell}
                  onChange={e => setWhatWentWell(e.target.value)}
                  placeholder="e.g. Followed entry trigger, held through minor noise"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-400 mb-1">
                  {t.whatToImprove}
                </label>
                <input
                  type="text"
                  value={whatToImprove}
                  onChange={e => setWhatToImprove(e.target.value)}
                  placeholder="e.g. Better patience at Asian high, trail stop sooner"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Chart screenshot URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                {t.chartAttachment} (URL)
              </label>
              <input
                type="url"
                value={chartUrl}
                onChange={e => setChartUrl(e.target.value)}
                placeholder="https://... TradingView image URL or screenshot link"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all font-sans flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {t.saveTrade}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

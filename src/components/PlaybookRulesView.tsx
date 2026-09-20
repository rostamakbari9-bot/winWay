import React, { useState } from 'react';
import { TradingRule, DailyNote, Language } from '../types';
import { translations } from '../translations';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Star, 
  BookOpen, 
  PenLine, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface PlaybookRulesViewProps {
  rules: TradingRule[];
  onToggleRule: (id: string) => void;
  onAddRule: (rule: TradingRule) => void;
  onDeleteRule: (id: string) => void;
  dailyNotes: DailyNote[];
  onSaveDailyNote: (note: DailyNote) => void;
  lang: Language;
}

export const PlaybookRulesView: React.FC<PlaybookRulesViewProps> = ({
  rules,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  dailyNotes,
  onSaveDailyNote,
  lang,
}) => {
  const t = translations[lang];

  // Daily note entry state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState<number>(5);
  const [marketCondition, setMarketCondition] = useState<DailyNote['marketCondition']>('Trending Bullish');
  const [preMarketNotes, setPreMarketNotes] = useState('');
  const [postMarketNotes, setPostMarketNotes] = useState('');
  const [followedRules, setFollowedRules] = useState(true);
  const [keyLesson, setKeyLesson] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // New rule modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<TradingRule['category']>('Risk');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const note: DailyNote = {
      id: `dn-${Date.now()}`,
      date,
      rating,
      marketCondition,
      preMarketNotes,
      postMarketNotes,
      followedRules,
      keyLesson
    };
    onSaveDailyNote(note);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    const r: TradingRule = {
      id: `r-${Date.now()}`,
      title: newRuleTitle.trim(),
      category: newRuleCategory,
      description: newRuleDesc.trim(),
      isActive: true
    };
    onAddRule(r);
    setIsRuleModalOpen(false);
    setNewRuleTitle('');
    setNewRuleDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t.tradingPlaybookTitle}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {t.playbookSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all font-sans shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRule}</span>
          </button>
        </div>
      </div>

      {/* Row: Rules Checklist (Left) & Daily Routine Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Trading Rules Checklist */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t.rulesChecklist}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {rules.filter(r => r.isActive).length}/{rules.length} active
            </span>
          </div>

          <div className="space-y-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  rule.isActive
                    ? 'bg-slate-950/70 border-slate-700/80'
                    : 'bg-slate-950/20 border-slate-850 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      rule.isActive
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{rule.title}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold ${
                        rule.category === 'Risk' ? 'bg-amber-500/20 text-amber-300' :
                        rule.category === 'Psychology' ? 'bg-purple-500/20 text-purple-300' :
                        rule.category === 'Execution' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {rule.category}
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {rule.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                  title={t.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Pre/Post Market Routine Entry */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <PenLine className="w-4 h-4 text-purple-400" />
              {lang === 'fa' ? 'ثبت روتین و یادداشت روزانه' : 'Daily Journal & Routine Entry'}
            </h3>
            {showSaveConfirm && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'fa' ? 'یادداشت ذخیره شد' : 'Journal Saved!'}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">{t.date}</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{lang === 'fa' ? 'وضعیت عمومی بازار' : 'Market Regime'}</label>
                <select
                  value={marketCondition}
                  onChange={e => setMarketCondition(e.target.value as DailyNote['marketCondition'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="Trending Bullish">Trending Bullish</option>
                  <option value="Trending Bearish">Trending Bearish</option>
                  <option value="Ranging/Choppy">Ranging / Choppy</option>
                  <option value="High Volatility">High Volatility (News Day)</option>
                  <option value="Low Volume">Low Volume / Consolidation</option>
                </select>
              </div>
            </div>

            {/* Rating Stars & Followed Rules */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">{lang === 'fa' ? 'امتیاز انضباط امروز (۱ تا ۵)' : 'Daily Discipline Rating'}</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 rounded transition-transform hover:scale-125 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={followedRules}
                  onChange={e => setFollowedRules(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 w-4 h-4 bg-slate-800"
                />
                <span className={followedRules ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  {lang === 'fa' ? 'پایبند به همه قوانین' : '100% Followed Rules'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t.preMarketChecklist}</label>
              <textarea
                rows={2}
                value={preMarketNotes}
                onChange={e => setPreMarketNotes(e.target.value)}
                placeholder="News events, key liquidity levels, mental state before opening terminal..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t.postMarketReview}</label>
              <textarea
                rows={2}
                value={postMarketNotes}
                onChange={e => setPostMarketNotes(e.target.value)}
                placeholder="Recap of trades, emotional challenges faced, how did execution feel?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{lang === 'fa' ? 'مهم‌ترین درس امروز' : 'Key Lesson of the Day'}</label>
              <input
                type="text"
                value={keyLesson}
                onChange={e => setKeyLesson(e.target.value)}
                placeholder="e.g. Always wait 15m after NFP before taking any trade"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20 transition-all"
            >
              {t.saveNotes}
            </button>
          </form>
        </div>
      </div>

      {/* Past Daily Notes History */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          {lang === 'fa' ? 'تاریخچه بازتاب‌های روزانه' : 'Past Daily Routine Logs'}
        </h3>

        <div className="space-y-3">
          {dailyNotes.map(dn => (
            <div key={dn.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-200">{dn.date}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    {dn.marketCondition}
                  </span>
                  {dn.followedRules ? (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Followed Rules
                    </span>
                  ) : (
                    <span className="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Rule Breach
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: dn.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {dn.keyLesson && (
                <div className="text-xs text-slate-200 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <strong className="text-emerald-400 font-medium">Lesson:</strong> {dn.keyLesson}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-1">
                {dn.preMarketNotes && (
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Pre-Market:</span>
                    <p className="mt-0.5">{dn.preMarketNotes}</p>
                  </div>
                )}
                {dn.postMarketNotes && (
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Post-Market:</span>
                    <p className="mt-0.5">{dn.postMarketNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100"
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
          >
            <h3 className="font-bold text-base mb-4">{t.addRule}</h3>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  value={newRuleTitle}
                  onChange={e => setNewRuleTitle(e.target.value)}
                  placeholder="e.g. Max 2% Daily Loss Limit"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newRuleCategory}
                  onChange={e => setNewRuleCategory(e.target.value as TradingRule['category'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="Risk">Risk Management</option>
                  <option value="Execution">Execution Discipline</option>
                  <option value="Psychology">Psychology & Emotional Control</option>
                  <option value="Routine">Daily Routine & Habit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Enforcing Condition</label>
                <textarea
                  rows={3}
                  value={newRuleDesc}
                  onChange={e => setNewRuleDesc(e.target.value)}
                  placeholder="Explain why this rule protects your edge and when it triggers..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  {t.addRule}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

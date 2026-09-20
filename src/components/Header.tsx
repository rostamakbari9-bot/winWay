import React from 'react';
import { ActiveTab, Language, Theme } from '../types';
import { translations, formatCurrency } from '../translations';
import { PerformanceStats } from '../utils/calculations';
import { 
  Plus, 
  Sun, 
  Moon, 
  Languages, 
  Menu, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: PerformanceStats;
  currentBalance: number;
  dayPnL: number;
  onOpenNewTrade: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  currentBalance,
  dayPnL,
  onOpenNewTrade,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onOpenMobileMenu,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold font-mono text-emerald-400 text-base">
                W
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-base text-white font-sans">
                  WIN <span className="text-emerald-400">WAY</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
                {t.brandSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Performance Snapshot Ticker (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-4 py-1.5 rounded-full text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t.accountBalance}:</span>
            <span className="font-mono font-bold text-slate-100">${currentBalance.toLocaleString()}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{lang === 'fa' ? 'سود امروز:' : "Today's P&L:"}</span>
            <span className={`font-mono font-bold flex items-center gap-0.5 ${dayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dayPnL >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {formatCurrency(dayPnL)}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t.winRate}:</span>
            <span className="font-mono font-semibold text-emerald-400">{stats.winRate.toFixed(1)}%</span>
          </div>

          {stats.currentStreak.count > 0 && (
            <>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-1 font-mono text-amber-400">
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.currentStreak.count}{stats.currentStreak.type === 'WIN' ? 'W' : 'L'}</span>
              </div>
            </>
          )}

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1 text-slate-300" title="Trading discipline score">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">{stats.ruleComplianceRate.toFixed(0)}%</span>
          </div>
        </div>

        {/* Right Controls: Language, Theme, New Trade Button */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title={lang === 'en' ? 'تغییر زبان به فارسی' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono uppercase text-[11px]">{lang === 'en' ? 'FA' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Primary CTA: Log Trade */}
          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all font-sans cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.newTrade}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-emerald-600/30 text-emerald-950 rounded font-mono font-bold">
              N
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};

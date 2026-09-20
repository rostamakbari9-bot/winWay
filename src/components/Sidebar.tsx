import React from 'react';
import { ActiveTab, Language } from '../types';
import { translations } from '../translations';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  EyeOff, 
  ShieldCheck, 
  X,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  tradesCount: number;
  onExportCSV: () => void;
  onResetDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  mobileOpen,
  onCloseMobile,
  tradesCount,
  onExportCSV,
  onResetDemo,
}) => {
  const t = translations[lang];

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'journal',
      label: t.journal,
      icon: <BookOpen className="w-4 h-4" />,
      badge: String(tradesCount),
    },
    {
      id: 'analytics',
      label: t.analytics,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'missed',
      label: t.missedTrades,
      icon: <EyeOff className="w-4 h-4" />,
    },
    {
      id: 'playbook',
      label: t.playbook,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Mobile Header Close */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono text-sm">
              W
            </div>
            <span className="font-bold text-slate-100 font-sans tracking-wide">WIN WAY</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section label */}
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {lang === 'fa' ? 'بخش‌های اصلی' : 'Main Modules'}
        </div>

        {/* Nav List */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer utility buttons */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onExportCSV}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.exportCSV}</span>
        </button>

        <button
          onClick={onResetDemo}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800/50 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.resetData}</span>
        </button>

        <div className="px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Trading Engine:</span>
            <span className="text-emerald-400 font-mono font-semibold">Active</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Version:</span>
            <span className="font-mono">v2.4 Pro</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-950/60 border-r border-slate-800/80 p-4 h-[calc(100vh-61px)] sticky top-[61px]">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 border-r border-slate-800 p-5 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Trade, 
  MissedTrade, 
  DailyNote, 
  TradingRule, 
  ActiveTab, 
  Language, 
  Theme 
} from './types';
import { 
  INITIAL_TRADES, 
  INITIAL_MISSED_TRADES, 
  INITIAL_DAILY_NOTES, 
  INITIAL_RULES 
} from './mockData';
import { 
  computePerformanceStats, 
  generateEquityCurve, 
  groupTradesByDay 
} from './utils/calculations';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { JournalView } from './components/JournalView';
import { AnalyticsView } from './components/AnalyticsView';
import { MissedTradesView } from './components/MissedTradesView';
import { PlaybookRulesView } from './components/PlaybookRulesView';
import { TradeModal } from './components/TradeModal';
import { TradeDetailModal } from './components/TradeDetailModal';

export default function App() {
  // LocalStorage persistence for trades
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('winway_trades');
      return saved ? JSON.parse(saved) : INITIAL_TRADES;
    } catch {
      return INITIAL_TRADES;
    }
  });

  const [missedTrades, setMissedTrades] = useState<MissedTrade[]>(() => {
    try {
      const saved = localStorage.getItem('winway_missed_trades');
      return saved ? JSON.parse(saved) : INITIAL_MISSED_TRADES;
    } catch {
      return INITIAL_MISSED_TRADES;
    }
  });

  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>(() => {
    try {
      const saved = localStorage.getItem('winway_daily_notes');
      return saved ? JSON.parse(saved) : INITIAL_DAILY_NOTES;
    } catch {
      return INITIAL_DAILY_NOTES;
    }
  });

  const [rules, setRules] = useState<TradingRule[]>(() => {
    try {
      const saved = localStorage.getItem('winway_rules');
      return saved ? JSON.parse(saved) : INITIAL_RULES;
    } catch {
      return INITIAL_RULES;
    }
  });

  // App settings state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [selectedTradeForDetail, setSelectedTradeForDetail] = useState<Trade | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('winway_trades', JSON.stringify(trades));
    } catch (e) {
      console.error(e);
    }
  }, [trades]);

  useEffect(() => {
    try {
      localStorage.setItem('winway_missed_trades', JSON.stringify(missedTrades));
    } catch (e) {
      console.error(e);
    }
  }, [missedTrades]);

  useEffect(() => {
    try {
      localStorage.setItem('winway_daily_notes', JSON.stringify(dailyNotes));
    } catch (e) {
      console.error(e);
    }
  }, [dailyNotes]);

  useEffect(() => {
    try {
      localStorage.setItem('winway_rules', JSON.stringify(rules));
    } catch (e) {
      console.error(e);
    }
  }, [rules]);

  // Handle document direction and theme classes
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // Global hotkey 'N' to log new trade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setTradeToEdit(null);
        setIsTradeModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Performance computations
  const stats = useMemo(() => computePerformanceStats(trades, 100000), [trades]);
  const equityCurve = useMemo(() => generateEquityCurve(trades, 100000), [trades]);
  const currentBalance = 100000 + stats.netPnL;

  // Day's P&L (latest active day)
  const dayPnL = useMemo(() => {
    const dailyMap = groupTradesByDay(trades);
    const dates = Array.from(dailyMap.keys()).sort().reverse();
    if (dates.length > 0) {
      return dailyMap.get(dates[0])?.netPnL || 0;
    }
    return 0;
  }, [trades]);

  // Trade management callbacks
  const handleSaveTrade = useCallback((trade: Trade) => {
    setTrades(prev => {
      const exists = prev.some(t => t.id === trade.id);
      if (exists) {
        return prev.map(t => (t.id === trade.id ? trade : t));
      } else {
        return [trade, ...prev];
      }
    });
  }, []);

  const handleDeleteTrade = useCallback((tradeId: string) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
    if (selectedTradeForDetail?.id === tradeId) {
      setSelectedTradeForDetail(null);
    }
  }, [selectedTradeForDetail]);

  const handleOpenEdit = useCallback((trade: Trade) => {
    setTradeToEdit(trade);
    setIsTradeModalOpen(true);
  }, []);

  const handleViewTrade = useCallback((trade: Trade) => {
    setSelectedTradeForDetail(trade);
  }, []);

  // Missed Trade callbacks
  const handleAddMissedTrade = useCallback((mt: MissedTrade) => {
    setMissedTrades(prev => [mt, ...prev]);
  }, []);

  const handleDeleteMissedTrade = useCallback((id: string) => {
    setMissedTrades(prev => prev.filter(m => m.id !== id));
  }, []);

  // Daily note callback
  const handleSaveDailyNote = useCallback((note: DailyNote) => {
    setDailyNotes(prev => {
      const idx = prev.findIndex(n => n.date === note.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = note;
        return updated;
      }
      return [note, ...prev];
    });
  }, []);

  // Rules callbacks
  const handleToggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  }, []);

  const handleAddRule = useCallback((rule: TradingRule) => {
    setRules(prev => [...prev, rule]);
  }, []);

  const handleDeleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  // Reset Demo Data
  const handleResetDemo = useCallback(() => {
    if (confirm('Reset journal data back to default demo records?')) {
      setTrades(INITIAL_TRADES);
      setMissedTrades(INITIAL_MISSED_TRADES);
      setDailyNotes(INITIAL_DAILY_NOTES);
      setRules(INITIAL_RULES);
      localStorage.removeItem('winway_trades');
      localStorage.removeItem('winway_missed_trades');
      localStorage.removeItem('winway_daily_notes');
      localStorage.removeItem('winway_rules');
    }
  }, []);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = [
      "ID",
      "Date",
      "Time",
      "Symbol",
      "AssetClass",
      "Direction",
      "Status",
      "EntryPrice",
      "ExitPrice",
      "Size",
      "RiskAmount",
      "NetPnL",
      "RMultiple",
      "ReturnPercent",
      "Fees",
      "Setup",
      "Session",
      "Mistakes",
      "FollowedPlan",
      "Notes"
    ];

    const rows = trades.map(t => [
      t.id,
      t.entryDate,
      t.entryTime,
      t.symbol,
      t.assetClass,
      t.direction,
      t.status,
      t.entryPrice,
      t.exitPrice,
      t.size,
      t.riskAmount,
      t.netPnL,
      t.rMultiple,
      t.returnPercent,
      t.fees,
      `"${(t.setup || '').replace(/"/g, '""')}"`,
      t.session,
      `"${(t.mistakes || []).join('; ')}"`,
      t.followedPlan ? "YES" : "NO",
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WIN_WAY_Trading_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [trades]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        currentBalance={currentBalance}
        dayPnL={dayPnL}
        onOpenNewTrade={() => {
          setTradeToEdit(null);
          setIsTradeModalOpen(true);
        }}
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'en' ? 'fa' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main App Layout */}
      <div className="flex max-w-7xl mx-auto w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          tradesCount={trades.length}
          onExportCSV={handleExportCSV}
          onResetDemo={handleResetDemo}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              trades={trades}
              stats={stats}
              equityData={equityCurve}
              lang={lang}
              onViewTrade={handleViewTrade}
              onNavigateToJournal={() => setActiveTab('journal')}
              onOpenNewTrade={() => {
                setTradeToEdit(null);
                setIsTradeModalOpen(true);
              }}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                if (date) {
                  setActiveTab('journal');
                }
              }}
            />
          )}

          {activeTab === 'journal' && (
            <JournalView
              trades={trades}
              lang={lang}
              onViewTrade={handleViewTrade}
              onEditTrade={handleOpenEdit}
              onDeleteTrade={handleDeleteTrade}
              onOpenNewTrade={() => {
                setTradeToEdit(null);
                setIsTradeModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              trades={trades}
              stats={stats}
              lang={lang}
            />
          )}

          {activeTab === 'missed' && (
            <MissedTradesView
              missedTrades={missedTrades}
              onAddMissedTrade={handleAddMissedTrade}
              onDeleteMissedTrade={handleDeleteMissedTrade}
              lang={lang}
            />
          )}

          {activeTab === 'playbook' && (
            <PlaybookRulesView
              rules={rules}
              onToggleRule={handleToggleRule}
              onAddRule={handleAddRule}
              onDeleteRule={handleDeleteRule}
              dailyNotes={dailyNotes}
              onSaveDailyNote={handleSaveDailyNote}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Trade Creation/Editing Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradeToEdit(null);
        }}
        onSave={handleSaveTrade}
        tradeToEdit={tradeToEdit}
        lang={lang}
      />

      {/* Trade In-Depth Detail Inspector Modal */}
      <TradeDetailModal
        trade={selectedTradeForDetail}
        isOpen={!!selectedTradeForDetail}
        onClose={() => setSelectedTradeForDetail(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTrade}
        lang={lang}
      />
    </div>
  );
}


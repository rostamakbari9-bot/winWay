import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Trade, 
  MissedTrade, 
  DailyNote, 
  TradingRule, 
  ActiveTab, 
  Language, 
  Theme,
  UserProfile 
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
import { AuthModal, AuthModalMode } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { PricingModal } from './components/PricingModal';
import { translations } from './translations';

// Firebase integration
import { useAuth } from './hooks/useAuth';
import { useTrades } from './hooks/useTrades';
import { useMissedTrades } from './hooks/useMissedTrades';
import { useDailyNotes } from './hooks/useDailyNotes';
import { useTradingRules } from './hooks/useTradingRules';
import { migrateLocalDataToFirestore } from './firebase/firestoreService';
import { isFirebaseConfigured } from './firebase/config';
import { Cloud, CloudUpload, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  // Auth state from Firebase
  const { user, profile: userProfile, loading: authLoading } = useAuth();
  const userId = user?.uid;

  // Firebase Real-Time Data Hooks
  const {
    trades: cloudTrades,
    loading: cloudTradesLoading,
    addOrUpdateTrade: saveCloudTrade,
    removeTrade: deleteCloudTrade,
  } = useTrades(userId);

  const {
    missedTrades: cloudMissedTrades,
    addOrUpdateMissedTrade: saveCloudMissedTrade,
    removeMissedTrade: deleteCloudMissedTrade,
  } = useMissedTrades(userId);

  const {
    dailyNotes: cloudDailyNotes,
    addOrUpdateDailyNote: saveCloudDailyNote,
  } = useDailyNotes(userId);

  const {
    rules: cloudRules,
    addOrUpdateRule: saveCloudRule,
    removeRule: deleteCloudRule,
    toggleRule: toggleCloudRule,
  } = useTradingRules(userId);

  // LocalStorage Fallback State (when user is not logged in)
  const [localTrades, setLocalTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('winway_trades');
      return saved ? JSON.parse(saved) : INITIAL_TRADES;
    } catch {
      return INITIAL_TRADES;
    }
  });

  const [localMissedTrades, setLocalMissedTrades] = useState<MissedTrade[]>(() => {
    try {
      const saved = localStorage.getItem('winway_missed_trades');
      return saved ? JSON.parse(saved) : INITIAL_MISSED_TRADES;
    } catch {
      return INITIAL_MISSED_TRADES;
    }
  });

  const [localDailyNotes, setLocalDailyNotes] = useState<DailyNote[]>(() => {
    try {
      const saved = localStorage.getItem('winway_daily_notes');
      return saved ? JSON.parse(saved) : INITIAL_DAILY_NOTES;
    } catch {
      return INITIAL_DAILY_NOTES;
    }
  });

  const [localRules, setLocalRules] = useState<TradingRule[]>(() => {
    try {
      const saved = localStorage.getItem('winway_rules');
      return saved ? JSON.parse(saved) : INITIAL_RULES;
    } catch {
      return INITIAL_RULES;
    }
  });

  // Effective state: If user is authenticated, use cloud data; otherwise, use local data
  const trades = useMemo(() => {
    return userId ? cloudTrades : localTrades;
  }, [userId, cloudTrades, localTrades]);

  const missedTrades = useMemo(() => {
    return userId ? cloudMissedTrades : localMissedTrades;
  }, [userId, cloudMissedTrades, localMissedTrades]);

  const dailyNotes = useMemo(() => {
    return userId ? cloudDailyNotes : localDailyNotes;
  }, [userId, cloudDailyNotes, localDailyNotes]);

  const rules = useMemo(() => {
    return userId ? cloudRules : localRules;
  }, [userId, cloudRules, localRules]);

  // App UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [selectedTradeForDetail, setSelectedTradeForDetail] = useState<Trade | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Auth, Profile & Pricing Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);

  // Migration Banner State
  const [showMigrationPrompt, setShowMigrationPrompt] = useState<boolean>(false);
  const [migrating, setMigrating] = useState<boolean>(false);
  const [migrationSuccess, setMigrationSuccess] = useState<boolean>(false);

  const t = translations[lang];

  // Detect if there are local trades that can be migrated to cloud
  useEffect(() => {
    if (userId && !cloudTradesLoading) {
      const savedLocal = localStorage.getItem('winway_trades');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0 && cloudTrades.length === 0) {
            setShowMigrationPrompt(true);
          }
        } catch {
          // ignore
        }
      }
    } else {
      setShowMigrationPrompt(false);
    }
  }, [userId, cloudTradesLoading, cloudTrades.length]);

  // Save to localStorage when unauthenticated
  useEffect(() => {
    if (!userId) {
      try {
        localStorage.setItem('winway_trades', JSON.stringify(localTrades));
      } catch (e) {
        console.error(e);
      }
    }
  }, [localTrades, userId]);

  useEffect(() => {
    if (!userId) {
      try {
        localStorage.setItem('winway_missed_trades', JSON.stringify(localMissedTrades));
      } catch (e) {
        console.error(e);
      }
    }
  }, [localMissedTrades, userId]);

  useEffect(() => {
    if (!userId) {
      try {
        localStorage.setItem('winway_daily_notes', JSON.stringify(localDailyNotes));
      } catch (e) {
        console.error(e);
      }
    }
  }, [localDailyNotes, userId]);

  useEffect(() => {
    if (!userId) {
      try {
        localStorage.setItem('winway_rules', JSON.stringify(localRules));
      } catch (e) {
        console.error(e);
      }
    }
  }, [localRules, userId]);

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
  const handleSaveTrade = useCallback(async (trade: Trade) => {
    if (userId) {
      try {
        await saveCloudTrade(trade);
      } catch (err) {
        console.error('Failed to save trade to cloud:', err);
      }
    } else {
      setLocalTrades(prev => {
        const exists = prev.some(t => t.id === trade.id);
        if (exists) {
          return prev.map(t => (t.id === trade.id ? trade : t));
        } else {
          return [trade, ...prev];
        }
      });
    }
  }, [userId, saveCloudTrade]);

  const handleDeleteTrade = useCallback(async (tradeId: string) => {
    if (userId) {
      try {
        await deleteCloudTrade(tradeId);
      } catch (err) {
        console.error('Failed to delete trade from cloud:', err);
      }
    } else {
      setLocalTrades(prev => prev.filter(t => t.id !== tradeId));
    }
    if (selectedTradeForDetail?.id === tradeId) {
      setSelectedTradeForDetail(null);
    }
  }, [userId, deleteCloudTrade, selectedTradeForDetail]);

  const handleOpenEdit = useCallback((trade: Trade) => {
    setTradeToEdit(trade);
    setIsTradeModalOpen(true);
  }, []);

  const handleViewTrade = useCallback((trade: Trade) => {
    setSelectedTradeForDetail(trade);
  }, []);

  // Missed Trade callbacks
  const handleAddMissedTrade = useCallback(async (mt: MissedTrade) => {
    if (userId) {
      try {
        await saveCloudMissedTrade(mt);
      } catch (err) {
        console.error('Failed to save missed trade to cloud:', err);
      }
    } else {
      setLocalMissedTrades(prev => [mt, ...prev]);
    }
  }, [userId, saveCloudMissedTrade]);

  const handleDeleteMissedTrade = useCallback(async (id: string) => {
    if (userId) {
      try {
        await deleteCloudMissedTrade(id);
      } catch (err) {
        console.error('Failed to delete missed trade from cloud:', err);
      }
    } else {
      setLocalMissedTrades(prev => prev.filter(m => m.id !== id));
    }
  }, [userId, deleteCloudMissedTrade]);

  // Daily note callback
  const handleSaveDailyNote = useCallback(async (note: DailyNote) => {
    if (userId) {
      try {
        await saveCloudDailyNote(note);
      } catch (err) {
        console.error('Failed to save daily note to cloud:', err);
      }
    } else {
      setLocalDailyNotes(prev => {
        const idx = prev.findIndex(n => n.date === note.date);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = note;
          return updated;
        }
        return [note, ...prev];
      });
    }
  }, [userId, saveCloudDailyNote]);

  // Rules callbacks
  const handleToggleRule = useCallback(async (id: string) => {
    if (userId) {
      try {
        await toggleCloudRule(id);
      } catch (err) {
        console.error('Failed to toggle rule in cloud:', err);
      }
    } else {
      setLocalRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    }
  }, [userId, toggleCloudRule]);

  const handleAddRule = useCallback(async (rule: TradingRule) => {
    if (userId) {
      try {
        await saveCloudRule(rule);
      } catch (err) {
        console.error('Failed to add rule in cloud:', err);
      }
    } else {
      setLocalRules(prev => [...prev, rule]);
    }
  }, [userId, saveCloudRule]);

  const handleDeleteRule = useCallback(async (id: string) => {
    if (userId) {
      try {
        await deleteCloudRule(id);
      } catch (err) {
        console.error('Failed to delete rule in cloud:', err);
      }
    } else {
      setLocalRules(prev => prev.filter(r => r.id !== id));
    }
  }, [userId, deleteCloudRule]);

  // Migration execution
  const handleExecuteMigration = async () => {
    if (!userId) return;
    try {
      setMigrating(true);
      await migrateLocalDataToFirestore(
        userId,
        localTrades,
        localMissedTrades,
        localDailyNotes,
        localRules
      );
      setMigrationSuccess(true);
      setTimeout(() => {
        setShowMigrationPrompt(false);
        setMigrationSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Migration failed:', err);
    } finally {
      setMigrating(false);
    }
  };

  // Reset Demo Data
  const handleResetDemo = useCallback(() => {
    if (confirm('Reset journal data back to default demo records?')) {
      if (!userId) {
        setLocalTrades(INITIAL_TRADES);
        setLocalMissedTrades(INITIAL_MISSED_TRADES);
        setLocalDailyNotes(INITIAL_DAILY_NOTES);
        setLocalRules(INITIAL_RULES);
        localStorage.removeItem('winway_trades');
        localStorage.removeItem('winway_missed_trades');
        localStorage.removeItem('winway_daily_notes');
        localStorage.removeItem('winway_rules');
      }
    }
  }, [userId]);

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
      
      {/* Migration Notification Banner */}
      {showMigrationPrompt && (
        <div 
          className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-slate-200"
          dir={lang === 'fa' ? 'rtl' : 'ltr'}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CloudUpload className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {migrationSuccess ? t.migrationSuccess : t.migrationPrompt}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!migrationSuccess && (
                <button
                  onClick={handleExecuteMigration}
                  disabled={migrating}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow flex items-center gap-1.5 transition-all"
                >
                  {migrating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
                  <span>{migrating ? t.migratingData : t.importLocalData}</span>
                </button>
              )}
              <button
                onClick={() => setShowMigrationPrompt(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                title={t.dismiss}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
        userProfile={userProfile}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
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
          userProfile={userProfile}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenPricing={() => setIsPricingModalOpen(true)}
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
              userId={userId}
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
        userId={userId}
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

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        initialMode={authModalMode}
      />

      {/* User Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        lang={lang}
        userProfile={userProfile}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {/* Pricing & Subscription Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        lang={lang}
        userProfile={userProfile}
        onRequireAuth={() => {
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
}

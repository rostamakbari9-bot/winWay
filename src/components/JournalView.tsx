import React, { useState, useMemo } from 'react';
import { Trade, Language, FilterOptions, AssetClass } from '../types';
import { translations, formatCurrency, formatR, formatPercent } from '../translations';
import { 
  Search, 
  Filter, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle,
  Plus,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface JournalViewProps {
  trades: Trade[];
  lang: Language;
  onViewTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onOpenNewTrade: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  trades,
  lang,
  onViewTrade,
  onEditTrade,
  onDeleteTrade,
  onOpenNewTrade
}) => {
  const t = translations[lang];

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    assetClass: 'ALL',
    direction: 'ALL',
    status: 'ALL',
    setup: 'ALL',
    session: 'ALL',
    mistake: 'ALL',
    dateRange: 'ALL'
  });

  const [sortField, setSortField] = useState<'date' | 'pnl' | 'rMultiple' | 'symbol'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract unique setups and mistakes
  const allSetups = useMemo(() => {
    const set = new Set<string>();
    trades.forEach(t => { if (t.setup) set.add(t.setup); });
    return Array.from(set);
  }, [trades]);

  const allMistakes = useMemo(() => {
    const set = new Set<string>();
    trades.forEach(t => {
      if (t.mistakes) t.mistakes.forEach(m => set.add(m));
    });
    return Array.from(set);
  }, [trades]);

  // Filter logic
  const filteredTrades = useMemo(() => {
    return trades.filter(tr => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchSymbol = tr.symbol.toLowerCase().includes(query);
        const matchSetup = tr.setup?.toLowerCase().includes(query);
        const matchNotes = tr.notes?.toLowerCase().includes(query);
        if (!matchSymbol && !matchSetup && !matchNotes) return false;
      }

      // Asset Class
      if (filters.assetClass !== 'ALL' && tr.assetClass !== filters.assetClass) return false;

      // Direction
      if (filters.direction !== 'ALL' && tr.direction !== filters.direction) return false;

      // Status
      if (filters.status !== 'ALL' && tr.status !== filters.status) return false;

      // Setup
      if (filters.setup !== 'ALL' && tr.setup !== filters.setup) return false;

      // Session
      if (filters.session !== 'ALL' && tr.session !== filters.session) return false;

      // Mistake
      if (filters.mistake !== 'ALL') {
        if (!tr.mistakes || !tr.mistakes.includes(filters.mistake)) return false;
      }

      // Date Range filter
      if (filters.dateRange !== 'ALL') {
        const tradeDate = new Date(tr.entryDate);
        const now = new Date('2026-09-17'); // current mock baseline
        if (filters.dateRange === 'TODAY') {
          if (tr.entryDate !== '2026-09-16') return false;
        } else if (filters.dateRange === 'THIS_WEEK') {
          const diffDays = (now.getTime() - tradeDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7 || diffDays < 0) return false;
        } else if (filters.dateRange === 'THIS_MONTH') {
          if (tr.entryDate.slice(0, 7) !== '2026-09') return false;
        } else if (filters.dateRange === 'LAST_MONTH') {
          if (tr.entryDate.slice(0, 7) !== '2026-08') return false;
        }
      }

      return true;
    });
  }, [trades, filters]);

  // Sorting
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        const timeA = new Date(`${a.entryDate}T${a.entryTime || '00:00'}`).getTime();
        const timeB = new Date(`${b.entryDate}T${b.entryTime || '00:00'}`).getTime();
        comparison = timeA - timeB;
      } else if (sortField === 'pnl') {
        comparison = a.netPnL - b.netPnL;
      } else if (sortField === 'rMultiple') {
        comparison = (a.rMultiple || 0) - (b.rMultiple || 0);
      } else if (sortField === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTrades, sortField, sortOrder]);

  // Aggregate stats of filtered trades
  const filteredNetPnL = useMemo(() => {
    return filteredTrades.reduce((acc, t) => acc + t.netPnL, 0);
  }, [filteredTrades]);

  const filteredWinRate = useMemo(() => {
    const closed = filteredTrades.filter(t => t.status !== 'OPEN');
    if (closed.length === 0) return 0;
    const wins = closed.filter(t => t.status === 'WIN' || t.netPnL > 0).length;
    return (wins / closed.length) * 100;
  }, [filteredTrades]);

  const handleSort = (field: 'date' | 'pnl' | 'rMultiple' | 'symbol') => {
    if (sortField === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      assetClass: 'ALL',
      direction: 'ALL',
      status: 'ALL',
      setup: 'ALL',
      session: 'ALL',
      mistake: 'ALL',
      dateRange: 'ALL'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.assetClass !== 'ALL' ||
    filters.direction !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.setup !== 'ALL' ||
    filters.session !== 'ALL' ||
    filters.mistake !== 'ALL' ||
    filters.dateRange !== 'ALL';

  return (
    <div className="space-y-4">
      {/* Top Controls & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters & Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t.filters}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={onOpenNewTrade}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newTrade}</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Grid */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Asset Class */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{lang === 'fa' ? 'بازار' : 'Asset'}</label>
              <select
                value={filters.assetClass}
                onChange={e => setFilters(p => ({ ...p, assetClass: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">{t.allAssets}</option>
                <option value="forex">{t.forex}</option>
                <option value="crypto">{t.crypto}</option>
                <option value="indices">{t.indices}</option>
                <option value="stocks">{t.stocks}</option>
                <option value="commodities">{t.commodities}</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.type}</label>
              <select
                value={filters.direction}
                onChange={e => setFilters(p => ({ ...p, direction: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">{t.allDirections}</option>
                <option value="LONG">{t.long}</option>
                <option value="SHORT">{t.short}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{lang === 'fa' ? 'وضعیت' : 'Outcome'}</label>
              <select
                value={filters.status}
                onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="WIN">{t.statusWin}</option>
                <option value="LOSS">{t.statusLoss}</option>
                <option value="BE">{t.statusBE}</option>
                <option value="OPEN">{t.statusOpen}</option>
              </select>
            </div>

            {/* Setup */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.setup}</label>
              <select
                value={filters.setup}
                onChange={e => setFilters(p => ({ ...p, setup: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">{t.allSetups}</option>
                {allSetups.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.session}</label>
              <select
                value={filters.session}
                onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">{t.allSessions}</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asia">Asia</option>
                <option value="Overnight">Overnight</option>
              </select>
            </div>

            {/* Mistake filter */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.mistakes}</label>
              <select
                value={filters.mistake}
                onChange={e => setFilters(p => ({ ...p, mistake: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">{t.allMistakes}</option>
                {allMistakes.map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Metrics Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-4">
            <span>
              {lang === 'fa' ? 'معاملات نمایش داده شده:' : 'Showing:'}{' '}
              <strong className="text-slate-100 font-mono">{sortedTrades.length}</strong> {lang === 'fa' ? 'از' : 'of'}{' '}
              <span className="font-mono">{trades.length}</span>
            </span>

            <span>
              {lang === 'fa' ? 'سود/زیان فیلتر شده:' : 'Net Filtered P&L:'}{' '}
              <strong className={`font-mono ${filteredNetPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(filteredNetPnL)}
              </strong>
            </span>

            <span>
              {lang === 'fa' ? 'نرخ برد فیلتر شده:' : 'Win Rate:'}{' '}
              <strong className="text-slate-100 font-mono">{filteredWinRate.toFixed(1)}%</strong>
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              {t.clearFilters}
            </button>
          )}
        </div>
      </div>

      {/* Main Trade Ledger Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800 select-none">
              <tr>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.date}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.symbol}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">{t.type}</th>
                <th className="py-3 px-3 font-mono">{t.entry}</th>
                <th className="py-3 px-3 font-mono">{t.exit}</th>
                <th className="py-3 px-3 font-mono">{t.size}</th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('pnl')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.pnl}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('rMultiple')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.rMultiple}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">{t.setup}</th>
                <th className="py-3 px-3">{t.mistakes}</th>
                <th className="py-3 px-3 text-center">{lang === 'fa' ? 'پلن' : 'Plan'}</th>
                <th className="py-3 px-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-sans text-sm">
                    {t.noTradesFound}
                  </td>
                </tr>
              ) : (
                sortedTrades.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Date */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {tr.entryDate} <span className="text-[11px] text-slate-500">{tr.entryTime}</span>
                    </td>

                    {/* Symbol */}
                    <td className="py-3 px-3 font-bold text-slate-100 whitespace-nowrap">
                      <span className="cursor-pointer hover:text-emerald-400" onClick={() => onViewTrade(tr)}>
                        {tr.symbol}
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tr.direction === 'LONG'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tr.direction}
                      </span>
                    </td>

                    {/* Entry Price */}
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {tr.entryPrice}
                    </td>

                    {/* Exit Price */}
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {tr.exitPrice}
                    </td>

                    {/* Size */}
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {tr.size}
                    </td>

                    {/* Net P&L */}
                    <td className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                      tr.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatCurrency(tr.netPnL)}
                    </td>

                    {/* R Multiple */}
                    <td className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${
                      tr.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatR(tr.rMultiple)}
                    </td>

                    {/* Setup */}
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-[150px] truncate" title={tr.setup}>
                      {tr.setup}
                    </td>

                    {/* Mistakes tags */}
                    <td className="py-3 px-3 font-sans">
                      {tr.mistakes && tr.mistakes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                          {tr.mistakes.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-rose-950/70 border border-rose-500/30 text-rose-300 truncate"
                              title={m}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Followed Plan */}
                    <td className="py-3 px-3 text-center">
                      {tr.followedPlan ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline-block" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 inline-block" />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewTrade(tr)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          title={t.viewDetails}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTrade(tr)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title={t.edit}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.confirmDelete)) {
                              onDeleteTrade(tr.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

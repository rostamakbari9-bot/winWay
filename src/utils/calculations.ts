import { Trade } from '../types';

export interface PerformanceStats {
  netPnL: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  beCount: number;
  openCount: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  winLossRatio: number;
  expectancy: number;
  avgRMultiple: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  bestTrade: number;
  worstTrade: number;
  ruleComplianceRate: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'NONE'; count: number };
  grossProfit: number;
  grossLoss: number;
}

export function computePerformanceStats(trades: Trade[], initialBalance: number = 100000): PerformanceStats {
  const closedTrades = trades.filter(t => t.status !== 'OPEN');
  
  if (closedTrades.length === 0) {
    return {
      netPnL: 0,
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      beCount: 0,
      openCount: trades.filter(t => t.status === 'OPEN').length,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      winLossRatio: 0,
      expectancy: 0,
      avgRMultiple: 0,
      maxDrawdown: 0,
      maxDrawdownPct: 0,
      bestTrade: 0,
      worstTrade: 0,
      ruleComplianceRate: 100,
      currentStreak: { type: 'NONE', count: 0 },
      grossProfit: 0,
      grossLoss: 0,
    };
  }

  let netPnL = 0;
  let winCount = 0;
  let lossCount = 0;
  let beCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let bestTrade = -Infinity;
  let worstTrade = Infinity;
  let totalR = 0;
  let followedPlanCount = 0;

  // For drawdown
  let peak = initialBalance;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  let runningBalance = initialBalance;

  // Sort trades chronologically for accurate streak & drawdown
  const sorted = [...closedTrades].sort((a, b) => {
    const timeA = new Date(`${a.entryDate}T${a.entryTime || '00:00'}`).getTime();
    const timeB = new Date(`${b.entryDate}T${b.entryTime || '00:00'}`).getTime();
    return timeA - timeB;
  });

  sorted.forEach(t => {
    netPnL += t.netPnL;
    totalR += t.rMultiple || 0;
    if (t.followedPlan) followedPlanCount++;

    if (t.netPnL > bestTrade) bestTrade = t.netPnL;
    if (t.netPnL < worstTrade) worstTrade = t.netPnL;

    if (t.status === 'WIN' || t.netPnL > 0) {
      winCount++;
      grossProfit += t.netPnL;
    } else if (t.status === 'LOSS' || t.netPnL < 0) {
      lossCount++;
      grossLoss += Math.abs(t.netPnL);
    } else {
      beCount++;
    }

    runningBalance += t.netPnL;
    if (runningBalance > peak) {
      peak = runningBalance;
    }
    const currentDd = peak - runningBalance;
    if (currentDd > maxDrawdown) {
      maxDrawdown = currentDd;
      maxDrawdownPct = peak > 0 ? (currentDd / peak) * 100 : 0;
    }
  });

  const totalClosed = closedTrades.length;
  const winRate = totalClosed > 0 ? (winCount / totalClosed) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;
  const avgWin = winCount > 0 ? grossProfit / winCount : 0;
  const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? avgWin : 0;
  
  const winFraction = totalClosed > 0 ? winCount / totalClosed : 0;
  const lossFraction = totalClosed > 0 ? lossCount / totalClosed : 0;
  const expectancy = (winFraction * avgWin) - (lossFraction * avgLoss);
  const avgRMultiple = totalClosed > 0 ? totalR / totalClosed : 0;
  const ruleComplianceRate = totalClosed > 0 ? (followedPlanCount / totalClosed) * 100 : 100;

  // Streak calculation (from most recent trade backward)
  let currentStreak: { type: 'WIN' | 'LOSS' | 'NONE'; count: number } = { type: 'NONE', count: 0 };
  if (sorted.length > 0) {
    const lastTrade = sorted[sorted.length - 1];
    const streakType = lastTrade.status === 'WIN' ? 'WIN' : lastTrade.status === 'LOSS' ? 'LOSS' : 'NONE';
    let count = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].status === streakType) {
        count++;
      } else {
        break;
      }
    }
    currentStreak = { type: streakType, count };
  }

  return {
    netPnL,
    totalTrades: totalClosed,
    winCount,
    lossCount,
    beCount,
    openCount: trades.filter(t => t.status === 'OPEN').length,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    winLossRatio,
    expectancy,
    avgRMultiple,
    maxDrawdown,
    maxDrawdownPct,
    bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
    worstTrade: worstTrade === Infinity ? 0 : worstTrade,
    ruleComplianceRate,
    currentStreak,
    grossProfit,
    grossLoss,
  };
}

export interface EquityCurvePoint {
  index: number;
  date: string;
  time: string;
  symbol: string;
  pnl: number;
  cumPnL: number;
  equity: number;
  rMultiple: number;
  status: string;
}

export function generateEquityCurve(trades: Trade[], startCapital: number = 100000): EquityCurvePoint[] {
  const sorted = [...trades]
    .filter(t => t.status !== 'OPEN')
    .sort((a, b) => {
      const timeA = new Date(`${a.entryDate}T${a.entryTime || '00:00'}`).getTime();
      const timeB = new Date(`${b.entryDate}T${b.entryTime || '00:00'}`).getTime();
      return timeA - timeB;
    });

  let cumPnL = 0;
  const curve: EquityCurvePoint[] = [
    {
      index: 0,
      date: sorted[0]?.entryDate || "Start",
      time: "00:00",
      symbol: "Initial Capital",
      pnl: 0,
      cumPnL: 0,
      equity: startCapital,
      rMultiple: 0,
      status: "BE"
    }
  ];

  sorted.forEach((trade, idx) => {
    cumPnL += trade.netPnL;
    curve.push({
      index: idx + 1,
      date: trade.entryDate,
      time: trade.entryTime,
      symbol: trade.symbol,
      pnl: trade.netPnL,
      cumPnL,
      equity: startCapital + cumPnL,
      rMultiple: trade.rMultiple,
      status: trade.status
    });
  });

  return curve;
}

export interface DailyPnLSummary {
  date: string; // YYYY-MM-DD
  netPnL: number;
  tradesCount: number;
  winCount: number;
  lossCount: number;
  trades: Trade[];
}

export function groupTradesByDay(trades: Trade[]): Map<string, DailyPnLSummary> {
  const map = new Map<string, DailyPnLSummary>();

  trades.forEach(trade => {
    if (!trade.entryDate) return;
    const date = trade.entryDate;
    const existing = map.get(date) || {
      date,
      netPnL: 0,
      tradesCount: 0,
      winCount: 0,
      lossCount: 0,
      trades: []
    };

    existing.netPnL += trade.netPnL;
    existing.tradesCount += 1;
    if (trade.status === 'WIN' || trade.netPnL > 0) existing.winCount += 1;
    if (trade.status === 'LOSS' || trade.netPnL < 0) existing.lossCount += 1;
    existing.trades.push(trade);

    map.set(date, existing);
  });

  return map;
}

export interface SetupAnalytics {
  setup: string;
  totalTrades: number;
  winRate: number;
  netPnL: number;
  avgR: number;
  profitFactor: number;
}

export function computeSetupAnalytics(trades: Trade[]): SetupAnalytics[] {
  const groups: Record<string, { wins: number; total: number; pnl: number; r: number; grossWin: number; grossLoss: number }> = {};

  trades.forEach(t => {
    const setupName = t.setup || "Unclassified";
    if (!groups[setupName]) {
      groups[setupName] = { wins: 0, total: 0, pnl: 0, r: 0, grossWin: 0, grossLoss: 0 };
    }
    groups[setupName].total += 1;
    groups[setupName].pnl += t.netPnL;
    groups[setupName].r += t.rMultiple || 0;
    if (t.status === 'WIN' || t.netPnL > 0) {
      groups[setupName].wins += 1;
      groups[setupName].grossWin += t.netPnL;
    } else if (t.status === 'LOSS' || t.netPnL < 0) {
      groups[setupName].grossLoss += Math.abs(t.netPnL);
    }
  });

  return Object.entries(groups).map(([setup, data]) => ({
    setup,
    totalTrades: data.total,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    netPnL: data.pnl,
    avgR: data.total > 0 ? data.r / data.total : 0,
    profitFactor: data.grossLoss > 0 ? data.grossWin / data.grossLoss : data.grossWin > 0 ? data.grossWin : 0
  })).sort((a, b) => b.netPnL - a.netPnL);
}

export interface MistakeCostAnalytics {
  mistake: string;
  occurrences: number;
  totalCost: number; // sum of losses when this mistake was made
}

export function computeMistakeCostAnalytics(trades: Trade[]): MistakeCostAnalytics[] {
  const map: Record<string, { count: number; cost: number }> = {};

  trades.forEach(t => {
    if (t.mistakes && t.mistakes.length > 0) {
      t.mistakes.forEach(m => {
        if (!map[m]) {
          map[m] = { count: 0, cost: 0 };
        }
        map[m].count += 1;
        // Cost is the negative PnL suffered
        if (t.netPnL < 0) {
          map[m].cost += Math.abs(t.netPnL);
        }
      });
    }
  });

  return Object.entries(map).map(([mistake, data]) => ({
    mistake,
    occurrences: data.count,
    totalCost: data.cost
  })).sort((a, b) => b.totalCost - a.totalCost);
}

export interface SessionAnalytics {
  session: string;
  totalTrades: number;
  winRate: number;
  netPnL: number;
}

export function computeSessionAnalytics(trades: Trade[]): SessionAnalytics[] {
  const groups: Record<string, { total: number; wins: number; pnl: number }> = {
    'London': { total: 0, wins: 0, pnl: 0 },
    'New York': { total: 0, wins: 0, pnl: 0 },
    'Asia': { total: 0, wins: 0, pnl: 0 },
    'Overnight': { total: 0, wins: 0, pnl: 0 },
  };

  trades.forEach(t => {
    const s = t.session || 'London';
    if (!groups[s]) {
      groups[s] = { total: 0, wins: 0, pnl: 0 };
    }
    groups[s].total += 1;
    groups[s].pnl += t.netPnL;
    if (t.status === 'WIN' || t.netPnL > 0) groups[s].wins += 1;
  });

  return Object.entries(groups).map(([session, data]) => ({
    session,
    totalTrades: data.total,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    netPnL: data.pnl
  }));
}

export interface EmotionAnalytics {
  emotion: string;
  totalTrades: number;
  winRate: number;
  netPnL: number;
}

export function computeEmotionAnalytics(trades: Trade[]): EmotionAnalytics[] {
  const groups: Record<string, { total: number; wins: number; pnl: number }> = {};

  trades.forEach(t => {
    const pre = t.emotions?.pre || 'Calm';
    if (!groups[pre]) {
      groups[pre] = { total: 0, wins: 0, pnl: 0 };
    }
    groups[pre].total += 1;
    groups[pre].pnl += t.netPnL;
    if (t.status === 'WIN' || t.netPnL > 0) groups[pre].wins += 1;
  });

  return Object.entries(groups).map(([emotion, data]) => ({
    emotion,
    totalTrades: data.total,
    winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    netPnL: data.pnl
  })).sort((a, b) => b.totalTrades - a.totalTrades);
}

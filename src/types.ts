export type AssetClass = 'forex' | 'crypto' | 'indices' | 'stocks' | 'commodities';

export type TradeDirection = 'LONG' | 'SHORT';

export type TradeStatus = 'WIN' | 'LOSS' | 'BE' | 'OPEN';

export type TradingSession = 'London' | 'New York' | 'Asia' | 'Overnight';

export type EmotionState = 
  | 'Confident' 
  | 'Disciplined' 
  | 'Calm' 
  | 'FOMO' 
  | 'Anxious' 
  | 'Rushed' 
  | 'Hesitant' 
  | 'Greedy' 
  | 'Revengeful' 
  | 'Frustrated' 
  | 'Patient'
  | 'Satisfied'
  | 'Stressed'
  | 'Regretful';

export interface Trade {
  id: string;
  symbol: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  status: TradeStatus;
  entryDate: string; // YYYY-MM-DD
  entryTime: string; // HH:mm
  exitDate: string;  // YYYY-MM-DD
  exitTime: string;  // HH:mm
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit?: number;
  size: number; // lots, contracts, or shares
  riskAmount: number; // $ risked
  netPnL: number; // $ profit/loss after fees
  rMultiple: number; // e.g. +2.4 or -1.0
  returnPercent: number; // % return on risk or trade
  fees: number;
  setup: string;
  session: TradingSession;
  timeframe: string;
  mistakes: string[];
  emotions: {
    pre: EmotionState;
    during: EmotionState;
    post: EmotionState;
  };
  followedPlan: boolean;
  notes: string;
  whatWentWell?: string;
  whatToImprove?: string;
  chartUrl?: string;
  account?: string;
}

export interface MissedTrade {
  id: string;
  date: string;
  time: string;
  symbol: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  setup: string;
  plannedEntry: number;
  stopLoss: number;
  plannedExit: number;
  potentialR: number;
  potentialPnL: number;
  reason: 'Fear of Loss' | 'Hesitation' | 'Distracted' | 'Away from Desk' | 'Spread/Limit Missed' | 'Analysis Paralysis';
  notes: string;
  chartUrl?: string;
}

export interface DailyNote {
  id: string;
  date: string; // YYYY-MM-DD
  rating: number; // 1 to 5
  marketCondition: 'Trending Bullish' | 'Trending Bearish' | 'Ranging/Choppy' | 'High Volatility' | 'Low Volume';
  preMarketNotes: string;
  postMarketNotes: string;
  followedRules: boolean;
  keyLesson: string;
}

export interface TradingRule {
  id: string;
  title: string;
  category: 'Risk' | 'Execution' | 'Psychology' | 'Routine';
  description: string;
  isActive: boolean;
}

export type ActiveTab = 'dashboard' | 'journal' | 'analytics' | 'missed' | 'playbook' | 'settings';

export type Language = 'en' | 'fa';

export type Theme = 'dark' | 'light';

export interface FilterOptions {
  search: string;
  assetClass: string;
  direction: string;
  status: string;
  setup: string;
  session: string;
  mistake: string;
  dateRange: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH';
}

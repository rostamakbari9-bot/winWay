import React, { useState } from 'react';
import { Trade } from '../types';
import { groupTradesByDay } from '../utils/calculations';
import { formatCurrency } from '../translations';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarHeatmapProps {
  trades: Trade[];
  onSelectDate?: (date: string) => void;
  selectedDate?: string | null;
  lang: 'en' | 'fa';
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  trades,
  onSelectDate,
  selectedDate,
  lang
}) => {
  // Current viewing month (default to September 2026 based on mock data)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 is September (0-indexed)

  const daysMap = groupTradesByDay(trades);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesFa = [
    "ژانویه", "فوریه", "مارس", "آوریل", "می", "ژوئن",
    "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"
  ];

  const currentMonthName = lang === 'fa' ? monthNamesFa[currentMonth] : monthNamesEn[currentMonth];

  // Calculate days in month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Day names header
  const weekDaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDaysFa = ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
  const weekDays = lang === 'fa' ? weekDaysFa : weekDaysEn;

  // Monthly summary stats
  let monthNetPnL = 0;
  let monthGreenDays = 0;
  let monthRedDays = 0;
  let monthTradesCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = daysMap.get(dStr);
    if (dayData) {
      monthNetPnL += dayData.netPnL;
      monthTradesCount += dayData.tradesCount;
      if (dayData.netPnL > 0) monthGreenDays++;
      else if (dayData.netPnL < 0) monthRedDays++;
    }
  }

  // Generate calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
      {/* Header bar with controls and month summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              {currentMonthName} {currentYear}
            </h3>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span>
                {lang === 'fa' ? 'روزهای سودده:' : 'Green Days:'} <strong className="text-emerald-400">{monthGreenDays}</strong>
              </span>
              <span>
                {lang === 'fa' ? 'روزهای ضررده:' : 'Red Days:'} <strong className="text-rose-400">{monthRedDays}</strong>
              </span>
              <span>
                {lang === 'fa' ? 'کل معاملات:' : 'Trades:'} <strong className="text-slate-200">{monthTradesCount}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Net PnL Pill */}
          <div className={`px-3 py-1 rounded-lg border font-mono text-sm font-semibold ${
            monthNetPnL >= 0 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`}>
            {formatCurrency(monthNetPnL)}
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
        {weekDays.map((day, idx) => (
          <div key={idx} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((dayNum, idx) => {
          if (dayNum === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-16 sm:h-20 rounded-lg bg-slate-900/20 border border-slate-900/40 opacity-30"
              />
            );
          }

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayData = daysMap.get(dateStr);
          const hasTrades = !!dayData && dayData.tradesCount > 0;
          const isPositive = hasTrades && dayData.netPnL >= 0;
          const isNegative = hasTrades && dayData.netPnL < 0;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate && onSelectDate(isSelected ? '' : dateStr)}
              className={`h-16 sm:h-20 p-1.5 rounded-lg text-left transition-all duration-150 flex flex-col justify-between border relative group ${
                isSelected
                  ? 'ring-2 ring-emerald-400 border-emerald-400 z-10'
                  : ''
              } ${
                hasTrades
                  ? isPositive
                    ? 'bg-emerald-950/25 border-emerald-500/30 hover:bg-emerald-950/40 hover:border-emerald-500/50'
                    : 'bg-rose-950/25 border-rose-500/30 hover:bg-rose-950/40 hover:border-rose-500/50'
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40'
              }`}
            >
              {/* Day number & trades badge */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-mono font-medium ${
                  hasTrades ? 'text-slate-200' : 'text-slate-500'
                }`}>
                  {dayNum}
                </span>

                {hasTrades && (
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isPositive ? 'text-emerald-300 bg-emerald-900/40' : 'text-rose-300 bg-rose-900/40'
                  }`}>
                    {dayData.winCount}W-{dayData.lossCount}L
                  </span>
                )}
              </div>

              {/* Day Net PnL */}
              {hasTrades ? (
                <div className="mt-auto">
                  <div className={`text-xs sm:text-sm font-semibold font-mono tracking-tight ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatCurrency(dayData.netPnL)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                    {dayData.tradesCount} {lang === 'fa' ? 'معامله' : 'trades'}
                  </div>
                </div>
              ) : (
                <div className="mt-auto text-[10px] text-slate-700 font-mono">
                  -
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span>
              {lang === 'fa' ? 'فیلتر بر اساس تاریخ انتخاب شده:' : 'Filtered to selected date:'}{' '}
              <strong className="font-mono text-emerald-400">{selectedDate}</strong>
            </span>
          </div>
          <button
            onClick={() => onSelectDate && onSelectDate('')}
            className="text-slate-400 hover:text-slate-200 underline text-xs"
          >
            {lang === 'fa' ? 'نمایش همه تاریخ‌ها' : 'Show all dates'}
          </button>
        </div>
      )}
    </div>
  );
};

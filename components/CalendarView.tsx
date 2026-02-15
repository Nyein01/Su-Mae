import React, { useState, useEffect, useRef } from 'react';
import { AppState, CONSTANTS } from '../types';
import { generateCalendarDays, formatDateKey } from '../utils';
import { format, isToday } from 'date-fns';
import { Sparkles, Banknote, Check, Bell, Crown, Coins, History, Calendar as CalendarIcon, User, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { PayoutHistory } from './PayoutHistory';

interface Props {
  state: AppState;
}

export const CalendarView: React.FC<Props> = ({ state }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'history'>('calendar');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exact full rotation length: 5 members * 15 days = 75 days
  const fullCycleDays = CONSTANTS.TOTAL_MEMBERS * CONSTANTS.CYCLE_DAYS;
  const days = generateCalendarDays(state.startDate, fullCycleDays);

  // Auto-scroll to today when switching to calendar view
  useEffect(() => {
    if (viewMode === 'calendar' && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [viewMode]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* View Toggle */}
      <div className="glass-panel p-1.5 rounded-2xl flex bg-black/40 border border-white/10 relative">
        <div 
            className={clsx(
                "absolute top-1.5 bottom-1.5 rounded-xl bg-white/10 shadow-lg transition-all duration-300 ease-out",
                viewMode === 'calendar' ? "left-1.5 w-[calc(50%-6px)]" : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
            )}
        />
        <button 
            onClick={() => setViewMode('calendar')}
            className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10",
                viewMode === 'calendar' ? "text-white" : "text-white/40 hover:text-white/60"
            )}
        >
            <CalendarIcon size={16} />
            Schedule
        </button>
        <button 
            onClick={() => setViewMode('history')}
            className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10",
                viewMode === 'history' ? "text-white" : "text-white/40 hover:text-white/60"
            )}
        >
            <History size={16} />
            History
        </button>
      </div>

      {viewMode === 'history' ? (
        <PayoutHistory startDate={state.startDate} members={state.members} />
      ) : (
        <>
          <div className="glass-panel p-5 rounded-3xl flex items-center justify-between bg-black/40 border border-white/5">
            <h3 className="font-bold text-white text-sm">Legend</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-white/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                <span className="text-gold-500">Payout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span>Complete</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {days.map((dayObj, idx) => {
              const dateKey = formatDateKey(dayObj.date);
              const record = state.records[dateKey];
              
              const payments = record?.payments || {};
              const paidCount = Object.values(payments).filter(Boolean).length;
              const isFullyPaid = paidCount === CONSTANTS.TOTAL_MEMBERS;
              const receiver = state.members.find(m => m.order === dayObj.cycleOwnerOrder);
              const isCurrentDay = isToday(dayObj.date);

              return (
                <div 
                  key={idx}
                  ref={isCurrentDay ? scrollRef : null}
                  className={clsx(
                    "relative p-5 rounded-3xl flex flex-col gap-3 transition-all duration-300 overflow-hidden group",
                    // Background styling
                    dayObj.isPayoutDay 
                        ? "bg-gradient-to-br from-gold-950/80 via-amber-900/40 to-black border-gold-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                        : "glass-card border-white/5 hover:bg-white/5",
                    // Border styling (Today overrides standard borders)
                    isCurrentDay 
                        ? "ring-2 ring-primary-500 shadow-[0_0_40px_-5px_rgba(34,197,94,0.25)] z-10 scale-[1.02]" 
                        : "border", // Payout day handles its own border color in the bg line above if needed, but clsx handles conflicts
                    // If standard day and not today, ensure border is present
                    !dayObj.isPayoutDay && !isCurrentDay && "border-white/5"
                  )}
                >
                  {dayObj.isPayoutDay && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gold-500/10 blur-[30px] rounded-full pointer-events-none -ml-5 -mb-5"></div>
                    </>
                  )}

                  {/* Today Label */}
                  {isCurrentDay && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary-500 text-black text-[9px] font-bold px-3 py-0.5 rounded-b-lg shadow-[0_2px_10px_rgba(34,197,94,0.4)] z-20 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} className="fill-black" />
                      Today
                    </div>
                  )}

                  {/* Header */}
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {/* Date Box */}
                      <div className={clsx(
                        "flex flex-col items-center justify-center w-14 h-14 rounded-2xl border flex-shrink-0 shadow-inner backdrop-blur-sm relative overflow-hidden",
                        dayObj.isPayoutDay 
                          ? "bg-gradient-to-br from-gold-400 to-amber-600 border-gold-300 text-black shadow-gold-500/30" 
                          : isCurrentDay
                            ? "bg-primary-500 text-black border-primary-400 shadow-primary-500/20"
                            : "bg-white/5 border-white/10 text-white"
                      )}>
                        <span className={clsx("text-[10px] font-bold uppercase tracking-wider", (dayObj.isPayoutDay || isCurrentDay) ? "opacity-70 text-black" : "opacity-60")}>
                          {format(dayObj.date, 'MMM')}
                        </span>
                        <span className="text-xl font-extrabold leading-none">
                          {format(dayObj.date, 'dd')}
                        </span>
                      </div>

                      {/* Info Column */}
                      <div className="flex flex-col">
                        {dayObj.isPayoutDay ? (
                          <>
                            <div className="flex items-center gap-1.5 text-gold-400 font-bold uppercase text-[10px] tracking-widest mb-0.5">
                              <Sparkles size={10} className="text-gold-400 fill-gold-400 animate-pulse" />
                              <span>Payout Day</span>
                            </div>
                            <div className="flex items-center gap-2">
                               {receiver?.avatar && (
                                 <img src={receiver.avatar} alt={receiver.name} className="w-5 h-5 rounded-full object-cover border border-gold-400/50" />
                               )}
                              <div className="text-lg font-bold text-white leading-tight">
                                  {receiver?.name}
                              </div>
                              <Crown size={14} className="text-gold-400 fill-gold-400" />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-black bg-gold-500/90 px-2 py-0.5 rounded shadow-sm">
                                    #{receiver?.order}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-red-200 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 animate-pulse">
                                    <Bell size={8} className="fill-current" />
                                    <span>REMINDER</span>
                                </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="text-[10px] font-bold uppercase text-white/40 tracking-wider">
                                For:
                              </div>
                              <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                                {receiver?.avatar ? (
                                    <img src={receiver.avatar} alt="" className="w-3 h-3 rounded-full object-cover" />
                                ) : (
                                    <Coins size={10} className="text-primary-400" />
                                )}
                                <span className="text-[10px] font-bold text-primary-200">
                                    {receiver?.name}
                                </span>
                              </div>
                            </div>
                            <div className={clsx("text-sm font-medium", isFullyPaid ? "text-primary-400" : "text-white/70")}>
                              {isFullyPaid ? "All Paid" : `${paidCount} / ${CONSTANTS.TOTAL_MEMBERS} Paid`}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Status Indicator */}
                    <div className="flex flex-col items-end gap-1">
                      {isCurrentDay && !isFullyPaid && !dayObj.isPayoutDay && (
                         <span className="relative flex h-3 w-3 mb-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                         </span>
                      )}

                      {dayObj.isPayoutDay ? (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 text-black shadow-lg shadow-gold-500/20 flex items-center justify-center border border-white/20">
                          <Banknote size={20} strokeWidth={2.5} />
                        </div>
                      ) : (
                        isFullyPaid && (
                          <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 border border-primary-500/30">
                            <Check size={18} strokeWidth={3} />
                          </div>
                        )
                      )}
                      
                      {dayObj.isPayoutDay && (
                        <span className={clsx("text-[10px] font-bold", isFullyPaid ? "text-primary-400" : "text-white/50")}>
                            {isFullyPaid ? "All Paid" : `${paidCount}/${CONSTANTS.TOTAL_MEMBERS} Paid`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar / Dots */}
                  <div className="relative z-10 mt-2 pt-3 border-t border-white/5 flex gap-1.5 justify-between">
                    {state.members.map((m) => {
                      const hasPaid = payments[m.id];
                      return (
                        <div 
                          key={m.id}
                          className={clsx(
                            "flex-1 h-1.5 rounded-full transition-all duration-500 overflow-hidden relative",
                            hasPaid 
                              ? "bg-primary-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" 
                              : "bg-white/10"
                          )}
                          title={m.name}
                        >
                            {m.avatar && hasPaid && (
                                <img src={m.avatar} className="w-full h-full object-cover opacity-60" alt="" />
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            <div className="p-4 text-center text-white/20 text-xs mt-4">
                End of Cycle 1 ({fullCycleDays} days)
            </div>
          </div>
        </>
      )}
    </div>
  );
};
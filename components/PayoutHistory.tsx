import React from 'react';
import { Member, CONSTANTS } from '../types';
import { addDays, format, parseISO, isBefore, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, TrendingUp, History } from 'lucide-react';

interface Props {
  startDate: string;
  members: Member[];
}

export const PayoutHistory: React.FC<Props> = ({ startDate, members }) => {
  if (!startDate || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <History size={48} className="mb-4 opacity-50" />
        <p>No history available</p>
      </div>
    );
  }

  const start = parseISO(startDate);
  const now = new Date();
  const history: { cycle: number; date: Date; receiver: Member; amount: number }[] = [];

  // Sort members to match rotation logic
  const sortedMembers = [...members].sort((a, b) => a.order - b.order);
  
  // We want to find all payouts from start date until today
  let cycleNum = 1;
  while (true) {
    // Payout is on the last day of the cycle (e.g., day 15, 30...)
    // Day 1 is startDate. Day 15 is startDate + 14 days.
    const daysToAdd = (cycleNum * CONSTANTS.CYCLE_DAYS) - 1;
    const payoutDate = addDays(start, daysToAdd);
    
    // If payout date is in the future (strictly after today), stop.
    // If it is today, we include it.
    if (isBefore(now, payoutDate) && !isSameDay(now, payoutDate)) {
      break;
    }

    const receiverIndex = (cycleNum - 1) % sortedMembers.length;
    const receiver = sortedMembers[receiverIndex];

    history.push({
      cycle: cycleNum,
      date: payoutDate,
      receiver,
      amount: CONSTANTS.TOTAL_PAYOUT
    });

    cycleNum++;
  }

  // Reverse to show latest first
  const sortedHistory = [...history].reverse();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* Summary Card */}
       <div className="glass-panel p-6 rounded-[32px] bg-gradient-to-br from-gray-900 to-black border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[50px] rounded-full -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary-400">
                  <TrendingUp size={20} />
              </div>
              <div>
                  <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Total Disbursed</h3>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tight">
                {(sortedHistory.length * CONSTANTS.TOTAL_PAYOUT).toLocaleString()}
              </span>
              <span className="text-lg text-primary-500 font-bold">฿</span>
            </div>
            <p className="text-sm text-white/40 mt-2 font-medium">
              Across {sortedHistory.length} cycles
            </p>
          </div>
       </div>

       <div className="space-y-3">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider pl-4">Payout Log</h3>
          
          {sortedHistory.map((item) => (
            <div key={item.cycle} className="glass-card p-4 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all duration-300 border border-white/5">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500/10 to-amber-900/10 border border-gold-500/20 flex flex-col items-center justify-center text-gold-500 relative overflow-hidden">
                     <span className="text-[9px] font-bold uppercase opacity-70 relative z-10">Cycle</span>
                     <span className="text-lg font-bold leading-none relative z-10">{item.cycle}</span>
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-0.5">
                        {item.receiver.avatar && (
                           <img src={item.receiver.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/20" />
                        )}
                        <span className="text-white font-bold text-lg">{item.receiver.name}</span>
                        <span className="text-[10px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">#{item.receiver.order}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                        <CalendarIcon size={12} />
                        <span>{format(item.date, 'MMMM dd, yyyy')}</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-col items-end">
                  <div className="font-bold text-white">{item.amount.toLocaleString()} ฿</div>
                  <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    Sent
                  </div>
               </div>
            </div>
          ))}

          {sortedHistory.length === 0 && (
            <div className="text-center py-12 glass-panel rounded-3xl border-dashed border-white/10">
               <p className="text-white/40 font-medium">No payouts have occurred yet.</p>
               <p className="text-xs text-white/20 mt-1">Wait for the first cycle to complete.</p>
            </div>
          )}
       </div>
    </div>
  );
};
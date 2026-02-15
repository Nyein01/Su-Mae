import React from 'react';
import { Member, DailyRecord } from '../types';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  members: Member[];
  record: DailyRecord;
  dateLabel: string;
  onTogglePayment: (memberId: string) => void;
}

export const DailyChecklist: React.FC<Props> = ({ members, record, dateLabel, onTogglePayment }) => {
  const paidCount = members.filter(m => record.payments[m.id]).length;
  const progress = (paidCount / members.length) * 100;
  const isComplete = paidCount === members.length;

  return (
    <div className="glass-panel rounded-[32px] overflow-hidden shadow-xl bg-black/20 border-white/5">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
        <div>
          <h3 className="font-bold text-white text-lg">Daily Tracker</h3>
          <p className="text-sm text-white/50 font-medium mt-0.5">
            Total: <span className="text-white font-bold">{(paidCount * 100).toLocaleString()}</span> <span className="text-xs">฿</span>
          </p>
        </div>
        
        {/* Progress Circle */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/10" />
            <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" fill="transparent" 
              className={clsx(
                "transition-all duration-700 ease-out", 
                isComplete ? "text-primary-500" : "text-primary-600"
              )}
              strokeLinecap="round"
              strokeDasharray={138} 
              strokeDashoffset={138 - (138 * progress) / 100} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={clsx("text-sm font-bold", isComplete ? "text-primary-400" : "text-white")}>
                {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {members.map((member, index) => {
          const isPaid = !!record.payments[member.id];
          return (
            <div 
              key={member.id} 
              onClick={() => onTogglePayment(member.id)}
              className={clsx(
                "group p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border backdrop-blur-sm active:scale-[0.98]",
                isPaid 
                  ? "bg-primary-500/10 border-primary-500/20" 
                  : "bg-white/5 border-transparent hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Avatar with Order */}
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 relative overflow-hidden",
                  isPaid 
                    ? "bg-primary-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105" 
                    : "bg-white/10 text-white/50 group-hover:text-white scale-100"
                )}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{member.order}</span>
                  )}
                  {/* Order badge if avatar exists */}
                  {member.avatar && (
                     <div className="absolute bottom-0 right-0 bg-black/60 px-1 rounded-tl text-[8px] text-white">
                        #{member.order}
                     </div>
                  )}
                </div>
                
                <div>
                  <p className={clsx(
                    "font-bold transition-all duration-300", 
                    isPaid ? "text-primary-400" : "text-white group-hover:text-white"
                  )}>
                    {member.name}
                  </p>
                  <p className={clsx(
                    "text-xs font-medium transition-all duration-300 flex items-center gap-1", 
                    isPaid ? "text-primary-500" : "text-white/40 group-hover:text-white/60"
                  )}>
                    {isPaid ? <Check size={12} className="stroke-2" /> : 'Pending'}
                    {isPaid ? 'Paid' : 'Payment needed'}
                  </p>
                </div>
              </div>

              {/* Action Button - Spring Animation */}
              <div 
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm relative",
                  isPaid 
                    ? "bg-primary-500 text-black shadow-[0_4px_12px_rgba(34,197,94,0.4)] rotate-0 scale-100" 
                    : "bg-white/10 text-white/20 -rotate-90 scale-90 group-hover:bg-white/20 group-hover:text-white/60"
                )}
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {isPaid ? <Check size={20} strokeWidth={3} /> : <X size={20} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
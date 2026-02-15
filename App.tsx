import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar as CalendarIcon, Wallet, Settings, Sparkles, ChevronLeft, ChevronRight, Loader2, CloudOff } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { MemberSetup } from './components/MemberSetup';
import { DailyChecklist } from './components/DailyChecklist';
import { CalendarView } from './components/CalendarView';
import { AppState, Member, DailyRecord, CONSTANTS } from './types';
import { getCycleInfo, formatDateKey } from './utils';

// Firebase imports
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const DOC_ID = "default_group";

export default function App() {
  const [state, setState] = useState<AppState>({
    members: [],
    startDate: '',
    records: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'settings'>('home');
  const [currentDateView, setCurrentDateView] = useState(new Date());

  useEffect(() => {
    setLoading(true);
    try {
      const unsub = onSnapshot(doc(db, "circles", DOC_ID), (docSnap) => {
        if (docSnap.exists()) {
          setState(docSnap.data() as AppState);
        } else {
          setState({ members: [], startDate: '', records: {} });
        }
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Firebase connection error:", err);
        setError("Database connection failed. Please check your config.");
        setLoading(false);
      });

      return () => unsub();
    } catch (err) {
      console.error("Firebase init error:", err);
      setError("Failed to initialize Firebase.");
      setLoading(false);
    }
  }, []);

  const handleSetupSave = async (members: Member[], startDate: string) => {
    const newState: AppState = { ...state, members, startDate };
    try {
      await setDoc(doc(db, "circles", DOC_ID), newState);
      setActiveTab('home');
    } catch (e) {
      alert("Error saving: " + e);
    }
  };

  const togglePayment = async (memberId: string) => {
    const dateKey = formatDateKey(currentDateView);
    const currentRecord = state.records[dateKey] || { date: dateKey, payments: {} };
    const newPayments = {
      ...currentRecord.payments,
      [memberId]: !currentRecord.payments[memberId]
    };
    
    const updatedRecords = {
      ...state.records,
      [dateKey]: { ...currentRecord, payments: newPayments }
    };

    const newState = { ...state, records: updatedRecords };
    setState(newState);

    try {
      await setDoc(doc(db, "circles", DOC_ID), newState);
    } catch (e) {
      console.error("Error updating payment:", e);
    }
  };

  const cycleInfo = useMemo(() => {
    if (!state.startDate || state.members.length === 0) return null;
    return getCycleInfo(state.startDate, currentDateView, state.members);
  }, [state.startDate, currentDateView, state.members]);

  const resetData = async () => {
    if (confirm("Reset ALL data? This cannot be undone.")) {
      await setDoc(doc(db, "circles", DOC_ID), { members: [], startDate: '', records: {} });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
        <p className="text-white/60 font-medium">Loading Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-black">
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center border-red-500/30">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4">
            <CloudOff size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-white/50 max-w-xs mx-auto mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (state.members.length === 0) {
    return (
      <div className="min-h-screen py-10 px-4 bg-black">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <div className="w-16 h-16 glass-panel rounded-2xl mx-auto mb-4 flex items-center justify-center text-primary-400 shadow-lg shadow-primary-500/20">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Su Mae Manager</h1>
          <p className="text-white/50">Setup your circle</p>
        </div>
        <MemberSetup 
          members={state.members} 
          onSave={handleSetupSave} 
          existingStartDate={state.startDate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Dark Header */}
      <header className="nav-glass sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
              SM
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">Su Mae</h1>
              <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>
          {cycleInfo && (
            <div className="text-xs font-bold text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              Cycle {cycleInfo.cycleNumber}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'home' && cycleInfo && (
          <>
            {/* Status Card - Darker, richer colors */}
            <div className={clsx(
              "relative overflow-hidden rounded-[32px] p-6 text-white shadow-2xl transition-all duration-500 border border-white/10",
              cycleInfo.isPayoutDay 
                ? "bg-gradient-to-br from-gold-600 via-amber-600 to-orange-700 shadow-amber-500/20" 
                : "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 shadow-lg"
            )}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1 flex items-center gap-2">
                      {cycleInfo.isPayoutDay ? <Sparkles size={16} className="text-white animate-pulse" /> : null}
                      {cycleInfo.isPayoutDay ? "PAYOUT DAY" : "NEXT PAYOUT"}
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-white">
                      {cycleInfo.isPayoutDay ? "Withdaw Now" : `${cycleInfo.daysUntilPayout} Days Left`}
                    </h2>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                    <Wallet className="text-white" size={24} />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Receiver Info */}
                  <div className="bg-black/30 rounded-3xl p-5 backdrop-blur-md border border-white/5">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-white/60 font-medium">Receiver</span>
                      <span className="font-bold text-xs text-black bg-white/90 px-2.5 py-1 rounded-full">
                        #{cycleInfo.currentReceiver?.order}
                      </span>
                    </div>
                    <p className="font-bold text-2xl mb-4 tracking-wide text-white">
                      {cycleInfo.currentReceiver?.name}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                        style={{ width: `${(cycleInfo.dayInCycle / CONSTANTS.CYCLE_DAYS) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-white/50 font-medium">
                      <span>Day {cycleInfo.dayInCycle}</span>
                      <span>Target: 15</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                     <span className="text-sm text-white/70 font-medium">Total Pot</span>
                     <span className="font-bold text-xl text-white">
                       {CONSTANTS.TOTAL_PAYOUT.toLocaleString()} <span className="text-sm font-normal text-white/50">Baht</span>
                     </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Navigator - Dark */}
            <div className="glass-panel p-2 rounded-full flex justify-between items-center bg-black/40">
               <button 
                 onClick={() => setCurrentDateView(d => new Date(d.setDate(d.getDate() - 1)))}
                 className="p-3 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-colors"
               >
                 <ChevronLeft size={20} />
               </button>
               <div className="flex flex-col items-center">
                 <span className="font-bold text-white text-lg leading-tight">
                   {format(currentDateView, 'MMM dd')}
                 </span>
                 <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                   {format(currentDateView, 'yyyy')} 
                   {format(new Date(), 'yyyy-MM-dd') === format(currentDateView, 'yyyy-MM-dd') && " • Today"}
                 </span>
               </div>
               <button 
                 onClick={() => setCurrentDateView(d => new Date(d.setDate(d.getDate() + 1)))}
                 className="p-3 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-colors"
               >
                 <ChevronRight size={20} />
               </button>
            </div>

            {/* Checklist */}
            <DailyChecklist 
              members={state.members}
              dateLabel={format(currentDateView, 'yyyy-MM-dd')}
              record={state.records[formatDateKey(currentDateView)] || { date: formatDateKey(currentDateView), payments: {} }}
              onTogglePayment={togglePayment}
            />
          </>
        )}

        {activeTab === 'calendar' && (
          <CalendarView state={state} />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MemberSetup 
              members={state.members} 
              onSave={handleSetupSave} 
              existingStartDate={state.startDate}
            />
            
            <div className="glass-panel p-6 rounded-3xl border-red-900/50 bg-red-900/10">
              <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-white/50 mb-4">
                Clear all data and start over.
              </p>
              <button 
                onClick={resetData}
                className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 font-medium transition-colors"
              >
                Reset Cloud Data
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation - Darker and Less Bright */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-40 pointer-events-none">
        <nav className="max-w-xs mx-auto nav-glass shadow-2xl shadow-black/50 rounded-[2rem] p-2 pointer-events-auto flex justify-between items-center border border-white/10">
          <button 
            onClick={() => setActiveTab('home')}
            className={clsx(
              "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 relative",
              activeTab === 'home' 
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105" 
                : "text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <Users size={22} />
          </button>
          
          <button 
            onClick={() => setActiveTab('calendar')}
            className={clsx(
              "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 relative",
              activeTab === 'calendar' 
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105" 
                : "text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <CalendarIcon size={22} />
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={clsx(
              "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 relative",
              activeTab === 'settings' 
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105" 
                : "text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <Settings size={22} />
          </button>
        </nav>
      </div>
    </div>
  );
}
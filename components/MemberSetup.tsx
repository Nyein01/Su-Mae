import React, { useState } from 'react';
import { Member, CONSTANTS } from '../types';
import { Save, User, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  members: Member[];
  onSave: (members: Member[], startDate: string) => void;
  existingStartDate: string;
}

export const MemberSetup: React.FC<Props> = ({ members: initialMembers, onSave, existingStartDate }) => {
  const [localMembers, setLocalMembers] = useState<Member[]>(() => {
    // Clone existing members to avoid mutating props
    const current = initialMembers.length > 0 ? [...initialMembers] : [];
    
    // Fill up to TOTAL_MEMBERS if we have fewer
    while (current.length < CONSTANTS.TOTAL_MEMBERS) {
      current.push({
        id: `mem-${Date.now()}-${current.length}`,
        name: '',
        order: current.length + 1
      });
    }
    
    // If we have more than needed (unlikely but safe), slice
    return current.slice(0, CONSTANTS.TOTAL_MEMBERS);
  });

  const [startDate, setStartDate] = useState<string>(
    existingStartDate || new Date().toISOString().split('T')[0]
  );

  const handleNameChange = (id: string, newName: string) => {
    setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localMembers.length - 1) return;

    const newMembers = [...localMembers];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order values
    const tempOrder = newMembers[index].order;
    newMembers[index].order = newMembers[swapIndex].order;
    newMembers[swapIndex].order = tempOrder;

    // Swap positions in array
    [newMembers[index], newMembers[swapIndex]] = [newMembers[swapIndex], newMembers[index]];
    
    setLocalMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localMembers.some(m => !m.name.trim())) {
      alert("Please enter names for all members.");
      return;
    }
    onSave(localMembers, startDate);
  };

  return (
    <div className="glass-panel p-6 rounded-[32px] shadow-2xl bg-black/40">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white shadow-inner">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Setup Circle</h2>
          <p className="text-sm text-white/50 font-medium">Add {CONSTANTS.TOTAL_MEMBERS} members & start date</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider pl-1">
            Start Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-white placeholder-white/20 shadow-inner"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider pl-1">
            Members Queue (1-5)
          </label>
          
          <div className="space-y-3">
            {localMembers.map((member, index) => (
              <div 
                key={member.id} 
                className="group flex items-center gap-3 p-2 pr-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-white/5 text-white/50 group-hover:bg-primary-600 group-hover:text-white rounded-xl flex items-center justify-center font-bold text-sm transition-colors duration-300">
                  {member.order}
                </div>
                
                <input
                  type="text"
                  placeholder={`Member Name`}
                  value={member.name}
                  onChange={(e) => handleNameChange(member.id, e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white font-medium placeholder-white/20 p-0"
                />

                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white disabled:opacity-0"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOrder(index, 'down')}
                    disabled={index === localMembers.length - 1}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white disabled:opacity-0"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full relative overflow-hidden group bg-white text-black p-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            <Save size={20} />
            <span>Save & Start</span>
          </div>
        </button>
      </form>
    </div>
  );
};
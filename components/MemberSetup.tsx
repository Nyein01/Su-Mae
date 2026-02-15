import React, { useState, useRef } from 'react';
import { Member, CONSTANTS } from '../types';
import { Save, User, ChevronUp, ChevronDown, Camera, X, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  members: Member[];
  onSave: (members: Member[], startDate: string) => void;
  existingStartDate: string;
}

export const MemberSetup: React.FC<Props> = ({ members: initialMembers, onSave, existingStartDate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMemberIdForUpload, setActiveMemberIdForUpload] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const [localMembers, setLocalMembers] = useState<Member[]>(() => {
    const current = initialMembers.length > 0 ? [...initialMembers] : [];
    while (current.length < CONSTANTS.TOTAL_MEMBERS) {
      current.push({
        id: `mem-${Date.now()}-${current.length}`,
        name: '',
        order: current.length + 1
      });
    }
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
    
    const tempOrder = newMembers[index].order;
    newMembers[index].order = newMembers[swapIndex].order;
    newMembers[swapIndex].order = tempOrder;

    [newMembers[index], newMembers[swapIndex]] = [newMembers[swapIndex], newMembers[index]];
    
    setLocalMembers(newMembers);
  };

  const triggerImageUpload = (memberId: string) => {
    setActiveMemberIdForUpload(memberId);
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeMemberIdForUpload) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxSize = 200; // Increased slightly for quality
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          
          setLocalMembers(prev => prev.map(m => 
            m.id === activeMemberIdForUpload ? { ...m, avatar: base64 } : m
          ));
          setActiveMemberIdForUpload(null);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    setLocalMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, avatar: undefined } : m
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localMembers.some(m => !m.name.trim())) {
      // Simple shake animation effect could be added here
      alert("Please enter names for all members.");
      return;
    }
    onSave(localMembers, startDate);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary-900 to-black border border-primary-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] mb-2">
          <Sparkles size={24} className="text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Configure Circle</h2>
        <p className="text-white/40 text-sm">Set the rotation order & start date</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Date Configuration Card */}
        <div className="glass-panel p-1 rounded-[24px] bg-white/5 border border-white/10">
          <div className="relative overflow-hidden rounded-[20px] bg-black/40 p-4 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-primary-500/50">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary-400 border border-white/5">
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                First Payout Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-white font-bold text-lg focus:ring-0 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          <div className="flex justify-between px-4 pb-1">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rotation Order</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{localMembers.length} Members</span>
          </div>

          {localMembers.map((member, index) => (
            <div 
              key={member.id}
              className={clsx(
                "group relative glass-panel rounded-[24px] p-2 pr-3 flex items-center gap-3 transition-all duration-300",
                focusedId === member.id ? "bg-white/10 border-white/20 translate-x-1" : "bg-black/20 border-white/5 hover:bg-white/5"
              )}
            >
              {/* Rank Number */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 z-20 shadow-xl">
                {index + 1}
              </div>

              {/* Avatar Upload */}
              <div 
                onClick={() => triggerImageUpload(member.id)}
                className="relative w-14 h-14 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-primary-500/50 transition-all group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                {member.avatar ? (
                  <>
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    <div 
                      onClick={(e) => removeImage(e, member.id)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <X size={18} className="text-white drop-shadow-lg" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20 group-hover:text-primary-400 transition-colors">
                    <Camera size={20} />
                  </div>
                )}
              </div>

              {/* Name Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Member Name"
                  value={member.name}
                  onFocus={() => setFocusedId(member.id)}
                  onBlur={() => setFocusedId(null)}
                  onChange={(e) => handleNameChange(member.id, e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white font-medium text-lg placeholder-white/20 p-0"
                />
                <div className="text-[10px] text-white/30 font-medium truncate mt-0.5">
                  Gets payout in Cycle {index + 1}
                </div>
              </div>

              {/* Reorder Controls */}
              <div className="flex flex-col gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => moveOrder(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp size={14} strokeWidth={3} />
                </button>
                <div className="h-[1px] bg-white/5 w-full mx-auto" />
                <button
                  type="button"
                  onClick={() => moveOrder(index, 'down')}
                  disabled={index === localMembers.length - 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 pb-12">
          <button
            type="submit"
            className="w-full group relative overflow-hidden rounded-[24px] bg-white text-black p-1 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-transform active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white rounded-[22px] py-4 px-6 flex items-center justify-center gap-3 border border-black/5">
              <span className="font-bold text-lg tracking-tight">Save Configuration</span>
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
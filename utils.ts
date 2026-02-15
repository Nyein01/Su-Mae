import { format, addDays, differenceInDays, parseISO, startOfDay, isSameDay } from 'date-fns';
import { CONSTANTS, Member } from './types';

export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getCycleInfo = (startDateStr: string, currentDate: Date, members: Member[]) => {
  // Validate inputs
  if (!startDateStr || !members || members.length === 0) return null;

  let startDate: Date;
  try {
    startDate = parseISO(startDateStr);
    if (isNaN(startDate.getTime())) return null; // Invalid date check
  } catch (e) {
    return null;
  }

  const diffDays = differenceInDays(startOfDay(currentDate), startOfDay(startDate));
  
  // If negative, it hasn't started yet
  if (diffDays < 0) return null;

  const currentCycleNumber = Math.floor(diffDays / CONSTANTS.CYCLE_DAYS) + 1;
  const dayInCycle = (diffDays % CONSTANTS.CYCLE_DAYS) + 1;
  const daysUntilPayout = CONSTANTS.CYCLE_DAYS - dayInCycle;
  
  // Sort members by order to ensure deterministic rotation, regardless of array order
  const sortedMembers = [...members].sort((a, b) => a.order - b.order);

  // Calculate receiver based on sorted list index
  // Cycle 1 -> Index 0, Cycle 2 -> Index 1... Cycle 6 -> Index 0
  const receiverIndex = (currentCycleNumber - 1) % sortedMembers.length;
  const currentReceiver = sortedMembers[receiverIndex];

  const isPayoutDay = dayInCycle === CONSTANTS.CYCLE_DAYS;

  return {
    cycleNumber: currentCycleNumber,
    dayInCycle,
    daysUntilPayout,
    currentReceiver,
    isPayoutDay,
    totalPot: CONSTANTS.TOTAL_PAYOUT
  };
};

export const generateCalendarDays = (startDateStr: string, daysToShow: number = 45) => {
  if (!startDateStr) return [];
  
  const startDate = parseISO(startDateStr);
  const days = [];
  
  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(startDate, i);
    const dayNumber = i + 1;
    const isPayout = dayNumber % CONSTANTS.CYCLE_DAYS === 0;
    
    // Determine cycle owner order (1-based)
    // This assumes 5 members. If dynamic, this function needs members array.
    // Keeping as is for now based on CONSTANTS.
    const cycleIndex = Math.floor(i / CONSTANTS.CYCLE_DAYS);
    const orderIndex = (cycleIndex % CONSTANTS.TOTAL_MEMBERS) + 1;

    days.push({
      date,
      dayGlobal: dayNumber,
      isPayout,
      cycleOwnerOrder: orderIndex
    });
  }
  return days;
};
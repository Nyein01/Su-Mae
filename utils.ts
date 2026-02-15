import { format, addDays, differenceInDays, parseISO, startOfDay, isSameDay } from 'date-fns';
import { CONSTANTS, Member } from './types';

export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getCycleInfo = (startDateStr: string, currentDate: Date, members: Member[]) => {
  const startDate = parseISO(startDateStr);
  const diffDays = differenceInDays(startOfDay(currentDate), startOfDay(startDate));
  
  // If negative, it hasn't started
  if (diffDays < 0) return null;

  const currentCycleNumber = Math.floor(diffDays / CONSTANTS.CYCLE_DAYS) + 1;
  const dayInCycle = (diffDays % CONSTANTS.CYCLE_DAYS) + 1;
  const daysUntilPayout = CONSTANTS.CYCLE_DAYS - dayInCycle;
  
  // Calculate who takes the money this cycle
  // Cycle 1 -> Order 1, Cycle 2 -> Order 2, Cycle 6 -> Order 1
  const memberIndex = (currentCycleNumber - 1) % CONSTANTS.TOTAL_MEMBERS;
  const currentReceiver = members.find(m => m.order === memberIndex + 1);

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
  const startDate = parseISO(startDateStr);
  const days = [];
  
  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(startDate, i);
    const dayNumber = i + 1;
    const isPayout = dayNumber % CONSTANTS.CYCLE_DAYS === 0;
    
    // Determine cycle owner
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
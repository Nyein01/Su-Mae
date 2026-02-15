export interface Member {
  id: string;
  name: string;
  order: number; // 1 to 5
}

export interface DailyRecord {
  date: string; // ISO string YYYY-MM-DD
  payments: Record<string, boolean>; // memberId -> hasPaid
}

export interface AppState {
  members: Member[];
  startDate: string; // ISO string YYYY-MM-DD
  records: Record<string, DailyRecord>; // date -> record
}

export const CONSTANTS = {
  TOTAL_MEMBERS: 5,
  DAILY_AMOUNT: 100,
  CYCLE_DAYS: 15,
  TOTAL_PAYOUT: 7500, // 5 * 100 * 15
};
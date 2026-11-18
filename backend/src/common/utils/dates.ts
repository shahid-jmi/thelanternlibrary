// The shop runs on Indian time (UTC+5:30, no daylight saving), whatever
// timezone the server happens to be in.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const toIst = (date: Date): Date => new Date(date.getTime() + IST_OFFSET_MS);
const fromIst = (date: Date): Date => new Date(date.getTime() - IST_OFFSET_MS);

export const startOfDayIst = (now: Date = new Date()): Date => {
  const ist = toIst(now);
  return fromIst(new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate())));
};

export const startOfMonthIst = (now: Date = new Date()): Date => {
  const ist = toIst(now);
  return fromIst(new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1)));
};

// Indian financial year (April–March), e.g. "2026-27".
export const financialYearLabel = (now: Date = new Date()): string => {
  const ist = toIst(now);
  const startYear = ist.getUTCMonth() >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
};

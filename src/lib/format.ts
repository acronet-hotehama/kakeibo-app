// =============================================================
// 表示用の小さな関数（ブラウザ・サーバーどちらでも使える）
// =============================================================

/** 12345 → "￥12,345" */
export function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
}

/** 数字を2桁にそろえる 3 → "03" */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 今月を "2026-10" 形式で返す */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

/** 今日を "2026-10-19" 形式で返す */
export function todayString(): string {
  const now = new Date();
  return `${currentMonth()}-${pad2(now.getDate())}`;
}

/** 月をずらす。shiftMonth("2026-01", -1) → "2025-12" */
export function shiftMonth(month: string, diff: number): string {
  const [year, mon] = month.split("-").map(Number);
  const d = new Date(year, mon - 1 + diff, 1); // Date は月を 0〜11 で扱う点に注意
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** "2026-10" → "2026年10月" */
export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-");
  return `${year}年${Number(mon)}月`;
}

/** "2026-10-05" → "10/5" */
export function formatShortDate(date: string): string {
  const [, mon, day] = date.split("-");
  return `${Number(mon)}/${Number(day)}`;
}

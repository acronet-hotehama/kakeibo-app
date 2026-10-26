// =============================================================
// 入力チェック（バリデーション）
//
// ブラウザ側でもチェックはしているが、API は誰でも直接呼べるので
// 「サーバー側で必ずもう一度チェックする」のが実務の基本。
// =============================================================
import type { TransactionInput } from "./types";

/**
 * 成功なら { ok: true, value }、失敗なら { ok: false, error } を返す。
 * ok の値で TypeScript が型を絞り込んでくれる（判別可能なユニオン型）。
 */
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** "YYYY-MM" 形式か */
export function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** "YYYY-MM-DD" 形式で、実在する日付か */
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  // 2026-02-31 のような日付は Date が 3/3 に繰り上げるので、元の文字列と比較して弾く
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** 取引の入力値をチェックする。body は何が来るか分からないので unknown で受け取る */
export function validateTransactionInput(body: unknown): ValidationResult<TransactionInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "リクエストの形式が正しくありません" };
  }
  const { amount, categoryId, date, memo } = body as Record<string, unknown>;

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return { ok: false, error: "金額は1以上の整数で入力してください" };
  }
  if (amount > 100_000_000) {
    return { ok: false, error: "金額が大きすぎます" };
  }
  if (typeof categoryId !== "number" || !Number.isInteger(categoryId)) {
    return { ok: false, error: "カテゴリを選択してください" };
  }
  if (typeof date !== "string" || !isValidDate(date)) {
    return { ok: false, error: "日付が正しくありません" };
  }
  if (memo !== undefined && typeof memo !== "string") {
    return { ok: false, error: "メモの形式が正しくありません" };
  }
  const memoText = (memo ?? "").trim();
  if (memoText.length > 100) {
    return { ok: false, error: "メモは100文字以内で入力してください" };
  }

  return { ok: true, value: { amount, categoryId, date, memo: memoText } };
}

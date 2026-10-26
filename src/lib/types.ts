// =============================================================
// アプリ全体で使う「データの形」の定義（TypeScript の型）
// サーバー側・ブラウザ側の両方から import される。
// =============================================================

/** 収入 or 支出。この2つの文字列以外は代入できない（ユニオン型） */
export type TransactionType = "income" | "expense";

/** カテゴリ 1件（categories テーブルの1行に対応） */
export type Category = {
  id: number;
  name: string;
  type: TransactionType;
};

/** 画面に表示する取引 1件（transactions と categories を JOIN した結果） */
export type Transaction = {
  id: number;
  amount: number;
  date: string; // "2026-10-19" 形式の文字列
  memo: string;
  categoryId: number;
  categoryName: string;
  type: TransactionType;
};

/** 登録・更新のときにブラウザから送られてくるデータ */
export type TransactionInput = {
  amount: number;
  categoryId: number;
  date: string;
  memo: string;
};

/** カテゴリ別の集計 1行 */
export type CategoryTotal = {
  categoryName: string;
  type: TransactionType;
  total: number;
};

/** 月の集計結果 */
export type MonthlySummary = {
  month: string; // "2026-10"
  income: number;
  expense: number;
  balance: number; // income - expense
  byCategory: CategoryTotal[];
};

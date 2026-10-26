// =============================================================
// リポジトリ層：SQL を実行する関数をここに集める
//
// API（route.ts）は「HTTP のやり取り」、ここは「DB のやり取り」と役割を分けている。
// こうしておくと、SQL を確認したいときはこのファイルだけ見ればよい。
//
// ★ SQL に値を入れるときは必ず $1, $2 ... のプレースホルダを使う。
//   文字列を直接つなげると「SQL インジェクション」という攻撃を受ける。
// =============================================================
import "server-only";
import { pool } from "./db";
import type { Category, MonthlySummary, Transaction, TransactionInput } from "./types";

/** 取引の SELECT で共通して使う列。DB の snake_case を JS の camelCase に変換している */
const TRANSACTION_COLUMNS = `
  t.id,
  t.amount,
  to_char(t.date, 'YYYY-MM-DD') AS date,
  t.memo,
  t.category_id AS "categoryId",
  c.name        AS "categoryName",
  c.type
`;

// ---------------- カテゴリ ----------------

export async function findAllCategories(): Promise<Category[]> {
  const result = await pool.query<Category>(
    "SELECT id, name, type FROM categories ORDER BY type DESC, id",
  );
  return result.rows;
}

// ---------------- 取引 ----------------

/** 指定した月 ("2026-10") の取引を新しい順に取得 */
export async function findTransactionsByMonth(month: string): Promise<Transaction[]> {
  const result = await pool.query<Transaction>(
    `SELECT ${TRANSACTION_COLUMNS}
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
      WHERE t.date >= $1::date
        AND t.date <  ($1::date + INTERVAL '1 month')
      ORDER BY t.date DESC, t.id DESC`,
    [`${month}-01`],
  );
  return result.rows;
}

/** 1件取得。見つからなければ null */
async function findTransactionById(id: number): Promise<Transaction | null> {
  const result = await pool.query<Transaction>(
    `SELECT ${TRANSACTION_COLUMNS}
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
      WHERE t.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

/** カテゴリが存在するか（存在しない id で登録されるのを防ぐ） */
export async function categoryExists(categoryId: number): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM categories WHERE id = $1", [categoryId]);
  return (result.rowCount ?? 0) > 0;
}

/** 新規登録して、登録した取引を返す */
export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  // RETURNING id で、INSERT した行の id を受け取れる
  const result = await pool.query<{ id: number }>(
    `INSERT INTO transactions (amount, category_id, date, memo)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.amount, input.categoryId, input.date, input.memo],
  );
  const created = await findTransactionById(result.rows[0].id);
  return created!; // 直前に INSERT したので必ず存在する（! = null ではないと TypeScript に伝える）
}

/** 更新。対象が無ければ null */
export async function updateTransaction(
  id: number,
  input: TransactionInput,
): Promise<Transaction | null> {
  const result = await pool.query(
    `UPDATE transactions
        SET amount = $1, category_id = $2, date = $3, memo = $4
      WHERE id = $5`,
    [input.amount, input.categoryId, input.date, input.memo, id],
  );
  if (result.rowCount === 0) return null;
  return findTransactionById(id);
}

/** 削除。削除できたら true */
export async function deleteTransaction(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

// ---------------- 集計 ----------------

/** 月の収入合計・支出合計・カテゴリ別合計 */
export async function getMonthlySummary(month: string): Promise<MonthlySummary> {
  // SUM() の結果は bigint で、pg は文字列で返してくる。::int で数値に変換する。
  // COALESCE(x, 0) = x が NULL（データ0件）なら 0 にする。
  const result = await pool.query<{ categoryName: string; type: "income" | "expense"; total: number }>(
    `SELECT c.name AS "categoryName",
            c.type,
            COALESCE(SUM(t.amount), 0)::int AS total
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
      WHERE t.date >= $1::date
        AND t.date <  ($1::date + INTERVAL '1 month')
      GROUP BY c.id, c.name, c.type
      ORDER BY total DESC`,
    [`${month}-01`],
  );

  const byCategory = result.rows;
  // 収入・支出の合計は、カテゴリ別の結果を JavaScript で足し合わせて求める
  const income = byCategory.filter((r) => r.type === "income").reduce((sum, r) => sum + r.total, 0);
  const expense = byCategory.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.total, 0);

  return { month, income, expense, balance: income - expense, byCategory };
}

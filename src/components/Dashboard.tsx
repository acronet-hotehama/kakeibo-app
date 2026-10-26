"use client";
// =============================================================
// 家計簿のメイン画面（クライアントコンポーネント）
//
// ★ "use client" を書いたコンポーネントはブラウザでも動く。
//   useState（状態）や onClick（イベント）が使えるのはクライアントコンポーネントだけ。
//
// このコンポーネントの役割:
//   - 「表示中の月」「取引一覧」「集計」「編集中の取引」などの状態を持つ
//   - 月が変わったら API からデータを取り直す
//   - 子コンポーネントに表示用のデータと、操作されたときの関数を渡す
// =============================================================
import { useEffect, useState } from "react";
import * as api from "@/lib/api-client";
import { currentMonth, todayString } from "@/lib/format";
import type { Category, MonthlySummary, Transaction, TransactionInput } from "@/lib/types";
import CategoryChart from "./CategoryChart";
import MonthSelector from "./MonthSelector";
import SummaryCards from "./SummaryCards";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import styles from "./Dashboard.module.css";

type Props = {
  categories: Category[]; // page.tsx（サーバー）から渡される
};

export default function Dashboard({ categories }: Props) {
  // ---------- 状態 (state) ----------
  // useState の値が変わると、React がこのコンポーネントを再描画する
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null); // null = 新規登録モード
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 登録・削除後に「データを取り直して」と合図するためのカウンター
  const [reloadKey, setReloadKey] = useState(0);

  // ---------- データ取得 ----------
  // [month, reloadKey] のどちらかが変わるたびに実行される
  useEffect(() => {
    // 月を素早く切り替えたとき、古い月の結果が後から届いて上書きしないようにするフラグ
    let ignore = false;
    setLoading(true);

    // 一覧と集計を同時に取得する
    Promise.all([api.fetchTransactions(month), api.fetchSummary(month)])
      .then(([txs, sum]) => {
        if (ignore) return;
        setTransactions(txs);
        setSummary(sum);
        setErrorMessage(null);
      })
      .catch((error: Error) => {
        if (!ignore) setErrorMessage(error.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    // クリーンアップ関数: 次の useEffect 実行前に呼ばれる
    return () => {
      ignore = true;
    };
  }, [month, reloadKey]);

  // ---------- イベント処理（子コンポーネントから呼ばれる） ----------

  /** フォーム送信時: 編集中なら更新、そうでなければ新規登録 */
  async function handleSubmit(input: TransactionInput) {
    if (editing) {
      await api.updateTransaction(editing.id, input);
      setEditing(null);
    } else {
      await api.createTransaction(input);
    }
    setReloadKey((k) => k + 1); // 一覧と集計を取り直す
  }

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm(`「${transaction.categoryName}」${transaction.amount}円 を削除しますか？`)) {
      return;
    }
    try {
      await api.deleteTransaction(transaction.id);
      if (editing?.id === transaction.id) setEditing(null);
      setReloadKey((k) => k + 1);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }

  function handleMonthChange(newMonth: string) {
    setMonth(newMonth);
    setEditing(null);
  }

  // 新規登録時の日付の初期値: 今月を見ているなら今日、それ以外はその月の1日
  const defaultDate = month === currentMonth() ? todayString() : `${month}-01`;

  // ---------- 描画 ----------
  return (
    <div className={styles.layout}>
      <MonthSelector month={month} onChange={handleMonthChange} />

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <SummaryCards summary={summary} />

      <div className={styles.columns}>
        <div className={styles.side}>
          {/*
            key が変わると React はフォームを作り直す（中の入力値もリセットされる）。
            編集する取引を切り替えたとき、フォームに初期値を入れ直すために使っている。
          */}
          <TransactionForm
            key={editing?.id ?? "new"}
            categories={categories}
            editing={editing}
            defaultDate={defaultDate}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditing(null)}
          />
          <CategoryChart summary={summary} />
        </div>

        <TransactionList
          transactions={transactions}
          loading={loading}
          editingId={editing?.id ?? null}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

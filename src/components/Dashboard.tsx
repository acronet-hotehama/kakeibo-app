"use client";
// =============================================================
// 家計簿のメイン画面（クライアントコンポーネント）
//
// ★ "use client" を書いたコンポーネントはブラウザでも動く。
//   useState（状態）や onClick（イベント）が使えるのはクライアントコンポーネントだけ。
//
// このコンポーネントの役割:
//   - 「表示中の月」「取引一覧」「集計」などの状態を持つ
//   - 月が変わったら API からデータを取り直す
//   - 子コンポーネントに表示用のデータと、操作されたときの関数を渡す
//   - 「収支を追加」「編集」で、新規作成画面（/transactions/new）へ移動する
// =============================================================
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as api from "@/lib/api-client";
import { currentMonth } from "@/lib/format";
import type { Category, MonthlySummary, Transaction } from "@/lib/types";
import CategoryChart from "./CategoryChart";
import MonthSelector from "./MonthSelector";
import SummaryCards from "./SummaryCards";
import TransactionList from "./TransactionList";
import styles from "./Dashboard.module.css";

type Props = {
  categories: Category[]; // page.tsx（サーバー）から渡される
};

export default function Dashboard({ categories }: Props) {
  // 画面を移動するための道具
  const router = useRouter();

  // ---------- 状態 (state) ----------
  // useState の値が変わると、React がこのコンポーネントを再描画する
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 削除後に「データを取り直して」と合図するためのカウンター
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

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm(`「${transaction.categoryName}」${transaction.amount}円 を削除しますか？`)) {
      return;
    }
    try {
      await api.deleteTransaction(transaction.id);
      setReloadKey((k) => k + 1);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }

 // ---------- 描画 ----------
  return (
    <div className={styles.layout}>
      <MonthSelector month={month} onChange={setMonth} />

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <SummaryCards summary={summary} />

      <div className={styles.columns}>
        <div className={styles.side}>
          {/* 新規作成画面へのリンク（見た目はボタン） */}
          <Link
            href="/transactions/new"
            className="button"
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            ＋ 収支を追加
          </Link>
          <CategoryChart summary={summary} />
        </div>

        <TransactionList
          transactions={transactions}
          loading={loading}
          editingId={null}
          onEdit={(t) => {
            const url = `/transactions/new?id=${t.id}`;
            console.log("編集ページへ移動:", url);
            router.push(url);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

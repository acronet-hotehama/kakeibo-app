// =============================================================
// 収入・支出・収支の3つのカード
// =============================================================
import { formatYen } from "@/lib/format";
import type { MonthlySummary } from "@/lib/types";
import styles from "./SummaryCards.module.css";

type Props = {
  summary: MonthlySummary | null; // 読み込み前は null
};

export default function SummaryCards({ summary }: Props) {
  // ?? 0 = summary が null のときは 0 を使う
  const income = summary?.income ?? 0;
  const expense = summary?.expense ?? 0;
  const balance = summary?.balance ?? 0;

  return (
    <div className={styles.cards}>
      <div className={`card ${styles.card}`}>
        <span className={styles.label}>収入</span>
        <span className={`${styles.value} income`}>{formatYen(income)}</span>
      </div>
      <div className={`card ${styles.card}`}>
        <span className={styles.label}>支出</span>
        <span className={`${styles.value} expense`}>{formatYen(expense)}</span>
      </div>
      <div className={`card ${styles.card}`}>
        <span className={styles.label}>収支</span>
        {/* マイナスなら赤字の色にする */}
        <span className={`${styles.value} ${balance < 0 ? "expense" : ""}`}>{formatYen(balance)}</span>
      </div>
    </div>
  );
}

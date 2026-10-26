// =============================================================
// 収支の一覧
// =============================================================
import { formatShortDate, formatYen } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import styles from "./TransactionList.module.css";

type Props = {
  transactions: Transaction[];
  loading: boolean;
  editingId: number | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export default function TransactionList({ transactions, loading, editingId, onEdit, onDelete }: Props) {
  return (
    <section className={`card ${styles.list}`}>
      <h2 className="section-title">収支一覧（{transactions.length}件）</h2>

      {/* 条件によって表示を切り替える（三項演算子） */}
      {loading ? (
        <p className="muted">読み込み中…</p>
      ) : transactions.length === 0 ? (
        <p className="muted">この月の収支はまだありません。</p>
      ) : (
        <ul className={styles.items}>
          {transactions.map((t) => (
            <li key={t.id} className={`${styles.item} ${t.id === editingId ? styles.editing : ""}`}>
              <span className={styles.date}>{formatShortDate(t.date)}</span>
              <div className={styles.body}>
                <span className={styles.category}>{t.categoryName}</span>
                {t.memo && <span className={styles.memo}>{t.memo}</span>}
              </div>
              <span className={`${styles.amount} ${t.type}`}>
                {t.type === "income" ? "+" : "-"}
                {formatYen(t.amount)}
              </span>
              <div className={styles.buttons}>
                <button className={styles.iconButton} onClick={() => onEdit(t)}>
                  編集
                </button>
                <button className={`${styles.iconButton} ${styles.danger}`} onClick={() => onDelete(t)}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

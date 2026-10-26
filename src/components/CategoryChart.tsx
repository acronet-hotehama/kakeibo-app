// =============================================================
// カテゴリ別の支出グラフ（ライブラリを使わず、CSS の width で棒グラフを描く）
// =============================================================
import { formatYen } from "@/lib/format";
import type { MonthlySummary } from "@/lib/types";
import styles from "./CategoryChart.module.css";

type Props = {
  summary: MonthlySummary | null;
};

export default function CategoryChart({ summary }: Props) {
  const expenses = summary?.byCategory.filter((c) => c.type === "expense") ?? [];
  const totalExpense = summary?.expense ?? 0;

  return (
    <section className="card">
      <h2 className="section-title">支出の内訳</h2>
      {expenses.length === 0 ? (
        <p className="muted">支出はありません。</p>
      ) : (
        <ul className={styles.bars}>
          {expenses.map((c) => {
            // 支出合計に対する割合（%）
            const percent = Math.round((c.total / totalExpense) * 100);
            return (
              <li key={c.categoryName} className={styles.row}>
                <div className={styles.labels}>
                  <span>{c.categoryName}</span>
                  <span className="muted">
                    {formatYen(c.total)}（{percent}%）
                  </span>
                </div>
                <div className={styles.track}>
                  {/* style 属性で幅を動的に指定する */}
                  <div className={styles.bar} style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

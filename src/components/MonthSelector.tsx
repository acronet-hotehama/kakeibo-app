// =============================================================
// 月の切り替え（◀ 2026年10月 ▶）
//
// 自分では状態を持たず、親から受け取った month を表示し、
// 操作されたら onChange で親に伝えるだけ（「制御されたコンポーネント」）。
// ※ "use client" が無いが、親の Dashboard がクライアントコンポーネントなので
//   ここもブラウザで動く。
// =============================================================
import { formatMonthLabel, shiftMonth } from "@/lib/format";
import styles from "./MonthSelector.module.css";

type Props = {
  month: string;
  onChange: (month: string) => void;
};

export default function MonthSelector({ month, onChange }: Props) {
  return (
    <div className={styles.selector}>
      <button className={styles.arrow} onClick={() => onChange(shiftMonth(month, -1))} aria-label="前の月">
        ◀
      </button>
      <label className={styles.label}>
        {formatMonthLabel(month)}
        {/* カレンダーから月を直接選ぶための入力欄 */}
        <input
          type="month"
          className={styles.picker}
          value={month}
          onChange={(e) => e.target.value && onChange(e.target.value)}
        />
      </label>
      <button className={styles.arrow} onClick={() => onChange(shiftMonth(month, 1))} aria-label="次の月">
        ▶
      </button>
    </div>
  );
}

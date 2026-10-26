// =============================================================
// 収支の入力フォーム（新規登録 / 編集 兼用）
//
// 流れ: 入力 → 送信ボタン → handleSubmit → 入力チェック → 親の onSubmit（API 呼び出し）
// =============================================================
import { useState, type FormEvent } from "react";
import type { Category, Transaction, TransactionInput, TransactionType } from "@/lib/types";
import styles from "./TransactionForm.module.css";

type Props = {
  categories: Category[];
  editing: Transaction | null; // null なら新規登録
  defaultDate: string;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancelEdit: () => void;
};

export default function TransactionForm({ categories, editing, defaultDate, onSubmit, onCancelEdit }: Props) {
  // 入力欄の値はすべて state で管理する。初期値は「編集中の収支」があればその値。
  // 金額は入力途中の空文字も扱えるよう、数値ではなく文字列で持つ。
  const [type, setType] = useState<TransactionType>(editing?.type ?? "expense");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [categoryId, setCategoryId] = useState(editing ? String(editing.categoryId) : "");
  const [date, setDate] = useState(editing?.date ?? defaultDate);
  const [memo, setMemo] = useState(editing?.memo ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 選択中の種別（収入/支出）のカテゴリだけを選択肢に出す
  const options = categories.filter((c) => c.type === type);

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    setCategoryId(""); // 種別を変えたらカテゴリ選択をリセット
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // ブラウザ標準の「ページ再読み込みを伴う送信」を止める

    // --- ブラウザ側の入力チェック（すぐにエラーを見せるため） ---
    const amountNumber = Number(amount);
    if (!Number.isInteger(amountNumber) || amountNumber <= 0) {
      setError("金額は1以上の整数で入力してください");
      return;
    }
    if (!categoryId) {
      setError("カテゴリを選択してください");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ amount: amountNumber, categoryId: Number(categoryId), date, memo });
      if (!editing) {
        // 新規登録が成功したら、続けて入力しやすいよう金額とメモだけ空にする
        setAmount("");
        setMemo("");
      }
    } catch (e) {
      setError((e as Error).message); // サーバー側のチェックで弾かれた場合など
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={`card ${styles.form}`} onSubmit={handleSubmit}>
      <h2 className="section-title">{editing ? "収支を編集" : "収支を追加"}</h2>

      {/* 収入 / 支出 の切り替え */}
      <div className={styles.typeToggle} role="radiogroup">
        <button
          type="button"
          className={`${styles.typeButton} ${type === "expense" ? styles.activeExpense : ""}`}
          onClick={() => handleTypeChange("expense")}
        >
          支出
        </button>
        <button
          type="button"
          className={`${styles.typeButton} ${type === "income" ? styles.activeIncome : ""}`}
          onClick={() => handleTypeChange("income")}
        >
          収入
        </button>
      </div>

      <label className={styles.field}>
        金額（円）
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
          required
        />
      </label>

      <label className={styles.field}>
        カテゴリ
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">選択してください</option>
          {options.map((c) => (
            // 配列から要素を並べるときは、各要素に一意な key が必要
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        日付
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label className={styles.field}>
        メモ
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={100}
          placeholder="任意"
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        {editing && (
          <button type="button" className="button button-secondary" onClick={onCancelEdit}>
            キャンセル
          </button>
        )}
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "保存中…" : editing ? "更新する" : "追加する"}
        </button>
      </div>
    </form>
  );
}

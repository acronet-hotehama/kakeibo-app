// =============================================================
// ブラウザから API を呼び出す関数（fetch のラッパー）
//
// 画面のコンポーネントは「どの URL に何を送るか」を気にせず、
// ここの関数を呼ぶだけでよいようにしている。
// =============================================================
import type { MonthlySummary, Transaction, TransactionInput } from "./types";

/** 共通処理: fetch して、エラーなら例外を投げ、成功なら JSON を返す */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    // サーバーは { error: "..." } の形でエラー内容を返してくる
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? `通信エラーが発生しました (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T; // 削除成功時など、中身が無いレスポンス
  }
  return response.json() as Promise<T>;
}

export function fetchTransactions(month: string): Promise<Transaction[]> {
  return request(`/api/transactions?month=${month}`);
}

export function fetchSummary(month: string): Promise<MonthlySummary> {
  return request(`/api/summary?month=${month}`);
}

export function createTransaction(input: TransactionInput): Promise<Transaction> {
  return request("/api/transactions", { method: "POST", body: JSON.stringify(input) });
}

export function updateTransaction(id: number, input: TransactionInput): Promise<Transaction> {
  return request(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteTransaction(id: number): Promise<void> {
  return request(`/api/transactions/${id}`, { method: "DELETE" });
}

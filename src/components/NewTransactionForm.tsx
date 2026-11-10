"use client";

import { useRouter } from "next/navigation";
import TransactionForm from "./TransactionForm";
import * as api from "@/lib/api-client";
import { todayString } from "@/lib/format";
import type { Category, Transaction, TransactionInput } from "@/lib/types";

type Props = {
  categories: Category[];
  editing: Transaction | null; // 編集する取引。null なら新規作成
};

export default function NewTransactionForm({ categories, editing }: Props) {
  const router = useRouter();

  async function handleSubmit(input: TransactionInput) {
    if (editing) {
      // 編集のとき: 更新する
      await api.updateTransaction(editing.id, input);
    } else {
      // 新規のとき: 追加する
      await api.createTransaction(input);
    }
    router.push("/");
  }

  return (
    <TransactionForm
      categories={categories}
      editing={editing}
      defaultDate={editing ? editing.date : todayString()}
      onSubmit={handleSubmit}
      onCancelEdit={() => router.push("/")}
    />
  );
}
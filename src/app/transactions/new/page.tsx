import NewTransactionForm from "@/components/NewTransactionForm";
import { findAllCategories, findTransactionById } from "@/lib/repository";

// URL の「?id=12」の部分を受け取るための型
type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function NewPage({ searchParams }: Props) {
  const categories = await findAllCategories();

  // URL に ?id= があれば、その番号の取引を DB から読む（なければ null = 新規作成）
  const { id } = await searchParams;
  const editing = id ? await findTransactionById(Number(id)) : null;

  return (
    <main className="container" style={{ maxWidth: 520 }}>
      <NewTransactionForm categories={categories} editing={editing} />
    </main>
  );
}
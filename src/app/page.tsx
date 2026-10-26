// =============================================================
// トップページ "/"
//
// ★ このファイルは「サーバーコンポーネント」（先頭に "use client" が無い）。
//   サーバー上で実行されるので、API を経由せず直接 DB を読める。
//   カテゴリ一覧はめったに変わらないので、ここで取得して Dashboard に渡している。
//
//   一方、取引の一覧や登録はボタン操作で変わるので、
//   ブラウザで動く Dashboard（クライアントコンポーネント）から API を呼ぶ。
// =============================================================
import Dashboard from "@/components/Dashboard";
import { findAllCategories } from "@/lib/repository";

// ビルド時ではなく、アクセスのたびにサーバーで実行する（DB の最新状態を読むため）
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await findAllCategories();

  return (
    <main className="container">
      <h1 className="page-title">家計簿</h1>
      <Dashboard categories={categories} />
    </main>
  );
}

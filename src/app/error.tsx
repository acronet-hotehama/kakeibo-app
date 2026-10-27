"use client";
// =============================================================
// ページの表示中にエラーが起きたときに代わりに表示される画面
// （例: PostgreSQL に接続できない）
// error.tsx はクライアントコンポーネントである必要がある。
// =============================================================

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container">
      <h1 className="page-title">家計簿</h1>
      <div className="card">
        <p>データを読み込めなかった！</p>
        <p className="muted">
          PostgreSQL が起動しているか、.env.local の DATABASE_URL が正しいか、
          npm run db:setup を実行済みかを確認してください。
        </p>
        <button className="button" onClick={reset}>
          再読み込み
        </button>
      </div>
    </main>
  );
}

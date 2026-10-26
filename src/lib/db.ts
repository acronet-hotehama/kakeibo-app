// =============================================================
// PostgreSQL への接続（サーバー側でのみ使う）
// =============================================================
import "server-only"; // 誤ってブラウザ側のコードから import するとビルドエラーにしてくれる
import { Pool } from "pg";

// Pool = 接続を使い回す仕組み。リクエストのたびに接続を作ると遅いため。
//
// 開発中 (npm run dev) はファイル保存のたびにこのモジュールが読み直される。
// そのたびに Pool を作ると接続が増え続けるので、globalThis に保存して1つだけにする。
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL, // .env.local から Next.js が自動で読み込む
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

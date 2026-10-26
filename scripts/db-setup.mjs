// =============================================================
// DB 初期化スクリプト（素の JavaScript + Node.js）
//
// 実行方法: npm run db:setup
//
// やっていること:
//   1. .env.local から接続先 (DATABASE_URL) を読み込む
//   2. データベース "kakeibo" が無ければ作る
//   3. db/schema.sql（テーブル作成）→ db/seed.sql（初期データ）を実行する
//
// ※ このファイルはあえて TypeScript ではなく JavaScript (.mjs) で書いている。
//   TypeScript と比べて「型の記述が無い」以外はほぼ同じ書き方であることを確認してみよう。
// =============================================================

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

// .env.local の中身を process.env に読み込む
dotenv.config({ path: ".env.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL が設定されていません。.env.example を .env.local にコピーして編集してください。");
  process.exit(1);
}

// このスクリプトがあるフォルダ (scripts/) の1つ上 = プロジェクトのルート
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** データベースが存在しなければ作成する */
async function createDatabaseIfMissing() {
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1); // "/kakeibo" → "kakeibo"

  // まだ kakeibo DB が無いかもしれないので、標準で存在する "postgres" DB に接続する
  url.pathname = "/postgres";
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  try {
    const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (result.rowCount === 0) {
      // CREATE DATABASE ではプレースホルダ ($1) が使えないため、名前を英数字に限定してから埋め込む
      if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error(`不正なDB名です: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`データベース "${dbName}" を作成しました`);
    }
  } finally {
    await client.end(); // 成功しても失敗しても必ず接続を閉じる
  }
}

/** SQL ファイルを読み込んで実行する */
async function runSqlFile(client, fileName) {
  const sql = await readFile(path.join(rootDir, "db", fileName), "utf8");
  await client.query(sql);
  console.log(`${fileName} を実行しました`);
}

async function main() {
  await createDatabaseIfMissing();

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await runSqlFile(client, "schema.sql");
    await runSqlFile(client, "seed.sql");
    console.log("セットアップ完了！ npm run dev でアプリを起動できます。");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("セットアップに失敗しました:", error.message);
  process.exit(1);
});

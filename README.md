# 家計簿アプリ（学習用）

Next.js + TypeScript + PostgreSQL で作る、シンプルな家計簿アプリです。
「AI が書いたコードを読んで理解し、確認・修正・フローチャート化できるようになる」ことを目的にしています。

## できること

- 収入・支出の登録 / 編集 / 削除
- 月ごとの一覧表示（◀ ▶ で月を切り替え）
- 月の収入・支出・収支の合計
- カテゴリ別の支出グラフ

## 使っている技術

| 技術 | このアプリでの役割 | 主なファイル |
| --- | --- | --- |
| HTML & CSS | 画面の構造と見た目 | `src/app/globals.css`, `src/components/*.module.css` |
| JavaScript | DB の初期化スクリプト | `scripts/db-setup.mjs` |
| TypeScript | アプリ本体すべて（型で安全に書く） | `src/**/*.ts(x)` |
| React | 画面の部品（コンポーネント）と状態管理 | `src/components/*.tsx` |
| Next.js | ページと API のルーティング、サーバー処理 | `src/app/` |
| Node.js | Next.js・API・スクリプトを動かす実行環境 | （全体） |
| PostgreSQL | データの保存 | `db/schema.sql`, `src/lib/repository.ts` |
| **追加: pg** | Node.js から PostgreSQL に接続するライブラリ | `src/lib/db.ts` |
| **追加: dotenv** | `.env.local` の設定を読み込む | `scripts/db-setup.mjs` |

## セットアップ

前提: Node.js 20 以上、PostgreSQL がインストール済みで起動していること。

1. 依存パッケージをインストール

   ```bash
   npm install
   ```

2. `.env.example` をコピーして `.env.local` を作り、`DATABASE_URL` のパスワード部分を
   PostgreSQL インストール時に設定したパスワードに書き換える

   ```bash
   copy .env.example .env.local
   ```

3. データベースとテーブルを作成し、サンプルデータを入れる

   ```bash
   npm run db:setup
   ```

4. 開発サーバーを起動して http://localhost:3000 を開く

   ```bash
   npm run dev
   ```

## コマンド一覧

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動（保存すると自動で反映） |
| `npm run build` | 本番用ビルド（型エラーもここで検出） |
| `npm run start` | ビルドしたものを起動 |
| `npm run typecheck` | TypeScript の型チェックだけ実行 |
| `npm run db:setup` | DB を作り直してサンプルデータを投入（**既存データは消えます**） |

## フォルダ構成

```
├─ db/
│   ├─ schema.sql            テーブル定義
│   └─ seed.sql              サンプルデータ
├─ scripts/
│   └─ db-setup.mjs          DB 初期化（JavaScript）
├─ src/
│   ├─ app/                  ★ Next.js のルーティング（フォルダ構成 = URL）
│   │   ├─ layout.tsx        全ページ共通の外枠
│   │   ├─ page.tsx          トップページ "/"（サーバーコンポーネント）
│   │   ├─ error.tsx         エラー時の画面
│   │   ├─ globals.css       全体の CSS
│   │   └─ api/              ★ API（サーバー側で動く）
│   │       ├─ transactions/route.ts        GET 一覧 / POST 登録
│   │       ├─ transactions/[id]/route.ts   PUT 更新 / DELETE 削除
│   │       └─ summary/route.ts             GET 月の集計
│   ├─ components/           ★ React コンポーネント（画面の部品）
│   │   ├─ Dashboard.tsx     画面全体の状態管理（"use client"）
│   │   ├─ MonthSelector.tsx 月切り替え
│   │   ├─ SummaryCards.tsx  収入・支出・収支
│   │   ├─ TransactionForm.tsx  入力フォーム
│   │   ├─ TransactionList.tsx  一覧
│   │   └─ CategoryChart.tsx    カテゴリ別グラフ
│   └─ lib/                  ★ 画面以外の共通処理
│       ├─ types.ts          データの型定義
│       ├─ db.ts             PostgreSQL 接続
│       ├─ repository.ts     SQL を実行する関数
│       ├─ validation.ts     入力チェック
│       ├─ api-client.ts     ブラウザから API を呼ぶ関数
│       └─ format.ts         金額・日付の表示用関数
└─ docs/                     学習用ドキュメント（フローチャート付き）
```

## 学習用ドキュメント

1. [全体像](docs/01_全体像.md) — 各技術の役割と、どこで何が動くか
2. [処理の流れ](docs/02_処理の流れ.md) — 画面表示・登録・削除のシーケンス図とフローチャート
3. [DB 設計](docs/03_DB設計.md) — テーブル構成と SQL の読み方
4. [学習の進め方](docs/04_学習の進め方.md) — 読む順番、AI コードのレビュー観点、練習課題

## 学習計画（`学習/` フォルダ）

- [学習計画](学習/00_学習計画.md) — 10月末コース・11月末コースの日別スケジュールと合格基準
- [確認テスト](学習/01_確認テスト.md) / [解答](学習/02_解答.md) / [学習記録シート](学習/03_学習記録.md)
- 学習ポータル（見やすい画面版）: `学習/学習ポータル.html`。上の Markdown を書き換えたら `npm run portal` で作り直せます
  - 「コード」タブでは、アプリを作る順番（全13ステップ）に全ファイルを並べ、ブロックごとに解説しています。解説の中身は `scripts/walkthrough-data.mjs` にあります

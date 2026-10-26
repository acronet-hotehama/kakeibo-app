// =============================================================
// 学習帳「コード」タブの解説データ
//
// 家計簿アプリを「実際に作るときの順番」に並べ、各ファイルを
// いくつかのブロックに分けて解説している。
//
// ブロックの書き方:
//   { at: "行に含まれる文字", back: 1, title: "見出し", text: "説明" }
//   - at   … そのブロックが始まる行を探す目印（前のブロックより後ろから探す）
//   - back … 目印の行より何行前から始めるか（コメント行を含めたいとき）
//   - 最初のブロックは at を省略すると1行目から始まる
//   - ブロックは次のブロックの直前の行まで続く（＝ファイルの全行がどれかの解説に入る）
// 目印が見つからないと npm run portal がエラーになるので、コードを変えたら解説も直すこと。
// =============================================================

export const STEPS = [
  // ---------------------------------------------------------------
  {
    title: "プロジェクトを作る",
    goal: "Next.js + TypeScript のアプリを動かすための「入れ物」を用意する。どんなライブラリを使い、どんなコマンドで動かすかをここで決める。",
    commands: ["npm install next react react-dom pg dotenv server-only", "npm install -D typescript @types/node @types/react @types/react-dom @types/pg"],
    check: "package.json と node_modules フォルダができていれば OK。",
    files: [
      {
        path: "package.json",
        intro: "プロジェクトの「名刺」兼「設定表」。npm はこのファイルを見て、ライブラリを入れたりコマンドを実行したりする。JSON という書式（{ } の中に \"名前\": 値 を並べる）で書く。",
        blocks: [
          { title: "アプリの名前と基本情報", text: "`name` はアプリの名前、`version` は版の番号。`private: true` は「誤ってインターネット上の npm に公開しない」ための安全装置。" },
          { at: "\"scripts\"", title: "npm run で使えるコマンド", text: "左が呼び名、右が実際に実行されるコマンド。たとえば `npm run dev` と打つと `next dev`（開発用サーバーの起動）が動く。`db:setup` と `portal` は自分で作ったスクリプトを Node.js で実行する。" },
          { at: "\"dependencies\"", title: "アプリが動くのに必要なライブラリ", text: "`next`（Next.js 本体）、`react` / `react-dom`（画面を作る React）、`pg`（Node.js から PostgreSQL に接続する）、`dotenv`（.env ファイルを読む）、`server-only`（サーバー専用のファイルを守る）。数字の前の `^` は「この版以上で、大きな変更がない範囲なら新しくてもよい」という意味。" },
          { at: "\"devDependencies\"", title: "開発中だけ使うもの", text: "`typescript` は TypeScript を JavaScript に変換・チェックする道具。`@types/○○` は、JavaScript で書かれたライブラリに TypeScript の型情報を足すためのもの。完成したアプリの動作そのものには使われない。" },
        ],
      },
      {
        path: "tsconfig.json",
        intro: "TypeScript の設定ファイル。「どれくらい厳しく型をチェックするか」「どのファイルを対象にするか」を決める。多くは Next.js が自動で書いてくれる部分なので、太字の項目だけ理解できれば十分。",
        blocks: [
          { title: "変換の基本設定", text: "`target` は変換後の JavaScript の世代、`lib` は使える機能（`dom` ＝ブラウザの機能）の指定。`allowJs` は .js ファイルも混ぜてよい、`skipLibCheck` はライブラリ側の型チェックを省いて速くする設定。" },
          { at: "\"strict\"", title: "**strict：厳しい型チェック**", text: "`true` にすると、null の扱い忘れなどのミスをエラーで教えてくれる。実務ではほぼ必ず `true`。`noEmit` は「チェックだけして、ファイルは出力しない」（変換は Next.js が行うため）。残りはモジュールの読み込み方の設定。" },
          { at: "\"jsx\"", title: "JSX と Next.js 用の設定", text: "`jsx` は、.tsx ファイルの中の HTML のような書き方（JSX）をどう扱うか。`plugins` の `next` は、エディタで Next.js 向けの補助を有効にする。" },
          { at: "\"paths\"", title: "**@/ の正体**", text: "`@/*` を `./src/*` に読み替える設定。これがあるので、どこからでも `import ... from \"@/lib/db\"` のように src フォルダからの場所で書ける（`../../lib/db` のような書き方をしなくて済む）。" },
          { at: "\"include\"", title: "チェックの対象", text: "`include` に書いた場所のファイルを TypeScript がチェックする。`exclude` の `node_modules`（入れたライブラリ置き場）は対象外。" },
        ],
      },
      {
        path: "next.config.ts",
        intro: "Next.js 自体の設定ファイル。今回は特別な設定が要らないので空。",
        blocks: [
          { title: "空の設定を書き出しているだけ", text: "`import type` は「型だけを読み込む」書き方。`const nextConfig: NextConfig = {}` の `: NextConfig` は「この変数は NextConfig という型ですよ」という型注釈。`export default` で、このファイルの代表の値として外に渡している。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "データベースを設計する",
    goal: "どんなデータを、どんな表（テーブル）で保存するかを決める。画面より先にデータの形を決めるのが、実務でも基本の順番。",
    commands: [],
    check: "まだ実行しない。次のステップのスクリプトで、このファイルが実行される。",
    files: [
      {
        path: "db/schema.sql",
        intro: "テーブルを作る SQL。「カテゴリ表」と「取引表」の2つを作る。SQL では `--` から行末までがコメント。",
        blocks: [
          { title: "ファイルの説明", text: "コメントだけの部分。このファイルは上から順に実行される。" },
          { at: "-- 何度実行しても", title: "古いテーブルを消す", text: "`DROP TABLE IF EXISTS` は「あれば消す」。何度実行しても同じ状態から作り直せるようにしている。取引表はカテゴリ表を参照している（後述の外部キー）ので、参照している **取引表から先に** 消す。" },
          { at: "-- カテゴリ（食費", back: 1, title: "カテゴリ表（categories）", text: "`CREATE TABLE` で表を作る。各行は「列名・型・ルール」。`SERIAL PRIMARY KEY` は 1, 2, 3… と自動で番号を振る主キー（行を見分ける番号）。`NOT NULL` は空を禁止。`CHECK (type IN (...))` は income / expense 以外を入れられなくする。`UNIQUE (name, type)` は同じ名前・同じ種別の重複を防ぐ。" },
          { at: "-- 取引（1件", back: 1, title: "取引表（transactions）", text: "1件の収入・支出の記録。`CHECK (amount > 0)` で0円以下を拒否。`REFERENCES categories(id)` は **外部キー**：カテゴリ表に存在する id しか入れられない。収入か支出かはカテゴリが持っているので、ここには持たせない（**正規化**：同じ情報を2か所に持たない設計）。`DEFAULT now()` は登録日時を自動で入れる。" },
          { at: "-- 「月ごとに", title: "インデックス", text: "`CREATE INDEX` は本の索引のようなもの。「日付で絞り込む」検索が多いので、date 列に索引を作って検索を速くしている。" },
        ],
      },
      {
        path: "db/seed.sql",
        intro: "動作確認用のサンプルデータを入れる SQL。seed（種）は、最初に植えておくデータという意味でよく使われる名前。",
        blocks: [
          { title: "ファイルの説明", text: "コメントだけの部分。" },
          { at: "INSERT INTO categories", title: "カテゴリを11件登録", text: "`INSERT INTO 表 (列, 列) VALUES (値, 値), (値, 値) ...;` で複数行をまとめて登録する。id は SERIAL なので自動で 1〜11 が振られる。" },
          { at: "-- サブクエリで", title: "取引を「今月」の日付で登録", text: "`INSERT INTO ... SELECT ...` は、SELECT の結果をそのまま登録する書き方。`date_trunc('month', CURRENT_DATE)` は今月1日。そこに `day_offset` 日を足して日付を作るので、いつ実行しても今月のデータになる。" },
          { at: "FROM (VALUES", title: "仮の表を作る", text: "`(VALUES (...), (...)) AS v(列名...)` で、その場限りの表 v を作っている。カテゴリは id ではなく名前（'食費' など）で書けるので読みやすい。" },
          { at: ") AS v(", title: "名前から id を引く", text: "`JOIN categories c ON c.name = v.category_name` で、カテゴリ名が一致する行をつなぎ、`c.id` を取引の category_id として使っている。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "データベースを準備する",
    goal: "接続先を設定し、スクリプトで DB とテーブルを作ってサンプルデータを入れる。",
    commands: ["copy .env.example .env.local", "npm run db:setup"],
    check: "「セットアップ完了！」と表示されれば OK。psql で `SELECT * FROM categories;` を実行すると11件出る。",
    files: [
      {
        path: ".env.example",
        intro: "接続先の書き方の見本。本物はこれをコピーした `.env.local` に書く（パスワードが入るので Git には入れない）。",
        blocks: [
          { title: "使い方の説明", text: "`#` から始まる行はコメント。" },
          { at: "DATABASE_URL=", title: "接続先の書式", text: "`postgresql://ユーザー名:パスワード@ホスト:ポート/DB名`。localhost は自分の PC、5432 は PostgreSQL の標準のポート番号、kakeibo は作る DB の名前。" },
        ],
      },
      {
        path: "scripts/db-setup.mjs",
        intro: "DB を作ってテーブルとサンプルデータを入れるスクリプト。あえて TypeScript ではなく素の JavaScript で書いている（.mjs ＝ import/export が使える JavaScript）。TypeScript との違いは「型の記述がない」ことだけなので、見比べてみよう。",
        blocks: [
          { title: "スクリプトの説明", text: "`//` から行末までがコメント。やっていることが3ステップで書かれている。" },
          { at: "import { readFile }", title: "使う道具を読み込む", text: "`node:fs/promises` はファイル読み書き、`node:path` はパスの組み立て、`node:url` は URL の変換。`node:` で始まるのは Node.js に最初から入っている機能。`dotenv` と `pg` は npm で入れたライブラリ。" },
          { at: "dotenv.config", title: ".env.local を読み込む", text: "これで `.env.local` に書いた DATABASE_URL が `process.env.DATABASE_URL` から読めるようになる（`process.env` は環境変数の入れ物）。" },
          { at: "const databaseUrl", title: "設定がなければ止める", text: "`if (!databaseUrl)` は「値が空なら」。エラー文を出して `process.exit(1)` でスクリプトを終了する（1 は「失敗した」という合図）。" },
          { at: "const rootDir", back: 1, title: "プロジェクトのフォルダを求める", text: "`import.meta.url` はこのファイル自身の場所。そこから1つ上のフォルダ（プロジェクトの一番上）を求めて、db フォルダの SQL を探せるようにしている。" },
          { at: "/** データベースが存在しなければ", title: "関数：DB がなければ作る（前半）", text: "`async function` は、途中で `await`（終わるまで待つ）を使える関数。`new URL(...)` で接続先を分解し、DB 名（kakeibo）を取り出している。" },
          { at: "url.pathname = \"/postgres\"", back: 1, title: "最初からある postgres DB に接続", text: "kakeibo DB はまだないかもしれないので、PostgreSQL に必ずある postgres DB につなぐ。`new pg.Client(...)` で接続の準備、`await client.connect()` で実際に接続する。" },
          { at: "const result = await client.query(\"SELECT 1 FROM pg_database", title: "DB があるか調べて、なければ作る", text: "`pg_database` は DB の一覧表。`$1` は **プレースホルダ**（後ろの配列 `[dbName]` の値が安全に入る）。`rowCount === 0`（見つからない）なら `CREATE DATABASE` を実行。CREATE DATABASE には $1 が使えないので、名前を英数字だけに限定してから埋め込んでいる。" },
          { at: "} finally {", title: "必ず接続を閉じる", text: "`try { ... } finally { ... }` の finally は、成功しても失敗しても必ず実行される。接続の閉じ忘れを防ぐ定番の書き方。" },
          { at: "/** SQL ファイルを読み込んで", title: "関数：SQL ファイルを実行する", text: "ファイルを文字列として読み込み（`readFile`）、そのまま `client.query` に渡して実行する。" },
          { at: "async function main()", title: "メインの処理", text: "① DB がなければ作る → ② kakeibo DB に接続 → ③ schema.sql（テーブル作成）→ seed.sql（サンプル）の順に実行。ここでも finally で接続を閉じる。" },
          { at: "main().catch", title: "実行と、失敗したときの処理", text: "`main()` を呼び出して実行する。途中でエラーが起きたら `.catch` に来て、メッセージを表示して終了する。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "データの形（型）を決める",
    goal: "アプリで扱うデータの形を TypeScript の型として定義する。ここで決めた形を、サーバーも画面も共通で使う。",
    commands: [],
    check: "`npm run typecheck` でエラーが出なければ OK。",
    files: [
      {
        path: "src/lib/types.ts",
        intro: "型の定義だけを集めたファイル。型は「この変数にはこういう形の値しか入らない」という約束。約束を破るとビルド時にエラーで教えてくれる。**アプリの全体像をつかむには、まずこのファイルを読むのが近道。**",
        blocks: [
          { title: "ファイルの説明", text: "このファイルはサーバー側・ブラウザ側の両方から import される。" },
          { at: "/** 収入 or 支出", title: "ユニオン型：TransactionType", text: "`\"income\" | \"expense\"` の `|` は「または」。この型の変数には、この2つの文字列以外は入れられない。DB の CHECK 制約と同じことを TypeScript 側でも守っている。" },
          { at: "/** カテゴリ 1件", title: "オブジェクト型：Category", text: "`{ 名前: 型; ... }` でオブジェクトの形を決める。categories テーブルの1行に対応している。`export` を付けると、ほかのファイルから import できる。" },
          { at: "/** 画面に表示する取引", title: "Transaction：画面に出す取引", text: "取引表とカテゴリ表を JOIN した結果の形。DB の列名は `category_id`（スネークケース）だが、JavaScript では `categoryId`（キャメルケース）にそろえている。変換は repository.ts の SQL で行う。" },
          { at: "/** 登録・更新のとき", title: "TransactionInput：画面から送られてくるデータ", text: "id や categoryName は送らない（サーバー側で決まる）ので、Transaction より項目が少ない。「何を受け取るか」を型で明確にしている。" },
          { at: "/** カテゴリ別の集計", title: "CategoryTotal：集計の1行", text: "支出グラフの1本分のデータ。" },
          { at: "/** 月の集計結果", title: "MonthlySummary：月の集計", text: "`byCategory: CategoryTotal[]` の `[]` は「CategoryTotal の配列」。1つの型の中で別の型を使える。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "データベースを読み書きする",
    goal: "Node.js から PostgreSQL に接続し、SQL を実行する関数を作る。画面や API は、この関数を呼ぶだけで DB を扱えるようになる。",
    commands: [],
    check: "まだ画面がないので、次の API のステップでまとめて確認する。",
    files: [
      {
        path: "src/lib/db.ts",
        intro: "PostgreSQL への接続を1つだけ作って、アプリ全体で使い回すためのファイル。",
        blocks: [
          { title: "ファイルの説明", text: "サーバー側でのみ使うファイル。" },
          { at: "import \"server-only\"", title: "サーバー専用の印と、pg の読み込み", text: "`import \"server-only\"` があると、ブラウザ側のコードからこのファイルを import したときにビルドエラーになる。DB のパスワードがブラウザに漏れないための安全装置。`{ Pool }` は pg ライブラリから Pool だけを取り出す書き方。" },
          { at: "// Pool = 接続を使い回す", title: "接続の使い回し（Pool）", text: "**Pool** は接続をいくつか用意しておき、使い回す仕組み。毎回接続すると遅いため。開発中はファイル保存のたびにこのファイルが読み直されるので、`globalThis`（プログラム全体で共有される場所）に保存して増えすぎを防ぐ。`as unknown as {...}` は「この形として扱う」と TypeScript に伝える書き方。" },
          { at: "export const pool", title: "Pool を作る（なければ）", text: "`A ?? B` は「A が null / undefined なら B」。保存済みの Pool があればそれを使い、なければ新しく作る。接続先は `.env.local` の DATABASE_URL（Next.js が自動で読み込む）。" },
          { at: "if (process.env.NODE_ENV", title: "開発中だけ保存しておく", text: "`NODE_ENV` は今が開発中（development）か本番（production）か。本番以外のときだけ globalThis に保存する。" },
        ],
      },
      {
        path: "src/lib/repository.ts",
        intro: "SQL を実行する関数を1か所に集めたファイル（リポジトリ層）。「SQL を見たいときはここだけ見ればよい」状態にするのが目的。",
        blocks: [
          { title: "役割と注意点", text: "**プレースホルダ（$1, $2）** を使う理由が書かれている。値を文字列としてつなげると、悪意のある入力で SQL を書き換えられる（SQL インジェクション）。" },
          { at: "import \"server-only\"", title: "読み込み", text: "`import type` は型だけを読み込む書き方（実行時には消える）。" },
          { at: "/** 取引の SELECT で共通", title: "共通で使う列の一覧", text: "取引を取り出す SQL で何度も使うので定数にしている。`AS \"categoryId\"` で列名をキャメルケースに変える（ダブルクォートがないと小文字になる）。`to_char(t.date, 'YYYY-MM-DD')` で日付を文字列にしておくと、タイムゾーンで日付がずれない。" },
          { at: "// ---------------- カテゴリ", title: "カテゴリを全部取得", text: "`pool.query<Category>(SQL)` は「結果の各行は Category 型」と伝えて SQL を実行する。`ORDER BY type DESC, id` で、支出（expense）→収入（income）の順、その中は id 順に並べる。`Promise<Category[]>` は「あとで Category の配列が手に入る」という戻り値の型。" },
          { at: "/** 指定した月", title: "月の取引一覧", text: "`JOIN categories c ON c.id = t.category_id` でカテゴリ名と種別をくっつける。`WHERE` で「月初以上、翌月1日未満」に絞り込む。`$1::date` は $1 を日付として扱う指定。`${TRANSACTION_COLUMNS}` は JavaScript のテンプレート文字列の埋め込み（SQL の値ではなく、決まった列名なので安全）。" },
          { at: "/** 1件取得", title: "id で1件取得", text: "`result.rows[0] ?? null`：1件目があればそれ、なければ null を返す。`export` していないので、このファイルの中だけで使う関数。" },
          { at: "/** カテゴリが存在するか", title: "カテゴリがあるか確認", text: "`SELECT 1` は「あれば1を返す」だけの軽い問い合わせ。`rowCount ?? 0` は件数（不明なら0）。0より大きければ true。" },
          { at: "/** 新規登録して", title: "取引を登録", text: "`INSERT ... RETURNING id` で、登録した行の id を受け取る。その id でもう一度取得して、カテゴリ名などを含む完全な形で返す。最後の `created!` の `!` は「null ではない」と TypeScript に伝える記号（直前に登録したので必ずある）。" },
          { at: "/** 更新。", title: "取引を更新", text: "`UPDATE ... SET 列 = 値 WHERE id = $5`。`rowCount === 0` なら対象の id がなかったので null を返す（API はこれを見て 404 を返す）。" },
          { at: "/** 削除。", title: "取引を削除", text: "`DELETE FROM ... WHERE id = $1`。消せたかどうかを true / false で返す。" },
          { at: "// ---------------- 集計", title: "月の集計（SQL 部分）", text: "`GROUP BY` でカテゴリごとにまとめ、`SUM(t.amount)` で合計する。`COALESCE(x, 0)` は x が NULL なら 0。`::int` は数値に変換（PostgreSQL の SUM は大きな整数型を返し、pg はそれを文字列で渡してくるため）。" },
          { at: "const byCategory = result.rows", title: "収入・支出の合計を JavaScript で計算", text: "`filter` で収入（または支出）の行だけ残し、`reduce` で total を足し合わせる。`reduce((sum, r) => sum + r.total, 0)` は「0 から始めて、1行ずつ total を足す」。最後に月・収入・支出・残高・内訳をまとめて返す。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "入力チェックを作る",
    goal: "API に送られてきたデータが正しいかを確かめる関数を作る。画面側でもチェックするが、API は誰でも直接呼べるので、サーバー側のチェックが本番。",
    commands: [],
    check: "次の API のステップで、わざと間違った値を送って確認する。",
    files: [
      {
        path: "src/lib/validation.ts",
        intro: "入力チェック（バリデーション）の関数。結果は「成功（ok: true）か、失敗（ok: false）と理由」の形で返す。",
        blocks: [
          { title: "ファイルの説明", text: "サーバー側で必ずもう一度チェックするのが実務の基本、という説明。" },
          { at: "import type", title: "型の読み込み", text: "TransactionInput 型を使う。" },
          { at: " * 成功なら", back: 1, title: "結果の型：ValidationResult", text: "`<T>` は **ジェネリクス**：中身の型を後から決められる型。`{ ok: true; value: T } | { ok: false; error: string }` のように、ok の値で形が変わる型を「判別可能なユニオン型」と呼ぶ。`if (!result.ok)` と書くと、その後ろでは value が使えることを TypeScript が理解してくれる。" },
          { at: "/** \"YYYY-MM\" 形式か", title: "月の形式チェック", text: "`/^\\d{4}-(0[1-9]|1[0-2])$/` は **正規表現**（文字のパターン）。「数字4つ、ハイフン、01〜12」。`.test(value)` で一致するか調べる。戻り値の型 `value is string` は「true なら value は string だと確定」と TypeScript に伝える。" },
          { at: "/** \"YYYY-MM-DD\" 形式で", title: "日付が実在するかのチェック", text: "形式だけでは 2026-02-31 のような存在しない日付が通ってしまう。Date に変換すると 3/3 に繰り上がるので、元の文字列と比べて違えば NG にしている。" },
          { at: "/** 取引の入力値をチェック", title: "本体：まず全体の形を確認", text: "引数の型は `unknown`（何が来るか分からない）。チェックが済むまで中身を使えないので安全。オブジェクトでなければすぐ失敗を返す。`const { amount, ... } = body` は **分割代入**：オブジェクトから項目を取り出して変数にする書き方。" },
          { at: "if (typeof amount !== \"number\"", title: "金額のチェック", text: "`typeof` で型を調べ、`Number.isInteger` で整数かを調べる。0以下や1億円を超える値も拒否。`100_000_000` の `_` は読みやすくするための区切り（値は1億）。" },
          { at: "if (typeof categoryId", title: "カテゴリ・日付・メモのチェック", text: "カテゴリは整数か、日付は実在するか、メモは文字列か（または未指定か）を順に確認する。`(memo ?? \"\").trim()` は「メモがなければ空文字、あれば前後の空白を取る」。" },
          { at: "return { ok: true, value", title: "すべて通ったら成功", text: "チェック済みの値だけを詰め直して返す。余計な項目が送られてきても、ここで捨てられる。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "API を作る",
    goal: "ブラウザからのリクエストを受け取り、入力チェック → DB 操作 → 結果を JSON で返す「窓口」を作る。Next.js ではフォルダの場所がそのまま URL になる。",
    commands: ["npm run dev"],
    check: "ブラウザで http://localhost:3000/api/transactions?month=2026-10 を開いて JSON が表示されれば OK。month=abc にすると 400 になることも確認する。",
    files: [
      {
        path: "src/app/api/transactions/route.ts",
        intro: "URL `/api/transactions` の API。`GET`（一覧取得）と `POST`（登録）という名前の関数を export すると、それぞれの HTTP メソッドの処理になる。",
        blocks: [
          { title: "この API の説明", text: "どの URL で何ができるかがコメントにまとまっている。このコードは Node.js（サーバー）で動く。" },
          { at: "import { NextResponse", title: "読み込み", text: "`NextResponse` はレスポンス（返事）を作る道具、`NextRequest` はリクエスト（届いた依頼）の型。`@/lib/...` から、作っておいた DB 操作と入力チェックの関数を読み込む。" },
          { at: "export async function GET", title: "GET：月の取引一覧", text: "`request.nextUrl.searchParams.get(\"month\")` で URL の `?month=2026-10` の部分を取り出す。形式が違えば **400**（リクエストが不正）とエラー文を返す。OK なら DB から取得し、`NextResponse.json(...)` で JSON にして返す（ステータスは 200）。" },
          { at: "export async function POST", title: "POST：① 本文を読む", text: "`await request.json()` で送られてきた JSON を読む。JSON として読めなかったときは `.catch(() => null)` で null にして、次のチェックで弾く。" },
          { at: "// ② 入力チェック", title: "POST：② 入力チェック", text: "validation.ts の関数でチェック。失敗なら 400 とエラー文。さらに、指定されたカテゴリが DB に存在するかも確認する。" },
          { at: "// ③ DB に登録", title: "POST：③ 登録して返す", text: "repository.ts の createTransaction で登録し、登録結果を **201**（作成成功）で返す。" },
        ],
      },
      {
        path: "src/app/api/transactions/[id]/route.ts",
        intro: "URL `/api/transactions/5` のような API。フォルダ名の `[id]` は「ここに入る値は毎回変わる」という意味（動的ルート）。",
        blocks: [
          { title: "この API の説明", text: "PUT（更新）と DELETE（削除）を扱う。" },
          { at: "import { NextResponse", title: "読み込み", text: "一覧用の API と同じように、DB 操作と入力チェックの関数を読み込む。" },
          { at: "// Next.js 15 以降", title: "URL の [id] を受け取る型", text: "`params` には URL の `[id]` の部分が入ってくる。Next.js 15 以降は Promise（あとで値が届く箱）で渡されるので、使うときは `await` する。" },
          { at: "/** URL の id 文字列", title: "id を数値に変換", text: "URL から来る値は常に文字列。`Number(raw)` で数値にし、正の整数でなければ null を返す。`/api/transactions/abc` のような不正な URL を弾くため。" },
          { at: "export async function PUT", title: "PUT：更新", text: "id のチェック → 本文のチェック → カテゴリの存在確認 → 更新。対象が見つからなければ **404**（見つからない）を返す。流れは POST とほぼ同じ。" },
          { at: "export async function DELETE", title: "DELETE：削除", text: "第1引数を使わないので `_request` と `_` を付けて「使わない」ことを示している。削除できたら **204**（成功・返す中身なし）を、`new NextResponse(null, ...)` で中身なしで返す。" },
        ],
      },
      {
        path: "src/app/api/summary/route.ts",
        intro: "URL `/api/summary?month=2026-10` の API。月の集計を返すだけのシンプルな API。",
        blocks: [
          { title: "この API の説明", text: "収入・支出・残高とカテゴリ別の合計を返す。" },
          { at: "import { NextResponse", title: "読み込み", text: "集計の関数と、月の形式チェックの関数を使う。" },
          { at: "export async function GET", title: "GET：集計を返す", text: "一覧の GET と同じく、month の形式をチェックしてから getMonthlySummary を呼び、JSON で返す。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "ページの土台と全体の見た目",
    goal: "全ページ共通の HTML の外枠と、アプリ全体の色・文字などの CSS を用意する。",
    commands: [],
    check: "画面を作るステップまで進むと、色やフォントが反映される。",
    files: [
      {
        path: "src/app/layout.tsx",
        intro: "全ページを包む外枠。Next.js では `app/layout.tsx` が必ず必要で、ここに `<html>` と `<body>` を書く。",
        blocks: [
          { title: "ファイルの説明", text: "全ページ共通の外枠であることの説明。" },
          { at: "import type { Metadata }", title: "読み込み", text: "`import \"./globals.css\"` で、アプリ全体の CSS を読み込む。CSS も import で読み込めるのが Next.js の特徴。" },
          { at: "// <title> などの設定", title: "ページのタイトル", text: "`metadata` を export すると、Next.js が `<title>`（ブラウザのタブに出る名前）などを自動で設定してくれる。" },
          { at: "export default function RootLayout", title: "外枠のコンポーネント", text: "**コンポーネント** は「画面の部品を返す関数」。`{ children }` は中に入れるページの中身。`children: React.ReactNode` は「React で表示できるもの」という型。`lang=\"ja\"` で日本語のページだと伝える。" },
        ],
      },
      {
        path: "src/app/globals.css",
        intro: "アプリ全体に効く CSS。色を変数にまとめ、どの部品でも使う共通クラスを定義する。",
        blocks: [
          { title: "ファイルの説明", text: "CSS のコメントは `/* */` で囲む。" },
          { at: ":root {", title: "色の変数（CSS 変数）", text: "`:root` はページ全体。`--bg: #f4f6fb;` のように `--名前` で変数を作り、ほかの場所で `var(--bg)` と書いて使う。色を変えたいときはここだけ直せば全体に反映される。`#` から始まる6桁は色の番号（赤・緑・青を16進数で表す）。" },
          { at: "@media (prefers-color-scheme: dark)", back: 1, title: "ダークモードの色", text: "`@media (prefers-color-scheme: dark)` は「OS がダークモードのとき」だけ中の CSS を使う。変数の値だけを差し替えているので、ほかの CSS は何も変えなくてよい。" },
          { at: "/* 幅に padding と border", title: "大きさの計算方法", text: "`*` はすべての要素。`box-sizing: border-box` にすると、width に内側の余白（padding）と枠線（border）が含まれ、レイアウトの計算が直感的になる。" },
          { at: "body {", title: "ページ全体の文字と背景", text: "`margin: 0` でブラウザが最初から付ける余白を消す。`font-family` は使うフォントを左から順に探す指定。`line-height` は行の高さ。" },
          { at: "button,", title: "フォームの文字をそろえる", text: "ボタンや入力欄は、そのままだとページと違うフォントになる。`font: inherit` で親（body）と同じ文字にそろえる。" },
          { at: "/* ---------- 共通クラス", title: "共通クラス：外枠と見出し", text: "`.container` は中央寄せで最大幅を決める箱（`margin: 0 auto` で左右中央）。`.page-title` と `.section-title` は見出しの大きさ。" },
          { at: ".card {", title: "共通クラス：カード", text: "白い背景・枠線・角丸・内側の余白をまとめたクラス。フォームや一覧などで `className=\"card\"` として使う。" },
          { at: ".income {", title: "共通クラス：収入・支出の色", text: "収入は緑、支出は赤。一覧やカードの金額で使う。" },
          { at: ".button {", title: "共通クラス：ボタン", text: "`:hover` はマウスを乗せたとき、`:disabled` は押せないときの見た目。`.button-secondary` は枠線だけの控えめなボタン。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "画面で使う関数を作る",
    goal: "表示用の小さな関数と、ブラウザから API を呼ぶ関数を用意する。部品（コンポーネント）からはこれらを呼ぶだけにして、部品のコードを短く保つ。",
    commands: [],
    check: "format.ts の関数は、ブラウザの開発者ツールの Console にコピーして動かしてみると理解しやすい。",
    files: [
      {
        path: "src/lib/format.ts",
        intro: "金額や日付を見やすい文字にする関数の集まり。どれも「値を受け取って、文字を返す」だけなので、関数の練習に最適。",
        blocks: [
          { title: "ファイルの説明", text: "ブラウザ・サーバーのどちらでも使える。" },
          { at: "/** 12345", title: "formatYen：金額を ￥12,345 に", text: "`Intl.NumberFormat` はブラウザに最初からある、数値を地域の形式で表示する機能。`ja-JP`（日本）と `JPY`（円）を指定している。" },
          { at: "/** 数字を2桁", title: "pad2：2桁にそろえる", text: "`String(n)` で文字にし、`padStart(2, \"0\")` で2文字になるまで左に0を足す。3 → \"03\"。export していないので、このファイルの中だけで使う。" },
          { at: "/** 今月を", title: "currentMonth：今月", text: "`new Date()` で今の日時。`getMonth()` は **0〜11** で返ってくる（1月が0）ので +1 している。テンプレート文字列 `` `${a}-${b}` `` で \"2026-10\" の形にする。" },
          { at: "/** 今日を", title: "todayString：今日", text: "今月の文字列に、今日の日付を2桁でつなげる。" },
          { at: "/** 月をずらす", title: "shiftMonth：月を前後に動かす", text: "`month.split(\"-\")` で [\"2026\", \"01\"] に分け、`.map(Number)` で数値に変換。`const [year, mon] = ...` は配列の分割代入。Date は 13月や0月を自動で年またぎに直してくれるので、年をまたぐ計算を自分で書かなくてよい。" },
          { at: "/** \"2026-10\" →", title: "formatMonthLabel：2026年10月", text: "`Number(mon)` で \"03\" を 3 にして、先頭の0を消している。" },
          { at: "/** \"2026-10-05\" →", title: "formatShortDate：10/5", text: "`const [, mon, day]` の先頭の空欄は「1つ目（年）は使わない」という意味。" },
        ],
      },
      {
        path: "src/lib/api-client.ts",
        intro: "ブラウザから API を呼ぶ関数の集まり。部品は「どの URL にどのメソッドで送るか」を気にせず、ここの関数を呼ぶだけでよい。",
        blocks: [
          { title: "ファイルの説明", text: "fetch のラッパー（包んで使いやすくしたもの）。" },
          { at: "import type", title: "型の読み込み", text: "返ってくるデータの型を使う。" },
          { at: "/** 共通処理", title: "共通処理：fetch して JSON を返す", text: "`fetch(url, 設定)` はブラウザの通信機能。`<T>` はジェネリクスで、呼ぶ側が「返ってくる型」を決められる。`...init` は **スプレッド構文**：init の中身を展開してコピーする書き方。" },
          { at: "if (!response.ok)", title: "エラーと「中身なし」の処理", text: "`response.ok` は 200 番台なら true。失敗ならサーバーが返した `{ error }` を読んで `throw new Error(...)` で例外を投げる（呼んだ側の catch に届く）。`data?.error` の `?.` は「data が null なら止まって undefined」。削除成功（204）は中身がないので JSON を読まない。" },
          { at: "export function fetchTransactions", title: "取得用の関数", text: "URL を組み立てて request を呼ぶだけ。戻り値の型 `Promise<Transaction[]>` で「あとで取引の配列が手に入る」と分かる。" },
          { at: "export function createTransaction", title: "登録・更新・削除用の関数", text: "`method` で HTTP メソッドを指定し、`JSON.stringify(input)` でオブジェクトを JSON の文字列に変換して送る。URL の `${id}` に対象の id を埋め込む。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "表示するだけの部品を作る",
    goal: "受け取ったデータを表示するだけの、シンプルなコンポーネントから作る。自分では状態を持たず、親から props で受け取る。",
    commands: [],
    check: "部品は単体では表示されない。最後に Dashboard に組み込んでから確認する。",
    files: [
      {
        path: "src/components/SummaryCards.tsx",
        intro: "収入・支出・収支の3枚のカード。いちばんシンプルなコンポーネントなので、React の書き方の基本をここで覚える。",
        blocks: [
          { title: "ファイルの説明", text: "" },
          { at: "import { formatYen }", title: "読み込み", text: "`styles` は CSS Modules。`styles.cards` のように書くと、このコンポーネント専用のクラス名になる。" },
          { at: "type Props", title: "受け取るデータ（props）の型", text: "**props** は親から渡される値。読み込み前は集計がまだないので `MonthlySummary | null`（集計 または null）にしている。" },
          { at: "export default function SummaryCards", title: "値を準備する", text: "`function SummaryCards({ summary }: Props)` の `{ summary }` は、props から summary を取り出す分割代入。`summary?.income ?? 0` は「summary が null なら 0」。" },
          { at: "return (", title: "JSX で画面を返す", text: "`return ( ... )` の中の HTML のような部分が **JSX**。`className` は HTML の class のこと。`{ }` の中には JavaScript の式を書ける。`` `card ${styles.card}` `` で、共通クラスと専用クラスを両方付けている。" },
          { at: "{/* マイナスなら", title: "条件で色を変える", text: "`条件 ? A : B` は **三項演算子**（条件が true なら A、false なら B）。収支がマイナスのときだけ expense クラス（赤）を付ける。JSX の中のコメントは `{/* */}` と書く。" },
        ],
      },
      {
        path: "src/components/SummaryCards.module.css",
        intro: "SummaryCards 専用の CSS。ここで書いたクラス名は、ほかの部品の同じ名前のクラスとぶつからない。",
        blocks: [
          { title: "3等分のグリッド", text: "`display: grid` で格子状に並べ、`grid-template-columns: repeat(3, 1fr)` で3列に等分する（fr は残りの幅の割合）。`gap` は間のすき間。" },
          { at: ".card {", title: "カードの中身", text: "`flex-direction: column` で縦に並べる。`tabular-nums` は数字の幅をそろえて、金額の桁が揃って見えるようにする指定。" },
          { at: "@media", title: "スマホでは1列", text: "画面幅が600px以下のときだけ1列にする（レスポンシブ対応）。" },
        ],
      },
      {
        path: "src/components/MonthSelector.tsx",
        intro: "◀ 2026年10月 ▶ の月切り替え。自分では状態を持たず、表示する月は親から受け取り、操作されたら親の関数を呼んで知らせる（**制御されたコンポーネント**）。",
        blocks: [
          { title: "ファイルの説明", text: "親の Dashboard がクライアントコンポーネントなので、ここもブラウザで動く。" },
          { at: "import { formatMonthLabel", title: "読み込み", text: "月の表示用・計算用の関数を使う。" },
          { at: "type Props", title: "props の型", text: "`onChange: (month: string) => void` は「文字列を1つ受け取り、何も返さない関数」という型。親から関数を受け取れるのが React の特徴。" },
          { at: "export default function MonthSelector", title: "◀ ボタン", text: "`onClick={() => onChange(shiftMonth(month, -1))}` は「クリックされたら、1か月前を親に知らせる」。`() => ...` は **アロー関数**（その場で作る短い関数）。`aria-label` は画面読み上げ用の名前。" },
          { at: "<label className={styles.label}>", title: "月の表示と入力欄", text: "`<input type=\"month\">` はブラウザ標準の年月選択欄。`value={month}` で表示する値を親の値に合わせ、`onChange` で変更を知らせる。`e.target.value &&` は「値が空でなければ」。" },
          { at: "shiftMonth(month, 1)", title: "▶ ボタン", text: "◀ と同じく、1か月後を親に知らせる。" },
        ],
      },
      {
        path: "src/components/MonthSelector.module.css",
        intro: "月切り替えの見た目。",
        blocks: [
          { title: "横並びで中央寄せ", text: "`display: flex` で横に並べ、`justify-content: center` で左右中央、`align-items: center` で上下中央にそろえる。" },
          { at: ".picker", title: "月の入力欄", text: "小さめの文字と枠線。" },
          { at: ".arrow {", title: "丸いボタン", text: "`border-radius: 50%` で正方形を円にする。`:hover` でマウスを乗せたときに背景色を変える。" },
        ],
      },
      {
        path: "src/components/CategoryChart.tsx",
        intro: "カテゴリ別の支出を棒グラフで表示する。グラフ用のライブラリは使わず、CSS の width（幅）だけで棒を描いている。",
        blocks: [
          { title: "ファイルの説明", text: "" },
          { at: "import { formatYen }", title: "読み込み", text: "" },
          { at: "type Props", title: "props の型", text: "集計（または null）を受け取る。" },
          { at: "export default function CategoryChart", title: "支出だけを取り出す", text: "`byCategory.filter((c) => c.type === \"expense\")` で、支出のカテゴリだけを残す。`?? []` は「集計がなければ空の配列」。" },
          { at: "{expenses.length === 0", title: "データがないときの表示", text: "三項演算子で「支出がない → メッセージ」「ある → グラフ」を切り替える。" },
          { at: "// 支出合計に対する割合", title: "割合を計算して1行ずつ表示", text: "`expenses.map((c) => { ... })` で、配列の要素1つにつき1行の JSX を作る。`Math.round(...)` は四捨五入。`key={c.categoryName}` は、React が行を見分けるための目印（並べる要素には必須）。" },
          { at: "{/* style 属性で", title: "棒の長さ", text: "`style={{ width: ... }}` で、その場で計算した幅を指定する。外側の `{ }` は JavaScript を書く印、内側の `{ }` はオブジェクト。" },
        ],
      },
      {
        path: "src/components/CategoryChart.module.css",
        intro: "棒グラフの見た目。",
        blocks: [
          { title: "行のレイアウト", text: "`list-style: none` で箇条書きの点を消す。ラベルは `justify-content: space-between` で左右の端に分ける。" },
          { at: "/* 棒の背景", title: "棒の背景（100% 部分）", text: "灰色の細い帯。`overflow: hidden` ではみ出した部分を隠す。" },
          { at: "/* 実際の棒", title: "実際の棒", text: "幅は TSX 側の style で決まる。`transition` で幅が変わるときに0.3秒かけて動く。" },
        ],
      },
      {
        path: "src/components/TransactionList.tsx",
        intro: "取引の一覧。各行に編集・削除ボタンがあり、押されたことを親に知らせる。",
        blocks: [
          { title: "ファイルの説明", text: "" },
          { at: "import { formatShortDate", title: "読み込み", text: "" },
          { at: "type Props", title: "props の型", text: "一覧のデータ、読み込み中かどうか、編集中の id、編集・削除のときに呼ぶ関数を受け取る。" },
          { at: "export default function TransactionList", title: "見出し", text: "`{transactions.length}` で件数を表示する。" },
          { at: "{/* 条件によって", title: "3つの状態を切り替える", text: "三項演算子を2つつなげて「読み込み中」「0件」「一覧」を出し分けている。" },
          { at: "{transactions.map", title: "1件ずつ行を作る", text: "`map` で取引1件につき `<li>` を1つ作る。`key={t.id}` は必須の目印。編集中の行には `styles.editing` を付けて色を変える。`{t.memo && ...}` は「メモがあるときだけ表示」。" },
          { at: "<span className={`${styles.amount}", title: "金額の表示", text: "クラス名に `t.type`（income / expense）をそのまま使い、色を変えている。収入なら +、支出なら − を付ける。" },
          { at: "<div className={styles.buttons}>", title: "編集・削除ボタン", text: "`onClick={() => onEdit(t)}` で、押された行の取引を親に渡す。実際の編集・削除の処理は親（Dashboard）が行う。" },
        ],
      },
      {
        path: "src/components/TransactionList.module.css",
        intro: "一覧の見た目。",
        blocks: [
          { title: "リストの基本", text: "箇条書きの点と余白を消す。" },
          { at: "/* 1行 =", title: "1行を4つの列に分ける", text: "`grid-template-columns: 48px 1fr auto auto` で「日付48px・内容は残り全部・金額とボタンは中身の幅」。`:last-child` は最後の行だけ下線を消す。" },
          { at: ".editing", title: "編集中・各部分の見た目", text: "`min-width: 0` は、長いメモが枠をはみ出さないためのおまじない。`text-overflow: ellipsis` ではみ出す文字を … にする。" },
          { at: "@media", title: "スマホでは2段にする", text: "`grid-column: 2 / -1` で、ボタンを2列目から最後の列までの位置（下の段）に回す。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "入力フォームを作る",
    goal: "入力欄の値を state（状態）で管理し、送信時にチェックして親に渡すフォームを作る。React の useState とイベント処理の練習。",
    commands: [],
    check: "最後に Dashboard に組み込んでから、取引を追加・編集して確認する。",
    files: [
      {
        path: "src/components/TransactionForm.tsx",
        intro: "取引の入力フォーム（新規登録と編集を兼用）。入力 → 送信ボタン → 入力チェック → 親の onSubmit（API 呼び出し）の流れ。",
        blocks: [
          { title: "ファイルの説明", text: "処理の流れがコメントにまとまっている。" },
          { at: "import { useState", title: "読み込み", text: "`useState` は React の機能（フック）。`type FormEvent` は送信イベントの型。" },
          { at: "type Props", title: "props の型", text: "編集中の取引（新規なら null）、日付の初期値、送信時と編集キャンセル時に呼ぶ関数を受け取る。`onSubmit` は Promise を返す関数（API 通信を待てるように）。" },
          { at: "export default function TransactionForm", title: "コンポーネントの始まり", text: "props を分割代入で受け取る。" },
          { at: "// 入力欄の値はすべて", title: "入力欄の値を state で持つ", text: "`const [値, 変更する関数] = useState(初期値)` が **useState** の形。変更する関数を呼ぶと値が変わり、画面が自動で描き直される。初期値は「編集中ならその取引の値、新規なら空」。金額は入力途中の空も扱えるよう文字列で持つ。" },
          { at: "// 選択中の種別", title: "選択肢をしぼる", text: "収入/支出のうち選んでいる方のカテゴリだけを選択肢にする。" },
          { at: "function handleTypeChange", title: "種別を切り替えたとき", text: "種別を変えたら、カテゴリの選択をリセットする（支出のカテゴリのまま収入にならないように）。" },
          { at: "async function handleSubmit", title: "送信時：まず標準の動きを止める", text: "`event.preventDefault()` で、ブラウザ標準の「ページを再読み込みして送信する」動きを止める。React では自分で送信処理を書くため。" },
          { at: "// --- ブラウザ側の入力チェック", title: "送信時：画面側のチェック", text: "すぐにエラーを見せるためのチェック。`Number(amount)` で文字列を数値にする。問題があれば `setError` でエラー文を表示して `return`（ここで終了）。" },
          { at: "setSubmitting(true)", title: "送信時：親に渡す", text: "送信中は `submitting` を true にしてボタンを押せなくする（二重送信の防止）。`await onSubmit(...)` で親に入力内容を渡す。失敗したら `catch` でエラー文を表示。`finally` で送信中を解除する。" },
          { at: "return (", title: "フォームの始まり", text: "`<form onSubmit={handleSubmit}>` で、送信されたら handleSubmit を呼ぶ。見出しは編集中かどうかで切り替える。" },
          { at: "{/* 収入 / 支出 の切り替え", title: "収入/支出の切り替えボタン", text: "`type=\"button\"` にしないと、押したときにフォームが送信されてしまう。選ばれている方にだけ色のクラスを付ける。" },
          { at: "<label className={styles.field}>", title: "金額の入力欄", text: "`value={amount}` と `onChange={(e) => setAmount(e.target.value)}` の組み合わせで、入力欄と state を常に一致させる（**制御された入力**）。`e.target.value` は入力された文字。" },
          { at: "<select value={categoryId}", back: 2, title: "カテゴリの選択", text: "`<select>` も value と onChange で state と結び付ける。" },
          { at: "{options.map", title: "選択肢を並べる", text: "`map` でカテゴリ1件につき `<option>` を1つ作る。`key` は必須。" },
          { at: "日付", back: 1, title: "日付とメモ", text: "`type=\"date\"` はカレンダーで選べる入力欄。`maxLength={100}` で100文字までしか入力できなくする（サーバー側でも同じチェックをしている）。" },
          { at: "{error && <p", title: "エラーの表示", text: "`条件 && 表示` は「条件が true のときだけ表示」の書き方。" },
          { at: "<div className={styles.actions}>", title: "ボタン", text: "編集中のときだけキャンセルボタンを出す。送信ボタンは `disabled={submitting}` で送信中は押せなくし、文字も「保存中…」「更新する」「追加する」と切り替える。" },
        ],
      },
      {
        path: "src/components/TransactionForm.module.css",
        intro: "フォームの見た目。",
        blocks: [
          { title: "縦に並べる", text: "フォームの中身を縦に並べ、間を14pxあける。" },
          { at: ".typeToggle", title: "収入/支出の切り替え", text: "2つのボタンを2列のグリッドで並べ、選ばれている方に支出（赤）か収入（緑）の色を付ける。" },
          { at: ".field {", title: "入力欄", text: "`.field input` は「.field の中にある input」という意味（子孫セレクタ）。`:focus` は入力中の欄に枠線を出す。" },
          { at: ".error", title: "エラーとボタンの位置", text: "`justify-content: flex-end` でボタンを右寄せにする。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "部品を組み合わせて画面を完成させる",
    goal: "状態（月・一覧・集計・編集中）を1か所に集め、API からデータを取り、部品に配る。最後にトップページに置いて、アプリが完成する。",
    commands: ["npm run dev"],
    check: "http://localhost:3000 を開き、取引の追加・編集・削除・月の切り替えがすべて動けば完成。",
    files: [
      {
        path: "src/components/Dashboard.tsx",
        intro: "画面全体をまとめる親コンポーネント。状態をここに集め（**state のリフトアップ**）、子の部品にはデータと関数を props で渡す。アプリでいちばん大事なファイル。",
        blocks: [
          { title: "\"use client\" とファイルの説明", text: "先頭の `\"use client\"` で **クライアントコンポーネント** になり、ブラウザでも動く。useState や onClick が使えるのはクライアントコンポーネントだけ。" },
          { at: "import { useEffect", title: "読み込み", text: "`import * as api from ...` は、api-client.ts の関数をまとめて `api.fetchTransactions` のように使う書き方。5つの子部品と CSS も読み込む。" },
          { at: "type Props", title: "props の型", text: "カテゴリ一覧はサーバー（page.tsx）から受け取る。" },
          { at: "export default function Dashboard", title: "状態（state）の一覧", text: "表示中の月、取引一覧、集計、編集中の取引（null なら新規モード）、読み込み中か、エラー文、再読み込み用のカウンター。`useState<Transaction[]>([])` の `<...>` は「この state の型」の指定。" },
          { at: "// ---------- データ取得", title: "useEffect：月が変わったらデータを取る", text: "`useEffect(() => { 処理 }, [month, reloadKey])` は、**[ ] の中の値が変わるたびに処理を実行する**。最初の表示のときにも1回実行される。" },
          { at: "Promise.all", title: "一覧と集計を同時に取得", text: "`Promise.all([A, B])` は2つの通信を同時に始め、両方終わるのを待つ。`.then` で成功時、`.catch` で失敗時、`.finally` で最後に必ず行う処理を書く。`if (ignore) return;` は、古い月の結果を捨てるための確認。" },
          { at: "// クリーンアップ関数", title: "後片付け（クリーンアップ）", text: "useEffect の中で return した関数は、次に useEffect が動く前に呼ばれる。ここで ignore を true にすることで、月を素早く切り替えたときに古い結果で画面が上書きされるのを防ぐ。" },
          { at: "// ---------- イベント処理", title: "フォーム送信時の処理", text: "編集中なら更新、そうでなければ登録の API を呼ぶ。最後に `setReloadKey((k) => k + 1)` でカウンターを増やすと、useEffect が再実行されて一覧と集計が最新になる。" },
          { at: "async function handleDelete", title: "削除時の処理", text: "`window.confirm` で確認ダイアログを出し、キャンセルなら何もしない。削除したら、編集中の取引だった場合は編集を解除し、データを取り直す。" },
          { at: "function handleMonthChange", title: "月を切り替えたとき", text: "月を変えて、編集中を解除する。month が変わるので、useEffect が自動でデータを取り直す。" },
          { at: "// 新規登録時の日付", title: "日付の初期値", text: "今月を見ているなら今日、ほかの月ならその月の1日を初期値にする。" },
          { at: "// ---------- 描画", title: "画面の組み立て（上半分）", text: "月の切り替え、エラー表示、集計カードを並べる。子には「表示するデータ」と「操作されたときに呼ぶ関数」を props で渡す。" },
          { at: "key が変わると", back: 1, title: "フォームと key", text: "`key={editing?.id ?? \"new\"}`：**key が変わると React はその部品を作り直す**。編集する取引を変えたときにフォームの中身（state）を初期値からやり直すためのテクニック。" },
          { at: "<TransactionList", title: "一覧", text: "`onEdit={setEditing}` のように、state を変える関数をそのまま渡すこともできる。" },
        ],
      },
      {
        path: "src/components/Dashboard.module.css",
        intro: "画面全体のレイアウト。",
        blocks: [
          { title: "縦に積む", text: "月の切り替え・集計・本体を縦に並べ、20pxずつあける。" },
          { at: "/* 左: フォーム", title: "2列レイアウト", text: "左360px（フォームとグラフ）、右は残り全部（一覧）。`align-items: start` で、左右の高さが違っても上にそろえる。" },
          { at: "@media", title: "スマホでは1列", text: "幅860px以下では1列にして、縦に並べる。" },
        ],
      },
      {
        path: "src/app/page.tsx",
        intro: "トップページ（URL の `/`）。`app/page.tsx` に置くとトップページになる。ここは **サーバーコンポーネント**（\"use client\" がない）なので、サーバーで実行され、API を通さず直接 DB を読める。",
        blocks: [
          { title: "サーバーとクライアントの使い分け", text: "めったに変わらないカテゴリはサーバーで取得して渡し、操作で変わる取引はブラウザの Dashboard から API で取る、という使い分けの説明。" },
          { at: "import Dashboard", title: "読み込み", text: "Dashboard と、DB からカテゴリを取る関数を読み込む。" },
          { at: "// ビルド時ではなく", title: "毎回サーバーで作る設定", text: "`dynamic = \"force-dynamic\"` にしないと、Next.js がビルド時に1回だけページを作ってしまい、DB の最新状態が反映されない。" },
          { at: "export default async function HomePage", title: "ページ本体", text: "サーバーコンポーネントは `async` にでき、`await` で DB の結果を待てる。取得したカテゴリを `categories={categories}` で Dashboard に渡す。" },
        ],
      },
      {
        path: "src/app/error.tsx",
        intro: "ページの表示中にエラーが起きたときに、代わりに表示される画面。`app/error.tsx` に置くと Next.js が自動で使う。",
        blocks: [
          { title: "クライアントコンポーネントにする", text: "error.tsx は必ず \"use client\" にする決まり。" },
          { at: "export default function ErrorPage", title: "エラー画面", text: "`reset` は Next.js が渡してくれる「もう一度表示を試す」関数。ボタンを押すと呼ばれる。DB に接続できないときの確認点を表示している。" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  {
    title: "完成の確認",
    goal: "型のエラーがないか、本番用にビルドできるかを確認する。AI が作ったコードを受け取ったときも、まずここを確認する。",
    commands: ["npm run typecheck", "npm run build"],
    check: "どちらもエラーなく終われば OK。ただし、ビルドが通っても計算や条件の間違いは見つけられないので、画面での動作確認も必ず行う。",
    files: [],
  },

  // ---------------------------------------------------------------
  {
    title: "おまけ：この学習帳を作るスクリプト",
    goal: "学習計画やテストの Markdown とソースコードを読み込んで、この学習帳（HTML）を作っている仕組み。Node.js でファイルを読み書きする例として読める。",
    commands: ["npm run portal"],
    check: "学習/学習ポータル.html が作り直されれば OK。",
    files: [
      {
        path: "scripts/build-portal.mjs",
        intro: "Markdown を解析し、データを HTML のひな形に埋め込むスクリプト。",
        blocks: [
          { title: "スクリプトの説明", text: "" },
          { at: "import { readFile, writeFile }", title: "読み込みと準備", text: "`walkthrough-data.mjs`（この解説のデータ）も読み込んでいる。" },
          { at: "/** HTML として特別な意味", title: "文字の変換", text: "`<` などを `&lt;` に置き換えて、HTML として誤って解釈されないようにする（エスケープ）。`inline` は Markdown の `コード` や **太字** を HTML に変換する。" },
          { at: "// ---------------- 学習計画", title: "学習計画を解析", text: "Markdown の表の行を正規表現で見つけ、`|` で分割して日ごとのデータにする。" },
          { at: "// ---------------- 確認テストと解答", title: "テストと解答を解析", text: "見出しごとに問題と解答を集め、数が合わなければエラーにする。" },
          { at: "// ---------------- 家計簿アプリのソースコード", title: "ソースコードを読み込む", text: "ファイルを読み込み、import 文から「どのファイルを使っているか」を調べる。" },
          { at: "// ---------------- 解説を", title: "解説をコードの行に結び付ける", text: "解説データの目印（at）を各ファイルの中から探し、何行目から何行目までの説明かを決める。目印が見つからなければエラーにする。" },
          { at: "async function main()", title: "まとめて HTML を書き出す", text: "全部のデータを JSON にしてひな形に埋め込み、`学習/学習ポータル.html` に保存する。" },
        ],
      },
    ],
  },
];

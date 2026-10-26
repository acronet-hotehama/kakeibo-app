-- =============================================================
-- 家計簿アプリのテーブル定義（PostgreSQL）
-- npm run db:setup を実行すると、このファイルが上から順に実行される。
-- =============================================================

-- 何度実行しても同じ状態になるよう、既存テーブルを先に削除する。
-- transactions は categories を参照しているので、参照している側から消す。
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

-- -------------------------------------------------------------
-- カテゴリ（食費・給料 など）
-- -------------------------------------------------------------
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,                 -- 自動で 1, 2, 3... と採番される
  name  TEXT   NOT NULL,                    -- 表示名
  type  TEXT   NOT NULL
        CHECK (type IN ('income', 'expense')), -- 収入 or 支出 以外は登録できない
  UNIQUE (name, type)                       -- 同じ名前・同じ種別の重複を防ぐ
);

-- -------------------------------------------------------------
-- 取引（1件の収入・支出の記録）
-- 「収入か支出か」はカテゴリ側が持っているので、ここには持たせない（正規化）。
-- 種別が必要なときは categories と JOIN して取得する。
-- -------------------------------------------------------------
CREATE TABLE transactions (
  id           SERIAL      PRIMARY KEY,
  amount       INTEGER     NOT NULL CHECK (amount > 0),  -- 金額（円）。0 以下は不可
  category_id  INTEGER     NOT NULL
               REFERENCES categories(id),               -- 外部キー: 存在するカテゴリのみ
  date         DATE        NOT NULL,                     -- 取引日
  memo         TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()        -- 登録日時（自動）
);

-- 「月ごとに取引を取り出す」検索を速くするためのインデックス
CREATE INDEX idx_transactions_date ON transactions(date);

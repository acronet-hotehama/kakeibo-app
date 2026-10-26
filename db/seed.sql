-- =============================================================
-- 初期データ（動作確認用のサンプル）
-- =============================================================

INSERT INTO categories (name, type) VALUES
  ('給料',     'income'),
  ('副業',     'income'),
  ('その他収入', 'income'),
  ('食費',     'expense'),
  ('日用品',   'expense'),
  ('交通費',   'expense'),
  ('住居費',   'expense'),
  ('水道光熱費', 'expense'),
  ('通信費',   'expense'),
  ('娯楽',     'expense'),
  ('その他支出', 'expense');

-- サブクエリでカテゴリ名から id を引いて登録する。
-- date_trunc('month', CURRENT_DATE) = 今月1日。どの日に実行しても「今月」のデータになる。
INSERT INTO transactions (amount, category_id, date, memo)
SELECT v.amount, c.id, (date_trunc('month', CURRENT_DATE) + v.day_offset * INTERVAL '1 day')::date, v.memo
FROM (VALUES
  (250000, '給料',       24, '月給'),
  ( 15000, '副業',       10, 'Web制作'),
  ( 80000, '住居費',      0, '家賃'),
  (  3200, '食費',        1, 'スーパー'),
  (  1200, '食費',        3, 'ランチ'),
  (  4500, '食費',        8, '外食'),
  (  1800, '日用品',      4, 'ドラッグストア'),
  (  6000, '交通費',      2, '定期券チャージ'),
  (  9800, '水道光熱費',  14, '電気・ガス'),
  (  5500, '通信費',     19, 'スマホ'),
  (  3000, '娯楽',       12, '映画')
) AS v(amount, category_name, day_offset, memo)
JOIN categories c ON c.name = v.category_name;

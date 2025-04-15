-- テーブル作成
CREATE TABLE accounts (
  id INT PRIMARY KEY,
  balance INT NOT NULL CHECK (balance >= 0)
);

-- 初期データ投入
INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 1000);

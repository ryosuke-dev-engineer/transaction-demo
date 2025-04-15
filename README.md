# transaction-demo
## 前提
Docker Desktopが入っている。
## 起動の仕方
```
git clone https://github.com/ryosuke-dev-engineer/transaction-demo.git
```
を実行し、ローカルにファイルを保存する。

```
docker compose up -d --build
```
を実行。docker composeのバージョンによっては、`docker-compose`にする。

docker composeビルドが完了次第、ウェブブラウザにて、次のURLを開く。
```
http://localhost:3000/
```

※追記
```
import { Pool } from "pg"
```
のpgにてtypesエラーが発生しています。
動作自体はするので問題ありませんが、気になる方は、`types.d.ts`を別途記述して対応してください。
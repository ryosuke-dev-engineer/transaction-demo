FROM node:18-alpine

# pnpm をインストール
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 依存関係ファイルをコピー（pnpm-lock.yaml を含む）
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN pnpm run build

# アプリケーションを起動
CMD ["pnpm", "start"]

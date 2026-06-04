# Lightsail Page Builder Site

Next.js + PostgreSQL 的官方網站雛形，前台內容由資料庫驅動，後台可登入編輯區塊。

## 本機啟動

1. 安裝套件

```bash
npm install
```

2. 建立環境變數

```bash
cp .env.example .env
```

請把 `.env` 裡的 `SESSION_SECRET` 改成至少 24 字元的隨機字串，並修改 `ADMIN_EMAIL`、`ADMIN_PASSWORD`。

3. 啟動 PostgreSQL

```bash
docker compose up -d
```

如果你已經有本機 PostgreSQL，也可以直接改 `.env` 的 `DATABASE_URL`。

4. 建立資料表與種子資料

```bash
npm run db:push
npm run db:seed
```

5. 啟動 Next.js

```bash
npm run dev
```

前台：http://localhost:3000

後台：http://localhost:3000/admin

## S3 圖片輪播設定

首頁 Hero 支援外部圖片 URL 輪播。將公開可讀取的圖片 URL 以逗號分隔填入 `.env`：

```bash
NEXT_PUBLIC_CAROUSEL_IMAGES="https://your-bucket.s3.ap-northeast-1.amazonaws.com/hero-1.jpg,https://your-bucket.s3.ap-northeast-1.amazonaws.com/hero-2.jpg"
```

修改後需重新 build 並重啟：

```bash
npm run build
pm2 restart pagebuilder
```

## 初始架構

- `app/page.tsx`：前台官方網站
- `app/admin`：後台內容編輯
- `app/admin/login`：操作者登入
- `prisma/schema.prisma`：PostgreSQL 資料模型
- `prisma/seed.ts`：初始管理員與網站區塊
- `public/hero-page-builder.png`：首頁 hero 圖

## Lightsail 上線方向

先以 Lightsail VPS 部署 Next.js 與 PostgreSQL，搭配 Lightsail snapshot 做備份。之後若內容檔案變多，再接 S3；若需要聯絡表單寄信，再接 SES；資料庫負載變大時，再把 PostgreSQL 拆到 RDS。

## SOP 文件

- [營運接手 SOP](docs/OPERATIONS_SOP.md)
- [緊急狀況處理 SOP](docs/INCIDENT_RESPONSE_SOP.md)

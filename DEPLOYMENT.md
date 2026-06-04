# AWS Lightsail 低成本部署方向

這份專案目前以本機開發為主。真的要放上 Lightsail 時，建議分兩階段走，避免一開始就把 RDS、S3、SES 全開起來。

## Phase 1：最低成本

- Lightsail VPS：跑 Next.js、Nginx、PostgreSQL
- PostgreSQL：先同機安裝或 Docker Compose 跑
- 備份：Lightsail snapshot
- SSL：Nginx + Let's Encrypt
- 檔案：先不上傳大量圖片，網站圖片放在專案 `public/`
- 寄信：先不用 SES，等聯絡表單真的需要再接

適合：剛起步、內容量小、管理者少、流量還不確定。

## Phase 2：開始拆服務

- PostgreSQL 搬到 RDS 或 Lightsail managed database
- 圖片、附件搬到 S3
- 聯絡表單、通知信接 SES
- Next.js 繼續留在 Lightsail VPS

適合：內容常更新、圖片變多、備份與資料庫維護變重要。

## VPS 上需要的環境

- Node.js 20 LTS 或更新版本
- npm
- PostgreSQL 16
- Nginx
- Certbot

## Production 指令概念

```bash
npm install
npm run db:push
npm run db:seed
npm run build
npm run start
```

正式環境請務必更換：

- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DATABASE_URL`

## 為什麼先不直接用 RDS

RDS 比同機 PostgreSQL 更穩、更好維護，但它會增加固定成本。這個專案初期若只是官方網站 + 後台編輯，同機 PostgreSQL 搭配 snapshot 已足夠。等資料重要性、多人維運、備份要求變高，再拆到 RDS 會比較合理。

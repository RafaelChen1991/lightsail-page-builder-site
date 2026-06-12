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

## GitHub Actions 自動部署到 Lightsail

專案已加入 `.github/workflows/deploy-lightsail.yml`。流程是：

1. push 到 `main` 或手動執行 workflow
2. GitHub Actions 啟動測試用 PostgreSQL
3. 執行 `npm ci`、`npm run db:push`、`npm run db:seed`、`npm run build`
4. build 成功後，透過 SSH 登入 Lightsail
5. 在 Lightsail 專案目錄執行 `git pull --ff-only origin main`、`npm ci`、`npm run db:push`、`npm run build`、`pm2 restart`

### Lightsail 先決條件

Lightsail 上要先完成一次手動部署，並確認以下條件成立：

- 專案目錄已經是 Git repo，例如 `/home/ubuntu/lightsail-page-builder-site`
- `.env` 已放在 Lightsail 專案目錄，且不要提交到 GitHub
- `DATABASE_URL` 指向 production PostgreSQL
- `pm2` 已建立 app，例如 `pagebuilder`
- `git pull --ff-only origin main` 在 Lightsail 上可以成功
- Lightsail 使用者的 SSH key 可以登入

如果還沒建立 PM2 app，可先在 Lightsail 專案目錄執行：

```bash
npm run build
pm2 start npm --name pagebuilder -- start
pm2 save
```

### GitHub Secrets

到 GitHub repo 的 `Settings` → `Secrets and variables` → `Actions` → `New repository secret` 新增：

| Secret | 範例 | 說明 |
| --- | --- | --- |
| `LIGHTSAIL_HOST` | `12.34.56.78` | Lightsail public IP 或網域 |
| `LIGHTSAIL_USER` | `ubuntu` | SSH 使用者，依映像檔可能是 `ubuntu`、`bitnami` 或其他名稱 |
| `LIGHTSAIL_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | 可登入 Lightsail 的私鑰內容 |
| `LIGHTSAIL_PORT` | `22` | SSH port |
| `LIGHTSAIL_APP_DIR` | `/home/ubuntu/lightsail-page-builder-site` | Lightsail 上的專案絕對路徑 |
| `LIGHTSAIL_PM2_APP_NAME` | `pagebuilder` | PM2 app 名稱 |

### 建議練習順序

1. 先到 GitHub Actions 手動執行 `Deploy to Lightsail`
2. 確認 workflow 的 `Build check` 成功
3. 確認 `Deploy` 成功，並到網站檢查版本有更新
4. 再做一次小修改，push 到 `main`，確認自動部署會被觸發

### 常見失敗點

- `Permission denied`：`LIGHTSAIL_SSH_KEY` 不對，或 public key 沒放到 Lightsail 的 `~/.ssh/authorized_keys`
- `git pull --ff-only` 失敗：Lightsail 上有本機 commit 或分支落後方式不一致，先手動整理 Git 狀態
- `npm ci` 失敗：`package-lock.json` 與 `package.json` 不一致，先在本機跑一次 `npm install` 後提交 lockfile
- `npm run db:push` 失敗：production `DATABASE_URL` 或 PostgreSQL 權限有問題
- `pm2 restart` 失敗：`LIGHTSAIL_PM2_APP_NAME` 和實際 PM2 app 名稱不同，可在 Lightsail 執行 `pm2 list` 確認

## Prisma migration

專案已加入第一份 migration：

```text
prisma/migrations/20260611000000_init/migration.sql
```

GitHub Actions 的 build check 會使用：

```bash
npm run db:migrate
```

也就是：

```bash
prisma migrate deploy
```

這比 `prisma db push` 更適合 CI，因為 migration 有版本紀錄。

### 為什麼 production deploy 暫時仍保留 db:push

Lightsail production database 之前已經用 `db:push` 建過資料表，因此它不是空資料庫。若直接在 production 執行第一份 migration，Prisma 可能會拒絕套用，因為資料表已存在。

切換 production deploy 前，需要先在 Lightsail 做一次 baseline，告訴 Prisma：

```text
目前 production schema 已經等同套用過 20260611000000_init
```

在 Lightsail 專案目錄執行：

```bash
cd /var/www/lightsail-page-builder-site
git pull --ff-only origin main
npm ci
npx prisma migrate resolve --applied 20260611000000_init
```

完成後，才能把部署流程中的：

```bash
npm run db:push
```

改成：

```bash
npm run db:migrate
```

## 為什麼先不直接用 RDS

RDS 比同機 PostgreSQL 更穩、更好維護，但它會增加固定成本。這個專案初期若只是官方網站 + 後台編輯，同機 PostgreSQL 搭配 snapshot 已足夠。等資料重要性、多人維運、備份要求變高，再拆到 RDS 會比較合理。

# 緊急狀況處理 SOP

這份文件用於網站異常時的第一線處理。處理原則是先確認範圍、保留資訊、做低風險檢查，再決定是否找工程師。

## 先收集資訊

發現問題時，先記錄：

- 發生時間
- 使用者看到的錯誤畫面
- 影響範圍：前台、後台、圖片、登入、資料更新
- 最近是否有部署、改內容、改資料庫、改 AWS 設定
- Lightsail public IP 是否有變

## 情境一：前台網站打不開

先在瀏覽器確認：

```text
http://<Lightsail Public IP>
```

SSH 登入 Lightsail 後檢查：

```bash
pm2 status
curl -I http://localhost:3000
curl -I http://<Lightsail Public IP>
sudo nginx -t
sudo systemctl status nginx
```

判斷：

- `localhost:3000` 失敗：Next.js 或 PM2 問題
- `localhost:3000` 成功，但 public IP 失敗：Nginx 或 Lightsail firewall 問題
- Nginx 設定失敗：先不要 reload，保留錯誤訊息給工程師

低風險修復：

```bash
pm2 restart pagebuilder
sudo systemctl reload nginx
```

## 情境二：後台打不開或無法登入

檢查後台網址：

```text
http://<Lightsail Public IP>/admin
```

檢查網站是否正常：

```bash
pm2 status
curl -I http://localhost:3000/admin
```

如果忘記密碼：

1. 修改 Lightsail 專案中的 `.env`：

```bash
cd /var/www/lightsail-page-builder-site
nano .env
```

2. 修改：

```text
ADMIN_EMAIL
ADMIN_PASSWORD
SESSION_SECRET
```

3. 更新資料庫管理員資料：

```bash
npm run db:seed
pm2 restart pagebuilder
```

## 情境三：更新內容後前台沒有變

先確認：

- 後台是否按了儲存
- 該區塊是否為 published
- 排序是否正確
- 前台是否重新整理

檢查 server：

```bash
pm2 logs pagebuilder --lines 80
```

低風險修復：

```bash
pm2 restart pagebuilder
```

## 情境四：部署後網站壞掉

先看 PM2 log：

```bash
pm2 logs pagebuilder --lines 120
```

確認最新部署：

```bash
cd /var/www/lightsail-page-builder-site
git log --oneline -5
git status
```

可嘗試重新 build：

```bash
npm install
npm run db:push
npm run build
pm2 restart pagebuilder
```

如果 `npm run build` 失敗，不要硬重啟到壞版本。保留錯誤訊息給工程師。

## 情境五：CPU 很高或網站變慢

Lightsail Metrics 檢查：

- CPU utilization
- Remaining CPU burst capacity
- Network out
- Status check failures

SSH 檢查：

```bash
pm2 status
top
```

常見原因：

- 正在 build
- 流量或 bot 掃描
- 資料庫查詢過重
- 程式錯誤造成重複運算
- 重複啟動多個 PM2 process

低風險處理：

```bash
pm2 restart pagebuilder
```

如果 CPU 長時間高於 80%，且 burst capacity 持續下降，通知工程師。

## 情境六：PostgreSQL 連線失敗

檢查 PostgreSQL：

```bash
sudo systemctl status postgresql
```

測試資料庫登入：

```bash
PGPASSWORD=pagebuilder_prod_password psql -h localhost -U pagebuilder -d pagebuilder -c "\dt"
```

如果 PostgreSQL 沒跑：

```bash
sudo systemctl restart postgresql
```

再重啟網站：

```bash
pm2 restart pagebuilder
```

## 情境七：資料誤刪或內容被改壞

先停止繼續操作，避免覆蓋更多資料。

確認最近備份：

```bash
ls -lh ~/backups
```

不要直接還原，先通知工程師確認還原範圍。還原資料庫可能覆蓋目前內容。

## 情境八：Public IP 變了

如果沒有 Static IP，Lightsail instance 停止後 public IP 可能改變。

檢查新的 public IP 後，更新：

- 瀏覽器測試網址
- Nginx `server_name`，如果它寫死舊 IP
- 任何外部服務 callback URL

可以把 Nginx 設定改成接受所有 host：

```nginx
server_name _;
```

修改後測試並 reload：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 找工程師時請附上

- 問題描述
- 發生時間
- 截圖
- 最近做過什麼操作
- `pm2 status`
- `pm2 logs pagebuilder --lines 120`
- `sudo nginx -t`
- `curl -I http://localhost:3000`
- `curl -I http://<Lightsail Public IP>`

這些資訊能讓工程師快速判斷是 Next.js、Nginx、PostgreSQL、AWS firewall，還是部署版本問題。

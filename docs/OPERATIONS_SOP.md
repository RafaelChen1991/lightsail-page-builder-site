# 營運接手 SOP

這份文件給接手網站營運的人使用。目標不是取代工程師，而是讓營運者能理解系統、完成日常檢查、更新內容、備份資料，並在需要時提供清楚資訊給工程師。

## 系統範圍

目前架構：

- 前台：Next.js
- 後台：Next.js admin pages
- 資料庫：PostgreSQL
- 主機：AWS Lightsail Ubuntu
- Web server：Nginx
- Process manager：PM2
- 程式碼版本：GitHub

目前測試機使用 public IP，未綁定 Static IP、網域或 HTTPS。

## 重要位置

本機專案：

```bash
/Users/chenkuanchuan/Documents/AWS lightsail測試
```

Lightsail 專案：

```bash
/var/www/lightsail-page-builder-site
```

GitHub：

```text
https://github.com/RafaelChen1991/lightsail-page-builder-site
```

## 日常內容操作

1. 開啟後台：

```text
http://<Lightsail Public IP>/admin
```

2. 登入管理員帳號。

3. 修改內容區塊：

- 標題
- 內文
- 按鈕文字
- 按鈕連結
- 排序
- 發布狀態

4. 儲存後回前台確認內容是否更新。

## Lightsail 主機檢查

登入 Lightsail SSH 後，先進專案資料夾：

```bash
cd /var/www/lightsail-page-builder-site
```

檢查網站 process：

```bash
pm2 status
```

正常狀態：

```text
pagebuilder online
```

測試 Next.js 本機服務：

```bash
curl -I http://localhost:3000
```

正常應看到：

```text
HTTP/1.1 200 OK
```

測試 Nginx 對外服務：

```bash
curl -I http://<Lightsail Public IP>
```

正常應看到：

```text
HTTP/1.1 200 OK
Server: nginx
```

## 部署更新流程

當本機修改完成並 push 到 GitHub 後，在 Lightsail 執行：

```bash
cd /var/www/lightsail-page-builder-site
git pull
npm install
npm run db:push
npm run build
pm2 restart pagebuilder
```

如果這次有更新初始資料或管理員密碼，再執行：

```bash
npm run db:seed
pm2 restart pagebuilder
```

## 資料庫備份

建立備份資料夾：

```bash
mkdir -p ~/backups
```

備份 PostgreSQL：

```bash
PGPASSWORD=pagebuilder_prod_password pg_dump -h localhost -U pagebuilder -d pagebuilder > ~/backups/pagebuilder_$(date +%Y%m%d_%H%M%S).sql
```

確認備份檔：

```bash
ls -lh ~/backups
```

備份分工：

- 程式碼：GitHub
- 資料庫內容：`pg_dump` SQL 檔
- 整台主機：Lightsail snapshot，可能產生額外費用

## 防火牆設定

Lightsail firewall 只保留：

```text
22  SSH
80  HTTP
443 HTTPS
```

不要對外開：

```text
3000 Next.js internal port
5432 PostgreSQL
```

## 監控檢查

Lightsail console：

```text
Instances -> pagebuilder-prod -> Metrics
```

建議觀察：

- CPU utilization
- Remaining CPU burst capacity
- Network in/out
- Status check failures

測試機建議 alarm：

- CPU utilization 大於 80%，持續 10 到 15 分鐘
- Status check failures 大於 0

## 接手者需要知道的基本指令

```bash
pwd
ls
cd /var/www/lightsail-page-builder-site
git status
git pull
npm install
npm run build
pm2 status
pm2 restart pagebuilder
sudo nginx -t
sudo systemctl reload nginx
```

避免在不確定時執行：

```bash
rm -rf
sudo shutdown
sudo reboot
git reset --hard
```

## 目前學習路線

1. Lightsail 營運與部署
2. PostgreSQL 備份與還原
3. S3 圖片儲存與輪播
4. CI/CD，自行另開聊天室練習
5. n8n 自動化，自行另開聊天室練習

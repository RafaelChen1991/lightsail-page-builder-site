# S3 圖片輪播練習

這份文件用來練習把網站圖片放到 Amazon S3，並讓 Next.js 首頁 Hero 使用 S3 圖片輪播。

## 目標

- 建立一個 S3 bucket
- 上傳 2 到 3 張圖片
- 讓圖片可以被網站讀取
- 將圖片 URL 填入 Lightsail `.env`
- 重新 build 並確認首頁輪播

## 成本提醒

S3 不是完全免費服務。新帳號通常會有 Free Tier 額度，但正式計費包含儲存量、請求數與資料傳出量。測試時請只上傳少量壓縮圖片，並在練習完成後刪除不需要的檔案。

## 建議圖片規格

- 格式：JPG 或 WebP
- 寬度：1600 到 2400 px
- 單張大小：建議小於 500 KB
- 數量：2 到 3 張即可

## 建立 Bucket

AWS Console：

```text
S3 -> Create bucket
```

建議設定：

```text
Region: Asia Pacific Tokyo / ap-northeast-1
Bucket name: 必須全世界唯一，例如 pagebuilder-carousel-你的代號
Object Ownership: ACLs disabled
Block Public Access: 先保持全部開啟
Bucket Versioning: Disable
Default encryption: SSE-S3
```

先保持 Block Public Access 全部開啟，是比較安全的預設。練習公開圖片時，再用 bucket policy 開放指定路徑。

## 建立 images/ 路徑並上傳圖片

進入 bucket 後：

```text
Create folder -> images
Upload -> 選圖片 -> Upload
```

建議檔名：

```text
images/hero-1.jpg
images/hero-2.jpg
images/hero-3.jpg
```

## 開放圖片讀取

因為網站要讓瀏覽器讀到圖片，需要讓指定圖片路徑可公開讀取。

Bucket：

```text
Permissions -> Block public access -> Edit
```

取消：

```text
Block all public access
```

再到：

```text
Permissions -> Bucket policy
```

加入 policy，將 `<bucket-name>` 換成你的 bucket 名稱：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadCarouselImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket-name>/images/*"
    }
  ]
}
```

這個 policy 只允許讀取 `images/` 下面的物件，不允許上傳、刪除或列出 bucket。

## 取得圖片 URL

圖片 URL 格式通常是：

```text
https://<bucket-name>.s3.ap-northeast-1.amazonaws.com/images/hero-1.jpg
```

在瀏覽器打開 URL，如果看得到圖片，代表公開讀取設定成功。

## 設定 Lightsail

SSH 到 Lightsail：

```bash
cd /var/www/lightsail-page-builder-site
nano .env
```

加入或修改：

```bash
NEXT_PUBLIC_CAROUSEL_IMAGES="https://<bucket-name>.s3.ap-northeast-1.amazonaws.com/images/hero-1.jpg,https://<bucket-name>.s3.ap-northeast-1.amazonaws.com/images/hero-2.jpg"
```

儲存後重新 build：

```bash
npm run build
pm2 restart pagebuilder
```

測試：

```bash
curl -I http://localhost:3000
curl -I http://<Lightsail Public IP>
```

## 回復成本

練習完成後，如果不再需要 S3：

- 刪除 bucket 內圖片
- 刪除 bucket policy
- 刪除 bucket

如果保留 bucket，請定期確認 S3 Billing 與 bucket 內檔案數量。

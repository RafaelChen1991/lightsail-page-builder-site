import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-now";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: await hashPassword(adminPassword)
    },
    create: {
      email: adminEmail,
      name: "網站管理員",
      passwordHash: await hashPassword(adminPassword)
    }
  });

  const blocks = [
    {
      slug: "hero",
      label: "首頁 Hero",
      eyebrow: "Next.js + PostgreSQL 官方網站建置",
      title: "用可視化區塊管理你的官方網站",
      body:
        "這是一套適合部署在 AWS Lightsail 的 page builder 官方網站雛形。前台內容由資料庫驅動，操作者可登入後台更新文案、CTA 與區塊排序。",
      ctaLabel: "進入後台",
      ctaHref: "/admin",
      sortOrder: 10
    },
    {
      slug: "architecture",
      label: "低成本架構",
      eyebrow: "以免費與低成本為主",
      title: "先在本機完成，之後可搬到 Lightsail",
      body:
        "本機使用 PostgreSQL 開發；上線時可選 Lightsail VPS 跑 Next.js，PostgreSQL 可先同機安裝，資料成長後再拆到 RDS。圖片與上傳檔案可接 S3，表單通知可接 SES。",
      ctaLabel: "查看架構",
      ctaHref: "#stack",
      sortOrder: 20
    },
    {
      slug: "editor",
      label: "後台功能",
      eyebrow: "Operator CMS",
      title: "登入後就能修改前台內容",
      body:
        "後台提供簡單的區塊編輯器，可修改標題、內文、按鈕、排序與發布狀態。這個版本刻意保持輕量，方便後續擴充圖片、頁面模板與多語系。",
      ctaLabel: "開始編輯",
      ctaHref: "/admin",
      sortOrder: 30
    }
  ];

  for (const block of blocks) {
    await prisma.pageBlock.upsert({
      where: { slug: block.slug },
      update: block,
      create: block
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

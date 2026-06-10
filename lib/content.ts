import { prisma } from "./db";

export type SiteBlock = {
  id?: string;
  slug: string;
  label: string;
  eyebrow: string | null;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  published: boolean;
};

export const fallbackBlocks: SiteBlock[] = [
  {
    slug: "hero",
    label: "首頁 Hero",
    eyebrow: "Next.js + PostgreSQL 官方網站建置",
    title: "用可視化區塊管理你的官方網站",
    body:
      "這是一套適合部署在 AWS Lightsail 的 page builder 官方網站雛形。前台內容由資料庫驅動，操作者可登入後台更新文案、CTA 與區塊排序。",
    ctaLabel: "進入後台",
    ctaHref: "/admin",
    sortOrder: 10,
    published: true
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
    sortOrder: 20,
    published: true
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
    sortOrder: 30,
    published: true
  }
];

type PageBlockReader = {
  pageBlock: {
    findMany: (args: {
      where: { published: true };
      orderBy: { sortOrder: "asc" };
    }) => Promise<SiteBlock[]>;
  };
};

export async function getPublishedBlocks(client: PageBlockReader = prisma) {
  try {
    const blocks = await client.pageBlock.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" }
    });

    return blocks.length ? blocks : fallbackBlocks;
  } catch {
    return fallbackBlocks;
  }
}

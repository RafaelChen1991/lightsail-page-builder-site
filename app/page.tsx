import Link from "next/link";
import { HeroCarousel } from "@/app/components/HeroCarousel";
import { getPublishedBlocks } from "@/lib/content";

const stackItems = [
  ["Lightsail VPS", "Next.js app、管理後台、反向代理與 SSL"],
  ["PostgreSQL", "本機 Docker 開發；上線初期可同機安裝節省成本"],
  ["Snapshots", "Lightsail 定期備份，保留回復點。CI/CD驗證成功"],
  ["S3", "圖片與上傳檔案，網站成長後再接入"],
  ["SES", "聯絡表單寄信，每月小量寄送很省"]
];

export default async function HomePage() {
  const blocks = await getPublishedBlocks();
  const [hero, ...sections] = blocks;
  const carouselImages = getCarouselImages();

  return (
    <main>
      <nav className="topbar">
        <Link href="/" className="brand">PageBuilder</Link>
        <div className="navlinks">
          <a href="#features">功能</a>
          <a href="#stack">架構</a>
          <Link href="/admin">後台</Link>
        </div>
      </nav>

      <section className="hero">
        <HeroCarousel images={carouselImages} />
        <div className="heroOverlay" />
        <div className="heroContent">
          <p className="eyebrow">{hero?.eyebrow}</p>
          <h1>{hero?.title}</h1>
          <p>{hero?.body}</p>
          {hero?.ctaHref && hero?.ctaLabel ? (
            <Link href={hero.ctaHref} className="primaryButton">
              {hero.ctaLabel}
            </Link>
          ) : null}
        </div>
      </section>

      <section id="features" className="section">
        <div className="sectionHeader">
          <p className="eyebrow">內容可編輯</p>
          <h2>前台區塊由 PostgreSQL 管理</h2>
        </div>
        <div className="featureGrid">
          {sections.map((block) => (
            <article key={block.slug} className="featureCard">
              <span>{block.label}</span>
              <p className="eyebrow">{block.eyebrow}</p>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
              {block.ctaHref && block.ctaLabel ? <a href={block.ctaHref}>{block.ctaLabel}</a> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="stack" className="stackBand">
        <div>
          <p className="eyebrow">AWS Lightsail 預計架構</p>
          <h2>先用最少服務跑起來，再按需求拆分</h2>
          <p>
            目前本機開發即可。正式上線時，最省的路線是 Lightsail VPS 先承載 Next.js 與 PostgreSQL，
            等流量、備份與維運需求變明確後，再把資料庫、檔案與寄信拆到專用服務。
          </p>
        </div>
        <div className="stackTable">
          {stackItems.map(([name, detail]) => (
            <div key={name} className="stackRow">
              <strong>{name}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function getCarouselImages() {
  return (process.env.NEXT_PUBLIC_CAROUSEL_IMAGES || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

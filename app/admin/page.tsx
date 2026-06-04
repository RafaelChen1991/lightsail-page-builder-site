import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBlockAction, logoutAction, updateBlocksAction } from "./actions";

export default async function AdminPage({
  searchParams
}: {
  searchParams: { saved?: string; created?: string };
}) {
  const session = requireAdmin();
  const blocks = await prisma.pageBlock.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <div>
          <Link href="/" className="brand">PageBuilder</Link>
          <h1>網站內容後台</h1>
          <p>登入者：{session.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="ghostButton">登出</button>
        </form>
      </header>

      {searchParams.saved ? <div className="notice">已儲存並更新前台內容。</div> : null}
      {searchParams.created === "1" ? <div className="notice">已新增區塊。</div> : null}

      <form action={updateBlocksAction} className="editorList">
        {blocks.map((block) => (
          <section key={block.id} className="editorPanel">
            <input type="hidden" name="id" value={block.id} />
            <div className="editorPanelHeader">
              <strong>{block.label}</strong>
              <label className="switch">
                <input type="checkbox" name={`published:${block.id}`} defaultChecked={block.published} />
                發布
              </label>
            </div>
            <div className="formGrid">
              <label>
                管理標籤
                <input name={`label:${block.id}`} defaultValue={block.label} required />
              </label>
              <label>
                排序
                <input name={`sortOrder:${block.id}`} type="number" defaultValue={block.sortOrder} />
              </label>
              <label>
                Eyebrow
                <input name={`eyebrow:${block.id}`} defaultValue={block.eyebrow || ""} />
              </label>
              <label>
                標題
                <input name={`title:${block.id}`} defaultValue={block.title} required />
              </label>
              <label className="wide">
                內文
                <textarea name={`body:${block.id}`} defaultValue={block.body} required />
              </label>
              <label>
                按鈕文字
                <input name={`ctaLabel:${block.id}`} defaultValue={block.ctaLabel || ""} />
              </label>
              <label>
                按鈕連結
                <input name={`ctaHref:${block.id}`} defaultValue={block.ctaHref || ""} />
              </label>
            </div>
          </section>
        ))}
        <button type="submit" className="primaryButton">儲存全部變更</button>
      </form>

      <section className="editorPanel">
        <div className="editorPanelHeader">
          <strong>新增區塊</strong>
        </div>
        <form action={createBlockAction} className="formGrid">
          <label>
            管理標籤
            <input name="label" placeholder="例如：服務特色" required />
          </label>
          <label>
            排序
            <input name="sortOrder" type="number" defaultValue={100} />
          </label>
          <label>
            Eyebrow
            <input name="eyebrow" placeholder="短標籤" />
          </label>
          <label>
            標題
            <input name="title" required />
          </label>
          <label className="wide">
            內文
            <textarea name="body" required />
          </label>
          <label>
            按鈕文字
            <input name="ctaLabel" />
          </label>
          <label>
            按鈕連結
            <input name="ctaHref" />
          </label>
          <button type="submit" className="primaryButton">新增</button>
        </form>
      </section>
    </main>
  );
}

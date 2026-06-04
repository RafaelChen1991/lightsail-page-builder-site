"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateBlocksAction(formData: FormData) {
  requireAdmin();

  const ids = formData.getAll("id").map(String);

  await Promise.all(
    ids.map((id) =>
      prisma.pageBlock.update({
        where: { id },
        data: {
          label: String(formData.get(`label:${id}`) || ""),
          eyebrow: String(formData.get(`eyebrow:${id}`) || "") || null,
          title: String(formData.get(`title:${id}`) || ""),
          body: String(formData.get(`body:${id}`) || ""),
          ctaLabel: String(formData.get(`ctaLabel:${id}`) || "") || null,
          ctaHref: String(formData.get(`ctaHref:${id}`) || "") || null,
          sortOrder: Number(formData.get(`sortOrder:${id}`) || 0),
          published: formData.get(`published:${id}`) === "on"
        }
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function createBlockAction(formData: FormData) {
  requireAdmin();

  const label = String(formData.get("label") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!label || !title || !body) redirect("/admin?created=0");

  await prisma.pageBlock.create({
    data: {
      slug: `${Date.now()}-${toSlug(label)}`,
      label,
      eyebrow: String(formData.get("eyebrow") || "") || null,
      title,
      body,
      ctaLabel: String(formData.get("ctaLabel") || "") || null,
      ctaHref: String(formData.get("ctaHref") || "") || null,
      sortOrder: Number(formData.get("sortOrder") || 100),
      published: true
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?created=1");
}

export async function logoutAction() {
  clearSessionCookie();
  redirect("/admin/login");
}

function toSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}

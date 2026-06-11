"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pageBlockInputFromFormData, validatePageBlockInput } from "@/lib/page-block-input";

export async function updateBlocksAction(formData: FormData) {
  requireAdmin();

  const ids = formData.getAll("id").map(String);
  const updates = ids.map((id) => ({
    id,
    result: validatePageBlockInput(pageBlockInputFromFormData(formData, { suffix: id }), {
      defaultSortOrder: 0
    })
  }));

  if (updates.some((update) => !update.result.ok)) redirect("/admin?saved=0");

  await Promise.all(
    updates.map((update) =>
      prisma.pageBlock.update({
        where: { id: update.id },
        data: update.result.ok ? update.result.data : {}
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function createBlockAction(formData: FormData) {
  requireAdmin();

  const result = validatePageBlockInput(
    pageBlockInputFromFormData(formData, { defaultPublished: true }),
    { defaultSortOrder: 100 }
  );

  if (!result.ok) redirect("/admin?created=0");

  await prisma.pageBlock.create({
    data: {
      slug: `${Date.now()}-${toSlug(result.data.label)}`,
      ...result.data
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

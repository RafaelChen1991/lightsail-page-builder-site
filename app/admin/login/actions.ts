"use server";

import { redirect } from "next/navigation";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/admin/login?error=1");
  }

  setSessionCookie(createSessionToken({ userId: user.id, email: user.email }));
  redirect("/admin");
}

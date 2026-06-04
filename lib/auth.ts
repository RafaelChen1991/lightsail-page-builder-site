import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "pb_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  userId: string;
  email: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("SESSION_SECRET must be at least 24 characters long.");
  }
  return secret;
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const session: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  };
  const body = base64Url(JSON.stringify(session));
  return `${body}.${sign(body)}`;
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/"
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = sign(body);
  const isValid =
    signature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!isValid) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAdmin() {
  const session = getSession();
  if (!session) redirect("/admin/login");
  return session;
}

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAdminPassword,
  getAdminSessionSecret,
  getAdminUsername,
} from "@/lib/env";

const SESSION_COOKIE_NAME = "airport_taxi_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

type AdminSession = {
  role: "admin";
  username: string;
  expiresAt: number;
};

function signPayload(payload: string) {
  return createHmac("sha256", getAdminSessionSecret())
    .update(payload)
    .digest("base64url");
}

function encodeSession(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function decodeSession(token: string | undefined): AdminSession | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (
      session.role !== "admin" ||
      session.username !== getAdminUsername() ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_TTL_MS;

  cookieStore.set(SESSION_COOKIE_NAME, encodeSession({
    role: "admin",
    username: getAdminUsername(),
    expiresAt,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function authenticateAdmin(username: string, password: string) {
  return (
    username === getAdminUsername().trim() &&
    password === getAdminPassword().trim()
  );
}

export const getAdminSession = cache(async () => {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
});

export const requireAdminSession = cache(async () => {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
});

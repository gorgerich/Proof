import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";
import { findUserById } from "./_db.js";

const scrypt = promisify(scryptCallback);
const cookieName = "proof_session";
const maxAgeSeconds = 60 * 60 * 24 * 14;

function secret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.DATABASE_URL ??
    "proof-local-dev-secret"
  );
}

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64Url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function cookieHeader(name, value, options = {}) {
  const parts = [`${name}=${value}`, "Path=/", "SameSite=Lax", "HttpOnly"];

  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function getCookie(req, name) {
  const header = req.headers.cookie ?? "";
  const cookies = header.split(";").map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.display_name ?? user.displayName ?? ""
  };
}

export function setSessionCookie(res, user) {
  const payload = base64Url(
    JSON.stringify({
      uid: user.id,
      role: user.role,
      exp: Date.now() + maxAgeSeconds * 1000
    })
  );
  const token = `${payload}.${sign(payload)}`;
  res.setHeader("Set-Cookie", cookieHeader(cookieName, encodeURIComponent(token), {
    maxAge: maxAgeSeconds
  }));
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", cookieHeader(cookieName, "", { maxAge: 0 }));
}

export async function readSession(req) {
  const token = getCookie(req, cookieName);
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  const data = JSON.parse(fromBase64Url(payload));
  if (!data.uid || Date.now() > data.exp) return null;

  return findUserById(data.uid);
}

export async function requireUser(req) {
  const user = await readSession(req);
  if (!user) {
    const error = new Error("auth_required");
    error.statusCode = 401;
    throw error;
  }
  return user;
}

export async function requireAdmin(req) {
  const user = await requireUser(req);
  if (user.role !== "admin") {
    const error = new Error("admin_required");
    error.statusCode = 403;
    throw error;
  }
  return user;
}

export async function hashPassword(password) {
  if (!password || password.length < 8) {
    const error = new Error("password_too_short");
    error.statusCode = 400;
    throw error;
  }

  const salt = randomBytes(16).toString("base64url");
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${key.toString("base64url")}`;
}

export async function verifyPassword(password, storedHash) {
  const [scheme, salt, hash] = String(storedHash ?? "").split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const key = await scrypt(password, salt, 64);
  const actual = Buffer.from(key.toString("base64url"));
  const expected = Buffer.from(hash);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

import { clearSessionCookie } from "../_auth.js";
import { sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  clearSessionCookie(res);
  return sendJson(res, 200, { ok: true });
}

import { backendMeta, createUser } from "../_db.js";
import { hashPassword, publicUser, setSessionCookie } from "../_auth.js";
import { readJson, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const body = await readJson(req);
    const passwordHash = await hashPassword(body.password ?? "");
    const user = await createUser({
      email: body.email,
      passwordHash,
      displayName: body.displayName ?? "",
      role: body.role
    });

    setSessionCookie(res, user);
    return sendJson(res, 201, {
      user: publicUser(user),
      backend: backendMeta()
    });
  } catch (error) {
    const duplicate = error.message?.includes("duplicate key");
    return sendJson(res, duplicate ? 409 : error.statusCode ?? 500, {
      error: duplicate ? "email_taken" : "register_failed",
      message: duplicate ? "email_taken" : error.message
    });
  }
}

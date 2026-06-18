import { backendMeta, findUserByEmail, touchUser } from "../_db.js";
import { publicUser, setSessionCookie, verifyPassword } from "../_auth.js";
import { readJson, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const body = await readJson(req);
    const user = await findUserByEmail(body.email);
    const ok = user && (await verifyPassword(body.password ?? "", user.password_hash));

    if (!ok) {
      return sendJson(res, 401, {
        error: "invalid_credentials",
        message: "invalid_credentials"
      });
    }

    await touchUser(user.id);
    setSessionCookie(res, user);
    return sendJson(res, 200, {
      user: publicUser(user),
      backend: backendMeta()
    });
  } catch (error) {
    return sendJson(res, error.statusCode ?? 500, {
      error: "login_failed",
      message: error.message
    });
  }
}

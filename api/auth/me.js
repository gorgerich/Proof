import { backendMeta } from "../_db.js";
import { publicUser, readSession } from "../_auth.js";
import { sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  const user = await readSession(req);
  return sendJson(res, 200, {
    user: publicUser(user),
    backend: backendMeta()
  });
}

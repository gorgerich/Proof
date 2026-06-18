import { logAdminEvent, recomputeAllMatches } from "../_db.js";
import { requireAdmin } from "../_auth.js";
import { sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const user = await requireAdmin(req);
    const result = await recomputeAllMatches();
    await logAdminEvent(user.id, "matches_recomputed", result);
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, error.statusCode ?? 500, {
      error: "admin_recompute_failed",
      message: error.message
    });
  }
}

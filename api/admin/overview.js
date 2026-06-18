import { getAdminOverview } from "../_db.js";
import { requireAdmin } from "../_auth.js";
import { sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    await requireAdmin(req);
    const data = await getAdminOverview();
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.statusCode ?? 500, {
      error: "admin_overview_failed",
      message: error.message
    });
  }
}

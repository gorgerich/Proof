import { getMatches } from "./_db.js";
import { readSession } from "./_auth.js";
import { sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const mode = req.query?.mode ?? "candidate";
    const user = await readSession(req);
    const data = await getMatches(mode, user?.id ?? null);
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.statusCode ?? 500, {
      error: "matches_failed",
      message: error.message
    });
  }
}

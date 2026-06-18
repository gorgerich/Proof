import { getMatches } from "./_db.js";
import { sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const mode = req.query?.mode ?? "candidate";
    const data = await getMatches(mode);
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.statusCode ?? 500, {
      error: "matches_failed",
      message: error.message
    });
  }
}

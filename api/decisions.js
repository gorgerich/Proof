import { saveDecision } from "./_db.js";
import { readJson, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const body = await readJson(req);
    const result = await saveDecision(body);
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 500, {
      error: "decision_failed",
      message: error.message
    });
  }
}

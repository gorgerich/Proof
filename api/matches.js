import { getMatches, getMatchThread, saveMatchThread } from "./_db.js";
import { readSession, requireUser } from "./_auth.js";
import { readJson, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET" && req.query?.threadMatchId) {
      const user = await readSession(req);
      const data = await getMatchThread(req.query.threadMatchId, user?.id ?? null);
      return sendJson(res, 200, data);
    }

    if (req.method === "POST") {
      const user = await requireUser(req);
      const body = await readJson(req);
      if (body?.type !== "thread") {
        return sendJson(res, 400, { error: "unsupported_match_action" });
      }
      const data = await saveMatchThread(body, user.id);
      return sendJson(res, 200, data);
    }

    if (req.method !== "GET") {
      return sendJson(res, 405, { error: "method_not_allowed" });
    }

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

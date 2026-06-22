import { getMatchThread, saveMatchThread } from "./_db.js";
import { readSession, requireUser } from "./_auth.js";
import { readJson, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const user = await readSession(req);
      const matchId = req.query?.matchId;
      const data = await getMatchThread(matchId, user?.id ?? null);
      return sendJson(res, 200, data);
    }

    if (req.method === "POST") {
      const user = await requireUser(req);
      const body = await readJson(req);
      const data = await saveMatchThread(body, user.id);
      return sendJson(res, 200, data);
    }

    return sendJson(res, 405, { error: "method_not_allowed" });
  } catch (error) {
    return sendJson(res, error.statusCode ?? 500, {
      error: "match_thread_failed",
      message: error.message
    });
  }
}

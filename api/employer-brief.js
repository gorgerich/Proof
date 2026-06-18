import { saveHiringBrief } from "./_db.js";
import { readJson, sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const body = await readJson(req);
    const result = await saveHiringBrief(body);
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 500, {
      error: "employer_brief_failed",
      message: error.message
    });
  }
}

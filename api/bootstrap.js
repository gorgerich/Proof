import { getBootstrap } from "./_db.js";
import { sendJson } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  try {
    const data = await getBootstrap();
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, 500, {
      error: "bootstrap_failed",
      message: error.message
    });
  }
}

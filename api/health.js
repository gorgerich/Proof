import { backendMeta } from "./_db.js";
import { sendJson } from "./_utils.js";

export default async function handler(req, res) {
  return sendJson(res, 200, {
    ok: true,
    backend: backendMeta()
  });
}

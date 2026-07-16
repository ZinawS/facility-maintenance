const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

/** Reads ?page=&limit= from the request, clamped to sane bounds. */
function getPagination(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildMeta({ page, limit }, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

module.exports = { getPagination, buildMeta };

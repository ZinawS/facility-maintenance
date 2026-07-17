const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();
const SITE_URL = "https://mossutech.com";

const STATIC_PATHS = [
  { path: "/", priority: "1.0" },
  { path: "/about", priority: "0.7" },
  { path: "/services", priority: "0.9" },
  { path: "/service-plans", priority: "0.7" },
  { path: "/parts", priority: "0.6" },
  { path: "/knowledge-base", priority: "0.6" },
  { path: "/blog", priority: "0.6" },
  { path: "/faq", priority: "0.5" },
  { path: "/contact", priority: "0.8" },
];

const urlTag = (loc, { lastmod, priority } = {}) =>
  `  <url>\n    <loc>${loc}</loc>\n` +
  (lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n` : "") +
  (priority ? `    <priority>${priority}</priority>\n` : "") +
  `  </url>`;

/**
 * @route GET /sitemap.xml
 * Generated from live content so new services and blog posts show up
 * without needing a manual sitemap edit.
 */
router.get(
  "/sitemap.xml",
  asyncHandler(async (req, res) => {
    const [services] = await req.db.query(
      "SELECT slug, updated_at FROM services WHERE is_active = 1"
    );
    const [blogs] = await req.db.query("SELECT id, created_at FROM blogs");

    const urls = [
      ...STATIC_PATHS.map(({ path, priority }) => urlTag(`${SITE_URL}${path}`, { priority })),
      ...services.map((s) =>
        urlTag(`${SITE_URL}/services/${s.slug}`, { lastmod: s.updated_at, priority: "0.7" })
      ),
      ...blogs.map((b) =>
        urlTag(`${SITE_URL}/blog/${b.id}`, { lastmod: b.created_at, priority: "0.6" })
      ),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    res.type("application/xml").send(xml);
  })
);

module.exports = router;

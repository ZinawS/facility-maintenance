const { createResourceRouter } = require("../utils/resourceRouter");
const settings = require("./settings");

const services = createResourceRouter({
  table: "services",
  hasImage: true,
  fields: [
    { name: "name", type: "string", required: true, max: 150 },
    { name: "slug", type: "string", required: true, max: 150 },
    { name: "short_description", type: "string", required: true, max: 300 },
    { name: "description", type: "string", required: false, max: 8000 },
    { name: "icon", type: "string", required: false, max: 50 },
    { name: "features", type: "json", required: false },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const team = createResourceRouter({
  table: "team_members",
  hasImage: true,
  fields: [
    { name: "name", type: "string", required: true, max: 150 },
    { name: "role", type: "string", required: true, max: 150 },
    { name: "bio", type: "string", required: false, max: 1000 },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const faqs = createResourceRouter({
  table: "faqs",
  fields: [
    { name: "question", type: "string", required: true, max: 300 },
    { name: "answer", type: "string", required: true, max: 3000 },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const servicePlans = createResourceRouter({
  table: "service_plans",
  fields: [
    { name: "name", type: "string", required: true, max: 100 },
    { name: "price_cents", type: "int", required: false, min: 0 },
    { name: "price_label", type: "string", required: false, max: 50 },
    { name: "billing_period", type: "string", required: false, max: 20 },
    { name: "features", type: "json", required: false },
    { name: "is_featured", type: "bool", required: false },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const parts = createResourceRouter({
  table: "parts",
  hasImage: true,
  fields: [
    { name: "name", type: "string", required: true, max: 150 },
    { name: "description", type: "string", required: false, max: 1000 },
    { name: "category", type: "string", required: false, max: 100 },
    { name: "price_cents", type: "int", required: true, min: 0 },
    { name: "sku", type: "string", required: false, max: 50 },
    { name: "stock_quantity", type: "int", required: false, min: 0 },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const knowledgeGuides = createResourceRouter({
  table: "knowledge_guides",
  fields: [
    { name: "title", type: "string", required: true, max: 200 },
    { name: "steps", type: "json", required: true },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const knowledgeVideos = createResourceRouter({
  table: "knowledge_videos",
  fields: [
    { name: "title", type: "string", required: true, max: 200 },
    { name: "video_url", type: "string", required: true, max: 500 },
    { name: "sort_order", type: "int", required: false },
    { name: "is_active", type: "bool", required: false },
  ],
});

const RESOURCES = [
  ["services", services],
  ["team", team],
  ["faqs", faqs],
  ["service-plans", servicePlans],
  ["parts", parts],
  ["knowledge-guides", knowledgeGuides],
  ["knowledge-videos", knowledgeVideos],
];

function mountContentRoutes(app) {
  for (const [name, { publicRouter, adminRouter }] of RESOURCES) {
    app.use(`/api/public/${name}`, publicRouter);
    app.use(`/api/admin/${name}`, adminRouter);
  }
  app.use("/api/public/settings", settings.publicRouter);
  app.use("/api/admin/settings", settings.adminRouter);
}

module.exports = mountContentRoutes;

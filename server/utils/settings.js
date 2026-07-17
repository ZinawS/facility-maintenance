/** Returns site_settings as a plain { key: value } map. */
async function getSettingsMap(db) {
  const [rows] = await db.query("SELECT setting_key, setting_value FROM site_settings");
  return Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
}

module.exports = { getSettingsMap };

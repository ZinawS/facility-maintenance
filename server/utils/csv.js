/** Converts an array of flat objects to a CSV string (RFC 4180 quoting). */
function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const str = value instanceof Date ? value.toISOString() : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

module.exports = { toCsv };

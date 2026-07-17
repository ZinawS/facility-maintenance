const PDFDocument = require("pdfkit");

const COMPANY_NAME = "One-Stop Utility Service";

/**
 * Ensures an invoice row exists for a payment (idempotent — invoices are
 * only ever created once, never regenerated, so the invoice_number stays
 * stable). Only makes sense for a payment that has actually been charged.
 */
async function ensureInvoice(db, payment) {
  const [existing] = await db.query("SELECT * FROM invoices WHERE payment_id = ?", [payment.id]);
  if (existing.length) return existing[0];

  const [result] = await db.query("INSERT INTO invoices (invoice_number, payment_id, user_id) VALUES (?, ?, ?)", [
    "PENDING",
    payment.id,
    payment.user_id ?? null,
  ]);
  const invoiceNumber = `INV-${String(result.insertId).padStart(6, "0")}`;
  await db.query("UPDATE invoices SET invoice_number = ? WHERE id = ?", [invoiceNumber, result.insertId]);

  const [rows] = await db.query("SELECT * FROM invoices WHERE id = ?", [result.insertId]);
  return rows[0];
}

const money = (amount, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount);

/**
 * Renders an invoice PDF to a Buffer. `settings` is the site_settings
 * key/value map (address/email/phone); customer/payment/invoice come
 * straight from their respective tables.
 */
function generateInvoicePdf({ invoice, payment, customer, settings }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primary = "#1E40AF";
    const gray = "#555555";

    // Header
    doc.fillColor(primary).fontSize(22).font("Helvetica-Bold").text(COMPANY_NAME);
    doc.fillColor(gray).fontSize(9).font("Helvetica");
    if (settings.address) doc.text(settings.address);
    const contactLine = [settings.phone, settings.email].filter(Boolean).join("  |  ");
    if (contactLine) doc.text(contactLine);

    doc.moveDown(1.5);
    doc.fillColor("#111111").fontSize(18).font("Helvetica-Bold").text("INVOICE", { align: "right" });
    doc.fontSize(10).font("Helvetica").fillColor(gray);
    doc.text(`Invoice #: ${invoice.invoice_number}`, { align: "right" });
    doc.text(`Date: ${new Date(invoice.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, {
      align: "right",
    });
    doc.text(`Order #: ${payment.id}`, { align: "right" });

    doc.moveDown(1.5);
    doc.strokeColor("#dddddd").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Bill to
    doc.fillColor("#111111").fontSize(11).font("Helvetica-Bold").text("Bill To");
    doc.font("Helvetica").fontSize(10).fillColor(gray);
    doc.text(customer?.name || "Guest Customer");
    if (customer?.email) doc.text(customer.email);

    doc.moveDown(1.5);

    // Line item table
    const tableTop = doc.y;
    const col = { desc: 50, qty: 330, price: 400, total: 475 };
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111");
    doc.text("Description", col.desc, tableTop);
    doc.text("Qty", col.qty, tableTop);
    doc.text("Price", col.price, tableTop);
    doc.text("Total", col.total, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor("#dddddd").stroke();

    const qty = payment.quantity || 1;
    const rowY = tableTop + 24;
    doc.font("Helvetica").fillColor(gray);
    doc.text(payment.description, col.desc, rowY, { width: 260 });
    doc.text(String(qty), col.qty, rowY);
    doc.text(money(payment.amount / qty, payment.currency), col.price, rowY);
    doc.text(money(payment.amount, payment.currency), col.total, rowY);

    doc.moveTo(50, rowY + 30).lineTo(545, rowY + 30).strokeColor("#dddddd").stroke();

    // Totals
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111");
    doc.text(`Total: ${money(payment.amount, payment.currency)}`, col.price, rowY + 45, { width: 120, align: "right" });

    doc.font("Helvetica").fontSize(10).fillColor(gray);
    const statusLabel = payment.status === "succeeded" ? "Paid" : payment.status;
    doc.text(`Payment status: ${statusLabel}`, col.desc, rowY + 45);

    // Footer
    doc.fontSize(8).fillColor("#999999").text(
      "Thank you for your business. This invoice was generated automatically and is valid without a signature.",
      50,
      760,
      { width: 495, align: "center" }
    );

    doc.end();
  });
}

module.exports = { ensureInvoice, generateInvoicePdf };

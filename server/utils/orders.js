const stripe = require("../config/stripe");

/**
 * Cancels an order. If it was already paid, issues a Stripe refund first —
 * the payment's `status` only moves to 'refunded' after Stripe confirms
 * the refund, so a failed refund never leaves the order silently canceled
 * without the money actually moving back. Revenue reporting sums only
 * status = 'succeeded', so a refunded order stops counting as revenue
 * automatically once this runs.
 *
 * @returns {"refunded"|"canceled"}
 */
async function cancelOrder(db, payment, reason) {
  const now = new Date();

  if (payment.status === "succeeded") {
    await stripe.refunds.create({ payment_intent: payment.stripe_payment_intent_id });
    await db.query(
      `UPDATE payments
       SET status = 'refunded', fulfillment_status = 'canceled',
           cancel_reason = ?, canceled_at = ?, refunded_at = ?
       WHERE id = ?`,
      [reason || null, now, now, payment.id]
    );
    return "refunded";
  }

  await db.query(
    `UPDATE payments
     SET status = 'canceled', fulfillment_status = 'canceled', cancel_reason = ?, canceled_at = ?
     WHERE id = ?`,
    [reason || null, now, payment.id]
  );
  return "canceled";
}

const CANCELABLE_FULFILLMENT_STATUSES = ["pending", "accepted"];

module.exports = { cancelOrder, CANCELABLE_FULFILLMENT_STATUSES };

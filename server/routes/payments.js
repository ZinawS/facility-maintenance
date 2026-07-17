const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const handleValidation = require("../middleware/handleValidation");
const { optionalAuth } = require("../middleware/auth");
const env = require("../config/env");
const logger = require("../config/logger");
const stripe = require("../config/stripe");
const { ensureInvoice, generateInvoicePdf } = require("../utils/invoices");
const { getSettingsMap } = require("../utils/settings");
const { sendMail } = require("../config/mailer");

const router = express.Router();
const webhookRouter = express.Router();

const MIN_CUSTOM_AMOUNT_CENTS = 100; // $1
const MAX_CUSTOM_AMOUNT_CENTS = 5_000_000; // $50,000
const MAX_PART_QUANTITY = 50;

/**
 * Never trust a client-supplied `amount`. Compute it server-side from the
 * plan/part the client references, so the checkout total can't be tampered
 * with. `custom` is the one deliberate exception, for ad-hoc quotes/deposits
 * that don't map to a catalog item — it's bounded and always requires a
 * human-readable description so it's easy to audit in the payments list.
 */
router.post(
  "/create",
  optionalAuth,
  [
    body("kind")
      .isIn(["plan", "part", "custom", "service_request"])
      .withMessage("kind must be plan, part, custom, or service_request"),
    body("planId")
      .if((value, { req }) => req.body.kind === "plan")
      .isInt()
      .withMessage("planId is required"),
    body("partId")
      .if((value, { req }) => req.body.kind === "part")
      .isInt()
      .withMessage("partId is required"),
    body("serviceRequestId")
      .if((value, { req }) => req.body.kind === "service_request")
      .isInt()
      .withMessage("serviceRequestId is required"),
    body("quantity")
      .if((value, { req }) => req.body.kind === "part")
      .optional()
      .isInt({ min: 1, max: MAX_PART_QUANTITY })
      .withMessage(`quantity must be between 1 and ${MAX_PART_QUANTITY}`),
    body("amount")
      .if((value, { req }) => req.body.kind === "custom")
      .isInt({ min: MIN_CUSTOM_AMOUNT_CENTS, max: MAX_CUSTOM_AMOUNT_CENTS })
      .withMessage("amount (in cents) is out of the allowed range"),
    body("description")
      .if((value, { req }) => req.body.kind === "custom")
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("description is required for a custom payment"),
  ],
  handleValidation,
  asyncHandler(async (req, res) => {
    const { kind } = req.body;
    let amount;
    let description;
    let planId = null;
    let partId = null;
    let serviceRequestId = null;
    let quantity = null;

    if (kind === "service_request") {
      if (!req.user) return res.status(401).json({ message: "Please log in to pay for a service request" });
      const [requests] = await req.db.query(
        "SELECT * FROM service_requests WHERE id = ? AND user_id = ?",
        [req.body.serviceRequestId, req.user.id]
      );
      const request = requests[0];
      if (!request) return res.status(404).json({ message: "Service request not found" });
      if (request.quote_amount_cents === null) {
        return res.status(400).json({ message: "This request hasn't been quoted yet" });
      }
      serviceRequestId = request.id;
      amount = request.quote_amount_cents;
      description = `Service Request: ${request.service_type}`;
    } else if (kind === "plan") {
      const [plans] = await req.db.query(
        "SELECT * FROM service_plans WHERE id = ? AND is_active = 1",
        [req.body.planId]
      );
      const plan = plans[0];
      if (!plan) return res.status(404).json({ message: "Plan not found" });
      if (plan.price_cents === null) {
        return res.status(400).json({ message: "This plan requires a custom quote — please contact us" });
      }
      planId = plan.id;
      amount = plan.price_cents;
      description = `Service Plan: ${plan.name}`;
    } else if (kind === "part") {
      if (!req.user) return res.status(401).json({ message: "Please log in to order parts" });
      quantity = req.body.quantity || 1;
      const [parts] = await req.db.query("SELECT * FROM parts WHERE id = ? AND is_active = 1", [
        req.body.partId,
      ]);
      const part = parts[0];
      if (!part) return res.status(404).json({ message: "Part not found" });
      if (part.stock_quantity < quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      partId = part.id;
      amount = part.price_cents * quantity;
      description = `${quantity} x ${part.name}`;
    } else {
      amount = req.body.amount;
      description = req.body.description;
    }

    // Stripe SDK errors carry their own `.statusCode` (e.g. 401 for an
    // expired API key) reflecting Stripe's response, not ours — letting
    // that propagate to the client meant a broken Stripe key made our API
    // return a real 401, which force-logs-out whoever was checking out
    // (the frontend treats any 401 as "your session expired"). Convert any
    // Stripe failure into a safe, generic 502 instead.
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        description,
        payment_method_types: ["card"],
        metadata: {
          kind,
          planId: planId ?? "",
          partId: partId ?? "",
          serviceRequestId: serviceRequestId ?? "",
          userId: req.user?.id ?? "",
        },
      });
    } catch (stripeErr) {
      logger.error({ err: stripeErr }, "Stripe payment intent creation failed");
      return res
        .status(502)
        .json({ message: "Payment processor is currently unavailable. Please try again shortly." });
    }

    await req.db.query(
      `INSERT INTO payments
        (user_id, stripe_payment_intent_id, plan_id, part_id, service_request_id, quantity, amount, currency, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'usd', ?, 'pending')`,
      [
        req.user?.id ?? null,
        paymentIntent.id,
        planId,
        partId,
        serviceRequestId,
        quantity,
        amount / 100,
        description,
      ]
    );

    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  })
);

webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    if (!env.stripe.webhookSecret) {
      logger.warn("Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured");
      return res.status(501).json({ message: "Webhook not configured" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        env.stripe.webhookSecret
      );
    } catch (err) {
      logger.warn({ err }, "Stripe webhook signature verification failed");
      return res.status(400).json({ message: `Webhook signature verification failed` });
    }

    const intent = event.data.object;
    const statusByEvent = {
      "payment_intent.succeeded": "succeeded",
      "payment_intent.payment_failed": "failed",
      "payment_intent.canceled": "canceled",
    };
    const nextStatus = statusByEvent[event.type];

    if (nextStatus) {
      // Stripe can and does redeliver the same event, so re-running the
      // succeeded side effects (stock decrement, invoice email) on a
      // payment that's already 'succeeded' would double them — fetch the
      // prior status first and only treat this as a fresh success once.
      const [beforeRows] = await req.db.query(
        `SELECT p.*, u.name AS customer_name, u.email AS customer_email
         FROM payments p LEFT JOIN users u ON p.user_id = u.id
         WHERE p.stripe_payment_intent_id = ?`,
        [intent.id]
      );
      const wasAlreadySucceeded = beforeRows[0]?.status === "succeeded";

      await req.db.query(
        "UPDATE payments SET status = ? WHERE stripe_payment_intent_id = ?",
        [nextStatus, intent.id]
      );

      if (nextStatus === "succeeded" && !wasAlreadySucceeded) {
        // Best-effort: a failure here shouldn't fail the webhook response
        // (Stripe retries on non-2xx), since the payment itself is already
        // recorded — the invoice can still be generated on demand later.
        try {
          const payment = beforeRows[0];

          if (payment?.part_id) {
            // Floor at 0 rather than trusting the pre-checkout stock check
            // alone — two near-simultaneous purchases of the last unit both
            // pass that check before either payment lands here.
            await req.db.query(
              "UPDATE parts SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ?",
              [payment.quantity || 1, payment.part_id]
            );
          }

          if (payment?.customer_email) {
            const invoice = await ensureInvoice(req.db, payment);
            const settings = await getSettingsMap(req.db);
            const pdf = await generateInvoicePdf({
              invoice,
              payment,
              customer: { name: payment.customer_name, email: payment.customer_email },
              settings,
            });
            await sendMail({
              to: payment.customer_email,
              subject: `Your invoice ${invoice.invoice_number}`,
              html: `<p>Hi ${payment.customer_name || "there"},</p><p>Thanks for your order! Your invoice is attached.</p>`,
              attachments: [{ filename: `${invoice.invoice_number}.pdf`, content: pdf }],
            });
          }
        } catch (err) {
          logger.error({ err }, "Failed to generate/send invoice after payment success");
        }
      }
    }

    res.json({ received: true });
  })
);

module.exports = { router, webhookRouter };

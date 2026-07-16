const Stripe = require("stripe");
const env = require("./env");

module.exports = Stripe(env.stripe.secretKey);

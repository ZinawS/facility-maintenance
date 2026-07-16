const nodemailer = require("nodemailer");
const env = require("./env");
const logger = require("./logger");

const transporter =
  env.mailer.email && env.mailer.pass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: env.mailer.email, pass: env.mailer.pass },
      })
    : null;

if (!transporter) {
  logger.warn(
    "NODEMAILER_EMAIL/NODEMAILER_PASS not set — password-reset emails will be logged instead of sent."
  );
}

async function sendMail(options) {
  if (!transporter) {
    logger.info({ to: options.to, subject: options.subject }, "Email not sent (mailer disabled)");
    return;
  }
  await transporter.sendMail({ from: env.mailer.email, ...options });
}

module.exports = { sendMail };

const pino = require("pino");
const { isProduction } = require("./env");

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
  redact: ["req.headers.authorization", "*.password", "*.token"],
});

module.exports = logger;

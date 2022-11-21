import winston from "winston";
import { WinstonTransport as AxiomTransport } from "@axiomhq/axiom-node";

export const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: "shrtlnk" },
  transports: [
    new AxiomTransport({
      dataset: "app-server-logs",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

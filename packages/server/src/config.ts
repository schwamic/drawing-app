import { resolve } from "path";
import envSchema from "env-schema";

const schema = {
  type: "object",
  properties: {
    DATABASE_URL: { type: "string" },
    DISABLED_CORS: { type: "boolean", default: false },
    LOG_LEVEL: { type: "string", default: "info" },
    PORT: { type: "number", default: 8080 },
  },
  required: ["DATABASE_URL"],
  additionalProperties: false,
};

export default envSchema({
  schema,
  dotenv: { path: resolve(process.cwd(), ".env") },
});

import { ApiRouter } from "../../deps.ts";
import config from "../config.ts";
import { hello as helloMiddleware } from "../middlewares/hello.ts";

// Extract name from config
const { name, version } = config;

// Create a new router instance
const hello = new ApiRouter();

// Add routes
hello.all("/", helloMiddleware, async (ctx) => {
  const { logger } = ctx.app.state;

  logger.info("Hello from route");

  ctx.response.body = {
    message: `Hello from ${name}`,
    name,
    version,
  };
});

// Export the router instance
export { hello };

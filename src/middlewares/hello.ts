import { Middleware } from "../../deps.ts";

export const hello: Middleware = async (ctx, next) => {
  const { logger } = ctx.app.state;

  logger.info("Hello from middleware");

  await next();
};

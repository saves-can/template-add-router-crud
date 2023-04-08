import { Context, Middleware, validate, z } from "../../../deps.ts";
import {
  userCreateSchema,
  userUpdateSchema,
  idsSchema,
  pageSchema,
} from "./schema.ts";

// Define middleware to validate that user exists
export const validateUserExist: Middleware = async (
  ctx: Context,
  next: any
) => {
  const { logger, dbClient } = ctx.app.state;
  const { users: usersModel } = dbClient;
  const { uuid, id } = ctx.state.requestData;

  const user = await usersModel.findFirst({
    where: {
      OR: [{ uuid }, { id }],
    },
  });

  const userDoesntExist = !user;
  const isExpected = id || uuid;

  if (userDoesntExist && isExpected) {
    ctx.response.status = 404;
    ctx.response.body = { message: "user doesn't exist", uuid, id };
    logger.debug("[middleware: validateUserExist][user doesn't exist]");
    return;
  }

  ctx.state.user = user;
  logger.debug("[middleware: validateUserExist][user exists]");

  await next();
};

export const validateUserCreate = validate({
  schema: userCreateSchema.strict(),
});

export const validateUserRead = validate({
  schema: z.object({ ...idsSchema, ...pageSchema }),
});

export const validateUserUpdate = validate({
  schema: z
    .object({ ...idsSchema })
    .merge(userUpdateSchema)
    .strip()
    .nullable()
    .refine((data: any) => !!(data.id || data.uuid), {
      message: "Either id or uuid must be provided",
      path: ["id", "uuid"],
    }),
});

export const validateUserDelete = validate({
  schema: z.object({ ...idsSchema }),
});

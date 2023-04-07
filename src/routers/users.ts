import {
  ApiRouter,
  Context,
  Middleware,
  validate,
  z,
} from "../../deps.ts";

// Define middleware to validate that user exists
const validateUserExist: Middleware = async (ctx: Context, next: any) => {
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

// Create a new router instance
const users = new ApiRouter({ prefix: "/users" });

// Define schemas by type
const uuidSchema = z.string().uuid();
const idSchema = z.string().min(12);

// Define schemas for creating and updating a user
const userCreateSchema =  z.object({
  email: z.string().email(),
});

const userUpdateSchema = userCreateSchema.partial()

// Define schemas for ids and pagination
const idsSchema = { id: idSchema.nullish(), uuid: uuidSchema.nullish() };
const pageSchema = {
  page: z.number().positive().nullish(),
  pageSize: z.number().positive().nullish(),
};

// Create route to create a user
users.all(
  "/create",
  validate({
    schema: userCreateSchema.strict(),
  }),
  async (ctx) => {
    const {
      logger,
      dbClient: { users: usersModel },
    } = ctx.app.state;
    const userData = ctx.state.requestData;

    const user = await usersModel.create({ data: userData });

    logger.debug("[route: user create][user created]");
    ctx.response.body = { data: { user } };
  }
);

// Read route to get user by id or uuid, or get all users
users.all(
  "/read",
  validate({
    schema: z.object({ ...idsSchema, ...pageSchema }),
  }),
  validateUserExist,
  async (ctx) => {
    const {
      logger,
      dbClient: { users: usersModel },
    } = ctx.app.state;
    const { requestData, user } = ctx.state;
    const { page = 1, pageSize = 12 } = requestData;
    let users: any[] = [];
    let maxPage = 0;

    if (!user) {
      // If user not requested, get all users
      const skip = (page - 1) * pageSize;
      users = await usersModel.findMany({ skip, take: pageSize });
      maxPage = Math.ceil((await usersModel.count()) / pageSize);
      logger.debug("[route: user read][users read]");
    }

    ctx.response.body = {
      data: { user, users, maxPage },
    };
  }
);

// Update
users.all(
  "/update",
  validate({
    schema: z
      .object({ ...idsSchema  }).merge(userUpdateSchema).strip().nullable()
      .refine((data: any) => !!(data.id || data.uuid), {
        message: "Either id or uuid must be provided",
        path: ["id", "uuid"],
      }),
  }),
  validateUserExist,
  async (ctx) => {
    const {
      logger,
      dbClient: { users: usersModel },
    } = ctx.app.state;
    let { requestData, user } = ctx.state;
    const { id, uuid, ...userData } = requestData;

    user = await usersModel.update({
      where: { id: user.id },
      data: { ...userData },
    });

    logger.debug("[route: user update][users updated]");
    ctx.response.body = { data: { user } };
  }
);

// Delete route
users.all(
  "/delete",
  validate({
    schema: z.object({ ...idsSchema }),
  }),
  validateUserExist,
  async (ctx) => {
    const {
      logger,
      dbClient: { users: usersModel },
    } = ctx.app.state;
    let { user } = ctx.state;

    user = await usersModel.delete({ where: { uuid: user.uuid } });

    logger.debug("[route: user deleted][users deleted]");
    ctx.response.body = { data: { user } };
  }
);

// Export the router instance
export { users };

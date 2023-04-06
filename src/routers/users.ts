import { any } from "https://deno.land/x/zod@v3.21.4/types.ts";
import {
  ApiRouter,
  Context,
  DBClient,
  Middleware,
  validate,
  z,
} from "../../deps.ts";
import config from "../config.ts";
import { logger } from "https://raw.githubusercontent.com/clau-org/api-core/v0.0.7/src/log.ts";

const { users: usersModel } = new DBClient({
  datasources: {
    db: { url: config.PROXY_DB },
  },
});


// Validation Middleware
const userExist = ({ exit = true }: { exit?: boolean } = { }): Middleware => {
  const middleware: Middleware = async (ctx: Context, next: any) => {
    const { uuid, id } = ctx.state.requestData;

    const user = await usersModel.findFirst({
      where: {
        OR: [
          { uuid },
          { id },
        ],
      },
    });

    const userDoesntExist = !user;

    if (userDoesntExist && exit) {
      ctx.response.status = 404;
      ctx.response.body = { message: "User doesn't exists", uuid, id };
      return;
    }

    ctx.state.user = user;

    await next();
  };
  return middleware;
};

// Create a new router instance
const users = new ApiRouter({ prefix: "/users" });

const addNullish = (schema:any) => {
  for (let [key] of Object.entries(schema)) {
    schema[key] = schema[key].nullish()
  }
  return schema
}

const userSchema = {
  email: z.string().email()
}

const idSchema = {
  id: z.string().min(12).nullish(),
  uuid: z.string().min(12).nullish(),
}
const pageSchema = {
  page: z.number().positive().nullish(),
  pageSize: z.number().positive().nullish(),
}

// Read route
users.all(
  "/read",
  validate({
    schema: z.object({
      ...idSchema,
      ...pageSchema,
    }),
  }),
  userExist({exit:false}),
  async (ctx) => {
    const { id, uuid, page = 1, pageSize = 12 } = ctx.state.requestData;

    let { user } = ctx.state;
    let users:any[] = [];
    let maxPage = 0;

    if ((id || uuid) && !user) {
      return ctx.response.body = {
        data: { user },
        message: `not found`,
      };
    }

    if (!user) {
      const skip = (page - 1) * pageSize;

      users = await usersModel.findMany({ skip, take: pageSize }),
      maxPage = Math.ceil((await usersModel.count()) / pageSize);
    }

    ctx.response.body = {
      data: { user, users, maxPage },
    };
  },
);

// Create route
users.all(
  "/create",
  validate({
    schema: z.object({
      ...userSchema,
    }),
  }),
  async (ctx) => {
    const { email } = ctx.state.requestData;

    const user = await usersModel.create({
      data: {
        email,
      },
    });

    ctx.response.body = {
      data: { user },
    };
  },
);

// Update route addNullish
users.all(
  "/update",
  validate({
    schema: z.object({
      ...idSchema,
      ...addNullish(userSchema),
    }).strict().refine(
      (data:any) => {
        let isThereIdOrUuid = !!(data.id || data.uuid);
        return isThereIdOrUuid;
      },
      {
        message: "Either id or uuid must be provided",
        path: ["id", "uuid"],
      },
    ),
  }),
  userExist(),
  async (ctx) => {
    const { id, uuid, ...userData } = ctx.state.requestData;
    let { user } = ctx.state;

    user = await usersModel.update({
      where: { id: user.id },
      data: { ...userData },
    });

    ctx.response.body = {
      data: { user },
    };
  },
);

// Delete route
users.all(
  "/delete",
  validate({
    schema: z.object({
      ...idSchema,
    }),
  }),
  userExist(),
  async (ctx) => {
    let { user } = ctx.state;
    // user = await usersModel.delete({where:{uuid:user.uuid}});
    ctx.response.body = {
      data: { user },
    };
  },
);

// Export the router instance
export { users };

import { Middleware } from "../../../deps.ts";

export const handlerUserCreate: Middleware = async (ctx) => {
  const {
    logger,
    dbClient: { users: usersModel },
  } = ctx.app.state;
  
  const userData = ctx.state.requestData;

  const user = await usersModel.create({ data: userData });

  logger.debug("[route: user create][user created]");
  ctx.response.body = { data: { user } };
};

export const handlerUserRead: Middleware = async (ctx) => {
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
};

export const handlerUserUpdate: Middleware = async (ctx) => {
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
};

export const handlerUserDelete: Middleware = async (ctx) => {
  const {
    logger,
    dbClient: { users: usersModel },
  } = ctx.app.state;
  let { user } = ctx.state;

  user = await usersModel.delete({ where: { uuid: user.uuid } });

  logger.debug("[route: user deleted][users deleted]");
  ctx.response.body = { data: { user } };
};

import { API } from "../deps.ts";
import { hello } from "./routers/hello.ts";
import { users } from "./routers/users.ts";
import config from "./config.ts";

const api = new API({ ...config });

api.addRouter(hello);
api.addRouter(users);

api.setDBUrl({ url: config.PROXY_DB });

export { api };

import { API } from "../deps.ts";
import { hello } from "./routers/hello.ts";
import { users } from "./routers/users.ts";

const api = new API({ name: "users" });

api.addRouter(hello);
api.addRouter(users);

export { api };

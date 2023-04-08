import { ApiRouter } from "../../../deps.ts";

import {
  validateUserExist,
  validateUserCreate,
  validateUserRead,
  validateUserUpdate,
  validateUserDelete,
} from "./middleware.ts";

import {
  handlerUserCreate,
  handlerUserRead,
  handlerUserUpdate,
  handlerUserDelete,
} from "./handler.ts";

// Create a new router instance
const users = new ApiRouter({ prefix: "/users" });

// Create
users.all("/create", validateUserCreate, handlerUserCreate);

// Read
users.all("/read", validateUserRead, validateUserExist, handlerUserRead);

// Update
users.all("/update", validateUserUpdate, validateUserExist, handlerUserUpdate);

// Delete
users.all("/delete", validateUserDelete, validateUserExist, handlerUserDelete);

// Export the router
export { users };

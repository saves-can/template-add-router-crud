import { z } from "../../../deps.ts";

// Define schemas by type
export const uuidSchema = z.string().uuid();
export const idSchema = z.string().min(12);

// Define schemas for creating and updating a user
export const userCreateSchema = z.object({
  email: z.string().email(),
});

export const userUpdateSchema = userCreateSchema.partial();

// Define schemas for ids and pagination
export const idsSchema = { id: idSchema.nullish(), uuid: uuidSchema.nullish() };

export const pageSchema = {
  page: z.number().positive().nullish(),
  pageSize: z.number().positive().nullish(),
};

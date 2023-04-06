import { assertEquals, superoak } from "../../deps_tests.ts";
import { api } from "../../src/api.ts"; // Import the router from the provided code

api.setupApp();

Deno.test("Hello endpoint should work", async () => {
  const request = await superoak(api.app);

  await request
    .post("/")
    .expect(200)
    .expect(({ body }: any) => {
      if (!body.message) {
        throw new Error("Missing Message");
      }
      assertEquals(body.message, "Hello from users");
    });
});

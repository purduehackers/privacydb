import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { initLogger } from "evlog";
import { evlog, type EvlogVariables } from "evlog/hono";
import preferences from "./routes/preferences.ts";

initLogger({ env: { service: "my-api" } });

const app = new Hono<EvlogVariables>();

app.use(evlog());

app.get("/", (c) => c.text("(╭ರ_•́)?"));

app.use("/*", bearerAuth({ token: process.env.API_KEY! }));

app.route("/preferences", preferences);

export default app;

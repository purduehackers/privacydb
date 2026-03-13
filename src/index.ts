import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import preferences from "./routes/preferences.ts";

const app = new Hono();

app.get("/", (c) => c.text("(╭ರ_•́)?"));

app.use("/*", bearerAuth({ token: process.env.API_KEY! }));

app.route("/preferences", preferences);

export default app;

import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import preferences from "./routes/preferences.ts";
import { Mode, Project } from "./enums.ts";
import { DEFAULT_MODE } from "./constants.ts";

const app = new Hono();

app.get("/", (c) =>
  c.json({
    name: "privacydb",
    status: "ok",
    modes: Object.values(Mode),
    default_mode: DEFAULT_MODE,
    projects: Object.values(Project),
  }),
);

app.use("/*", bearerAuth({ token: process.env.API_KEY! }));

app.route("/preferences", preferences);

export default app;

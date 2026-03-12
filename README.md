# privacydb

Privacy preferences API for Purdue Hackers.

## Philosophy

PH is build-in-public, ship-in-public by default. Sharing what we do and building in public has always been a part of PH — we should be building systems to publicize what PH people build. Building in public is really cool and more people should be doing it; part of what PH should be doing is helping people be more comfortable sharing with the broader internet. It's a good talent to foster.

We've had a weird cultural division in the past that kneecapped our ability to share what we do. Not participating in public visibility is a choice, not the standard.

That said, some people have legitimate privacy concerns — and we're not the arbiters of what's a good reason. So we build provisions to opt out where and when possible, while encouraging and helping people build in public. This policy has been incrementally adopted since Commit Overflow, and privacydb expands it into a shared API that any PH project can pull from.

## How it works

Three modes:

| Mode                 | Meaning                                                         |
| -------------------- | --------------------------------------------------------------- |
| `opt_in`             | **Default.** Activity is public.                                |
| `opt_out_privacy`    | Data is collected internally but hidden from public surfaces.   |
| `opt_out_collection` | No data collected at all. Systems must skip this user entirely. |

Each user has one **global mode** that applies everywhere. Projects can have **per-user overrides** that take priority over the global setting.

## Notes for developers

**Why `opt_out_privacy` exists:** if a user opts out of collection, we can't backtrack — their data is gone. `opt_out_privacy` keeps collecting data internally so users can toggle back to public without losing anything. `opt_out_collection` is a hard delete — systems should wipe all existing data for that user when they see this mode.

**Consuming this API:** check a user's mode before collecting or publishing their data. All endpoints except `GET /` require `Authorization: Bearer <API_KEY>`.

| Method   | Route                          | Description                        |
| -------- | ------------------------------ | ---------------------------------- |
| `GET`    | `/preferences/:userId`         | Get global mode + project overrides |
| `PUT`    | `/preferences/:userId`         | Set global mode                    |
| `DELETE` | `/preferences/:userId`         | Reset all preferences              |
| `PUT`    | `/preferences/:userId/:project` | Set a project override             |
| `DELETE` | `/preferences/:userId/:project` | Remove a project override          |

Setting mode to `opt_out_collection` automatically wipes user data from all registered projects.

**Adding a new project:** add it to the `Project` enum in `src/enums.ts` and `PROJECT_CONFIG` in `src/constants.ts` with a wipe URL, then redeploy. The wipe URL is a `POST` endpoint on your project that deletes all stored data for a user — privacydb calls it automatically when a user switches to `opt_out_collection`. Use `:userId` as a placeholder in the URL (e.g., `https://your-project.purduehackers.com/api/privacy/wipe/:userId`). The request includes an `Authorization: Bearer <API_KEY>` header using privacydb's API key, so your project should validate it.

**Running locally:** `bun install`, then `bun run dev`. Needs `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `API_KEY` env vars. Push schema with `bun run db:push`.

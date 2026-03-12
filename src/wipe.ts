import { PROJECT_CONFIG } from "./constants.ts";

export async function wipeUserData(
  userId: string,
): Promise<Record<string, { ok: boolean; error?: string }>> {
  const results = await Promise.all(
    Object.entries(PROJECT_CONFIG).map(async ([project, config]) => {
      const url = config.wipeUrl.replace(":userId", userId);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.API_KEY}` },
        });
        return [project, { ok: res.ok, error: res.ok ? undefined : `${res.status}` }] as const;
      } catch (e) {
        return [project, { ok: false, error: String(e) }] as const;
      }
    }),
  );

  return Object.fromEntries(results);
}

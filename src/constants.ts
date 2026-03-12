import { Mode, Project } from "./enums.ts";

export const DEFAULT_MODE = Mode.OptIn;

export const PROJECT_CONFIG: Record<Project, { wipeUrl: string }> = {
  [Project.CommitOverflow]: {
    wipeUrl: "https://commit-overflow.purduehackers.com/api/privacy/wipe/:userId",
  },
  [Project.Ships]: {
    wipeUrl: "https://ships.purduehackers.com/api/privacy/wipe/:userId",
  },
};

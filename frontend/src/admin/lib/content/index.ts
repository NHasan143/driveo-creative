import { localRepository } from "./local-repository";
import type { ContentRepository } from "./repository";

/**
 * The single place the admin chooses its data source. When the Django API is
 * ready, add an `apiRepository` implementing ContentRepository and switch here.
 */
export const repository: ContentRepository = localRepository;

/** True while content lives only in this browser; the UI says so. */
export const IS_LOCAL_DEMO = true;

export * from "./repository";
export * from "./types";

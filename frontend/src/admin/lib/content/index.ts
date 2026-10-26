import { env } from "@/config/env";
import { apiRepository } from "./api-repository";
import { localRepository } from "./local-repository";
import type { ContentRepository } from "./repository";

/** True while content lives only in this browser (demo mode); the UI says so. */
export const IS_LOCAL_DEMO = env.adminContentSource === "local";

/**
 * The single place the admin chooses its data source, set by
 * NEXT_PUBLIC_ADMIN_CONTENT_SOURCE: the Django API ("api") or this browser ("local").
 */
export const repository: ContentRepository = IS_LOCAL_DEMO ? localRepository : apiRepository;

export * from "./repository";
export * from "./types";

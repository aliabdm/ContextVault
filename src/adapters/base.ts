import type { LLMAdapter, Platform } from "../types";

const adapterRegistry = new Map<Platform, LLMAdapter>();

export function registerAdapter(adapter: LLMAdapter): void {
  if (adapterRegistry.has(adapter.platform)) {
    console.warn(`[LLM Observer] Adapter for ${adapter.platform} already registered, overwriting.`);
  }
  adapterRegistry.set(adapter.platform, adapter);
}

export function getAdapter(platform: Platform): LLMAdapter | undefined {
  return adapterRegistry.get(platform);
}

export function getAdapterForUrl(url: string): LLMAdapter | undefined {
  for (const adapter of adapterRegistry.values()) {
    if (adapter.urlPattern.test(url)) {
      return adapter;
    }
  }
  return undefined;
}

export function getAllAdapters(): LLMAdapter[] {
  return Array.from(adapterRegistry.values());
}

export function clearAdapterRegistry(): void {
  adapterRegistry.clear();
}

export function getPlatformForUrl(url: string): Platform {
  for (const adapter of adapterRegistry.values()) {
    if (adapter.urlPattern.test(url)) {
      return adapter.platform;
    }
  }
  return "generic";
}

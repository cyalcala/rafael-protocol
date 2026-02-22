/**
 * Rafael Context
 * Context assembly and caching layer
 */

import type { User, Organization, App, CommonPath, Session } from '@rafael/types';

/**
 * Context assembler
 * Gathers all context for an agent run
 */
export class ContextAssembler {
  /**
   * Assemble full context for an agent run
   */
  static async assemble(params: {
    userId: string;
    orgId: string;
    appId: string;
  }): Promise<{
    user: User | null;
    org: Organization | null;
    app: App | null;
    knowledge: CommonPath[];
    recentSessions: Session[];
  }> {
    // In production, these would fetch from Supabase/Redis
    const [user, org, app, knowledge, recentSessions] = await Promise.all([
      this.getUser(params.userId),
      this.getOrg(params.orgId),
      this.getApp(params.appId),
      this.getKnowledge(params.appId),
      this.getRecentSessions(params.userId, params.appId)
    ]);

    return { user, org, app, knowledge, recentSessions };
  }

  /**
   * Get user by ID
   */
  private static async getUser(userId: string): Promise<User | null> {
    // TODO: Fetch from Supabase
    console.log(`[Context] Fetching user: ${userId}`);
    return null;
  }

  /**
   * Get organization by ID
   */
  private static async getOrg(orgId: string): Promise<Organization | null> {
    // TODO: Fetch from Supabase
    console.log(`[Context] Fetching org: ${orgId}`);
    return null;
  }

  /**
   * Get app by ID
   */
  private static async getApp(appId: string): Promise<App | null> {
    // TODO: Fetch from Supabase
    console.log(`[Context] Fetching app: ${appId}`);
    return null;
  }

  /**
   * Get knowledge graph paths for app
   */
  private static async getKnowledge(appId: string): Promise<CommonPath[]> {
    // TODO: Fetch from Supabase/Redis
    console.log(`[Context] Fetching knowledge for app: ${appId}`);
    return [];
  }

  /**
   * Get recent sessions for user/app
   */
  private static async getRecentSessions(userId: string, appId: string): Promise<Session[]> {
    // TODO: Fetch from Supabase
    console.log(`[Context] Fetching sessions for user: ${userId}, app: ${appId}`);
    return [];
  }
}

/**
 * Cache wrapper for context
 */
export class ContextCache {
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();
  private ttl: number;

  constructor(ttlMinutes = 10) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export { ContextAssembler, ContextCache };

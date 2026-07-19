/* ==========================================================================
   CacheManager.js
   Two-level guest identity cache:
     Level 1 — in-memory Map (fastest, current tab only)
     Level 2 — sessionStorage (survives soft refresh, same tab session)

   Prevents repeated guests.json fetches on scroll-triggered re-renders
   and on casual page refreshes.
   ========================================================================== */

class CacheManager {
  constructor() {
    this._mem = new Map();
  }

  /**
   * Retrieve a cached guest.
   * Checks memory first, then sessionStorage.
   * @param {string} token
   * @returns {Object|null}
   */
  get(token) {
    // Level 1 — memory
    if (this._mem.has(token)) return this._mem.get(token);

    // Level 2 — sessionStorage
    try {
      const raw = sessionStorage.getItem('inv_g_' + token);
      if (raw) {
        const parsed = JSON.parse(raw);
        this._mem.set(token, parsed); // promote to memory
        return parsed;
      }
    } catch (_) {
      // sessionStorage blocked (private mode, quota) — memory only
    }

    return null;
  }

  /**
   * Store a guest in both cache levels.
   * @param {string} token
   * @param {Object} guest
   */
  set(token, guest) {
    this._mem.set(token, guest);
    try {
      sessionStorage.setItem('inv_g_' + token, JSON.stringify(guest));
    } catch (_) {
      // Quota exceeded or blocked — memory only is fine
    }
  }

  /**
   * Remove a guest from all cache levels (e.g., on status change).
   * @param {string} token
   */
  invalidate(token) {
    this._mem.delete(token);
    try { sessionStorage.removeItem('inv_g_' + token); } catch (_) {}
  }
}

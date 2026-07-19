/* ==========================================================================
   GuestRepository.js
   Single source for reading guest identity from guests.json.

   FUTURE MIGRATION:
     Replace only the class body to switch to Supabase, Firebase, or REST API.
     All callers (InvitationService, admin panel) remain completely unchanged.
   ========================================================================== */

class GuestRepository {
  /**
   * @param {string} dataUrl - Root-relative URL to guests.json
   */
  constructor(dataUrl) {
    this._url = dataUrl || '/data/guests.json';
    this._cache = null; // full list cached for page lifetime
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                           */
  /* ------------------------------------------------------------------ */

  /**
   * Find a single active guest by their unique token.
   * Returns null if not found or inactive.
   * @param {string} token - Base62 22-char token
   * @returns {Promise<Object|null>}
   */
  async getByToken(token) {
    if (!token || typeof token !== 'string') return null;
    const all = await this._loadAll();
    return all.find(g => g.token === token && g.status === 'active') || null;
  }

  /**
   * Return all guests (used by admin panel).
   * @returns {Promise<Object[]>}
   */
  async getAll() {
    return this._loadAll();
  }

  /* ------------------------------------------------------------------ */
  /* Private                                                              */
  /* ------------------------------------------------------------------ */

  async _loadAll() {
    if (this._cache !== null) return this._cache;
    // Cache-bust to prevent stale data after admin updates
    const res = await fetch(this._url + '?_=' + Date.now());
    if (!res.ok) throw new Error('GuestRepository: HTTP ' + res.status + ' — ' + this._url);
    const data = await res.json();
    this._cache = Array.isArray(data) ? data : [];
    return this._cache;
  }
}

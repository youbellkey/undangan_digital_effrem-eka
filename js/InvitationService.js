/* ==========================================================================
   InvitationService.js
   Sole orchestrator for guest-centric invitation rendering.

   Responsibilities:
     1. Extract token from URL pathname  (/invite/<token>)
     2. Validate + load guest via GuestRepository (with CacheManager)
     3. Atomically fill ALL UI injection points
     4. Expose window.__currentGuest as the single source of truth
     5. Handle errors: retry once → redirect to /404.html (never blank)

   SECURITY:
     Guest identity is ONLY determined by the validated token.
     window.__currentGuest is Object.freeze()'d after init — immutable.
     form submissions in script.js read from here, never from user inputs.
   ========================================================================== */

class InvitationService {
  /**
   * @param {GuestRepository} repo
   * @param {CacheManager} cache
   */
  constructor(repo, cache) {
    this._repo  = repo;
    this._cache = cache;
    this._guest = null;
  }

  /** Read-only reference to the loaded guest. Null for generic access. */
  get guest() { return this._guest; }

  /* ------------------------------------------------------------------ */
  /* Public                                                               */
  /* ------------------------------------------------------------------ */

  /**
   * Main entry point. Call once after DOM and scripts are loaded.
   * Safe to call multiple times (idempotent after first successful init).
   */
  async init() {
    const token = this._extractToken();

    // No token in URL → generic invitation view (root access).
    // Leave UI at its default "Tamu Undangan" state.
    if (!token) return;

    // Try cache first (no network call on re-open / soft refresh)
    let guest = this._cache.get(token);

    if (!guest) {
      // Fetch from repository with one automatic retry
      guest = await this._fetchWithRetry(token, 2);
    }

    if (!guest) {
      this._handleNotFound();
      return;
    }

    // Freeze to prevent accidental mutation anywhere in the app
    this._guest = Object.freeze(guest);
    this._cache.set(token, guest);

    this._fillUI(this._guest);
  }

  /* ------------------------------------------------------------------ */
  /* Private                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Extract token from pathname: /invite/<token>
   * Token pattern: Base62, 10–64 characters.
   * @returns {string|null}
   */
  _extractToken() {
    const m = window.location.pathname.match(/\/invite\/([A-Za-z0-9]{10,64})/);
    return m ? m[1] : null;
  }

  /**
   * Inject guest data into every DOM target.
   * All operations are individually guarded — never throws.
   * @param {Object} guest
   */
  _fillUI(guest) {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    // ── Welcome overlay ─────────────────────────────────────────────
    setText('welcome-guest-name', guest.displayName);
    setText('guest-greeting',     'Kepada Yth. ' + guest.displayName);

    // ── RSVP form ────────────────────────────────────────────────────
    setText('rsvpNameDisplay', guest.displayName);
    setVal ('rsvpGuestId',    guest.uuid);

    // ── Guestbook form ───────────────────────────────────────────────
    setText('guestbookNameDisplay', guest.displayName);
    setVal ('guestbookGuestId',    guest.uuid);

    // ── Global reference for script.js form submissions ──────────────
    window.__currentGuest = this._guest;
  }

  /**
   * Fetch guest from repository with automatic retry on network failure.
   * @param {string} token
   * @param {number} maxAttempts
   * @returns {Promise<Object|null>}
   */
  async _fetchWithRetry(token, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const guest = await this._repo.getByToken(token);
        if (guest) return guest;
        // Token not found in data → no point retrying
        return null;
      } catch (err) {
        console.warn('[InvitationService] Attempt', i + 1, 'failed —', err.message);
        if (i < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 600));
        }
      }
    }
    return null;
  }

  /** Redirect to the elegant 404 page. Never leaves the user on a blank screen. */
  _handleNotFound() {
    const from = encodeURIComponent(window.location.pathname);
    window.location.replace('/404.html?from=' + from);
  }
}

/* ==========================================================================
   InvitationService.js
   Sole orchestrator for guest-centric invitation rendering via Apps Script.

   Responsibilities:
     1. Extract token from URL pathname (/invite/<token>)
     2. Fetch guest identity via Apps Script REST API
     3. Manage local session cache to prevent duplicated visit counts
     4. Atomically fill ALL UI injection points
     5. Handle errors resiliently (keep UI alive if API fails)
   ========================================================================== */

class InvitationService {
  constructor(apiUrl) {
    this._apiUrl = apiUrl;
    this._guest = null;
  }

  get guest() { return this._guest; }

  async init() {
    const token = this._extractToken();

    // No token in URL → generic invitation view
    if (!token) return;

    // Use sessionStorage to prevent re-fetching and spamming visitCount on the same session
    const cacheKey = 'guest_data_' + token;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        this._guest = Object.freeze(JSON.parse(cachedData));
        this._fillUI(this._guest);
        return;
      } catch (e) {
        console.warn('Cache corrupted', e);
      }
    }

    // Determine if we should increment visit count
    const visitKey = 'visited_' + token;
    const hasVisited = sessionStorage.getItem(visitKey);
    const visitParam = hasVisited ? '' : '&visit=1';

    try {
      const response = await fetch(`${this._apiUrl}?action=getGuest&token=${token}${visitParam}`);
      if (!response.ok) throw new Error('Network error');
      
      const json = await response.json();
      if (!json.success || !json.data) {
        this._handleNotFound();
        return;
      }

      this._guest = Object.freeze(json.data);
      
      // Cache for session
      sessionStorage.setItem(cacheKey, JSON.stringify(this._guest));
      sessionStorage.setItem(visitKey, 'true');

      this._fillUI(this._guest);

    } catch (err) {
      console.warn('[InvitationService] API Error:', err.message);
      // Resilient UI: Do NOT redirect to 404 on API failure.
      // Leave the UI intact so the invitation still functions aesthetically.
    }
  }

  _extractToken() {
    const m = window.location.pathname.match(/\/invite\/([A-Za-z0-9]{10,64})/);
    return m ? m[1] : null;
  }

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
    setText('guest-greeting', 'Kepada Yth. ' + guest.displayName);

    // ── RSVP form ────────────────────────────────────────────────────
    setText('rsvpNameDisplay', guest.displayName);
    setVal('rsvpGuestId', guest.uuid);

    // ── Guestbook form ───────────────────────────────────────────────
    setText('guestbookNameDisplay', guest.displayName);
    setVal('guestbookGuestId', guest.uuid);

    // ── Global reference for script.js form submissions ──────────────
    window.__currentGuest = this._guest;
  }

  _handleNotFound() {
    const from = encodeURIComponent(window.location.pathname);
    window.location.replace('/404.html?from=' + from);
  }
}

/**
 * UNDANGAN DIGITAL EFFREM & EKA - GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * 
 * PETUNJUK INSTALASI:
 * 1. Buat Google Spreadsheet baru.
 * 2. Buat 4 Sheet dengan nama persis: 
 *    - Guests
 *    - RSVP
 *    - Guestbook
 *    - Sessions
 * 3. Buka menu Extensions > Apps Script.
 * 4. Paste seluruh kode ini ke dalam Code.gs, timpa kode yang ada.
 * 5. Ganti ADMIN_PASSWORD dengan password yang Anda inginkan.
 * 6. Klik Deploy > New Deployment.
 * 7. Pilih type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 8. Klik Deploy, lalu copy URL Web App yang dihasilkan.
 * 9. Masukkan URL tersebut ke dalam file js/config.js di project undangan.
 */

const ADMIN_PASSWORD = "effremeka2026"; // Ganti jika diperlukan

// Utility: Response JSON yang konsisten
function jsonResponse(success, message, data = null) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success,
    message: message,
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

// Utility: Setup Header Kolom jika kosong
function initHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const guestsSheet = ss.getSheetByName('Guests');
  if (guestsSheet && guestsSheet.getLastRow() === 0) {
    guestsSheet.appendRow(['uuid', 'token', 'displayName', 'status', 'visitCount', 'lastVisit', 'createdAt', 'updatedAt']);
  }
  
  const rsvpSheet = ss.getSheetByName('RSVP');
  if (rsvpSheet && rsvpSheet.getLastRow() === 0) {
    rsvpSheet.appendRow(['uuid', 'guestUuid', 'displayName', 'attendance', 'guestCount', 'timestamp']);
  }
  
  const guestbookSheet = ss.getSheetByName('Guestbook');
  if (guestbookSheet && guestbookSheet.getLastRow() === 0) {
    guestbookSheet.appendRow(['uuid', 'guestUuid', 'displayName', 'message', 'status', 'timestamp']);
  }

  const sessionsSheet = ss.getSheetByName('Sessions');
  if (sessionsSheet && sessionsSheet.getLastRow() === 0) {
    sessionsSheet.appendRow(['sessionId', 'timestamp']);
  }
}

// Helper: Get Sheet Data as Array of Objects
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rowObj._rowIndex = i + 1; // Simpan nomor baris untuk update/delete
    rows.push(rowObj);
  }
  return rows;
}

// Helper: Validasi Admin Session
function isValidAdmin(sessionId) {
  if (!sessionId) return false;
  const sessions = getSheetData('Sessions');
  const now = new Date().getTime();
  for (let s of sessions) {
    if (s.sessionId === sessionId) {
      // Session valid selama 24 jam (86400000 ms)
      const sessionTime = new Date(s.timestamp).getTime();
      if (now - sessionTime < 86400000) {
        return true;
      }
    }
  }
  return false;
}

// ============================================================================
// METHOD: GET
// ============================================================================
function doGet(e) {
  initHeaders();
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getGuest':
        return handleGetGuest(e);
      case 'listGuests':
        return handleListGuests(e);
      case 'getSettings':
        return handleGetSettings(e);
      case 'getGuestbook':
        return handleGetGuestbook(e);
      default:
        return jsonResponse(false, 'Action not found');
    }
  } catch (error) {
    return jsonResponse(false, 'Server error: ' + error.message);
  }
}

// ============================================================================
// METHOD: POST
// ============================================================================
function doPost(e) {
  initHeaders();
  
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonResponse(false, 'Invalid JSON body');
  }

  const action = body.action || e.parameter.action;
  
  try {
    switch (action) {
      case 'adminLogin':
        return handleAdminLogin(body);
      case 'createGuest':
        if (!isValidAdmin(body.session)) return jsonResponse(false, 'Unauthorized');
        return handleCreateGuest(body);
      case 'getRSVP':
        if (!isValidAdmin(body.session)) return jsonResponse(false, 'Unauthorized');
        return handleGetRSVP(body);
      case 'updateGuest':
        if (!isValidAdmin(body.session)) return jsonResponse(false, 'Unauthorized');
        return handleUpdateGuest(body);
      case 'deleteGuest':
        if (!isValidAdmin(body.session)) return jsonResponse(false, 'Unauthorized');
        return handleDeleteGuest(body);
      case 'submitRSVP':
        return handleSubmitRSVP(body);
      case 'submitGuestbook':
        return handleSubmitGuestbook(body);
      case 'deleteMessage':
        return handleDeleteMessage(body);
      default:
        return jsonResponse(false, 'Action not found');
    }
  } catch (error) {
    return jsonResponse(false, 'Server error: ' + error.message);
  }
}

// ============================================================================
// HANDLERS (GET)
// ============================================================================

function handleGetGuest(e) {
  const token = e.parameter.token;
  if (!token) return jsonResponse(false, 'Token is required');
  
  const guests = getSheetData('Guests');
  const guest = guests.find(g => g.token === token && g.status === 'active');
  
  if (!guest) return jsonResponse(false, 'Guest not found or inactive');
  
  // Increment visitCount jika ada parameter visit=1
  if (e.parameter.visit === '1') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
    const newCount = (parseInt(guest.visitCount) || 0) + 1;
    const now = new Date().toISOString();
    
    // Asumsi urutan kolom: uuid(A), token(B), displayName(C), status(D), visitCount(E), lastVisit(F)
    sheet.getRange(guest._rowIndex, 5).setValue(newCount);
    sheet.getRange(guest._rowIndex, 6).setValue(now);
  }
  
  // Jangan kembalikan _rowIndex ke client
  delete guest._rowIndex;
  return jsonResponse(true, 'Guest found', guest);
}

function handleListGuests(e) {
  if (!isValidAdmin(e.parameter.session)) {
    return jsonResponse(false, 'Unauthorized');
  }
  
  const guests = getSheetData('Guests');
  const cleanGuests = guests.map(g => {
    delete g._rowIndex;
    return g;
  });
  return jsonResponse(true, 'Guests loaded', cleanGuests);
}

function handleGetSettings(e) {
  // Optional endpoint (Mungkin berguna untuk masa depan)
  return jsonResponse(true, 'Settings loaded', {
    bride: "Eka",
    groom: "Effrem",
    date: "25 Juli 2026",
    location: "Gereja Katedral"
  });
}

function handleGetGuestbook(e) {
  const messages = getSheetData('Guestbook');
  // Return hanya yang statusnya bukan deleted
  const activeMessages = messages.filter(m => m.status !== 'deleted').map(m => {
    return {
      id: m.uuid,
      authorId: m.guestUuid,
      name: m.displayName,
      message: m.message,
      timestamp: m.timestamp
    };
  });
  return jsonResponse(true, 'Messages loaded', activeMessages);
}


// ============================================================================
// HANDLERS (POST)
// ============================================================================

function handleAdminLogin(body) {
  if (body.password === ADMIN_PASSWORD) {
    const sessionId = Utilities.getUuid();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sessions');
    sheet.appendRow([sessionId, new Date().toISOString()]);
    return jsonResponse(true, 'Login success', { session: sessionId });
  }
  return jsonResponse(false, 'Invalid password');
}

function handleCreateGuest(body) {
  if (!isValidAdmin(body.session)) return jsonResponse(false, 'Unauthorized');
  
  const displayName = body.displayName;
  if (!displayName) return jsonResponse(false, 'Name is required');
  
  const uuid = Utilities.getUuid();
  // Generate random token yang rapi (16 char alphanumeric)
  const rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, Utilities.getUuid() + new Date().getTime().toString());
  const token = rawBytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('').substring(0, 16);
  
  const now = new Date().toISOString();
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
  sheet.appendRow([uuid, token, displayName, 'active', 0, '', now, now]);
  
  return jsonResponse(true, 'Guest created', { uuid: uuid, token: token, displayName: displayName });
}

function handleUpdateGuest(body) {
  if (!isValidAdmin(body.session)) return jsonResponse(false, 'Unauthorized');
  
  const { uuid, displayName, status } = body;
  if (!uuid) return jsonResponse(false, 'UUID is required');
  
  const guests = getSheetData('Guests');
  const guest = guests.find(g => g.uuid === uuid);
  
  if (!guest) return jsonResponse(false, 'Guest not found');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
  const now = new Date().toISOString();
  
  // Update name
  if (displayName) sheet.getRange(guest._rowIndex, 3).setValue(displayName);
  // Update status (soft delete: status = 'inactive')
  if (status) sheet.getRange(guest._rowIndex, 4).setValue(status);
  // Update updatedAt
  sheet.getRange(guest._rowIndex, 8).setValue(now);
  
  return jsonResponse(true, 'Guest updated');
}

function handleDeleteGuest(body) {
  const { uuid } = body;
  if (!uuid) return jsonResponse(false, 'UUID is required');
  
  const guests = getSheetData('Guests');
  const guest = guests.find(g => g.uuid === uuid);
  
  if (!guest) return jsonResponse(false, 'Guest not found');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
  sheet.deleteRow(guest._rowIndex);
  
  return jsonResponse(true, 'Guest deleted');
}

function handleSubmitRSVP(body) {
  const { guestUuid, attendance, guestCount } = body;
  if (!guestUuid) return jsonResponse(false, 'Guest UUID is required');
  
  // Validasi di server: ambil nama dari tabel Guests
  const guests = getSheetData('Guests');
  const guest = guests.find(g => g.uuid === guestUuid && g.status === 'active');
  
  if (!guest) return jsonResponse(false, 'Invalid guest identity');
  
  const uuid = Utilities.getUuid();
  const now = new Date().toISOString();
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  sheet.appendRow([uuid, guestUuid, guest.displayName, attendance, guestCount || 0, now]);
  
  return jsonResponse(true, 'RSVP saved');
}

function handleGetRSVP(body) {
  const rsvp = getSheetData('RSVP');
  const guests = getSheetData('Guests');
  
  const result = rsvp.map(r => {
    const guest = guests.find(g => g.uuid === r.guestUuid);
    return {
      name: guest ? guest.displayName : 'Unknown',
      status: r.attendance,
      count: r.guestCount,
      timestamp: r.timestamp
    };
  });
  
  return jsonResponse(true, 'Success', result);
}

function handleSubmitGuestbook(body) {
  const { guestUuid, message } = body;
  if (!guestUuid || !message) return jsonResponse(false, 'Guest UUID and message are required');
  
  // Validasi identitas
  const guests = getSheetData('Guests');
  const guest = guests.find(g => g.uuid === guestUuid && g.status === 'active');
  
  if (!guest) return jsonResponse(false, 'Invalid guest identity');
  
  const uuid = Utilities.getUuid();
  const now = new Date().toISOString();
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guestbook');
  sheet.appendRow([uuid, guestUuid, guest.displayName, message, 'active', now]);
  
  return jsonResponse(true, 'Message saved');
}

function handleDeleteMessage(body) {
  const { messageId, guestUuid, session } = body;
  if (!messageId) return jsonResponse(false, 'Message ID is required');
  
  const messages = getSheetData('Guestbook');
  const msg = messages.find(m => m.uuid === messageId);
  if (!msg) return jsonResponse(false, 'Message not found');
  
  // Cek otorisasi: Admin ATAU pemilik pesan
  const isAdmin = isValidAdmin(session);
  const isOwner = (msg.guestUuid === guestUuid);
  
  if (!isAdmin && !isOwner) {
    return jsonResponse(false, 'Unauthorized to delete this message');
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guestbook');
  // Soft delete: set status to 'deleted' (kolom ke-5)
  sheet.getRange(msg._rowIndex, 5).setValue('deleted');
  
  return jsonResponse(true, 'Message deleted');
}

// Untuk melayani CORS preflight (OPTIONS)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
}

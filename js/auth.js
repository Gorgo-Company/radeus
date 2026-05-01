/* RADEUS — Operator auth. Reads RAD_* globals from supabase-config.js. */
(function() {
  const SK = window.RAD_SESSION_KEY;
  const TK = window.RAD_STAFF_KEY;
  const URL = window.RAD_SUPA_URL;
  const KEY = window.RAD_SUPA_KEY;

  function getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SK) || 'null');
      if (!s) return null;
      if (s.expires_at && Date.now()/1000 > s.expires_at) {
        localStorage.removeItem(SK); return null;
      }
      return s;
    } catch { return null; }
  }
  function getStoredStaff() {
    try { const r = localStorage.getItem(TK); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function signOut() {
    const s = getSession();
    if (s?.access_token) {
      fetch(`${URL}/auth/v1/logout`, {
        method:'POST',
        headers:{'apikey':KEY,'Authorization':`Bearer ${s.access_token}`}
      }).catch(()=>{});
    }
    localStorage.removeItem(SK);
    localStorage.removeItem(TK);
    window.location.href = 'login.html';
  }

  window.radGetSession = getSession;
  window.radGetStoredStaff = getStoredStaff;
  window.radSignOut = signOut;

  const s = getSession();
  if (!s) { window.location.href = 'login.html'; return; }
  const staff = getStoredStaff();
  if (!staff) { window.location.href = 'login.html'; return; }

  const orgId = staff.org_id || '00000000-0000-0000-0000-000000000001';

  /*
   * CRITICAL: each operator page declares `let ORG_ID = null;` at the top of
   * its inline page-logic script and reads `ORG_ID` (NOT `window.ORG_ID`) inside
   * loadCycles/loadDashboard/etc. Because auth.js and inline page scripts share
   * the document's script-level lexical environment, a bare assignment hits that
   * `let` binding directly. Pages that use `const ORG_ID = '...'` (command/index/
   * comms/payments/readings/reports/system) will throw on the bare assignment —
   * the try/catch silently absorbs it because their hardcoded const is already
   * the right value.
   */
  window.ORG_ID = orgId;
  window.STAFF  = staff;
  try { ORG_ID = orgId; } catch (e) { /* page used const ORG_ID — already set */ }

  function wireUi() {
    const el = document.getElementById('operatorName');
    if (el) el.textContent = staff.name || 'OPERATOR';
    const lb = document.getElementById('logoutBtn');
    if (lb && !lb._radWired) { lb.addEventListener('click', signOut); lb._radWired = true; }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireUi);
  } else {
    wireUi();
  }
})();

/* Live clock */
(function() {
  function tick() {
    const el = document.getElementById('clock');
    if (el) el.textContent = new Date().toTimeString().slice(0, 8);
  }
  setInterval(tick, 1000);
  tick();
})();
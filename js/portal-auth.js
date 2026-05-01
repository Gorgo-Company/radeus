/* RADEUS — Customer portal auth helpers. Uses RAD_* namespace. */
(function() {
  const SK = window.RAD_PORTAL_SESSION_KEY;
  const CK = window.RAD_PORTAL_CUSTOMER_KEY;
  const URL = window.RAD_SUPA_URL;
  const KEY = window.RAD_SUPA_KEY;

  function getPortalSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SK) || 'null');
      if (!s) return null;
      if (s.expires_at && Date.now()/1000 > s.expires_at) {
        localStorage.removeItem(SK); return null;
      }
      return s;
    } catch { return null; }
  }
  function getStoredCustomer() {
    try { const r = localStorage.getItem(CK); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function portalSignOut() {
    const s = getPortalSession();
    if (s?.access_token) {
      fetch(`${URL}/auth/v1/logout`, {
        method:'POST',
        headers:{'apikey':KEY,'Authorization':`Bearer ${s.access_token}`}
      }).catch(()=>{});
    }
    localStorage.removeItem(SK);
    localStorage.removeItem(CK);
    window.location.reload();
  }

  window.radGetPortalSession = getPortalSession;
  window.radGetStoredCustomer = getStoredCustomer;
  window.radPortalSignOut = portalSignOut;
})();

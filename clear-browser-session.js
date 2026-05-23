/**
 * DEVELOPMENT ENVIRONMENT SESSION CLEANER SCRIPT
 * 
 * This script is designed to clear all client-side session data, cookies, local storage, 
 * session storage, and securely close the active Firebase authentication session.
 * 
 * DIRECTIONS (Option A: Copy & Paste in Browser Console):
 * 1. Open your development environment URL in your browser.
 * 2. Press F12 or Right Click -> "Inspect" to open developer tools.
 * 3. Copy the script block below and paste it directly into the Console, then press Enter.
 * 4. The page will reload in a fully authenticated guest/clean state.
 * 
 * DIRECTIONS (Option B: Run via Browser URL):
 * Alternatively, you can navigate directly to the dedicated clean-up route:
 * https://<YOUR-DEV-URL>/clear-session
 */

(async function clearSession() {
  console.log("🧹 Initializing full development session wipe...");

  // 1. Clear LocalStorage and SessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ LocalStorage and SessionStorage cleared successfully.");
  } catch (err) {
    console.warn("⚠️ LocalStorage/SessionStorage clear failed:", err);
  }

  // 2. Clear All Cookies (for current host and parent domains)
  try {
    const cookies = document.cookie.split(";");
    let clearedCount = 0;
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Expire the cookie by setting max-age and past expiration date
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      
      // Also clear parent base domains if applicable
      const domainParts = window.location.hostname.split('.');
      while (domainParts.length > 1) {
        const parentDomain = domainParts.join('.');
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${parentDomain}`;
        domainParts.shift();
      }
      clearedCount++;
    }
    console.log(`✅ Cleared ${clearedCount} active cookies from the domain context.`);
  } catch (err) {
    console.warn("⚠️ Cookie clear failed:", err);
  }

  // 3. Clear Firebase Client-Side Authenticators
  try {
    // Attempt to locate initialized Firebase App inside window context
    const firebase = window.firebase || window.firebaseApp;
    if (firebase && firebase.auth) {
      const auth = firebase.auth();
      if (auth && typeof auth.signOut === 'function') {
        await auth.signOut();
        console.log("✅ Firebase Auth signed out successfully.");
      }
    } else {
      // Direct IndexDB and Cache clean as fallback for Google Firebase auth tokens
      const dbs = ['firebase-heartbeat-database', 'firebaseLocalStorageDb'];
      for (const dbName of dbs) {
        try {
          const req = indexedDB.deleteDatabase(dbName);
          req.onsuccess = () => console.log(`✅ Cleared storage table: ${dbName}`);
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn("⚠️ Firebase Auth client trace clear error:", err);
  }

  // 4. Force state reset via URL Reload
  console.log("✨ All sessions cleared! Reloading page to apply clean slate...");
  setTimeout(() => {
    window.location.href = window.location.origin + '/';
  }, 1000);
})();

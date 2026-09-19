import { setDoc, deleteDoc, DocumentReference, SetOptions } from 'firebase/firestore';

const QUOTA_STORAGE_KEY = 'bseb_firestore_quota_exhausted';

// Initialize from localStorage if marked recently (within 24 hours)
let quotaExceededState = (() => {
  try {
    const saved = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const elapsed = Date.now() - (parsed.exceededAt || 0);
      // Quotas reset daily (24h)
      if (elapsed < 24 * 60 * 60 * 1000) {
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    }
  } catch {}
  return false;
})();

export function isFirestoreQuotaExceeded(): boolean {
  if (quotaExceededState) return true;
  try {
    const saved = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const elapsed = Date.now() - (parsed.exceededAt || 0);
      if (elapsed < 24 * 60 * 60 * 1000) {
        quotaExceededState = true;
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
        quotaExceededState = false;
      }
    }
  } catch {}
  return false;
}

export function setFirestoreQuotaExceeded(val: boolean) {
  quotaExceededState = val;
  try {
    if (val) {
      localStorage.setItem(
        QUOTA_STORAGE_KEY,
        JSON.stringify({
          exceededAt: Date.now(),
          date: new Date().toISOString()
        })
      );
    } else {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  } catch {}
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = err.code || '';
  const msg = err.message || String(err);
  return (
    code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('Free daily write units') ||
    msg.includes('Quota exceeded')
  );
}

export async function safeSetDoc<T = any>(
  reference: DocumentReference<T>,
  data: any,
  options?: SetOptions,
  timeoutMs: number = 2500
): Promise<boolean> {
  // If quota is already exceeded, SKIP network write completely
  // to avoid resource-exhausted exceptions and Firestore backoff delay loops
  if (isFirestoreQuotaExceeded()) {
    console.warn("Firestore write skipped: Daily write quota reached (20,000/day). Saved to local cache.");
    return false;
  }

  try {
    const writePromise = options ? setDoc(reference, data, options) : setDoc(reference, data);
    const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));

    const result = await Promise.race([writePromise, timeoutPromise]);
    if (result === 'timeout') {
      console.warn("Firestore write timed out. Safely continuing with local data.");
      return false;
    }
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      console.warn("Firestore daily write quota reached (20,000 free writes/day). The app continues in local-offline mode.");
      return false;
    }
    console.warn("Firestore write notice:", err?.message || String(err));
    return false;
  }
}

export async function safeDeleteDoc<T = any>(
  reference: DocumentReference<T>,
  timeoutMs: number = 2500
): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) {
    console.warn("Firestore delete skipped: Daily quota reached. Data updated locally.");
    return false;
  }

  try {
    const delPromise = deleteDoc(reference);
    const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));

    const result = await Promise.race([delPromise, timeoutPromise]);
    if (result === 'timeout') {
      console.warn("Firestore delete timed out. Safely continuing.");
      return false;
    }
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      console.warn("Firestore daily write/delete quota reached. Continuing in local-offline mode.");
      return false;
    }
    console.warn("Firestore delete notice:", err?.message || String(err));
    return false;
  }
}


import { setDoc, deleteDoc, DocumentReference, SetOptions } from 'firebase/firestore';

let quotaExceededState = false;

export function isFirestoreQuotaExceeded(): boolean {
  return quotaExceededState;
}

export function setFirestoreQuotaExceeded(val: boolean) {
  quotaExceededState = val;
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = err.code || '';
  const msg = err.message || String(err);
  return (
    code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('Free daily write units')
  );
}

export async function safeSetDoc<T = any>(
  reference: DocumentReference<T>,
  data: any,
  options?: SetOptions,
  timeoutMs: number = 3000
): Promise<boolean> {
  if (quotaExceededState) {
    console.warn("Firestore write skipped: Daily write quota currently reached. Local cache is active.");
    return false;
  }
  try {
    const writePromise = options ? setDoc(reference, data, options) : setDoc(reference, data);
    const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));

    const result = await Promise.race([writePromise, timeoutPromise]);
    if (result === 'timeout') {
      console.warn("Firestore write timed out (quota limit or network delay). Safely continuing.");
      return false;
    }
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      quotaExceededState = true;
      console.warn("Firestore daily write quota reached (20,000 free writes/day). The app continues in local-offline cache mode.");
      return false;
    }
    console.warn("Firestore write notice:", err?.message || String(err));
    return false;
  }
}

export async function safeDeleteDoc<T = any>(
  reference: DocumentReference<T>,
  timeoutMs: number = 3000
): Promise<boolean> {
  if (quotaExceededState) {
    console.warn("Firestore delete skipped: Daily quota reached. Local cache is active.");
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
      quotaExceededState = true;
      console.warn("Firestore daily write/delete quota reached. Continuing in local-offline cache mode.");
      return false;
    }
    console.warn("Firestore delete notice:", err?.message || String(err));
    return false;
  }
}

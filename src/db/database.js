const DB_NAME = 'gamified-planner-local';
const VERSION = 1;

// Store names intentionally mirror the portable planner data model. Catalogues are
// local records too, so an exported database can be restored without a server.
export const STORE_NAMES = ['profiles', 'tasks', 'recurring_tasks', 'xp_transactions', 'activity_days', 'pomodoro_sessions', 'daily_goals', 'achievements', 'user_achievements', 'shop_items', 'user_inventory', 'postcards', 'user_postcards', 'themes', 'daily_rewards', 'settings'];

let opening;
export function openDatabase() {
  if (opening) return opening;
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB is unavailable. This browser cannot safely store planner data.'));
  opening = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORE_NAMES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open the local planner database.'));
    request.onblocked = () => reject(new Error('Close other planner tabs to finish upgrading local data.'));
  });
  return opening;
}

export async function readAll(store) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => { const r = db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
}
export async function read(store, id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => { const r = db.transaction(store).objectStore(store).get(id); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
}
export async function write(store, value) { await transaction([store], 'readwrite', ({ [store]: s }) => s.put(value)); return value; }
export async function remove(store, id) { await transaction([store], 'readwrite', ({ [store]: s }) => s.delete(id)); }
export async function transaction(stores, mode, work) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let result; let failed = false;
    tx.oncomplete = () => failed ? undefined : resolve(result);
    tx.onerror = () => reject(tx.error || new Error('Local write failed. Your existing data was not changed.'));
    tx.onabort = () => reject(tx.error || new Error('Local write was cancelled.'));
    try { result = work(Object.fromEntries(stores.map((name) => [name, tx.objectStore(name)])), tx); } catch (error) { failed = true; tx.abort(); reject(error); }
  });
}
export async function replaceAll(snapshot) {
  await transaction(STORE_NAMES, 'readwrite', (stores) => {
    STORE_NAMES.forEach((name) => { stores[name].clear(); (snapshot[name] || []).forEach((record) => stores[name].put(record)); });
  });
}

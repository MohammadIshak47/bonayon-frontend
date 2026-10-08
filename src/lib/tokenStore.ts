import { storage } from './storage';

const KEY = 'bonayon_token'; // per the API contract
export const tokenStore = { get: () => storage.get(KEY), set: (t: string) => storage.set(KEY, t), clear: () => storage.remove(KEY) };

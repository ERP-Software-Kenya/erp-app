export const authStorage = {
  getString: (key: string): string | undefined => localStorage.getItem(key) ?? undefined,
  set: (key: string, value: string): void => { localStorage.setItem(key, value); },
  delete: (key: string): void => { localStorage.removeItem(key); },
};

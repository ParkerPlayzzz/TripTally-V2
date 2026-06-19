const isDev = typeof import.meta !== 'undefined' ? Boolean(import.meta.env?.DEV) : false;

export const debug = (...args: any[]) => {
  if (isDev) console.debug(...args);
};

export const info = (...args: any[]) => {
  if (isDev) console.info(...args);
};

export const warn = (...args: any[]) => {
  if (isDev) console.warn(...args);
};

export const error = (...args: any[]) => {
  console.error(...args);
};

export default { debug, info, warn, error };

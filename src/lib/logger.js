const isDev = typeof import.meta !== 'undefined' ? Boolean(import.meta.env?.DEV) : false;

const debug = (...args) => {
  if (isDev) console.debug(...args);
};

const info = (...args) => {
  if (isDev) console.info(...args);
};

const warn = (...args) => {
  if (isDev) console.warn(...args);
};

const error = (...args) => {
  console.error(...args);
};

export default {
  debug,
  info,
  warn,
  error,
};

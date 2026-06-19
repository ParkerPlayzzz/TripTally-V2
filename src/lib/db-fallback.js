const DEFAULT_DB = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    loginViaEmailPassword: async () => { throw new Error('Auth backend unavailable'); },
    loginWithProvider: async () => {},
  },
  entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }),
  integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } },
};

const db = globalThis.__B44_DB__ || DEFAULT_DB;

export default db;

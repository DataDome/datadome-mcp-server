export interface Config {
  api: {
    base: string;
    key: string;
  };
}

export function loadConfig(): Config {
  const required = ['DD_MGMT_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    api: {
      base: 'https://customer-api.datadome.co',
      key: process.env.DD_MGMT_KEY!
    }
  };
}

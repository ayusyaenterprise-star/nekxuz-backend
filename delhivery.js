const axios = require('axios');

// prefer explicit env, fall back to Delhivery One console base
const BASE = process.env.DELHIVERY_BASE_URL || 'https://one.delhivery.com';
const UMS_URL = process.env.DELHIVERY_UMS_URL || 'https://ltl-clients-api-dev.delhivery.com/ums/login';
const USERNAME = process.env.DELHIVERY_USERNAME || process.env.DELHIVERY_USER;
const PASSWORD = process.env.DELHIVERY_PASSWORD;
const DEBUG = process.env.DELHIVERY_DEBUG === 'true';

let cachedToken = null;
let tokenObtainedAt = 0;
const TOKEN_TTL_MS = (process.env.DELHIVERY_TOKEN_TTL_SEC ? parseInt(process.env.DELHIVERY_TOKEN_TTL_SEC) : 3600) * 1000;

const client = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

async function loginUMS() {
  if (!USERNAME || !PASSWORD) {
    throw new Error('DELHIVERY_USERNAME / DELHIVERY_PASSWORD not configured');
  }
  try {
    if (DEBUG) console.log('[delhivery] logging in to UMS', UMS_URL, USERNAME);
    const resp = await axios.post(UMS_URL, { username: USERNAME, password: PASSWORD }, { timeout: 10000 });
    const data = resp.data || {};
    // try common fields for token
    const token = data.token || data.auth_token || data.access_token || data.data?.token || data.data?.access_token;
    if (!token) {
      if (DEBUG) console.warn('[delhivery] UMS login response', data);
      throw new Error('Delhivery UMS login succeeded but no token found in response');
    }
    cachedToken = token;
    tokenObtainedAt = Date.now();
    return token;
  } catch (err) {
    const details = err.response?.data || err.message || String(err);
    if (DEBUG) console.error('[delhivery] UMS login failed', details);
    const e = new Error('Delhivery UMS login failed');
    e.details = details;
    throw e;
  }
}

async function getToken() {
  if (cachedToken && (Date.now() - tokenObtainedAt) < TOKEN_TTL_MS) return cachedToken;
  return await loginUMS();
}

/**
 * Proxy a request to Delhivery.
 * opts: { method='get', path='/', params={}, data={}, headers={} }
 */
async function proxy({ method = 'get', path = '/', params = {}, data = {}, headers: extraHeaders = {} }) {
  if (!path) throw new Error('path is required');
  const m = method.toLowerCase();

  const apiKey = process.env.DELHIVERY_API_KEY;
  const authSchemes = [];

  if (apiKey) {
    authSchemes.push({ header: `Token ${apiKey}`, label: 'Token <key>' });
    authSchemes.push({ header: `Bearer ${apiKey}`, label: 'Bearer <key>' });
    authSchemes.push({ header: `${apiKey}`, label: 'Raw <key>' });
  }

  authSchemes.push({ headerGetter: async () => `Token ${await getToken()}`, label: 'ums_token' });

  let lastErr = null;
  for (const scheme of authSchemes) {
    try {
      // MERGE extraHeaders with the Authorization header
      const headers = { ...extraHeaders };
      if (scheme.header) headers.Authorization = scheme.header;
      else if (scheme.headerGetter) headers.Authorization = await scheme.headerGetter();
      
      const resp = await client.request({ 
        url: path, 
        method: m, 
        params, 
        data, 
        headers 
      });
      return resp.data;
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      if (status && status >= 400 && status < 500 && status !== 401 && status !== 403) throw err;
    }
  }

  const e = new Error('Delhivery proxy failed');
  e.details = lastErr?.response?.data || lastErr?.message;
  throw e;
}

module.exports = { proxy, getToken, loginUMS };
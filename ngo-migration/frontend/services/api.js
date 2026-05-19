// src/services/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken  = ()  => localStorage.getItem('ngo_token');
export const setToken  = (t) => localStorage.setItem('ngo_token', t);
export const removeToken = () => localStorage.removeItem('ngo_token');

// ─── snake_case → camelCase normalizer ───────────────────────────────────────
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function normalize(obj) {
  if (Array.isArray(obj)) return obj.map(normalize);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), normalize(v)])
    );
  }
  return obj;
}

// ─── Core fetch helpers ───────────────────────────────────────────────────────
const jsonHeaders = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});
const formHeaders = () => ({
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

async function handle(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return normalize(data);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  googleLogin : () => { window.location.href = `${BASE_URL}/auth/google`; },
  getMe       : () => fetch(`${BASE_URL}/auth/me`, { headers: jsonHeaders() }).then(handle),
  logout      : () => removeToken(),
};

// ─── Causes ───────────────────────────────────────────────────────────────────
export const causes = {
  getAll  : ()        => fetch(`${BASE_URL}/api/causes`).then(handle),
  getOne  : (id)      => fetch(`${BASE_URL}/api/causes/${id}`).then(handle),
  create  : (fd)      => fetch(`${BASE_URL}/api/causes`,     { method: 'POST',   headers: formHeaders(), body: fd }).then(handle),
  update  : (id, fd)  => fetch(`${BASE_URL}/api/causes/${id}`,{ method: 'PUT',   headers: formHeaders(), body: fd }).then(handle),
  remove  : (id)      => fetch(`${BASE_URL}/api/causes/${id}`,{ method: 'DELETE', headers: jsonHeaders() }).then(handle),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blog = {
  getAll      : ()       => fetch(`${BASE_URL}/api/blog`).then(handle),
  getAllAdmin  : ()       => fetch(`${BASE_URL}/api/blog/all`,  { headers: jsonHeaders() }).then(handle),
  getOne      : (id)     => fetch(`${BASE_URL}/api/blog/${id}`).then(handle),
  create      : (fd)     => fetch(`${BASE_URL}/api/blog`,      { method: 'POST',   headers: formHeaders(), body: fd }).then(handle),
  update      : (id, fd) => fetch(`${BASE_URL}/api/blog/${id}`,{ method: 'PUT',    headers: formHeaders(), body: fd }).then(handle),
  remove      : (id)     => fetch(`${BASE_URL}/api/blog/${id}`,{ method: 'DELETE', headers: jsonHeaders() }).then(handle),
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const gallery = {
  getAll  : ()      => fetch(`${BASE_URL}/api/gallery`).then(handle),
  upload  : (fd)    => fetch(`${BASE_URL}/api/gallery`,     { method: 'POST',   headers: formHeaders(), body: fd }).then(handle),
  remove  : (id)    => fetch(`${BASE_URL}/api/gallery/${id}`,{ method: 'DELETE', headers: jsonHeaders() }).then(handle),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = {
  createOrder : (amount)  => fetch(`${BASE_URL}/api/payments/order`,       { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ amount }) }).then(handle),
  verify      : (payload) => fetch(`${BASE_URL}/api/payments/verify`,      { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload)   }).then(handle),
  getAll      : ()        => fetch(`${BASE_URL}/api/payments/donations`,    { headers: jsonHeaders() }).then(handle),
  getMine     : ()        => fetch(`${BASE_URL}/api/payments/my-donations`, { headers: jsonHeaders() }).then(handle),
};

// ─── Volunteers ───────────────────────────────────────────────────────────────
export const volunteers = {
  apply        : (data)        => fetch(`${BASE_URL}/api/volunteers`,            { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(data)   }).then(handle),
  getAll       : ()            => fetch(`${BASE_URL}/api/volunteers`,            { headers: jsonHeaders() }).then(handle),
  updateStatus : (id, status)  => fetch(`${BASE_URL}/api/volunteers/${id}/status`,{ method: 'PUT',  headers: jsonHeaders(), body: JSON.stringify({ status }) }).then(handle),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contacts = {
  send     : (data) => fetch(`${BASE_URL}/api/contacts`,         { method: 'POST',   headers: jsonHeaders(), body: JSON.stringify(data) }).then(handle),
  getAll   : ()     => fetch(`${BASE_URL}/api/contacts`,         { headers: jsonHeaders() }).then(handle),
  markRead : (id)   => fetch(`${BASE_URL}/api/contacts/${id}/read`,{ method: 'PUT',  headers: jsonHeaders() }).then(handle),
  remove   : (id)   => fetch(`${BASE_URL}/api/contacts/${id}`,   { method: 'DELETE', headers: jsonHeaders() }).then(handle),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = {
  getAll  : ()           => fetch(`${BASE_URL}/api/users`,           { headers: jsonHeaders() }).then(handle),
  setRole : (id, role)   => fetch(`${BASE_URL}/api/users/${id}/role`,{ method: 'PUT', headers: jsonHeaders(), body: JSON.stringify({ role }) }).then(handle),
};

// ─── CMS ──────────────────────────────────────────────────────────────────────
export const cms = {
  get  : (pageKey)         => fetch(`${BASE_URL}/api/cms/${pageKey}`).then(handle),
  save : (pageKey, fields) => fetch(`${BASE_URL}/api/cms/${pageKey}`,{ method: 'POST', headers: jsonHeaders(), body: JSON.stringify(fields) }).then(handle),
};

// ─── Donation Plans ───────────────────────────────────────────────────────────
export const donationPlans = {
  getAll  : ()         => fetch(`${BASE_URL}/api/donation-plans`).then(handle),
  create  : (data)     => fetch(`${BASE_URL}/api/donation-plans`,      { method: 'POST',   headers: jsonHeaders(), body: JSON.stringify(data) }).then(handle),
  update  : (id, data) => fetch(`${BASE_URL}/api/donation-plans/${id}`,{ method: 'PUT',    headers: jsonHeaders(), body: JSON.stringify(data) }).then(handle),
  remove  : (id)       => fetch(`${BASE_URL}/api/donation-plans/${id}`,{ method: 'DELETE', headers: jsonHeaders() }).then(handle),
};

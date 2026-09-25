export const API_BASE_URL = '/api';

export function authHeaders() {
  const token = localStorage.getItem('adminToken');
  const csrf = localStorage.getItem('csrfToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;
  return headers;
}

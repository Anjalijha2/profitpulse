import path from 'path';
export const API_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/v1';
export const authFile = (role) => path.join('e2e', '.auth', `${role}.json`);
export async function loginViaAPI(request, email, password) {
  const res = await request.post(`${API_URL}/auth/login`, { data: { email, password } });
  const body = await res.json();
  return body.data?.token || body.token;
}
export const USERS = {
  admin: { email: 'admin@profitpulse.com', password: 'Admin@123' },
  finance: { email: 'ritu.finance@profitpulse.com', password: 'Finance@123' },
  delivery_manager: { email: 'suresh.dm@profitpulse.com', password: 'Delivery@123' },
  department_head: { email: 'anita.dh@profitpulse.com', password: 'DeptHead@123' },
  hr: { email: 'pooja.hr@profitpulse.com', password: 'HRUser@123' },
};

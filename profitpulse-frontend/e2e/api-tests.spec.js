import { test, expect } from '@playwright/test';
import { API_URL, USERS, loginViaAPI } from './helpers/test-utils.js';

// All tests use raw request context — no browser. storageState not needed.
test.use({ storageState: { cookies: [], origins: [] } });

// Helper: get Bearer token for a given role
async function getToken(request, role) {
  const user = USERS[role];
  return await loginViaAPI(request, user.email, user.password);
}

// ─── Health ───────────────────────────────────────────────────────────────────
test.describe('API — Health', () => {
  test('GET /health returns 200 with success:true', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('uptime');
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
test.describe('API — Auth', () => {
  test('POST /auth/login with valid admin credentials returns token', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { email: USERS.admin.email, password: USERS.admin.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const token = body.data?.token || body.token;
    expect(token).toBeTruthy();
  });

  test('POST /auth/login with wrong password returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { email: USERS.admin.email, password: 'WrongPassword!' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /auth/login with unknown email returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'nobody@nowhere.com', password: 'Any@123' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /auth/login with missing fields returns 4xx', async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, { data: {} });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
test.describe('API — Dashboard endpoints (admin)', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request, 'admin');
  });

  const dashboardEndpoints = [
    '/dashboard/executive',
    '/dashboard/project',
    '/dashboard/employee',
    '/dashboard/department',
    '/dashboard/client',
  ];

  for (const endpoint of dashboardEndpoints) {
    test(`GET ${endpoint} returns 200`, async ({ request }) => {
      const res = await request.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  }
});

// ─── Employees ────────────────────────────────────────────────────────────────
test.describe('API — Employees', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request, 'admin');
  });

  test('GET /employees returns paginated list', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  test('GET /employees without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees`);
    expect(res.status()).toBe(401);
  });
});

// ─── Projects ─────────────────────────────────────────────────────────────────
test.describe('API — Projects', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request, 'admin');
  });

  test('GET /projects returns paginated list', async ({ request }) => {
    const res = await request.get(`${API_URL}/projects?page=1&limit=15`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

// ─── Config ───────────────────────────────────────────────────────────────────
test.describe('API — Config', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request, 'admin');
  });

  test('GET /config returns financial settings', async ({ request }) => {
    const res = await request.get(`${API_URL}/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // Expect overhead percentage and standard hours fields
    const data = body.data;
    expect(data).toBeDefined();
  });

  test('GET /config/rbac returns RBAC overrides object', async ({ request }) => {
    const res = await request.get(`${API_URL}/config/rbac`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

// ─── Upload Templates ─────────────────────────────────────────────────────────
test.describe('API — Upload Templates', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request, 'admin');
  });

  test('GET /uploads/template/employees returns a non-empty Excel file', async ({ request }) => {
    const res = await request.get(`${API_URL}/uploads/template/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const buffer = await res.body();
    expect(buffer.length).toBeGreaterThan(1000); // Real Excel file > 1 KB
  });

  test('GET /uploads/template/timesheets returns a non-empty Excel file', async ({ request }) => {
    const res = await request.get(`${API_URL}/uploads/template/timesheets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const buffer = await res.body();
    expect(buffer.length).toBeGreaterThan(1000);
  });
});

// ─── Upload Validate — type guard ─────────────────────────────────────────────
test.describe('API — Upload Validate type guard', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getToken(request, 'admin');
  });

  test('POST /uploads/validate without upload_type returns 400', async ({ request }) => {
    // Send multipart with a file but NO upload_type
    const res = await request.post(`${API_URL}/uploads/validate`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        file: {
          name: 'test.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: Buffer.from('PK'), // minimal stub — enough to pass multer
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

// ─── RBAC — Finance cannot access admin endpoints ─────────────────────────────
test.describe('API — RBAC enforcement', () => {
  let adminToken;
  let financeToken;
  let hrToken;

  test.beforeAll(async ({ request }) => {
    [adminToken, financeToken, hrToken] = await Promise.all([
      getToken(request, 'admin'),
      getToken(request, 'finance'),
      getToken(request, 'hr'),
    ]);
  });

  test('Finance cannot GET /users (403)', async ({ request }) => {
    const res = await request.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('HR cannot GET /dashboard/executive (403)', async ({ request }) => {
    const res = await request.get(`${API_URL}/dashboard/executive`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('Admin can GET /users (200)', async ({ request }) => {
    const res = await request.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
  });
});

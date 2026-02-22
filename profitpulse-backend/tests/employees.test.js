import request from 'supertest';
import app from '../src/app.js';
import db from '../src/models/index.js';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

afterAll(async () => {
    await db.sequelize.close();
});

const generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

const adminToken = generateToken({ id: 'mock-admin', email: 'admin@profitpulse.com', role: 'admin' });
const hrToken = generateToken({ id: 'mock-hr', email: 'hr@profitpulse.com', role: 'hr' });

describe('Employees API', () => {

    it('GET /api/v1/employees returns paginated list', async () => {
        const res = await request(app)
            .get('/api/v1/employees')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.employees).toBeInstanceOf(Array);
        expect(res.body.data.pagination).toBeDefined();
    });

    it('GET /api/v1/employees/:id returns single employee with department', async () => {
        // Fetch list first to get a valid ID
        const listRes = await request(app)
            .get('/api/v1/employees?limit=1')
            .set('Authorization', `Bearer ${adminToken}`);

        if (listRes.body.data.employees.length > 0) {
            const id = listRes.body.data.employees[0].id;
            const res = await request(app)
                .get(`/api/v1/employees/${id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.employee).toBeDefined();
            expect(res.body.data.employee.Department).toBeDefined();
        }
    });

    it('GET /api/v1/employees/:id/profitability returns calculations', async () => {
        const listRes = await request(app)
            .get('/api/v1/employees?limit=1')
            .set('Authorization', `Bearer ${adminToken}`);

        if (listRes.body.data.employees.length > 0) {
            const id = listRes.body.data.employees[0].id;
            const res = await request(app)
                .get(`/api/v1/employees/${id}/profitability`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.profitability).toBeDefined();
            expect(res.body.data.profitability.revenue).toBeDefined();
        }
    });

    it('GET /api/v1/employees/:id/timesheet-summary returns monthly breakdown', async () => {
        const listRes = await request(app)
            .get('/api/v1/employees?limit=1')
            .set('Authorization', `Bearer ${adminToken}`);

        if (listRes.body.data.employees.length > 0) {
            const id = listRes.body.data.employees[0].id;
            const res = await request(app)
                .get(`/api/v1/employees/${id}/timesheet-summary`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.timesheets).toBeDefined();
        }
    });

});

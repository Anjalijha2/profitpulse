import request from 'supertest';
import app from '../src/app.js';
import db from '../src/models/index.js';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

afterAll(async () => {
    await db.sequelize.close();
});

const generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

// Setup Tokens for different roles
const adminToken = generateToken({ id: '1', email: 'admin@profitpulse.com', role: 'admin' });
const financeToken = generateToken({ id: '2', email: 'finance@profitpulse.com', role: 'finance' });
const hrToken = generateToken({ id: '3', email: 'hr@profitpulse.com', role: 'hr' });
const dmToken = generateToken({ id: '4', email: 'dm@profitpulse.com', role: 'delivery_manager' });
const dhToken = generateToken({ id: '5', email: 'dh@profitpulse.com', role: 'department_head' });

describe('RBAC Verification', () => {

    it('Admin can access everything (e.g. users)', async () => {
        const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
    });

    it('Finance cannot access /api/v1/users', async () => {
        const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${financeToken}`);
        expect(res.statusCode).toBe(403);
    });

    it('HR cannot upload revenue', async () => {
        const res = await request(app)
            .post('/api/v1/uploads/revenue')
            .set('Authorization', `Bearer ${hrToken}`);
        // Even if missing files, auth checks run first before validation so we expect 403 Forbidden
        expect(res.statusCode).toBe(403);
    });

    it('Delivery Manager gets scoped project data', async () => {
        // Technically this means it succeeds but the query is scoped in the backend. 
        // We test that they can access the endpoint.
        const res = await request(app).get('/api/v1/projects').set('Authorization', `Bearer ${dmToken}`);
        expect(res.statusCode).toBe(200);
    });

    it('Department Head gets scoped employee data', async () => {
        const res = await request(app).get('/api/v1/employees').set('Authorization', `Bearer ${dhToken}`);
        expect(res.statusCode).toBe(200);
    });

});

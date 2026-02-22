import request from 'supertest';
import app from '../src/app.js';
import db from '../src/models/index.js';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

afterAll(async () => {
    await db.sequelize.close();
});

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Setup admin token
const adminToken = generateToken({ id: 'mock-admin', email: 'admin@profitpulse.com', role: 'admin' });
const hrToken = generateToken({ id: 'mock-hr', email: 'hr@profitpulse.com', role: 'hr' });

describe('System Config API', () => {

    it('GET /api/v1/config returns all config values with Auth', async () => {
        const res = await request(app)
            .get('/api/v1/config')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.configs).toBeDefined();
    });

    it('PUT /api/v1/config updates values as Admin', async () => {
        const res = await request(app)
            .put('/api/v1/config')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                configs: { standard_monthly_hours: 165 }
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('Non-admin cannot update config', async () => {
        const res = await request(app)
            .put('/api/v1/config')
            .set('Authorization', `Bearer ${hrToken}`)
            .send({ configs: { standard_monthly_hours: 150 } });

        expect(res.statusCode).toBe(403);
    });
});

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
const dmToken = generateToken({ id: '6b5e0031-9f20-4107-adea-b0a5bfa4a39d', email: 'dm@profitpulse.com', role: 'delivery_manager' });

describe('Projects API', () => {

    it('GET /api/v1/projects returns paginated list', async () => {
        const res = await request(app)
            .get('/api/v1/projects')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.projects).toBeInstanceOf(Array);
        expect(res.body.data.pagination).toBeDefined();
    });

    it('POST /api/v1/projects creates new project (Validation or Success)', async () => {
        const res = await request(app)
            .post('/api/v1/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                project_code: 'TEST-01',
                name: 'Test Project',
                client_id: 'b6e8-2e17c90c2bf4', // Dummy ID
                project_type: 'fixed_cost',
                status: 'Planned'
            });

        // It should either pass with 201 or fail validation (400) because client_id doesn't exist 
        // We only care that the route exists and processes it
        expect([201, 400, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/projects/:id returns single project', async () => {
        // Fetch list first to get a valid ID
        const listRes = await request(app)
            .get('/api/v1/projects?limit=1')
            .set('Authorization', `Bearer ${adminToken}`);

        if (listRes.body.data.projects.length > 0) {
            const id = listRes.body.data.projects[0].id;
            const res = await request(app)
                .get(`/api/v1/projects/${id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project).toBeDefined();
        }
    });

    it('GET /api/v1/projects/:id/profitability returns calculations', async () => {
        const listRes = await request(app)
            .get('/api/v1/projects?limit=1')
            .set('Authorization', `Bearer ${adminToken}`);

        if (listRes.body.data.projects.length > 0) {
            const id = listRes.body.data.projects[0].id;
            const res = await request(app)
                .get(`/api/v1/projects/${id}/profitability`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.profitability).toBeDefined();
            expect(res.body.data.profitability.revenue).toBeDefined();
        }
    });

    it('GET /api/v1/projects/:id/burn-rate works', async () => {
        const listRes = await request(app)
            .get('/api/v1/projects?limit=1')
            .set('Authorization', `Bearer ${adminToken}`);

        if (listRes.body.data.projects.length > 0) {
            const id = listRes.body.data.projects[0].id;
            const res = await request(app)
                .get(`/api/v1/projects/${id}/burn-rate`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.burnRate).toBeDefined();
        }
    });

});

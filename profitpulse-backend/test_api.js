import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' }
});

async function runTests() {
    try {
        console.log('--- LOGIN ---');
        const loginRes = await api.post('/auth/login', {
            email: 'admin@profitpulse.com',
            password: 'Admin@123'
        });
        console.log('Login Success:', loginRes.data.success);
        const token = loginRes.data.data.token;
        console.log('Token Obtained');

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('--- GETTING IDS ---');
        const employeesRes = await api.get('/employees');
        const employeeId = employeesRes.data.data[0].id;
        console.log(`Using Employee ID: ${employeeId}`);

        const projectsRes = await api.get('/projects');
        const projectId = projectsRes.data.data[0].id;
        console.log(`Using Project ID: ${projectId}`);

        const endpoints = [
            '/dashboard/executive?month=2025-01',
            '/dashboard/employee?month=2025-01',
            '/dashboard/project?month=2025-01',
            '/dashboard/department?month=2025-01',
            '/dashboard/client?month=2025-01',
            '/employees',
            `/employees/${employeeId}`,
            `/employees/${employeeId}/profitability?month=2025-01`,
            '/projects',
            `/projects/${projectId}/profitability?month=2025-01`,
            '/uploads/template/employees',
            '/config',
            '/users',
            '/reports/project-profitability?month=2025-01'
        ];

        console.log('--- TESTING ENDPOINTS ---');
        for (const endpoint of endpoints) {
            process.stdout.write(`Testing ${endpoint}... `);
            try {
                const res = await api.get(endpoint);
                console.log(`PASS (${res.status})`);
            } catch (err) {
                console.log(`FAIL (${err.response?.status || 'ERR'}) - ${err.message}`);
                if (err.response?.data) {
                    console.log('   Error Detail:', JSON.stringify(err.response.data));
                }
            }
        }

    } catch (err) {
        console.error('Test Runner Failed:', err.response?.data || err.message);
    }
}

runTests();

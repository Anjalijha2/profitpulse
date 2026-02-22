import bcrypt from 'bcryptjs';
import db from '../src/models/index.js';

const seedData = async () => {
    let createdUsers = 0, createdDepts = 0, createdEmps = 0, createdClients = 0, createdProjects = 0, createdTimesheets = 0, createdRevenues = 0;

    try {
        console.log('🌱 Starting Database Seeding...');

        // 1. Departments
        const depts = [
            { name: 'Engineering', code: 'ENG' },
            { name: 'QA', code: 'QA' },
            { name: 'DevOps', code: 'DEV' },
            { name: 'Design', code: 'DSN' },
            { name: 'Management', code: 'MGT' },
            { name: 'HR', code: 'HR' },
            { name: 'Finance', code: 'FIN' },
            { name: 'Sales', code: 'SAL' }
        ];
        const deptMap = {};
        for (const d of depts) {
            const [dept] = await db.Department.findOrCreate({ where: { name: d.name }, defaults: d });
            deptMap[d.name] = dept.id;
            createdDepts++;
        }
        console.log(`✅ Verified/Created ${createdDepts} departments`);

        // 2. Users
        const usersData = [
            { name: 'System Admin', email: 'admin@profitpulse.com', role: 'admin', password: 'Admin@123', dept: 'Management' },
            { name: 'Ritu Kapoor', email: 'ritu.finance@profitpulse.com', role: 'finance', password: 'Finance@123', dept: 'Finance' },
            { name: 'Suresh Menon', email: 'suresh.dm@profitpulse.com', role: 'delivery_manager', password: 'Delivery@123', dept: 'Engineering' },
            { name: 'Anita Desai', email: 'anita.dh@profitpulse.com', role: 'department_head', password: 'DeptHead@123', dept: 'Engineering' },
            { name: 'Pooja Sharma', email: 'pooja.hr@profitpulse.com', role: 'hr', password: 'HRUser@123', dept: 'HR' }
        ];

        let sureshId = null;

        for (const u of usersData) {
            const existing = await db.User.findOne({ where: { email: u.email } });
            if (!existing) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                const created = await db.User.create({
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    password: hashedPassword,
                    department_id: deptMap[u.dept],
                    is_active: true
                });
                if (u.role === 'delivery_manager') sureshId = created.id;
                createdUsers++;
            } else {
                if (u.role === 'delivery_manager') sureshId = existing.id;
            }
        }
        console.log(`✅ Verified/Created 5 test users`);

        // 3. System Config
        const configs = [
            { key: 'overhead_cost_per_year', value: '180000', description: 'Annual overhead per employee (INR)' },
            { key: 'standard_monthly_hours', value: '160', description: 'Standard working hours per month' },
            { key: 'financial_year_start_month', value: '4', description: 'April (Indian FY)' }
        ];
        for (const conf of configs) {
            const existing = await db.SystemConfig.findOne({ where: { key: conf.key } });
            if (!existing) {
                await db.SystemConfig.create(conf);
            } else {
                await existing.update(conf);
            }
        }
        console.log(`✅ Seeded SystemConfig`);

        // 4. Clients
        const clientsData = [
            { name: 'MuniDigital Corp', industry: 'Government' },
            { name: 'CloudBridge Infra', industry: 'Technology' },
            { name: 'HealthStack AI', industry: 'Healthcare' },
            { name: 'GovConnect Systems', industry: 'Government' },
            { name: 'RetailSphere Ltd', industry: 'Retail' },
            { name: 'FinEdge Analytics', industry: 'BFSI' },
            { name: 'SmartCity Ventures', industry: 'Smart City' },
            { name: 'TechNova Solutions', industry: 'Enterprise' }
        ];
        const clientMap = {};
        for (const c of clientsData) {
            const [client] = await db.Client.findOrCreate({ where: { name: c.name }, defaults: c });
            clientMap[c.name] = client.id;
            createdClients++;
        }
        console.log(`✅ Verified/Created ${createdClients} clients`);

        // 5. Employees
        const empConfigs = [
            { dept: 'Engineering', count: 12, desigs: ['Junior Dev', 'Senior Dev', 'SSE', 'Tech Lead'], ctcRange: [500000, 2500000], isBillable: true, prefix: 1 },
            { dept: 'QA', count: 4, desigs: ['QA Analyst', 'QA Lead'], ctcRange: [500000, 1500000], isBillable: true, prefix: 13 },
            { dept: 'DevOps', count: 3, desigs: ['DevOps Engineer', 'Sr DevOps'], ctcRange: [800000, 2000000], isBillable: true, prefix: 17 },
            { dept: 'Design', count: 3, desigs: ['UI Designer', 'Sr Designer'], ctcRange: [600000, 1600000], isBillable: true, prefix: 20 },
            { dept: 'Management', count: 2, desigs: ['Project Manager', 'Delivery Manager'], ctcRange: [1800000, 2800000], isBillable: false, prefix: 23 },
            { dept: 'HR', count: 2, desigs: ['HR Executive', 'HR Manager'], ctcRange: [500000, 1200000], isBillable: false, prefix: 25 },
            { dept: 'Finance', count: 2, desigs: ['Finance Analyst', 'Finance Manager'], ctcRange: [600000, 1400000], isBillable: false, prefix: 27 },
            { dept: 'Sales', count: 2, desigs: ['Sales Executive', 'Sales Manager'], ctcRange: [600000, 1500000], isBillable: false, prefix: 29 }
        ];

        const indianFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Sanya', 'Aditi', 'Kavya', 'Ananya', 'Riya', 'Nisha', 'Neha', 'Meera', 'Isha', 'Rahul', 'Ravi', 'Karan', 'Vijay', 'Dev', 'Amit', 'Vikram', 'Priya', 'Sneha', 'Ruchika'];
        const indianLastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Desai', 'Reddy', 'Rao', 'Iyer', 'Banerjee', 'Das', 'Nair', 'Kapoor', 'Bhat', 'Gupta', 'Jain', 'Verma', 'Mehta', 'Bose', 'Yadav', 'Trivedi'];

        const empMap = {};
        for (const ec of empConfigs) {
            for (let i = 0; i < ec.count; i++) {
                const empCode = `EMP${String(ec.prefix + i).padStart(3, '0')}`;
                const existingEmp = await db.Employee.findOne({ where: { employee_code: empCode } });
                if (!existingEmp) {
                    const fn = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
                    const ln = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
                    const name = `${fn} ${ln}`;
                    const designation = ec.desigs[i % ec.desigs.length];
                    const annual_ctc = Math.floor(Math.random() * (ec.ctcRange[1] - ec.ctcRange[0])) + ec.ctcRange[0];

                    const emp = await db.Employee.create({
                        employee_code: empCode,
                        name,
                        department_id: deptMap[ec.dept],
                        designation,
                        annual_ctc,
                        is_billable: ec.isBillable,
                        joining_date: new Date('2022-01-15'),
                        financial_year: '2024-2025'
                    });
                    empMap[empCode] = emp.id;
                    createdEmps++;
                } else {
                    empMap[empCode] = existingEmp.id;
                }
            }
        }
        console.log(`✅ Verified/Created 30 employees`);

        // 6. Projects
        const projectsData = [
            { id: 'PRJ001', name: 'MuniTax Platform', type: 'tm', client: 'MuniDigital Corp', rate: 1500, vertical: 'Municipal', status: 'active', hasDm: true },
            { id: 'PRJ002', name: 'CloudOps Dashboard', type: 'tm', client: 'CloudBridge Infra', rate: 1800, vertical: 'Enterprise', status: 'active', hasDm: true },
            { id: 'PRJ003', name: 'AI Chatbot Engine', type: 'tm', client: 'HealthStack AI', rate: 2000, vertical: 'AI', status: 'active', hasDm: true },
            { id: 'PRJ004', name: 'E-Governance Portal', type: 'fixed_cost', client: 'GovConnect Systems', cv: 5500000, vertical: 'Municipal', status: 'active', hasDm: true },
            { id: 'PRJ005', name: 'Retail Analytics Suite', type: 'fixed_cost', client: 'RetailSphere Ltd', cv: 4200000, vertical: 'Retail', status: 'active', hasDm: true },
            { id: 'PRJ006', name: 'Banking Module v2', type: 'fixed_cost', client: 'FinEdge Analytics', cv: 6000000, vertical: 'BFSI', status: 'completed', hasDm: true },
            { id: 'PRJ007', name: 'Smart City Infra', type: 'infrastructure', client: 'SmartCity Ventures', ic: 350000, vertical: 'Municipal', status: 'active', hasDm: true },
            { id: 'PRJ008', name: 'Cloud Hosting Setup', type: 'infrastructure', client: 'CloudBridge Infra', ic: 200000, vertical: 'Enterprise', status: 'active', hasDm: true },
            { id: 'PRJ009', name: 'GovConnect AMC', type: 'amc', client: 'GovConnect Systems', cv: 1200000, vertical: 'Municipal', status: 'active', hasDm: true },
            { id: 'PRJ010', name: 'Internal Operations', type: 'tm', client: null, rate: 0, vertical: 'Internal', status: 'active', hasDm: false }
        ];

        const projectMap = {};
        for (const p of projectsData) {
            const [prj] = await db.Project.findOrCreate({
                where: { project_code: p.id },
                defaults: {
                    project_code: p.id,
                    name: p.name,
                    project_type: p.type,
                    client_id: p.client ? clientMap[p.client] : null,
                    billing_rate: p.rate || null,
                    contract_value: p.cv || null,
                    infra_vendor_cost: p.ic || null,
                    vertical: p.vertical,
                    status: p.status,
                    delivery_manager_id: p.hasDm ? sureshId : null,
                    start_date: new Date('2024-04-01')
                }
            });
            projectMap[p.id] = prj.id;
            createdProjects++;
        }
        console.log(`✅ Verified/Created 10 projects`);

        // 7. Timesheets & Revenue 
        const months = ['2025-01', '2025-02'];

        const revenueGen = {
            'PRJ001': [1250000, 1375000],
            'PRJ002': [875000, 950000],
            'PRJ003': [1500000, 1400000],
            'PRJ004': [2200000, 2200000],
            'PRJ005': [1850000, 1850000],
            'PRJ006': [2500000, 0],
            'PRJ007': [750000, 800000],
            'PRJ008': [425000, 425000],
            'PRJ009': [350000, 350000]
        };

        // Make Timesheets
        for (let mIdx = 0; mIdx < months.length; mIdx++) {
            const mStr = months[mIdx];
            // Generate constraints for timesheets
            for (let i = 1; i <= 30; i++) {
                const eCode = `EMP${String(i).padStart(3, '0')}`;
                const eId = empMap[eCode];
                if (!eId) continue;

                let targetProj1, targetProj2 = null;
                let isBillable = false;
                if (i <= 12) { // Eng
                    targetProj1 = 'PRJ001'; targetProj2 = 'PRJ002'; isBillable = true;
                } else if (i <= 16) { // QA
                    targetProj1 = 'PRJ004'; targetProj2 = 'PRJ005'; isBillable = true;
                } else if (i <= 19) { // DevOps
                    targetProj1 = 'PRJ007'; isBillable = true;
                } else if (i <= 22) { // Design
                    targetProj1 = 'PRJ003'; targetProj2 = 'PRJ006'; isBillable = true;
                } else {
                    targetProj1 = 'PRJ010'; // Internal
                    isBillable = false;
                }

                const h1 = 120 + Math.floor(Math.random() * 20);
                const h2 = targetProj2 ? 40 : 0;

                const existing1 = await db.Timesheet.findOne({ where: { employee_id: eId, project_id: projectMap[targetProj1], month: mStr } });
                if (!existing1) {
                    await db.Timesheet.create({
                        employee_id: eId,
                        project_id: projectMap[targetProj1],
                        month: mStr,
                        total_hours: h1 + (isBillable ? 0 : 40),
                        billable_hours: isBillable ? h1 : 0
                    });
                    createdTimesheets++;
                }

                if (targetProj2) {
                    const existing2 = await db.Timesheet.findOne({ where: { employee_id: eId, project_id: projectMap[targetProj2], month: mStr } });
                    if (!existing2) {
                        await db.Timesheet.create({
                            employee_id: eId,
                            project_id: projectMap[targetProj2],
                            month: mStr,
                            total_hours: h2,
                            billable_hours: isBillable ? h2 : 0
                        });
                        createdTimesheets++;
                    }
                }
            }

            // Revenue
            for (const [pCode, amounts] of Object.entries(revenueGen)) {
                const revAmount = amounts[mIdx];
                if (revAmount > 0) {
                    const pId = projectMap[pCode];
                    const existingRev = await db.Revenue.findOne({ where: { project_id: pId, month: mStr } });
                    if (!existingRev) {
                        await db.Revenue.create({
                            project_id: pId,
                            client_id: projectsData.find(x => x.id === pCode).client ? clientMap[projectsData.find(x => x.id === pCode).client] : null,
                            month: mStr,
                            invoice_amount: revAmount,
                            invoice_date: new Date(`${mStr}-15`),
                            project_type: projectsData.find(x => x.id === pCode).type,
                            vertical: projectsData.find(x => x.id === pCode).vertical
                        });
                        createdRevenues++;
                    }
                }
            }
        }
        console.log(`✅ Verified/Created ~${createdTimesheets} timesheets and ~${createdRevenues} revenue records`);

        console.log(`\n╔══════════════════════════════════════╗`);
        console.log(`║     ProfitPulse Test Data Summary    ║`);
        console.log(`╠══════════════════╦═══════════════════╣`);
        console.log(`║ Users            ║ 5                 ║`);
        console.log(`║ Departments      ║ 8                 ║`);
        console.log(`║ Employees        ║ 30                ║`);
        console.log(`║ Clients          ║ 8                 ║`);
        console.log(`║ Projects         ║ 10                ║`);
        console.log(`║ Timesheets       ║ ~${createdTimesheets + 76}               ║`);
        console.log(`║ Revenue Entries  ║ ~${createdRevenues + 17}               ║`);
        console.log(`╚══════════════════╩═══════════════════╝`);

    } catch (err) {
        console.error('❌ SEEDING FAILED:', err);
    } finally {
        process.exit(0);
    }
};

seedData();

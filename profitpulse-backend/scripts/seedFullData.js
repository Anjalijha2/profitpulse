import bcrypt from 'bcryptjs';
import db from '../src/models/index.js';

const SEED_USERS = [
    { name: 'System Admin', email: 'admin@profitpulse.com', pwd: 'Admin@123', role: 'admin', dept: null },
    { name: 'Ritu Kapoor', email: 'ritu.finance@profitpulse.com', pwd: 'Finance@123', role: 'finance', dept: 'Finance' },
    { name: 'Suresh Menon', email: 'suresh.dm@profitpulse.com', pwd: 'Delivery@123', role: 'delivery_manager', dept: 'Engineering' },
    { name: 'Anita Desai', email: 'anita.dh@profitpulse.com', pwd: 'DeptHead@123', role: 'department_head', dept: 'Engineering' },
    { name: 'Pooja Sharma', email: 'pooja.hr@profitpulse.com', pwd: 'HRUser@123', role: 'hr', dept: 'HR' }
];

const SEED_DEPARTMENTS = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'QA', code: 'QA' },
    { name: 'DevOps', code: 'DEV' },
    { name: 'Design', code: 'DES' },
    { name: 'Management', code: 'MGT' },
    { name: 'HR', code: 'HR' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Sales', code: 'SAL' },
];

const SEED_CLIENTS = [
    { name: 'VI Travel', industry: 'Telecom / Travel' },
    { name: 'MyHealthMeter', industry: 'Healthcare' },
    { name: 'PlayMo Inc', industry: 'EdTech / Gaming' },
    { name: 'Nirmal Energy Ltd', industry: 'Energy / Manufacturing' },
    { name: 'IBC Events Pvt Ltd', industry: 'Events / Conferences' },
    { name: 'Peer Connection Inc', industry: 'Social Networking' },
    { name: 'Electrical Enterprise', industry: 'Manufacturing / Electrical' },
    { name: 'Signet Excipients Pvt Ltd', industry: 'Pharmaceutical' },
    { name: 'Quantum CorpHealth Pvt. Ltd.', industry: 'Corporate Healthcare' },
    { name: 'Manufacturing Enterprise Ltd', industry: 'Manufacturing' },
    { name: 'OpportuneHR Solutions', industry: 'HR Technology' },
    { name: 'NNPC Retail', industry: 'Oil & Gas / Retail' },
    { name: 'FreightGain Logistics', industry: 'Logistics / Supply Chain' },
    { name: 'Wilmette Park District', industry: 'Government / Public Sector' },
    { name: 'ANAROCK Property Consultants', industry: 'Real Estate' },
    { name: 'Hoabl (House of Abhinandan Lodha)', industry: 'Real Estate' },
    { name: 'Slow Burn Method LLC', industry: 'Fitness / Wellness' },
    { name: 'Anchor Packaging Co.', industry: 'Manufacturing / Packaging' },
    { name: 'Lancaster Hotel Group', industry: 'Hospitality' }
];

const INDIAN_NAMES = [
    'Rajesh Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Gupta', 'Vikram Singh',
    'Neha Joshi', 'Arjun Reddy', 'Kavita Nair', 'Rohit Mehta', 'Deepika Iyer',
    'Sanjay Kumar', 'Meera Bose', 'Karan Malhotra', 'Divya Rao', 'Aakash Tiwari',
    'Poornima Hegde', 'Nikhil Deshmukh', 'Shreya Chatterjee', 'Rakesh Pillai', 'Anand Mishra',
    'Tanvi Kulkarni', 'Dev Banerjee', 'Riya Saxena', 'Vivek Srinivasan', 'Nandini Menon',
    'Aditya Jain', 'Shalini Krishnamurthy', 'Rohan Aggarwal', 'Megha Thakur', 'Sunil Rathore',
    'Harish Iyer', 'Manisha Patil', 'Gaurav Pandey', 'Pallavi Deshpande', 'Rahul Bhat',
    'Swati Goswami', 'Aarav Kapoor', 'Ishita Choudhury', 'Vishal Naik', 'Farhan Sheikh'
];

async function run() {
    try {
        console.log('Syncing database...');
        await db.sequelize.sync();

        console.log('Seeding Departments...');
        const deptMap = {};
        for (const d of SEED_DEPARTMENTS) {
            const [dept] = await db.Department.findOrCreate({ where: { name: d.name }, defaults: d });
            deptMap[dept.name] = dept.id;
        }

        console.log('Seeding Users...');
        let adminId = null;
        let dmId = null;
        for (const u of SEED_USERS) {
            let user = await db.User.findOne({ where: { email: u.email } });
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.pwd, salt);
                user = await db.User.create({
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    department_id: u.dept ? deptMap[u.dept] : null
                });
            }
            if (u.role === 'admin') adminId = user.id;
            if (u.role === 'delivery_manager') dmId = user.id;
        }

        console.log('Seeding Config...');
        const configs = [
            { key: 'overhead_cost_per_year', value: '180000', description: 'Annual overhead per employee (INR)', data_type: 'number' },
            { key: 'standard_monthly_hours', value: '160', description: 'Standard working hours per month', data_type: 'number' },
            { key: 'financial_year_start_month', value: '4', description: 'April (Indian FY)', data_type: 'number' }
        ];
        for (const c of configs) {
            await db.SystemConfig.findOrCreate({ where: { key: c.key }, defaults: c });
        }

        console.log('Seeding Clients...');
        const clientMap = {};
        for (const c of SEED_CLIENTS) {
            const [client] = await db.Client.findOrCreate({ where: { name: c.name }, defaults: c });
            clientMap[client.name] = client.id;
        }

        console.log('Seeding Projects...');
        const projectData = [
            { code: 'PRJ001', name: 'VI Travel E-Sim', type: 'tm', client: 'VI Travel', rate: 1800, cv: null, infra: null, vertical: 'Telecom', status: 'active' },
            { code: 'PRJ002', name: 'MyHealthMeter', type: 'tm', client: 'MyHealthMeter', rate: 2000, cv: null, infra: null, vertical: 'Healthcare', status: 'active' },
            { code: 'PRJ003', name: 'PlayMo', type: 'tm', client: 'PlayMo Inc', rate: 1500, cv: null, infra: null, vertical: 'EdTech', status: 'active' },
            { code: 'PRJ004', name: 'Nirmal Flow Cell', type: 'fixed_cost', client: 'Nirmal Energy Ltd', rate: null, cv: 5500000, bh: 3000, infra: null, vertical: 'Energy', status: 'active' },
            { code: 'PRJ005', name: 'IBC – International Business Conference', type: 'fixed_cost', client: 'IBC Events Pvt Ltd', rate: null, cv: 3800000, bh: 2200, infra: null, vertical: 'Events', status: 'active' },
            { code: 'PRJ006', name: 'Peer Connection', type: 'tm', client: 'Peer Connection Inc', rate: 1600, cv: null, infra: null, vertical: 'Social', status: 'active' },
            { code: 'PRJ007', name: 'Electrical Enterprise', type: 'fixed_cost', client: 'Electrical Enterprise', rate: null, cv: 4200000, bh: 2500, infra: null, vertical: 'Manufacturing', status: 'active' },
            { code: 'PRJ008', name: 'Signet Excipients', type: 'infrastructure', client: 'Signet Excipients Pvt Ltd', rate: null, cv: null, infra: 450000, vertical: 'Pharma', status: 'active' },
            { code: 'PRJ009', name: 'Quantum CorpHealth Pvt. Ltd.', type: 'amc', client: 'Quantum CorpHealth Pvt. Ltd.', rate: null, cv: 1800000, infra: null, vertical: 'Healthcare', status: 'active' },
            { code: 'PRJ010', name: 'Manufacturing Enterprise', type: 'infrastructure', client: 'Manufacturing Enterprise Ltd', rate: null, cv: null, infra: 380000, vertical: 'Manufacturing', status: 'active' },
            { code: 'PRJ011', name: 'OpportuneHR', type: 'tm', client: 'OpportuneHR Solutions', rate: 1700, cv: null, infra: null, vertical: 'HR Tech', status: 'active' },
            { code: 'PRJ012', name: 'NNPC Retail', type: 'fixed_cost', client: 'NNPC Retail', rate: null, cv: 6200000, bh: 3500, infra: null, vertical: 'Oil & Gas', status: 'active' },
            { code: 'PRJ013', name: 'FreightGain', type: 'tm', client: 'FreightGain Logistics', rate: 1900, cv: null, infra: null, vertical: 'Logistics', status: 'active' },
            { code: 'PRJ014', name: 'Wilmette Park District', type: 'fixed_cost', client: 'Wilmette Park District', rate: null, cv: 3200000, bh: 1800, infra: null, vertical: 'Government', status: 'active' },
            { code: 'PRJ015', name: 'ANAROCK', type: 'tm', client: 'ANAROCK Property Consultants', rate: 2200, cv: null, infra: null, vertical: 'Real Estate', status: 'active' },
            { code: 'PRJ016', name: 'Hoabl', type: 'tm', client: 'Hoabl (House of Abhinandan Lodha)', rate: 2000, cv: null, infra: null, vertical: 'Real Estate', status: 'completed' },
            { code: 'PRJ017', name: 'Slow Burn Method', type: 'fixed_cost', client: 'Slow Burn Method LLC', rate: null, cv: 2800000, bh: 1600, infra: null, vertical: 'Wellness', status: 'active' },
            { code: 'PRJ018', name: 'Anchor Packaging', type: 'infrastructure', client: 'Anchor Packaging Co.', rate: null, cv: null, infra: 320000, vertical: 'Packaging', status: 'active' },
            { code: 'PRJ019', name: 'Lancaster', type: 'amc', client: 'Lancaster Hotel Group', rate: null, cv: 1500000, infra: null, vertical: 'Hospitality', status: 'active' },
            { code: 'PRJ020', name: 'Internal Operations', type: 'tm', client: null, rate: 0, cv: null, infra: null, vertical: 'Internal', status: 'active' }
        ];

        const projectMap = {};
        for (const p of projectData) {
            let proj = await db.Project.findOne({ where: { project_code: p.code } });
            if (!proj) {
                proj = await db.Project.create({
                    project_code: p.code,
                    name: p.name,
                    project_type: p.type,
                    client_id: p.client ? clientMap[p.client] : null,
                    billing_rate: p.rate,
                    contract_value: p.cv,
                    budgeted_hours: p.bh,
                    infra_vendor_cost: p.infra,
                    vertical: p.vertical,
                    status: p.status,
                    delivery_manager_id: dmId,
                });
            }
            projectMap[p.code] = proj.id;
        }

        console.log('Seeding Employees...');
        const empConfigs = [
            { start: 1, end: 16, dept: 'Engineering', count: 16, desigs: ['Junior Dev', 'Senior Dev', 'SSE', 'Tech Lead'], ctcRange: [500000, 2800000], billable: true },
            { start: 17, end: 21, dept: 'QA', count: 5, desigs: ['QA Analyst', 'QA Lead'], ctcRange: [500000, 1500000], billable: true },
            { start: 22, end: 25, dept: 'DevOps', count: 4, desigs: ['DevOps Eng', 'Sr DevOps', 'Cloud Architect'], ctcRange: [800000, 2200000], billable: true },
            { start: 26, end: 29, dept: 'Design', count: 4, desigs: ['UI Designer', 'UX Researcher', 'Sr Designer'], ctcRange: [600000, 1800000], billable: true },
            { start: 30, end: 32, dept: 'Management', count: 3, desigs: ['Project Manager', 'Delivery Mgr', 'Program Mgr'], ctcRange: [1800000, 3000000], billable: false },
            { start: 33, end: 34, dept: 'HR', count: 2, desigs: ['HR Executive', 'HR Manager'], ctcRange: [500000, 1200000], billable: false },
            { start: 35, end: 36, dept: 'Finance', count: 2, desigs: ['Finance Analyst', 'Finance Mgr'], ctcRange: [600000, 1400000], billable: false },
            { start: 37, end: 38, dept: 'Sales', count: 2, desigs: ['Sales Exec', 'Sales Mgr'], ctcRange: [600000, 1500000], billable: false },
            { start: 39, end: 40, dept: 'DevOps', count: 2, desigs: ['SRE Engineer', 'DevOps Lead'], ctcRange: [1000000, 2000000], billable: true },
        ];

        const employeeMap = [];
        let empIdx = 0;
        for (const ec of empConfigs) {
            for (let i = ec.start; i <= ec.end; i++) {
                const code = `EMP${i.toString().padStart(3, '0')}`;
                let emp = await db.Employee.findOne({ where: { employee_code: code } });
                const designation = ec.desigs[i % ec.desigs.length];
                const ctc = Math.floor(Math.random() * (ec.ctcRange[1] - ec.ctcRange[0]) + ec.ctcRange[0]);
                if (!emp) {
                    emp = await db.Employee.create({
                        employee_code: code,
                        name: INDIAN_NAMES[empIdx % INDIAN_NAMES.length],
                        department_id: deptMap[ec.dept],
                        designation: designation,
                        annual_ctc: ctc,
                        is_billable: ec.billable,
                        joining_date: '2023-04-01',
                        financial_year: '2024-2025',
                        is_active: true
                    });
                }
                employeeMap.push({ id: emp.id, code, billable: ec.billable, dept: ec.dept });
                empIdx++;
            }
        }

        console.log('Seeding Timesheets (Jan, Feb, Mar 2025)...');
        await db.Timesheet.destroy({ where: {}, force: true }); // Reset for clean seed
        const months = ['2025-01', '2025-02', '2025-03'];

        let timesheetCount = 0;
        for (const month of months) {
            for (const emp of employeeMap) {
                if (emp.billable) {
                    // Assign projects by dept
                    let projects = [];
                    if (emp.dept === 'Engineering') projects = ['PRJ001', 'PRJ002', 'PRJ003', 'PRJ004', 'PRJ005', 'PRJ006', 'PRJ007', 'PRJ011', 'PRJ012', 'PRJ013', 'PRJ014', 'PRJ015', 'PRJ016'];
                    else if (emp.dept === 'QA') projects = ['PRJ004', 'PRJ005', 'PRJ007', 'PRJ012', 'PRJ014', 'PRJ017'];
                    else if (emp.dept === 'DevOps') projects = ['PRJ008', 'PRJ010', 'PRJ018', 'PRJ001', 'PRJ002'];
                    else if (emp.dept === 'Design') projects = ['PRJ003', 'PRJ006', 'PRJ015', 'PRJ016'];

                    const projCode = projects[Math.floor(Math.random() * projects.length)];
                    await db.Timesheet.create({
                        employee_id: emp.id,
                        project_id: projectMap[projCode],
                        billable_hours: 140 + Math.floor(Math.random() * 20),
                        non_billable_hours: 10 + Math.floor(Math.random() * 10),
                        month: month
                    });
                    timesheetCount++;
                } else {
                    await db.Timesheet.create({
                        employee_id: emp.id,
                        project_id: projectMap['PRJ020'],
                        billable_hours: 0,
                        non_billable_hours: 160 + Math.floor(Math.random() * 10),
                        month: month
                    });
                    timesheetCount++;
                }
            }
        }

        console.log('Seeding Revenue (Jan, Feb, Mar 2025)...');
        await db.Revenue.destroy({ where: {}, force: true }); // Reset for clean seed
        const revenuesData = [
            { p: 'PRJ001', amom: [1450000, 1580000, 1620000] },
            { p: 'PRJ002', amom: [1800000, 1700000, 1900000] },
            { p: 'PRJ003', amom: [925000, 980000, 950000] },
            { p: 'PRJ004', amom: [2200000, 2200000, 2200000] },
            { p: 'PRJ005', amom: [1900000, 1900000, 1900000] },
            { p: 'PRJ006', amom: [1100000, 1250000, 1180000] },
            { p: 'PRJ007', amom: [2100000, 2100000, 2100000] },
            { p: 'PRJ008', amom: [850000, 850000, 900000] },
            { p: 'PRJ009', amom: [450000, 450000, 450000] },
            { p: 'PRJ010', amom: [680000, 720000, 700000] },
            { p: 'PRJ011', amom: [1350000, 1400000, 1500000] },
            { p: 'PRJ012', amom: [3100000, 3100000, 3100000] },
            { p: 'PRJ013', amom: [1600000, 1550000, 1700000] },
            { p: 'PRJ014', amom: [1600000, 1600000, 1600000] },
            { p: 'PRJ015', amom: [2400000, 2600000, 2500000] },
            { p: 'PRJ016', amom: [1800000, 0, 0] },
            { p: 'PRJ017', amom: [1400000, 1400000, 1400000] },
            { p: 'PRJ018', amom: [550000, 580000, 560000] },
            { p: 'PRJ019', amom: [375000, 375000, 375000] }
        ];

        let revCount = 0;
        for (let i = 0; i < months.length; i++) {
            const m = months[i];
            const date = `${m}-15`;
            for (const r of revenuesData) {
                const amt = r.amom[i];
                if (amt > 0) {
                    const pCode = r.p;
                    const pData = projectData.find(pd => pd.code === pCode);
                    await db.Revenue.create({
                        project_id: projectMap[pCode],
                        client_id: clientMap[pData.client],
                        invoice_amount: amt,
                        invoice_date: date,
                        month: m,
                        project_type: pData.type,
                        vertical: pData.vertical
                    });
                    revCount++;
                }
            }
        }

        console.log(`
╔═══════════════════════════════════════════╗
║     ProfitPulse — Data Seed Summary       ║
╠═══════════════════════════════════════════╣
║ Users:        ${SEED_USERS.length}                           ║
║ Departments:  ${SEED_DEPARTMENTS.length}                           ║
║ Employees:    40                          ║
║ Clients:      ${SEED_CLIENTS.length}                          ║
║ Projects:     20 (19 real + 1 internal)   ║
║ Timesheets:   ${timesheetCount} rows (3 months)        ║
║ Revenue:      ${revCount} entries (3 months)      ║
║ System Config: 3 entries                  ║
╠═══════════════════════════════════════════╣
║ Q1 Revenue: ₹8.06 Cr                     ║
╠═══════════════════════════════════════════╣
║ Login Credentials:                        ║
║ admin@profitpulse.com / Admin@123         ║
║ ritu.finance@profitpulse.com / Finance@123║
║ suresh.dm@profitpulse.com / Delivery@123  ║
║ anita.dh@profitpulse.com / DeptHead@123   ║
║ pooja.hr@profitpulse.com / HRUser@123     ║
╚═══════════════════════════════════════════╝
`);
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
}

run();

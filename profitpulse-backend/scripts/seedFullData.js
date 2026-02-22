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
    { name: 'OpportuneHR Solutions', industry: 'HR Technology' }
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
        console.log('🔄 Performing Hard Reset of Central Database...');

        // sync({ force: true }) drops tables if they exist and recreates them
        await db.sequelize.sync({ force: true });

        console.log('✅ Database Schema Reset Successfully.\n');

        console.log('🌱 Seeding Departments...');
        const deptMap = {};
        for (const d of SEED_DEPARTMENTS) {
            const dept = await db.Department.create(d);
            deptMap[dept.name] = dept.id;
        }

        console.log('🌱 Seeding Users...');
        let adminId = null;
        let dmId = null;
        for (const u of SEED_USERS) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.pwd, salt);
            const user = await db.User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                department_id: u.dept ? deptMap[u.dept] : null
            });
            if (u.role === 'admin') adminId = user.id;
            if (u.role === 'delivery_manager') dmId = user.id;
        }

        console.log('🌱 Seeding System Config...');
        const configs = [
            { key: 'overhead_cost_per_year', value: '180000', description: 'Annual overhead per employee (INR)', data_type: 'number' },
            { key: 'standard_monthly_hours', value: '160', description: 'Standard working hours per month', data_type: 'number' },
            { key: 'financial_year_start_month', value: '4', description: 'April (Indian FY)', data_type: 'number' }
        ];
        for (const c of configs) {
            await db.SystemConfig.create(c);
        }

        console.log('🌱 Seeding Clients...');
        const clientMap = {};
        for (const c of SEED_CLIENTS) {
            const client = await db.Client.create(c);
            clientMap[client.name] = client.id;
        }

        console.log('🌱 Seeding Projects...');
        const projectData = [
            { code: 'PRJ001', name: 'VI Travel E-Sim', type: 'tm', client: 'VI Travel', rate: 1800, cv: null, infra: null, vertical: 'Telecom', status: 'active' },
            { code: 'PRJ002', name: 'HealthConnect Portal', type: 'tm', client: 'MyHealthMeter', rate: 2200, cv: null, infra: null, vertical: 'Healthcare', status: 'active' },
            { code: 'PRJ003', name: 'PlayMo Engine v2', type: 'tm', client: 'PlayMo Inc', rate: 1600, cv: null, infra: null, vertical: 'EdTech', status: 'active' },
            { code: 'PRJ004', name: 'Smart City Grid', type: 'fixed_cost', client: 'Nirmal Energy Ltd', rate: null, cv: 8500000, bh: 4000, infra: null, vertical: 'Energy', status: 'active' },
            { code: 'PRJ005', name: 'ExpoGlobal App', type: 'fixed_cost', client: 'IBC Events Pvt Ltd', rate: null, cv: 4200000, bh: 2000, infra: null, vertical: 'Events', status: 'active' },
            { code: 'PRJ006', name: 'CloudOps Dashboard', type: 'tm', client: 'Peer Connection Inc', rate: 1900, cv: null, infra: null, vertical: 'Social', status: 'active' },
            { code: 'PRJ007', name: 'Automated Billing Sys', type: 'fixed_cost', client: 'Electrical Enterprise', rate: null, cv: 3200000, bh: 1500, infra: null, vertical: 'Manufacturing', status: 'active' },
            { code: 'PRJ008', name: 'Pharma Ledger', type: 'infrastructure', client: 'Signet Excipients Pvt Ltd', rate: null, cv: null, infra: 550000, vertical: 'Pharma', status: 'active' },
            { code: 'PRJ009', name: 'Quantum Mobile UI', type: 'amc', client: 'Quantum CorpHealth Pvt. Ltd.', rate: null, cv: 2400000, infra: null, vertical: 'Healthcare', status: 'active' },
            { code: 'PRJ010', name: 'Legacy Core Support', type: 'tm', client: null, rate: 0, cv: null, infra: null, vertical: 'Internal', status: 'active' }
        ];

        const projectMap = {};
        for (const p of projectData) {
            const proj = await db.Project.create({
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
                start_date: '2024-04-01'
            });
            projectMap[p.code] = proj.id;
        }

        console.log('🌱 Seeding Employees...');
        const empConfigs = [
            { dept: 'Engineering', count: 20, desigs: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Architect'], ctcRange: [600000, 3200000], billable: true },
            { dept: 'QA', count: 6, desigs: ['Automation Tester', 'QA Lead', 'Testing Analyst'], ctcRange: [500000, 1800000], billable: true },
            { dept: 'DevOps', count: 4, desigs: ['Platform Engineer', 'Site Reliability Engineer'], ctcRange: [1000000, 2400000], billable: true },
            { dept: 'Design', count: 4, desigs: ['UI/UX Designer', 'Interaction Specialist'], ctcRange: [700000, 2000000], billable: true },
            { dept: 'Management', count: 4, desigs: ['Project Manager', 'Product Owner'], ctcRange: [1500000, 3500000], billable: false },
            { dept: 'HR', count: 2, desigs: ['HR Specialist'], ctcRange: [600000, 1400000], billable: false },
        ];

        const employeeMap = [];
        let empIdx = 0;
        for (const ec of empConfigs) {
            for (let i = 0; i < ec.count; i++) {
                const code = `EMP${(empIdx + 1).toString().padStart(3, '0')}`;
                const designation = ec.desigs[i % ec.desigs.length];
                const ctc = Math.floor(Math.random() * (ec.ctcRange[1] - ec.ctcRange[0]) + ec.ctcRange[0]);
                const emp = await db.Employee.create({
                    employee_code: code,
                    name: INDIAN_NAMES[empIdx % INDIAN_NAMES.length],
                    department_id: deptMap[ec.dept],
                    designation: designation,
                    annual_ctc: ctc,
                    is_billable: ec.billable,
                    joining_date: '2024-01-01',
                    financial_year: '2024-2025',
                    is_active: true
                });
                employeeMap.push({ id: emp.id, billable: ec.billable, dept: ec.dept });
                empIdx++;
            }
        }

        // Dynamically generate months from Apr 2024 to current month
        const now = new Date();
        const endYear = now.getFullYear();
        const endMonth = now.getMonth(); // 0-indexed, so this is "last month end"
        const months = [];
        let curDate = new Date(2024, 3, 1); // Start from April 2024
        while (curDate.getFullYear() < endYear || (curDate.getFullYear() === endYear && curDate.getMonth() <= endMonth)) {
            const yr = curDate.getFullYear();
            const mo = String(curDate.getMonth() + 1).padStart(2, '0');
            months.push(`${yr}-${mo}`);
            curDate.setMonth(curDate.getMonth() + 1);
        }
        console.log(`🌱 Seeding ${months.length} Months of Activity Data (${months[0]} to ${months[months.length - 1]})...`);

        const timesheetEntries = [];
        const revenueEntries = [];
        let tsCount = 0;
        let revCount = 0;

        for (const month of months) {
            console.log(`   🗓️  Processing ${month}...`);

            // Accumulate Timesheets
            for (const emp of employeeMap) {
                const projCode = emp.billable
                    ? ['PRJ001', 'PRJ002', 'PRJ003', 'PRJ004', 'PRJ005', 'PRJ006', 'PRJ007'][Math.floor(Math.random() * 7)]
                    : 'PRJ010';

                timesheetEntries.push({
                    employee_id: emp.id,
                    project_id: projectMap[projCode],
                    billable_hours: emp.billable ? (145 + Math.floor(Math.random() * 25)) : 0,
                    non_billable_hours: emp.billable ? (10 + Math.floor(Math.random() * 10)) : 160,
                    month: month
                });
                tsCount++;
            }

            // Accumulate Revenue (Simulating invoices generated mid-month)
            const monthIdx = months.indexOf(month);
            const growthFactor = 1 + (monthIdx * 0.015); // ~1.5% monthly growth

            for (const p of projectData) {
                if (!p.client) continue; // Skip internal/clientless projects

                let baseAmt = 0;
                if (p.type === 'tm') {
                    baseAmt = p.rate * 150 * 3;
                } else if (p.type === 'fixed_cost') {
                    baseAmt = p.cv / 12;
                } else if (p.type === 'amc') {
                    baseAmt = p.cv / 12;
                } else if (p.type === 'infrastructure') {
                    baseAmt = 600000 + (Math.random() * 100000);
                }

                const noise = 0.92 + (Math.random() * 0.16);
                const finalAmt = Math.round(baseAmt * growthFactor * noise);

                if (finalAmt > 0) {
                    revenueEntries.push({
                        project_id: projectMap[p.code],
                        client_id: clientMap[p.client],
                        invoice_amount: finalAmt,
                        invoice_date: `${month}-15`,
                        month: month,
                        project_type: p.type,
                        vertical: p.vertical
                    });
                    revCount++;
                }
            }
        }

        console.log(`🚀 Bulk Inserting ${timesheetEntries.length} Timesheets...`);
        await db.Timesheet.bulkCreate(timesheetEntries);

        console.log(`🚀 Bulk Inserting ${revenueEntries.length} Revenues...`);
        await db.Revenue.bulkCreate(revenueEntries);

        console.log(`
✅ SEEDING COMPLETE
---------------------------
Departments:  ${SEED_DEPARTMENTS.length}
Users:        ${SEED_USERS.length}
Clients:      ${SEED_CLIENTS.length}
Projects:     10
Employees:    40
Timesheets:   ${timesheetEntries.length} rows (${months.length} months)
Revenue:      ${revenueEntries.length} rows (${months.length} months)
---------------------------
Login: admin@profitpulse.com / Admin@123
`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    }
}

run();

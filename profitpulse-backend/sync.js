import db from './src/models/index.js';

// Setup utility to automatically sync the DB schemas mapped by Sequelize rather than writing 500 lines of queryInterface
const setup = async () => {
    try {
        await db.sequelize.sync({ force: true });
        console.log("Database & tables created!");

        // Let's create an admin user
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.default.genSalt(10);
        const hashedPassword = await bcrypt.default.hash('Admin@123', salt);

        await db.User.create({
            name: "System Admin",
            email: "admin@profitpulse.com",
            password: hashedPassword,
            role: "admin",
            is_active: true
        });

        await db.SystemConfig.bulkCreate([
            { key: 'overhead_cost_per_year', value: '180000', description: 'Overhead' },
            { key: 'standard_monthly_hours', value: '160', description: 'Hrs' }
        ]);
        console.log("Seeding complete!");
        process.exit(0);
    } catch (e) {
        console.error("Setup failed", e);
        process.exit(1);
    }
}
setup();

import db from './src/models/index.js';
try {
    const depts = await db.Department.findAll();
    console.log(JSON.stringify(depts, null, 2));
    process.exit(0);
} catch (err) {
    console.error(err);
    process.exit(1);
}

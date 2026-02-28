const db = require('./src/models/index.js');
db.Department.findAll()
    .then(depts => {
        console.log(JSON.stringify(depts, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

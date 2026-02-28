import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import db from './src/models/index.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Test Database Connection and Sync
db.sequelize
    .authenticate()
    .then(() => {
        logger.info('Database connection established successfully.');
        // Start Server only if the database is connected
        server.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error('Unable to connect to the database:', err);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Trigger nodemon restart

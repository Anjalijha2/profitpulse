'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // We'll just rely on sequelize.sync() for the test to save massive boilerplate across 10 files.
        // In a real scenario, this would have queryInterface.createTable() calls.
    },

    async down(queryInterface, Sequelize) {
    }
};

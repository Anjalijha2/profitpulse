describe('Data Management', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.login('admin@profitpulse.com', 'Admin@123');
    });

    it('Navigate to /employees → verify 40 employees in table', () => {
        cy.contains('Data Management').click();
        cy.contains('Employees').click();
        cy.url().should('include', '/employees');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
        cy.get('.ant-pagination-total-text').should('contain', '40');

        // Search Rajesh
        cy.get('input[placeholder="Search employees..."]').type('Rajesh');
        cy.wait(500); // Wait for debounce and query
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
        cy.get('.ant-pagination-total-text').should('not.contain', '40');

        // View Details
        cy.contains('View Details').first().click();
        cy.url().should('include', '/employees/');
        cy.contains('Employee Information').should('be.visible');
    });

    it('Navigate to /projects → verify projects listed', () => {
        cy.contains('Data Management').click();
        cy.contains('Projects').click();
        cy.url().should('include', '/projects');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);

        // Filter by Status
        cy.get('.ant-select-selection-search-input').click();
        cy.contains('Completed').click(); // Make sure this option exists in Select
        cy.wait(500);
        // cy.get('.ant-table-row').should('have.length.greaterThan', 0);

        // Clear Search/Filter
        cy.visit('/projects');
        cy.wait(500);

        // View Details
        cy.contains('View Details').first().click();
        cy.url().should('include', '/projects/');
        cy.contains('Project Summary').should('be.visible');
    });
});

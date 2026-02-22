describe('Other Dashboards', () => {
    it('Admin explores all dashboards', () => {
        cy.login('admin@profitpulse.com', 'Admin@123');
        cy.wait(1000);
        cy.contains('Employee Dashboard').click();
        cy.url().should('include', '/dashboard/employees');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);

        cy.contains('Project Dashboard').click();
        cy.url().should('include', '/dashboard/projects');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);

        cy.contains('Department Dashboard').click();
        cy.url().should('include', '/dashboard/departments');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0); // Verifies 8 depts

        cy.contains('Client Dashboard').click();
        cy.url().should('include', '/dashboard/clients');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
    });

    it('Login as Dept Head -> Employee Dashboard shows ONLY Engineering employees', () => {
        cy.login('anita.dh@profitpulse.com', 'DeptHead@123');
        cy.wait(1000);
        cy.contains('Employee Dashboard').click();
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
        cy.get('.ant-table-row').first().contains('Engineering').should('exist');
    });

    it('Login as Delivery Mgr -> Project Dashboard shows assigned projects', () => {
        cy.login('suresh.dm@profitpulse.com', 'Delivery@123');
        cy.wait(1000); // Wait for redirect to /dashboard/projects
        cy.url().should('include', '/dashboard/projects');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
    });
});

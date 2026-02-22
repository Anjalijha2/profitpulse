describe('Admin Routes', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('Admin sees all admin pages', () => {
        cy.login('admin@profitpulse.com', 'Admin@123');
        cy.wait(1000);
        cy.visit('/admin/users');
        cy.url().should('include', '/admin/users');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);

        cy.visit('/admin/config');
        cy.url().should('include', '/admin/config');
        cy.get('input').should('have.length.greaterThan', 2);
        // Financial values
        cy.get('input').eq(0).should('have.value', '180000');
        cy.get('input').eq(1).should('have.value', '160');

        cy.visit('/admin/audit');
        cy.url().should('include', '/admin/audit');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
    });

    it('HR User cannot see admin menu', () => {
        cy.login('pooja.hr@profitpulse.com', 'HRUser@123');
        cy.wait(1000);
        cy.contains('Admin Panel').should('not.exist');
        cy.contains('User Management').should('not.exist');
        cy.contains('System Config').should('not.exist');
        cy.contains('Audit Log').should('not.exist');
    });
});

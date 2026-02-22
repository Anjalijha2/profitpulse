describe('RBAC Verification', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('Finance Dashboard Access', () => {
        cy.login('ritu.finance@profitpulse.com', 'Finance@123');
        cy.wait(1000);
        cy.contains('Executive Overview').should('be.visible');
        cy.contains('Project Dashboard').should('be.visible');
        cy.contains('Department Dashboard').should('be.visible');
        cy.contains('Client Dashboard').should('be.visible');
        cy.contains('Admin Panel').should('not.exist');
    });

    it('HR Dashboard Access', () => {
        cy.login('pooja.hr@profitpulse.com', 'HRUser@123');
        cy.wait(1000);
        cy.contains('Employee Dashboard').should('be.visible');
        cy.contains('Executive Overview').should('not.exist');
    });

    it('Delivery Mgr Dashboard Access', () => {
        cy.login('suresh.dm@profitpulse.com', 'Delivery@123');
        cy.wait(1000);
        cy.url().should('include', '/dashboard/projects');
        cy.contains('Project Dashboard').should('be.visible');
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
    });

    it('Dept Head Dashboard Access', () => {
        cy.login('anita.dh@profitpulse.com', 'DeptHead@123');
        cy.wait(1000);
        cy.url().should('include', '/dashboard/departments');
        cy.contains('Employee Dashboard').click();
        cy.get('.ant-table-row').should('have.length.greaterThan', 0);
    });
});

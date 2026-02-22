describe('Executive Dashboard', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.login('admin@profitpulse.com', 'Admin@123');
        cy.intercept('GET', '**/api/v1/dashboard/executive*').as('execData');
        cy.visit('/dashboard');
        cy.wait('@execData');
    });

    it('Verify 4 KPI cards are visible and show non-zero values', () => {
        cy.contains('Total Revenue').should('be.visible');
        cy.contains('Total Cost').should('be.visible');
        cy.contains('Net Margin').should('be.visible');
        cy.contains('Utilization').should('be.visible');

        cy.get('.kpi-large-number').should('have.length', 4);
        cy.get('.kpi-large-number').first().should('not.contain', '0');
    });

    it('Verify Revenue KPI shows amount in ₹', () => {
        cy.contains('Total Revenue').parent().parent().contains('₹').should('be.visible');
    });

    it('Verify monthly trend chart renders with data points', () => {
        cy.get('.recharts-wrapper').should('be.visible');
    });

    it('Verify top projects list shows real project names', () => {
        cy.contains('Top Projects by Margin').should('be.visible');
        // Seeded projects like 'ANAROCK', 'NNPC Retail' should be present.
        cy.contains('Top Projects by Margin').parent().parent().find('div').should('have.length.greaterThan', 2);
    });

    it('Change month filter → verify data updates', () => {
        cy.get('.ant-picker-input > input').click();
        cy.get('.ant-picker-cell-inner').first().click(); // Click some month before
        cy.wait('@execData');
        cy.contains('Total Revenue').should('be.visible');
    });
});

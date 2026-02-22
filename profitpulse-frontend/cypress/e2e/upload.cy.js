describe('Upload Center', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.login('admin@profitpulse.com', 'Admin@123');
        cy.visit('/upload-center');
    });

    it('Verify type selection options', () => {
        cy.contains('Upload Center').should('be.visible');
        cy.get('.ant-select-selector').click();
        cy.contains('Employee Master').should('be.visible');
        cy.contains('Timesheets').should('be.visible');
        cy.contains('Revenue').should('be.visible');
    });

    it('Click Download Template', () => {
        cy.get('.ant-select-selector').click();
        cy.contains('Employee Master').click();
        cy.contains('Next').click();

        // This verifies the button is present correctly
        cy.contains('Download Template').should('be.visible');

        // We can optionally intercept the template download API to ensure it triggers
        cy.intercept('GET', '**/api/v1/uploads/template/*').as('downloadTemplate');
        cy.contains('Download Template').click();
        cy.wait('@downloadTemplate').its('response.statusCode').should('eq', 200);
    });

    it('Upload demo verification flow', () => {
        cy.get('.ant-select-selector').click();
        cy.contains('Employee Master').click();
        cy.contains('Next').click();

        // Mock a file selection as Cypress file upload with Ant Design can be tricky,
        // but testing the UI step process:
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('dummy excel content'),
            fileName: 'employees.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }, { force: true });

        // Verifying it appears
        cy.contains('employees.xlsx').should('be.visible');
        cy.contains('Run Dry-Run Validation').should('be.visible');
    });
});

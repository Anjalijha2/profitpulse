describe('Auth Flows', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('Login with valid admin credentials → verify redirect to Executive Dashboard', () => {
        cy.intercept('POST', '**/api/v1/auth/login').as('loginReq');
        cy.visit('/login');
        cy.get('#login_email').type('admin@profitpulse.com');
        cy.get('#login_password').type('Admin@123');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
        cy.url().should('include', '/dashboard');
    });

    it('Login with wrong password → verify error message', () => {
        cy.intercept('POST', '**/api/v1/auth/login').as('loginReq');
        cy.visit('/login');
        cy.get('#login_email').type('admin@profitpulse.com');
        cy.get('#login_password').type('wrongpass');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginReq').its('response.statusCode').should('not.eq', 200);
        cy.contains('Invalid email or password').should('be.visible');
    });

    it('Login with each role → verify correct redirect', () => {
        const roles = [
            { email: 'admin@profitpulse.com', pass: 'Admin@123', redirect: '/dashboard' },
            { email: 'ritu.finance@profitpulse.com', pass: 'Finance@123', redirect: '/dashboard' },
            { email: 'suresh.dm@profitpulse.com', pass: 'Delivery@123', redirect: '/dashboard/project' },
            { email: 'anita.dh@profitpulse.com', pass: 'DeptHead@123', redirect: '/dashboard/department' },
            { email: 'pooja.hr@profitpulse.com', pass: 'HRUser@123', redirect: '/dashboard/employee' }
        ];

        roles.forEach(r => {
            cy.clearLocalStorage();
            cy.intercept('POST', '**/api/v1/auth/login').as(`login_${r.email}`);
            cy.visit('/login');
            cy.get('#login_email').type(r.email);
            cy.get('#login_password').type(r.pass);
            cy.get('button[type="submit"]').click();
            cy.wait(`@login_${r.email}`);
            cy.url().should('include', r.redirect);
            // Click logout
            cy.get('.ant-avatar').click();
            cy.contains('Sign out').click({ force: true });
            cy.url().should('include', '/login');
        });
    });

    it('Access protected route without login → verify redirect to /login', () => {
        cy.visit('/');
        cy.url().should('include', '/login');
    });
});

Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login')
    cy.get('#login_email').clear().type(email)
    cy.get('#login_password').clear().type(password)
    cy.get('button[type="submit"]').click()
    // Wait for the login API to finish
    // A better approach is to intercept the API
})

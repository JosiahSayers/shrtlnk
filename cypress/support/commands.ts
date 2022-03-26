// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import "@testing-library/cypress/add-commands";

const customCommands = {
  login: (email = "test@test.com", password = "password") => {
    cy.visit("/developer/signin");
    cy.findByPlaceholderText("Email").type(email);
    cy.findByPlaceholderText("Password").type(password);
    cy.findByText("Submit").click();
    cy.location('pathname', {timeout: 10000})
      .should('include', '/developer/applications');
  },
  preserveAuthCookie: () => {
    Cypress.Cookies.preserveOnce("shrtlnk_session");
  },
  logout: () => {
    cy.visit("/developer/signout")
  }
};

Object.keys(customCommands).forEach((commandKey) => {
  Cypress.Commands.add(commandKey as any, (customCommands as any)[commandKey]);
});

type CustomCommands = typeof customCommands;
declare global {
  namespace Cypress {
    interface Chainable extends CustomCommands {}
  }
}

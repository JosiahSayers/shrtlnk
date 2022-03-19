describe('Admin Dashboard', () => {
  it("loads the dashboard page and expected graphs", () => {
    cy.login("admin@test.com");
    cy.findByText("Admin Dashboard").click();
    cy.findByText("Admin Tools");
    cy.findAllByText("Dashboard");
    cy.findByText("Impersonate");
    cy.findByText("Shrtlnk Totals");
    cy.findByText("User Totals");
    cy.findByText("New Shrtlnks");
    cy.findByText("Shrtlnks Loaded");
    cy.findByText("New Users");
    cy.findByText("New Applications");
  });
});

describe("Admin Impersonate", () => {
  it("displays the page title", () => {
    cy.login("admin@test.com");
    cy.findByText("Admin Dashboard").click();
    cy.findByText("Impersonate").click();
    cy.findAllByText("Impersonate").should("have.length", 2);
  });
});

export { };

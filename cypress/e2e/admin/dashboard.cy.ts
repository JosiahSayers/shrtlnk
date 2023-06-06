describe("Admin Dashboard", () => {
  before(() => cy.login("admin@test.com"));
  beforeEach(() => cy.preserveAuthCookie());
  after(() => cy.logout());

  it("loads the dashboard page and expected graphs", () => {
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findByText("Admin Tools");
    cy.findAllByText("Dashboard");
    cy.findByText("Impersonate");
    cy.findAllByText("Shrtlnk Totals").should("have.class", "card-title");
    cy.findAllByText("User Totals").should("have.class", "card-title");
    cy.findAllByText("Shrtlnks").should("have.class", "card-title");
    cy.findAllByText("Users").should("have.class", "card-title");
  });

  it("allows a user to change the amount of days to query data", () => {
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findByLabelText("Days to show:").should("have.value", "10");
    cy.findByLabelText("Days to show:").select("20");
    cy.location("search").should("include", "days=20");
  });
});

export {};

describe("Admin Impersonate", () => {
  before(() => cy.login("admin@test.com"));
  beforeEach(() => {
    cy.preserveAuthCookie();
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findByText("Impersonate").click();
  });
  after(() => cy.logout());

  it("displays the page title", () => {
    cy.findAllByText("Impersonate").should("have.length", 2);
  });

  it("lists all users in a select", () => {
    cy.findByText("Admin Developer (admin@test.com)");
    cy.findByText("Appless Developer (noapps@test.com)");
    cy.findByText("Legacy User (legacy@test.com)");
    cy.findByText("John Developer (test@test.com)");
    cy.get("select").children().should("have.length", 5);
  });

  it("allows an admin to start and stop impersonating a user", () => {
    cy.get("select").select("John Developer (test@test.com)");
    cy.findByText("Start Impersonating").click();
    cy.findByText("Admin Developer impersonating!");
    cy.findByText("Stop Impersonating");
    cy.findByText("Hey there, John");
    cy.findByText("Admin Dashboard").should("not.exist");
    cy.findByText("Stop Impersonating").click();
    cy.findByText("Hey there, Admin");
    cy.findAllByText("Admin Dashboard");
  });

  it("logs an impersonation record in the db", () => {
    cy.task("getImpersonations").then((impersonations: any) => {
      const last = impersonations[impersonations.length - 1];
      expect(last.impersonator.email).to.eq("admin@test.com");
      expect(last.impersonated.email).to.eq("test@test.com");
    });
  });
});

export {};

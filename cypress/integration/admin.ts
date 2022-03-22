describe("Admin", () => {
  before(() => cy.login("admin@test.com"));
  beforeEach(() => cy.preserveAuthCookie());
  after(() => cy.logout());

  describe('Admin Dashboard', () => {
    it("loads the dashboard page and expected graphs", () => {
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
    beforeEach(() => {
      cy.findByText("Admin Dashboard").click();
      cy.findByText("Impersonate").click();
    });

    it("displays the page title", () => {
      cy.findAllByText("Impersonate").should("have.length", 2);
    });
    
    it("lists all users in a select", () => {
      cy.findByText("Admin Developer (admin@test.com)");
      cy.findByText("Appless Developer (noapps@test.com)");
      cy.findByText("Legacy User (legacy@test.com)");
      cy.findByText("John Developer (test@test.com)");
      cy.get("select").children().should("have.length", 4);
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
      cy.findByText("Admin Dashboard");
    });
  });
});

export { };

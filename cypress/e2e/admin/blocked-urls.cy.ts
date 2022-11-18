describe("Admin Blocked URLs", () => {
  before(() => cy.login("admin@test.com"));
  beforeEach(() => {
    cy.preserveAuthCookie();
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findAllByText("Blocked URLs").filter("a").click();
    cy.get("h2").should("be.visible").and("have.text", "Blocked URLs");
  });
  after(() => cy.logout());

  it("Displays all blocked links in a table", () => {
    cy.get("h3").should("not.exist");

    cy.findByText("Blocked");
    cy.findByText("Link Created");
    cy.findByText("Application");
    cy.findByText("Found By");
    cy.findByText("URL");

    cy.get("tr").should("have.length", 3);

    cy.findAllByText("Seed Data").should("have.length", 2);
    cy.findByText("3/8/2022, 7:34:27 AM");
    cy.findByText("3/5/2022, 7:35:27 AM");
    cy.findByText("Test App");
    cy.findByText("http://totally-not-a.scam");

    cy.findAllByText("3/5/2022, 7:34:27 AM").should("have.length", 2);
    cy.findByText("invalid");
    cy.findByText("http://realbank.freesites.com");
  });

  it("Allows you to filter to a specific date", () => {
    cy.location("pathname").then((path) =>
      cy.visit(`${path}?utc_date=3/8/2022`)
    );
    cy.get("h3").should("have.text", "Filtered to date: 3/8/2022 (show all)");
    cy.get("tr").should("have.length", 2);

    cy.findByText("3/8/2022, 7:34:27 AM");
    cy.findByText("3/5/2022, 7:35:27 AM");
    cy.findByText("Test App");
    cy.findByText("Seed Data");
    cy.findByText("http://totally-not-a.scam");

    cy.findByText("3/5/2022, 7:34:27 AM").should("not.exist");
    cy.findByText("invalid").should("not.exist");
    cy.findByText("http://realbank.freesites.com").should("not.exist");
  });
});

export {};

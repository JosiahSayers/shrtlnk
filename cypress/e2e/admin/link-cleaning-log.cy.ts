describe("Admin Link Cleaning Log", () => {
  beforeEach(() => {
    cy.login("admin@test.com");
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findByText("Link Cleaning Log").click();
    cy.get("h2").should("be.visible").and("have.text", "Link Cleaning Log");
  });
  after(() => cy.logout());

  it("Displays all log data in a table", () => {
    cy.findByText("Date");
    cy.findByText("Time to complete");
    cy.findByText("Links cleaned");
    cy.findByText("Status");
    cy.findAllByText("3/5/2022, 7:34:27 AM").should("have.length", 3);
    cy.findAllByText("5.00s").should("have.length", 3);
    cy.findByText(4);
    cy.findAllByText(0).should("have.length", 2);
    cy.findAllByText("success").should("have.length", 2);
    cy.findByText("failure");
  });

  it("Allows the user to click on a date and see all blocked URLs from that date", () => {
    cy.findAllByText("3/5/2022, 7:34:27 AM").first().click();
    cy.location("pathname").should("eq", "/developer/admin/blocked-urls");
    cy.location("search").should("eq", "?utc_date=3/5/2022");
  });
});

export {};

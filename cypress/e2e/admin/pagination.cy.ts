describe("pagination", () => {
  beforeEach(() => {
    cy.login("admin@test.com");
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findAllByText("Blocked URLs").filter("a").click();
    cy.get("h2").should("be.visible").and("have.text", "Blocked URLs");
  });
  after(() => cy.logout());

  it("disables the previous button when on the first page", () => {
    cy.visit("/developer/admin/blocked-urls?pageSize=1&page=1");
    cy.findByText("Back").should("be.disabled");
    cy.findByText("Next").should("not.be.disabled");
  });

  it("disables the next button when on the last page", () => {
    cy.visit("/developer/admin/blocked-urls?pageSize=1&page=2");
    cy.findByText("Back").should("not.be.disabled");
    cy.findByText("Next").should("be.disabled");
  });

  it("goes to the next page when the next button is clicked", () => {
    cy.visit("/developer/admin/blocked-urls?pageSize=1&page=1");
    cy.findByText("Next").click();
    cy.location("search").should("include", "page=2");
  });

  it("goes to the previous page when the back button is clicked", () => {
    cy.visit("/developer/admin/blocked-urls?pageSize=1&page=2");
    cy.findByText("Back").click();
    cy.location("search").should("include", "page=1");
  });
});

export {};

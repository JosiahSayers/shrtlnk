describe("Admin", () => {
  before(() => cy.login("admin@test.com"));
  beforeEach(() => cy.preserveAuthCookie());
  after(() => cy.logout());

  describe("Admin Dashboard", () => {
    it("loads the dashboard page and expected graphs", () => {
      cy.findAllByText("Admin Dashboard").filter(":visible").click();
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
      cy.findAllByText("Admin Dashboard").filter(":visible").click();
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

  describe("Admin Clean Links Log", () => {
    beforeEach(() => {
      cy.findAllByText("Admin Dashboard").filter(":visible").click();
      cy.findByText("Link Cleaning Log").click();
      cy.get("h2").should("be.visible").and("have.text", "Link Cleaning Log");
    });

    it("Displays all log data in a table", () => {
      cy.findByText("Date");
      cy.findByText("Time to complete");
      cy.findByText("Links cleaned");
      cy.findByText("Status");
      cy.findAllByText("3/5/2022, 7:34:27 AM").should("have.length", 2);
      cy.findAllByText("5.00s").should("have.length", 2);
      cy.findByText(4);
      cy.findByText(0);
      cy.findByText("success");
      cy.findByText("failure");
    });

    it("Allows the user to click on a date and see all blocked URLs from that date", () => {
      cy.findAllByText("3/5/2022, 7:34:27 AM").first().click();
      cy.location("pathname").should("eq", "/developer/admin/blocked-urls");
      cy.location("search").should("eq", "?date=3/5/2022");
    });
  });

  describe("Admin Blocked URLs", () => {
    beforeEach(() => {
      cy.findAllByText("Admin Dashboard").filter(":visible").click();
      cy.findAllByText("Blocked URLs").filter("a").click();
      cy.get("h2").should("be.visible").and("have.text", "Blocked URLs");
    });

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
      cy.location("pathname").then((path) => cy.visit(`${path}?date=3/8/2022`));
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
});

export {};

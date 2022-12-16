describe("Application CRUD", () => {
  before(() => cy.login());
  beforeEach(() => cy.preserveAuthCookie());
  after(() => cy.logout());

  describe("Creating an application", () => {
    it("requires an application name", () => {
      cy.findByText("Add an application").click();
      cy.findByText("Create").click();
      cy.findByText("Name is required");
    });

    it("Allows you to create an application without a website", () => {
      cy.findByLabelText("Application Name*").type("Test App 1");
      cy.findByText("Create").click();
      cy.findByText("Test App 1");
      cy.task("deleteApplication", {
        name: "Test App 1",
        email: "test@test.com",
      });
    });
  });

  describe("Updating an application", () => {
    it("allows you to update the name and website of an existing application", () => {
      const name = "test-editing-app";
      const editedName = name + "-edited";
      cy.task("createApplication", {
        email: "test@test.com",
        app: {
          name,
        },
      });
      cy.reload();
      cy.findByText(name)
        .parent("div")
        .within(() => {
          cy.findByText("Edit").click();
        });
      cy.findByLabelText("Application Name*").clear().type(editedName);
      cy.findByLabelText("URL of Application").type("https://thisisatest.com");
      cy.findByText("Update").click();
      cy.findByText(editedName);
      cy.findAllByText(
        (content, node) =>
          node?.textContent === "Website: https://thisisatest.com"
      );
      cy.task("deleteApplication", {
        name: editedName,
        email: "test@test.com",
      });
    });
  });

  describe("Deleting an application", () => {
    beforeEach(() => cy.visit("/developer/applications"));

    it("allows you to delete an application", () => {
      cy.task("createApplication", {
        email: "test@test.com",
        app: {
          name: "Test App 1",
        },
      });
      cy.reload();
      cy.findByText("Test App 1")
        .parent("div")
        .within(() => {
          cy.findByText("Delete").click();
        });
      cy.findByText("Are you sure that you want to delete this?");
      cy.findByText("All applications using this API key will no longer work.");
      cy.findByText(
        "All shrtlnks that were created through this application will not be deleted and will remain functional."
      );
      cy.findByText((content, node) => node?.textContent === "App: Test App 1");
      cy.findByText("Delete").click();
      cy.findByText("Test App 1").should("not.exist");
    });

    it("allows you to cancel and go back without deleting anything", () => {
      cy.findByText("Test App")
        .parent("div")
        .within(() => cy.findByText("Delete").click());
      cy.findByText("Cancel").click();
      cy.findByText("Test App");
    });
  });
});

export {};

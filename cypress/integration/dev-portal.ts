describe("Developer landing page", () => {
  before(() => cy.visit("/developer"));

  it("has the correct static content", () => {
    cy.findByText("shrtlnk");
    cy.findByText("Dev Portal");
    cy.findByText("Documentation");
    cy.findByText("Register");
    cy.findAllByText("Sign In").should("have.length", 2);

    cy.findByText("Welcome, artisan of the internet!");
    cy.findByText(
      "Shrtlnk strives to be the easiest API to integrate into your project."
    );
    cy.findByText("Here's our onboarding process:");

    cy.findByText("Create an account");
    cy.findByText("Click the button below to get started.");
    cy.findByText("Create Account");

    cy.findByText("Add an application");
    cy.findByText(
      "You can have as many applications as you would like, we don't like limits here!"
    );

    cy.findByText("Use the API");
    cy.findByText(
      "Each application will be given a private API key, use that to call shrtlnk"
    );
    cy.findByText("View Documentation");
  });
});

describe("Signing into an account", () => {
  beforeEach(() => cy.visit("/developer/signin"));

  it("requires email and password", () => {
    cy.findByText("Submit").click();
    cy.findByText('"email" is not allowed to be empty');
    cy.findByText('"password" is not allowed to be empty');
  });

  it("display a form level error when the email is not found", () => {
    cy.findByPlaceholderText("Email").type("test@test.co");
    cy.findByPlaceholderText("Password").type("password");
    cy.findByText("Submit").click();
    cy.findByText("Could not log you in with these credentials");
  });

  it("displays a form level error when the email is found but the password is incorrect", () => {
    cy.findByPlaceholderText("Email").type("test@test.com");
    cy.findByPlaceholderText("Password").type("incorrect password");
    cy.findByText("Submit").click();
    cy.findByText("Could not log you in with these credentials");
  });

  it("logs the user in when given correct credentials", () => {
    cy.findByPlaceholderText("Email").type("test@test.com");
    cy.findByPlaceholderText("Password").type("password");
    cy.findByText("Submit").click();
    cy.findByText("Add an application");
  });

  it("shows the updated navbar for logged in users", () => {
    cy.login();
    cy.findByText("My Applications");
    cy.findByText("Hey there, John");
    cy.findByText("Sign Out");
  });
});

describe("Application list", () => {
  it("shows the correct content when the user has no applications", () => {
    cy.login("noapps@test.com");
    cy.get(".alert.alert-light").should(
      "have.text",
      "Hi, Appless.It looks like you haven't added an application yet. Click here to get started!"
    );
    cy.findByText("Click here").click();
    cy.findByText("Application Name");
  });

  it("lists the applications that a user has setup", () => {
    cy.login();
    cy.findByText("Test App");
    cy.findByText((content, node) => node?.textContent === "Status: Valid");
    cy.findByText(
      (content, node) => node?.textContent === "API Key: test-api-key"
    );
    cy.findByText(
      (content, node) => node?.textContent === "Created on: Sat Mar 05 2022"
    );
    cy.findByText(
      (content, node) => node?.textContent === "Website: http://localhost:3000"
    );
    cy.findByText(
      (content, node) =>
        node?.textContent === "Shrtlnks created with application: 2"
    );
    cy.findByText(
      (content, node) =>
        node?.textContent ===
        "Shrtlnk clicks from this application's shrtlnks: 3"
    );
    cy.findByText(
      (content, node) =>
        node?.textContent ===
        "Unsafe URLs detected and blocked from this application: 0"
    );
  });
});

describe("Application CRUD", () => {
  before(() => cy.login());
  beforeEach(() => cy.preserveAuthCookie());

  describe("Creating an application", () => {
    beforeEach(() => cy.visit("/developer/applications/new"));

    it("requires an application name", () => {
      cy.findByText("Submit").click();
      cy.findByText('"name" is not allowed to be empty');
    });

    it("Allows you to create an application without a website", () => {
      cy.findByPlaceholderText("Name").type("Test App 1");
      cy.findByText("Submit").click();
      cy.findByText("Test App 1");
    });
  });

  describe("Deleting an application", () => {
    beforeEach(() => cy.visit("/developer/applications"));

    it("allows you to delete an application", () => {
      cy.findByText("Test App 1")
        .parent("div")
        .parent("div")
        .within(() => {
          cy.findByText("Delete App").click();
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
        .parent("div")
        .within(() => cy.findByText("Delete App").click());
      cy.findByText("Cancel").click();
      cy.findByText("Test App");
    });
  });
});

export {};

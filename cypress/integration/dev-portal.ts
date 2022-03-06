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
    cy.findByPlaceholderText("Password").type("a-really-bad-password");
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
    cy.findByPlaceholderText("Password").type("a-really-bad-password");
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
  before(() => cy.login());
  beforeEach(() => cy.preserveAuthCookie());

  it("lists the applications that a user has setup", () => {
    cy.findByText("Test App");
  });
});

export {};

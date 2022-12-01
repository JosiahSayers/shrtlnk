describe("Registering for an account", () => {
  beforeEach(() => cy.visit("/developer/register"));
  after(() => cy.logout());

  it("requires all fields", () => {
    cy.findByText("Sign up").click();
    cy.findByText('"First Name" is not allowed to be empty');
    cy.findByText('"Last Name" is not allowed to be empty');
    cy.findByText('"Email" is not allowed to be empty');
    cy.findByText('"Password" is not allowed to be empty');
  });

  it("requires that password is at least 8 characters", () => {
    cy.findByLabelText("Password*").clear().type("short");
    cy.findByText("Sign up").click();
    cy.findByText('"Password" length must be at least 8 characters long');
  });

  it("allows you to register for an account", () => {
    const email = `integration-${new Date().getTime()}@test.com`;
    cy.findByLabelText("First Name*").clear().type("integration");
    cy.findByLabelText("Last Name*").clear().type(new Date().toLocaleString());
    cy.findByLabelText("Email Address*").clear().type(email);
    cy.findByLabelText("Password*").clear().type("password");
    cy.findByText("Sign up").click();
    cy.findByText("Your Applications");
    cy.findByText("Hey there, integration");
    cy.task("deleteUser", email);
  });

  it("redirects to the applications page when logged in", () => {
    cy.login();
    cy.visit("/developer/register");
    cy.findByText("Test App");
  });

  it("keeps you signed in after registering", () => {
    const email = `integration-${new Date().getTime()}@test.com`;
    cy.findByLabelText("First Name*").clear().type("integration");
    cy.findByLabelText("Last Name*").clear().type(new Date().toLocaleString());
    cy.findByLabelText("Email Address*").clear().type(email);
    cy.findByLabelText("Password*").clear().type("password");
    cy.findByText("Sign up").click();
    cy.findByText("Your Applications");
    cy.findByText("Hey there, integration");
    cy.findAllByText("Documentation").first().click();
    cy.findAllByText("My Applications").first().click();
    cy.findByText("Hey there, integration");
    cy.task("deleteUser", email);
  });
});

export {};

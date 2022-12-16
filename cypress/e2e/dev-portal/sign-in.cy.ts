describe("Signing into an account", () => {
  beforeEach(() => cy.visit("/developer/signin"));
  after(() => cy.logout());

  it("has a link to the password reset page", () => {
    cy.findByText("Reset it").should(
      "have.attr",
      "href",
      "/developer/request-password-reset"
    );
  });

  it("requires email and password", () => {
    cy.findByText("Sign in").click();
    cy.findByText("Email is required");
    cy.findByText("Password is required");
  });

  it("display a form level error when the email is not found", () => {
    cy.findByLabelText("Email Address").type("test@test.co");
    cy.findByLabelText("Password").type("password");
    cy.findByText("Sign in").click();
    cy.findByText("Could not log you in with these credentials");
  });

  it("displays a form level error when the email is found but the password is incorrect", () => {
    cy.findByLabelText("Email Address").type("test@test.com");
    cy.findByLabelText("Password").type("incorrect password");
    cy.findByText("Sign in").click();
    cy.findByText("Could not log you in with these credentials");
  });

  it("keeps the form populated with previous values when there is a sign in error", () => {
    cy.findByLabelText("Email Address").type("test@test.com");
    cy.findByLabelText("Password").type("incorrect password");
    cy.findByText("Sign in").click();
    cy.findByText("Could not log you in with these credentials");
    cy.findByLabelText("Email Address").should("have.value", "test@test.com");
    cy.findByLabelText("Password").should("have.value", "incorrect password");
  });

  it("logs the user in when given correct credentials", () => {
    cy.findByLabelText("Email Address").type("test@test.com");
    cy.findByLabelText("Password").type("password");
    cy.findByText("Sign in").click();
    cy.findByText("Add an application");
  });

  it("shows the updated navbar for logged in users", () => {
    cy.login();
    cy.findAllByText("My Applications");
    cy.findByText("Admin Dashboard").should("not.exist");
    cy.findByText("Hey there, John");
    cy.findByText("Sign Out");
  });

  it("shows the updated navbar for privileged users", () => {
    cy.login("privileged@test.com");
    cy.findAllByText("My Applications");
    cy.findAllByText("Shorten Link (without ads)");
    cy.findByText("Admin Dashboard").should("not.exist");
    cy.findByText("Hey there, Privileged");
    cy.findByText("Sign Out");
  });

  it("allows legacy users to log in", () => {
    cy.findByLabelText("Email Address").type("legacy@test.com");
    cy.findByLabelText("Password").type("password");
    cy.findByText("Sign in").click();
    cy.findByText("Hey there, Legacy");
    cy.findByText("Add an application");
  });

  it("allows legacy users to log in a second time (after their password has been hashed with bcrypt)", () => {
    cy.findByLabelText("Email Address").type("legacy@test.com");
    cy.findByLabelText("Password").type("password");
    cy.findByText("Sign in").click();
    cy.findByText("Hey there, Legacy");
    cy.findByText("Add an application");
  });
});

export {};

describe("Account management", () => {
  beforeEach(() => {
    cy.login();
    cy.findByText("Hey there, John").click();
  });
  after(() => cy.logout());

  describe("changing your name", () => {
    it("requires both first name and last name", () => {
      cy.findByLabelText("First Name*").clear();
      cy.findByLabelText("Last Name*").clear();
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText("First Name is required");
      cy.findByText("Last Name is required");
    });

    it("allows updates the users name", () => {
      cy.findByLabelText("First Name*").type("test-first");
      cy.findByLabelText("Last Name*").type("test-last");
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText("Hey there, test-first").click();
      cy.findByLabelText("First Name*").should("have.value", "test-first");
      cy.findByLabelText("Last Name*").should("have.value", "test-last");
      cy.findByLabelText("First Name*").clear().type("John");
      cy.findByLabelText("Last Name*").clear().type("Developer");
      cy.findAllByText("Save").filter(":visible").click();
    });
  });

  describe("changing your password", () => {
    beforeEach(() => cy.findByText("Change Password").click());

    it("requires all fields", () => {
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText("Current Password is required");
      cy.findByText("New Password has a minimum length of 8 characters");
    });

    it("requires the new password field to be at least 8 characters", () => {
      cy.findByLabelText("New Password*").clear().type("short");
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText("New Password has a minimum length of 8 characters");
    });

    it("requires the current password to match the user's current password", () => {
      cy.findByLabelText("Current Password*").clear().type("wrong-password");
      cy.findByLabelText("New Password*").clear().type("password2");
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText(
        "The password you entered does not match your current password"
      );
    });

    it("allows updates to the password", () => {
      cy.findByLabelText("Current Password*").clear().type("password");
      cy.findByLabelText("New Password*").clear().type("password2");
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText("Sign Out").click();
      cy.login("test@test.com", "password2");
      cy.findByText("Hey there, John").click();
      cy.findByText("Change Password").click();
      cy.findByLabelText("Current Password*").clear().type("password2");
      cy.findByLabelText("New Password*").clear().type("password");
      cy.findAllByText("Save").filter(":visible").click();
    });
  });
});

export {};

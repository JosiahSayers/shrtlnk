describe("Requesting a password reset", () => {
  beforeEach(() => {
    cy.visit("/developer/request-password-reset");
  });

  it("has a link back to the sign in page", () => {
    cy.findByText("Back to Sign In").should(
      "have.attr",
      "href",
      "/developer/signin"
    );
  });

  it("Displays an error when an email is not found", () => {
    cy.findByLabelText("Email Address").type(
      "thisemailshouldnotexist@test.com"
    );
    cy.findByText("Reset Password").click();
    cy.findByText("Something went wrong, please try again");
  });

  it("creates a password reset in the db when an email is found", () => {
    let startingLength: number;
    cy.task("getPasswordResetsForUser", "test@test.com").then((resets: any) => {
      startingLength = resets.length;
    });
    cy.findByLabelText("Email Address").type("test@test.com");
    cy.findByText("Reset Password").click();
    cy.findByText(
      "If the email address you entered is associated with an account we'll send an email with instructions on how to reset your password."
    );
    cy.task("getPasswordResetsForUser", "test@test.com").then((resets: any) => {
      expect(resets.length).eq(startingLength + 1);
    });
  });
});

describe("resetting a password", () => {
  it("redirects to signin if no key is provided", () => {
    cy.visit("/developer/reset-password");
    cy.location("pathname").should("eq", "/developer/signin");
  });

  it("redirects to signin when an invalid key is provided", () => {
    cy.visit("/developer/reset-password?key=invalid");
    cy.location("pathname").should("eq", "/developer/signin");
    cy.findByText("Invalid Password Reset Link");
    cy.findByText("This password reset link is invalid");
  });

  it("displays user info when a valid password reset key is provided", () => {
    cy.task("createPasswordResetForUser", "test@test.com").then(
      (passwordReset: any) => {
        cy.visit(`/developer/reset-password?key=${passwordReset.key}`);
        cy.findByText(
          "Hey John, submit the form below to change your password."
        );
      }
    );
  });

  it("allows a user to reset their password", () => {
    cy.task("createUser", { password: "password", firstName: "first" }).then(
      (user: any) => {
        cy.task("createPasswordResetForUser", user.email).then(
          (passwordReset: any) => {
            cy.visit(`/developer/reset-password?key=${passwordReset.key}`);
            cy.findByText(
              "Hey first, submit the form below to change your password."
            );
            cy.findByLabelText("New Password").type("password2");
            cy.findByText("Reset Password").click();
            cy.findByText(
              "Your password has been reset. You can now log in with your new password."
            );
            cy.login(user.email, "password2");
            cy.findByText("Hey there, first");
            cy.task("deleteUser", user.email);
          }
        );
      }
    );
  });
});

export {};

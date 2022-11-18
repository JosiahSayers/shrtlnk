import { User } from "@prisma/client";

describe("Change User Role", () => {
  let testUser: User;
  before(() => {
    cy.task("createUser").then((u) => (testUser = u as User));
    cy.login("admin@test.com");
  });
  beforeEach(() => {
    cy.preserveAuthCookie();
    cy.findAllByText("Admin Dashboard").filter(":visible").click();
    cy.findAllByText("Change User Role").filter("a").click();
    cy.get("h2").should("be.visible").and("have.text", "Change User Role");
  });
  after(() => {
    cy.task("deleteUser", testUser.email);
    cy.logout();
  });

  it("Loads the user's current role into the select", () => {
    cy.findByLabelText("User:").select(
      `${testUser.firstName} ${testUser.lastName} (${testUser.email})`
    );
    cy.findByLabelText("Role:").should("have.value", testUser.role);
  });

  it("saves the user's role when updated", () => {
    cy.findByLabelText("User:").select(
      `${testUser.firstName} ${testUser.lastName} (${testUser.email})`
    );
    cy.findByLabelText("Role:").select("Privileged");
    cy.findByText("Change Role").click();
    cy.findByText("The user's role was successfully updated");
    cy.task("getUser", testUser.email).then((userFromDb) => {
      expect((userFromDb as User).role).to.eq("Privileged");
    });
  });
});

export {};

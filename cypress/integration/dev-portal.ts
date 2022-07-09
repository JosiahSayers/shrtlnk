describe("Developer landing page", () => {
  before(() => cy.visit("/developer"));

  it("has the correct static content", () => {
    cy.findAllByText("shrtlnk");
    cy.findAllByText("Dev Portal");
    cy.findAllByText("Documentation");
    cy.findAllByText("Sign Up");
    cy.findAllByText("Sign In").should("have.length", 2);

    cy.findByText("Welcome, artisan of the internet!");

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
    cy.findAllByText("Dev Portal").filter(":visible").click();
    cy.findByText("Create Account").click();
    cy.findByText("Test App");
  });
});

describe("Signing into an account", () => {
  beforeEach(() => cy.visit("/developer/signin"));
  after(() => cy.logout());

  it("requires email and password", () => {
    cy.findByText("Sign in").click();
    cy.findByText('"email" is not allowed to be empty');
    cy.findByText('"password" is not allowed to be empty');
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

describe("Application list", () => {
  afterEach(() => cy.logout());

  it("shows the correct content when the user has no applications", () => {
    cy.login("noapps@test.com");
    cy.findByText("Hi, Appless.");
    cy.findByText(
      (_, node) =>
        node?.textContent ===
        "It looks like you haven't added an application yet. Click here to get started!"
    );
    cy.findByText("Click here").click();
    cy.findByText("Application Name");
  });

  it("lists the applications that a user has setup", () => {
    cy.login();
    cy.findByText("Test App");
    cy.findByText((content, node) => node?.textContent === "Status: Valid");
    cy.findAllByText(
      (content, node) =>
        node?.textContent === "API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxx"
    );
    cy.findByText(
      (content, node) =>
        node?.textContent === "Created On: Saturday, March 5, 2022"
    );
    cy.findByText(
      (content, node) => node?.textContent === "Website: http://localhost:3000"
    );
    cy.findAllByText((content, node) =>
      /^Shrtlnks created: \d$/gm.test(node?.textContent ?? "")
    );
    cy.findAllByText((content, node) =>
      /^Shrtlnks loaded: \d times$/gm.test(node?.textContent ?? "")
    );
    cy.findAllByText((content, node) =>
      /^Unsafe URLs detected and blocked from this application: \d$/gm.test(
        node?.textContent ?? ""
      )
    );
  });

  it("shows the API key when the element is clicked", () => {
    cy.login();
    cy.findByText(
      (content, node) => node?.textContent === "API Key: test-api-key"
    ).should("not.exist");
    cy.findAllByText(
      (content, node) =>
        node?.textContent === "API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ).each((el) => cy.wrap(el).click());
    cy.findByText(
      (content, node) => node?.textContent === "API Key: test-api-key"
    );
  });
});

describe("Application CRUD", () => {
  before(() => cy.login());
  beforeEach(() => cy.preserveAuthCookie());
  after(() => cy.logout());

  describe("Creating an application", () => {
    it("requires an application name", () => {
      cy.findByText("Add an application").click();
      cy.findByText("Create").click();
      cy.findByText('"name" is not allowed to be empty');
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

describe("Account management", () => {
  before(() => cy.login());
  beforeEach(() => {
    cy.preserveAuthCookie();
    cy.findByText("Hey there, John").click();
  });
  after(() => cy.logout());

  describe("changing your name", () => {
    it("requires both first name and last name", () => {
      cy.findByLabelText("First Name*").clear();
      cy.findByLabelText("Last Name*").clear();
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText('"First Name" is not allowed to be empty');
      cy.findByText('"Last Name" is not allowed to be empty');
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
      cy.findByText('"Current Password" is not allowed to be empty');
      cy.findByText('"New Password" is not allowed to be empty');
    });

    it("requires the new password field to be at least 8 characters", () => {
      cy.findByLabelText("New Password*").clear().type("short");
      cy.findAllByText("Save").filter(":visible").click();
      cy.findByText('"New Password" length must be at least 8 characters long');
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

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

export {};

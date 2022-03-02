before(() => {
  cy.visit("localhost:3000");
});

describe("Home Page", () => {
  describe("Page content", () => {
    it("Renders the page title", () => {
      cy.findByText((content, node) => node?.textContent === "SHRTLNK");
    });

    it("Renders the form", () => {
      cy.findByLabelText("URL TO SHORTEN:");
      cy.findByText("CREATE SHORT LINK");
    });

    it("Renders the developer banner", () => {
      cy.findByText(
        (content, node) =>
          node?.textContent === "Pssst, are you a developer? We have an API."
      );
    });
  });

  describe("Form", () => {
    it("renders an error if the text input is empty", () => {
      cy.findByText("CREATE SHORT LINK").click();
      cy.findByText('"URL" is not allowed to be empty');
    });

    it("renders an error if the text is not a valid URI", () => {
      cy.findByLabelText("URL TO SHORTEN:").type("google");
      cy.findByText("CREATE SHORT LINK").click();
      cy.findByText('"URL" must be a valid uri');
    });
  });
});

export {};

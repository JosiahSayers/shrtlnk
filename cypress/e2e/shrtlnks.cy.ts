import { Shrtlnk } from "@prisma/client";

describe("Home Page", () => {
  before(() => cy.visit("/"));

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

describe("shrtlnk functionality", () => {
  beforeEach(() => cy.visit("/"));

  it("allows users to submit valid links", () => {
    cy.findByLabelText("URL TO SHORTEN:").type("https://google.com");
    cy.findByText("CREATE SHORT LINK").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");
  });

  it("marks links as eligible for ads", () => {
    cy.findByLabelText("URL TO SHORTEN:").type("https://google.com");
    cy.findByText("CREATE SHORT LINK").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");
    cy.get("#shrtlnk").then((currentSubject) => {
      console.log({ currentSubject });
      const key = currentSubject.text().split("/")[1];
      cy.task("getShrtlnk", key).then((shrtlnk) => {
        expect(shrtlnk).not.to.be.null;
        expect(shrtlnk).not.to.be.undefined;
        expect((shrtlnk as Shrtlnk).eligibleForAd).to.eq(true);
      });
    });
  });

  it("redirects to the not-found page when a shrtlnk key is not found", () => {
    cy.visit("/non-existent-key");
    cy.findByText("UH-OH! WE CAN'T FIND THAT SHORT LINK IN OUR DATABASE.");
  });
});

export {};

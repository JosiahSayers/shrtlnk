import { Shrtlnk } from "@prisma/client";
import ShortUniqueId from "short-unique-id";

describe("Create Privileged Link", () => {
  before(() => cy.login("privileged@test.com"));
  beforeEach(() => {
    cy.preserveAuthCookie();
    cy.visit("/developer");
    cy.findAllByText("Shorten Link (without ads)").filter(":visible").click();
  });
  after(() => cy.logout());

  it("shows the correct copy", () => {
    cy.findByText("Shorten Link");
    cy.findByText(
      "Your account has been marked as a privileged account which allows you to create shrtlnks that will skip the ads when loaded. Thanks for being awesome!"
    );
  });

  it("allows a user to create a link that skips ads", () => {
    cy.findByLabelText("URL to shorten").type("https://google.com");
    cy.findByText("Create Shrtlnk").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");
    cy.get("#shrtlnk").then((currentSubject) => {
      const key = currentSubject.text().split("/")[1];
      cy.task("getShrtlnk", key).then((shrtlnk) => {
        expect(shrtlnk).not.to.be.null;
        expect(shrtlnk).not.to.be.undefined;
        expect((shrtlnk as Shrtlnk).eligibleForAd).to.eq(false);
      });
    });
  });

  it("allows a user to create a link with a custom url", () => {
    const testCustomUrl = new ShortUniqueId().randomUUID(15);
    cy.findByLabelText("URL to shorten").type("https://google.com");
    cy.findByLabelText("Custom Shortened URL (optional)").type(testCustomUrl);
    cy.findByText("Create Shrtlnk").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");
    cy.task("getShrtlnk", testCustomUrl).then((shrtlnk) => {
      expect(shrtlnk).not.to.be.null;
      expect(shrtlnk).not.to.be.undefined;
      expect((shrtlnk as Shrtlnk).eligibleForAd).to.eq(false);
    });
  });

  it("validates the custom url", () => {
    const type = (text: string) =>
      cy.findByLabelText("Custom Shortened URL (optional)").clear().type(text);
    const testNum = new ShortUniqueId({ dictionary: "number" }).randomUUID(4);

    type("a".repeat(21));
    cy.findByText("Create Shrtlnk").click();
    cy.findByText("Custom URLs have a max length of 20 characters");
    type("#");
    cy.findByText(
      "Only the following characters are allowed: a-z, A-Z, 0-9, _, -"
    );
    type(`valid_CUSTOM-${testNum}`);
    cy.findByLabelText("URL to shorten").type("https://google.com");
    cy.findByText("Create Shrtlnk").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");
  });

  it("does not allow you to submit a custom URL key that already exists", () => {
    const testCustomUrl = new ShortUniqueId().randomUUID(15);
    cy.findByLabelText("URL to shorten").type("https://google.com");
    cy.findByLabelText("Custom Shortened URL (optional)").type(testCustomUrl);
    cy.findByText("Create Shrtlnk").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");

    cy.visit("/developer/create-privileged-link");
    cy.findByLabelText("URL to shorten").type("https://google.com");
    cy.findByLabelText("Custom Shortened URL (optional)").type(testCustomUrl);
    cy.findByText("Create Shrtlnk").click();
    cy.findByText("This key already exists, please choose another");
  });
});

export {};

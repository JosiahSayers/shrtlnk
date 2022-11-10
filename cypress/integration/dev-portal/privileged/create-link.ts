import { Shrtlnk } from "@prisma/client";

describe("Create Privileged Link", () => {
  before(() => cy.login("privileged@test.com"));
  beforeEach(() => {
    cy.preserveAuthCookie();
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
      console.log({ currentSubject });
      const key = currentSubject.text().split("/")[1];
      cy.task("getShrtlnk", key).then((shrtlnk) => {
        expect(shrtlnk).not.to.be.null;
        expect(shrtlnk).not.to.be.undefined;
        expect((shrtlnk as Shrtlnk).eligibleForAd).to.eq(false);
      });
    });
  });
});

export {};

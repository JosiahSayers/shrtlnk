before(() => {
  cy.visit("localhost:3000");
});

describe("shrtlnks", () => {
  let newLinkKey = "";

  it("allows users to submit valid links", () => {
    cy.findByLabelText("URL TO SHORTEN:").type("https://google.com");
    cy.findByText("CREATE SHORT LINK").click();
    cy.findByText("SUCCESS! HERE'S YOUR NEW LINK:");
    cy.get("#shrtlnk").then(($anchor) => {
      newLinkKey = $anchor[0].attributes.getNamedItem("href")?.value ?? "";
    });
  });

  it("redirects users to the full URL when a shrtlnk is loaded", async () => {
    cy.request({
      url: newLinkKey,
      followRedirect: false,
    })
      .its("headers")
      .then((headers) => expect(headers.location).to.eq("https://google.com"));
  });
});

export {};

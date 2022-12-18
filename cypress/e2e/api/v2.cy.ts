describe("API", () => {
  it("returns CORS headers when an OPTIONS request comes in", () => {
    cy.request({
      url: "/api/v2/link",
      method: "OPTIONS",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.headers["access-control-allow-origin"]).to.eq("*");
      expect(res.headers["access-control-allow-methods"]).to.eq(
        "POST, OPTIONS"
      );
      expect(res.headers["access-control-allow-headers"]).to.eq("*");
      expect(res.status).to.eq(204);
      expect(res.statusText).to.eq("No Content");
    });
  });

  it("returns an error when the request is not a POST", () => {
    cy.request({
      url: "/api/v2/link",
      method: "PUT",
      body: { url: "https://google.com" },
      headers: { "api-key": "shrtlnk-test-api-key" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.message).to.eq("PUT requests are not allowed");
      expect(res.status).to.eq(405);
    });
  });

  it("returns an error when the api-key header is missing", () => {
    cy.request({
      url: "/api/v2/link",
      method: "POST",
      body: { url: "https://google.com" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.message).to.eq("api-key header is required");
      expect(res.status).to.eq(403);
    });
  });

  it("returns an error when the api-key header is not found", () => {
    cy.request({
      url: "/api/v2/link",
      method: "POST",
      body: { url: "https://google.com" },
      headers: { "api-key": "this-should-not-exist" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.message).to.eq("API key is not valid");
      expect(res.status).to.eq(403);
    });
  });

  it("returns an error when the api-key is invalidated", () => {
    cy.request({
      url: "/api/v2/link",
      method: "POST",
      body: { url: "https://google.com" },
      headers: { "api-key": "invalid-application" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.message).to.eq("API key is not valid");
      expect(res.status).to.eq(403);
    });
  });

  it("returns an error when the URL is not valid", () => {
    cy.request({
      url: "/api/v2/link",
      method: "POST",
      body: { url: "google is the best website." },
      headers: { "api-key": "shrtlnk-test-api-key" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.message).to.eq("not a valid url");
      expect(res.status).to.eq(400);
    });
  });

  it("returns the expected success response", () => {
    cy.request({
      url: "/api/v2/link",
      method: "POST",
      body: { url: "https://google.com" },
      headers: { "api-key": "shrtlnk-test-api-key" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.body.url).to.eq("https://google.com");
      expect(typeof res.body.key).to.eq("string");
      expect(res.body.shrtlnk).to.eq(`https://shrtlnk.dev/${res.body.key}`);
      expect(res.status).to.eq(201);
    });
  });
});

export {};

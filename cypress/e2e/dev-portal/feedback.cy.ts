describe("Feedback Form", () => {
  beforeEach(() => {
    cy.login();
    cy.findAllByText("Feedback").filter("a").filter(":visible").click();
  });
  after(() => cy.logout());

  it("renders the static content", () => {
    cy.findByText("Feedback Form");
    cy.findByText(
      "Your feedback is always appreciated. Let us know how we can make shrtlnk better!"
    );
  });

  it("requires feedback text to be submitted", () => {
    cy.findByText("Send Feedback").click();
    cy.findByText("Feedback is required to submit this form");
  });

  it("saves feedback to the database", () => {
    const time = new Date().getTime();
    const feedback = `This is some test feedback. Sent at ${time}`;
    cy.findByLabelText("Type").select("other");
    cy.findByLabelText("Feedback*").type(feedback);
    cy.findByText("Send Feedback").click();
    cy.findByText(
      "Your feedback has been recorded. Thank you for helping us improve this service for everyone."
    );
    cy.task("getFeedback").then((allFeedback) => {
      const justSubmitted = allFeedback.find((f) => f.text === feedback);
      expect(justSubmitted).not.to.be.undefined;
    });
  });
});

export {};

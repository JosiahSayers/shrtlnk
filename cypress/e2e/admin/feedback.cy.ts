import { Feedback } from "@prisma/client";
import { sentenceCase } from "change-case";

describe("feedback", () => {
  let feedback1: Feedback;
  let feedback2: Feedback;
  let longFeedback: Feedback;

  beforeEach(() => {
    cy.task("deleteAllFeedback");
    cy.task("getUser", "admin@test.com").then((adminUser) => {
      cy.task("createFeedback").then((f) => (feedback1 = f));
      cy.task("createFeedback", {
        text: "this feedback is acknowledged",
        acknowledgedAt: new Date(),
        acknowledgedByUserId: adminUser!.id,
        type: "suggestion",
      }).then((f) => (feedback2 = f));
      cy.task("createFeedback", {
        text: "this is a really long bit of feedback. Because it is so long the whole thing should not show up in the feedback table",
        type: "bugReport",
      }).then((f) => (longFeedback = f));
    });
    cy.login("admin@test.com");
  });

  it("Displays a list of feedback", () => {
    cy.visit("/developer/admin/feedback");
    cy.findByText("User Feedback (2 Unread)");
    cy.findByText(feedback1.text);
    cy.findByText(sentenceCase(feedback1.type));

    cy.findByText(feedback2.text);
    cy.findByText(sentenceCase(feedback2.type));

    cy.findAllByText(new Date(feedback1.createdAt).toLocaleString()).should(
      "have.length",
      3
    );
    cy.findAllByText("John Developer").should("have.length", 3);
  });

  it("truncates long feedback", () => {
    cy.visit("/developer/admin/feedback");
    cy.findByText(`${longFeedback.text.substring(0, 50)}...`);
  });

  it("allows an admin to click on a feedback item to view details", () => {
    cy.visit("/developer/admin/feedback");
    cy.findByText("Test feedback").click();
    cy.location("pathname").should(
      "eq",
      `/developer/admin/feedback/${feedback1.id}`
    );
  });

  it("displays unread feedback count in the nav", () => {
    cy.visit("/developer/admin/feedback");
    cy.get('[href="/developer/admin/feedback"]')
      .find(".chakra-badge")
      .should("have.text", "2");
  });

  describe("details", () => {
    it("allows an admin to mark a message as acknowledged", () => {
      cy.visit(`/developer/admin/feedback/${feedback1.id}`);
      cy.get("#mark-as-acknowledged").click();
      cy.get("#mark-as-acknowledged").should("not.exist");
      cy.task("getFeedbackById", feedback1.id).then((feedback) => {
        cy.findByText(
          `Acknowledged by Admin Developer on ${new Date(
            feedback!.acknowledgedAt!
          ).toLocaleString()}`
        );
      });
    });

    it("goes back to the list of feedback when the back button is clicked", () => {
      cy.visit(`/developer/admin/feedback/${feedback2.id}`);
      cy.get("#back-button").click();
      cy.location("pathname").should("eq", "/developer/admin/feedback");
    });

    it("shows the full length of the text", () => {
      cy.visit(`/developer/admin/feedback/${longFeedback.id}`);
      cy.findByText(longFeedback.text);
    });
  });
});

export {};

import { User, PasswordReset } from "@prisma/client";
import sendgrid from "@sendgrid/mail";
import { logger } from "~/utils/logger.server";

const shouldSendEmail = process.env.NODE_ENV === "production";

export async function passwordResetEmail(
  user: User,
  passwordReset: PasswordReset
): Promise<any> {
  if (!shouldSendEmail) {
    return true;
  }

  try {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
    await sendgrid.send({
      to: user.email,
      from: "no-reply@shrtlnk.dev",
      templateId: "d-85b380b4bcd8493c9c581a53f23cacde",
      dynamicTemplateData: {
        name: `${user.firstName} ${user.lastName}`,
        resetLink: `https://shrtlnk.dev/developer/reset-password?key=${passwordReset.key}`,
      },
    });
    return true;
  } catch (e) {
    logger.error("Error sending password reset email", e);
    return false;
  }
}

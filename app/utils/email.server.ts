import { User, PasswordReset } from "@prisma/client";
import sendgrid from "@sendgrid/mail";
import { db } from "~/utils/db.server";
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
  } catch (e: any) {
    logger.error(e, { msg: "Error sending password reset email" });
    return false;
  }
}

export async function newFeedbackEmail(userName: string): Promise<boolean> {
  if (!shouldSendEmail) {
    return true;
  }

  try {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
    const admins = await db.user.findMany({ where: { role: "Admin" } });
    for (const admin of admins) {
      await sendgrid.send({
        to: admin.email,
        from: "no-reply@shrtlnk.dev",
        templateId: "d-471c01d68a524b87acfd6c47c658e3da",
        dynamicTemplateData: {
          adminName: admin.firstName,
          userName,
          linkToFeedback: "https://shrtlnk.dev/developer/admin",
        },
      });
    }
    return true;
  } catch (e: any) {
    logger.error(e, { msg: "Error sending new feedback email" });
    return false;
  }
}

export async function makeUserPrivilegedRoleEmail(user: User): Promise<boolean> {
  if (!shouldSendEmail) {
    return true;
  }

  try {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
    await sendgrid.send({
      to: user.email,
      from: "no-reply@shrtlnk.dev",
      templateId: "d-ba71a3c8cb004f94bc41e0c4724e798c",
      dynamicTemplateData: {
        name: user.firstName,
      },
    });
    return true;
  } catch (e: any) {
    logger.error(e, { msg: "Error sending make user privileged role email", userId: user.id });
    return false;
  }
}

import { User, PasswordReset } from "@prisma/client";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function passwordResetEmail(
  user: User,
  passwordReset: PasswordReset
): Promise<any> {
  try {
    await sendgrid.send({
      to: user.email,
      from: "no-reply@shrtlnk.dev",
      templateId: "d-85b380b4bcd8493c9c581a53f23cacde",
      dynamicTemplateData: {
        name: `${user.firstName} ${user.lastName}`,
        resetLink: `https://shrtlnk.dev/developer/change-password?reset=${passwordReset.key}`,
      },
    });
    return true;
  } catch (e) {
    console.error("Error sending password reset email", e);
    return false;
  }
}

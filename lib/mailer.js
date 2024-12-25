import { MailService } from "@sendgrid/mail";

export const getAccountConfirmationEmail = (name, confirmationLink, otp, validity) => {
  const missingFields = [];
  if (!name) {
    missingFields.push("Name");
  }

  if (!confirmationLink) {
    missingFields.push("Confirmation Link");
  }

  if (!otp) {
    missingFields.push("OTP");
  }

  if (!validity) {
    missingFields.push("OTP Validity");
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields to send account confirmation email: ${missingFields.join(", ")}`);
  }

  const body = `
Dear ${name},

Thank you for signing up for RocketMoon! We're excited to have you join us.

To complete your registration, please confirm your account by either of the following methods:

<strong>Option 1: Confirm via Email</strong>
Click the link below to verify your email address:

<a href="${confirmationLink}">Confirm My Account</a>

If the link above doesn't work, you can copy and paste the following URL into your browser:
${confirmationLink}

<strong>Option 2: Confirm via OTP in the Mobile App</strong>
Open the RocketMoon Sample app on your mobile device.
Enter the One-Time Password (OTP) below when prompted:
Your OTP: ${otp}
The OTP is valid for the next ${validity} minutes.

<strong>Why is confirmation important?</strong>
Confirming your account ensures its security and grants you full access to the features and benefits of RocketMoon.

If you didn’t sign up for this account, you can safely ignore this email.

If you have any questions, feel free to contact our support team at support@rocketmoon.in.

Best regards,
The RocketMoon Team
    `;

  return {
    subject: "Confirm Your Account – Action Required",
    html: body.replace(/(?:\r\n|\r|\n)/g, "<br>"),
    text: body,
    from: process.env.FROM_EMAIL_ADDRESS,
  };
};

export const sendEmail = async (params) => {
  try {
    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    await mailService.send(params);
  } catch (error) {
    console.error("sendEmail", error);

    if (error.response) {
      console.error("sendEmail", error.response.body);
    }

    throw error;
  }
};

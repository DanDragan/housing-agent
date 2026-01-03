import nodemailer from "nodemailer";

export async function sendEmail(body: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailTo = process.env.EMAIL_TO || emailUser;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  try {
    await transporter.sendMail({
      from: emailUser,
      to: emailTo,
      subject: `🏠 Bucharest Housing Digest - ${new Date().toLocaleDateString()}`,
      text: body,
      html: body.replace(/\n/g, "<br>") // Basic HTML formatting
    });
    console.log(`Email sent successfully to ${emailTo}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

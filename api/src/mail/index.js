import nodemailer from "nodemailer";

let mail;

export const mailInit = async () => {
  let testAccount = await nodemailer.createTestAccount();
  mail = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendEmail = async ({ from = '"Jorne Saenen" <jorne@jsjj.be>', to = "jorne@jsjj.be", subject, html }) => {
  try {
    const info = await mail.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
};

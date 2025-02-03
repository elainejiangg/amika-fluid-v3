// This module provides functionality for sending emails using Nodemailer.
// It allows users to send emails with specified recipients, subjects, and content.
// The service is configured to use a Gmail for sending emails
import nodemailer from "nodemailer";

export async function sendEmail(to, subject, text, options = {}) {
  return new Promise((resolve, reject) => {
    // Create a Nodemailer transport using personal email credentials
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amikachats@gmail.com", // Replace with your email
        pass: "jfiy xfic zkdv crmx", // Replace with your email password or app password (note this is the correct password for amikachats@gmail.com)
      },
    });

    // Define the email options
    const mailOptions = {
      from: `Amika <amikachats@gmail.com>`, // Replace with your name and email
      to,
      subject,
      text: options.isHtml ? undefined : text,
      html: options.isHtml ? text : undefined,
    };

    // Send the email
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return reject(error);
      } else {
        console.log("Email sent:", info.response);
        return resolve(info.response);
      }
    });
  });
}

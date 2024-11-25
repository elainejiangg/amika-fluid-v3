import { google } from "googleapis";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

export async function sendEmail(to, subject, text, options = {}) {
  return new Promise((resolve, reject) => {
    // Create a Nodemailer transport using personal email credentials
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amikachats@gmail.com", // Replace with your email
        pass: "jfiy xfic zkdv crmx", // Replace with your email password or app password
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

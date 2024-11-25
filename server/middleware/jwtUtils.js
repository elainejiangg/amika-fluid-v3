import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "***";

export function generateToken(user, emailBody) {
  const payload = {
    googleId: user.googleId,
    email: user.email,
    emailContent: emailBody.replace(/\n/g, ""),
  };
  const options = {
    expiresIn: "5h", // Token expires in 1 hour
  };
  return jwt.sign(payload, SECRET_KEY, options);
}

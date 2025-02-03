/**
 * This module provides middleware for verifying JSON Web Tokens (JWT) in incoming requests.
 * It checks the authorization header for a valid token and verifies it using the secret key.
 * 
 * Key functionalities include:
 * - `verifyToken(req, res, next)`: Middleware function that extracts the token from the
 *   authorization header, verifies it, and attaches the decoded user information to the
 *   request object if the token is valid. If the token is missing or invalid, it sends
 *   an appropriate error response.
 * 
 * This middleware is crucial for protecting routes that require user authentication,
 * ensuring that only authorized users can access certain resources.
 */

import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "***";

export function verifyToken(req, res, next) {
  console.log("REQUEST HEADERS: ", req.headers);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token received:", token); // Log the received token

  if (!token) {
    console.log("No token provided"); // Log when no token is provided
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    console.log("Token verified:", verified); // Log the verified token payload
    req.user = verified;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message); // Log the error message
    res.status(400).send("Invalid Token");
  }
}

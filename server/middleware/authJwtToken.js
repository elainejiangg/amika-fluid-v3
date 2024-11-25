import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "***";

export function verifyToken(req, res, next) {
  // console.log("REQUEST QUERY: ", req.query);
  // const token = req.query.token;
  // console.log("Token received:", token); // Log the received token
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

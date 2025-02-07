/**
 * This module serves as the entry point for the application, initializing the Express server
 * and setting up middleware, routes, and database connections.
 */

import express from "express"; // express is web framework for node.js
import cors from "cors"; // CORS (cross-origin resource sharing) enables secure requests and data transfers from outside origins
import connectDB from "./mongoConfig/connection.js";
import userRoutes from "./routes/userRoute.js";
import chat, { watchCollection } from "./routes/chat.js";
import { fetchAndScheduleReminders } from "./nudgeSys/reminderUtils.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Connect to MongoDB
connectDB().then(() => {
  // Fetch and schedule reminders after connecting to the database
  fetchAndScheduleReminders();
  // Start watching for changes in the database
  watchCollection();
});

// Middleware
app.use(express.json());
app.use(cors());

app.use(cors());
app.use(express.json());
app.use("/", userRoutes); // User user routes. "/" is the base path for all endpoints
app.use("/chat", chat);

// Start Express Server, listening in to port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

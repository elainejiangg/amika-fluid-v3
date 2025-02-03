/**
 * This module establishes a connection to a MongoDB database using Mongoose.
 * It defines the connection URI and exports a function to connect to the database.
 * 
 * The `connectDB` function should be called during the application startup
 * to ensure that the application can interact with the database.
 */

import mongoose from "mongoose";

// Format of connection url: mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
const URI = "000";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(URI);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error(`Failed to connect to MongoDB. Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

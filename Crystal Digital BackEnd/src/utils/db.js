dotenv.config();


import mongoose from "mongoose";
import dotenv from "dotenv"

const ConnectionString = process.env.MONGO_DB_URI;

if (!ConnectionString) {
  throw new Error("MONGO_DB_URI is not defined in environment variables");
}

export const DB_CONNECT = async () => {
  try {
    const connection = await mongoose.connect(ConnectionString, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Do not allow the application to run without a database
    process.exit(1);
  }
};


// MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
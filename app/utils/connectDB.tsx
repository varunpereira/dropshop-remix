import mongoose from "mongoose";
import { getGlobalState } from "./globalState";

var process = getGlobalState("process");

export default function connectDB() {
  if (mongoose.connections[0].readyState) {
    console.log("Already connected.");
    return;
  }
  mongoose.connect(process.env.mongodbURI!, (err) => {
    if (err) {
      throw err;
    }
    console.log("Connected to mongodb.");
  });
}

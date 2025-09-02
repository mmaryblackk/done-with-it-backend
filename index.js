import config from "config";
import debug from "debug";
import express, { json } from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import categories from "./routes/categories.js";
import listings from "./routes/listings.js";
import messages from "./routes/messages.js";
import users from "./routes/users.js";
import auth from "./routes/auth.js";

const app = express();
app.use(express.static("public"));
app.use(json());

app.use("/api/listings", listings);
app.use("/api/users", users);
app.use("/api/categories", categories);
app.use("/api/messages", messages);
app.use("/api/auth", auth);

const startupDebugger = debug("app:startup");
const dbDebugger = debug("app:db");

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled..");
}

mongoose
  .connect("mongodb://localhost:27018/DoneWithIt")
  .then(() => dbDebugger("Connected to the database.."))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const port = config.get("port");
app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});

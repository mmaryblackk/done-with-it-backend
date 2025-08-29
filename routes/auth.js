import express from "express";
import bcrypt from "bcrypt";
import * as z from "zod";

import { User } from "../models/user.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateData(req.body);
  if (error) {
    return res
      .status(400)
      .send(`${error.issues[0].path[0]}. ${error.issues[0].message}`);
  }

  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("Invalid email or password.");
  }

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isValidPassword) {
    return res.status(400).send("Invalid email or password.");
  }

  const token = user.generateAuthToken();
  res.send(token);
});

function validateData(body) {
  const schema = z.object({
    email: z.email().min(5).max(255),
    password: z.string().min(5).max(255),
  });
  return schema.safeParse(body);
}

export default router;

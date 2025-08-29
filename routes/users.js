import bcrypt from "bcrypt";
import express from "express";
import multer from "multer";
import _ from "lodash";

import { auth } from "../middleware/auth.js";

import { User, validateData } from "../models/user.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validateData(req.body);
  if (error) {
    return res
      .status(400)
      .send(`${error.issues[0].path[0]}. ${error.issues[0].message}`);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already registered.");
  }

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

router.put("/:id", [auth, upload.single("avatar")], async (req, res) => {
  const { name } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");

  if (name) user.name = name;
  if (req.file) {
    user.avatarUrl = `/assets/avatars/${req.file.filename}`;
  }

  await user.save();

  res.send(_.pick(user, ["_id", "name", "email", "avatarUrl"]));
});

export default router;

// jwt john.doe@test.com
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGIxNzZjOGUwNzFiMDVkMmRjNWU2MTkiLCJpYXQiOjE3NTY0NjA3NDR9.KvOczHD_MH-tz9GkWLHMnSc1lilNXvwxoii-2I1hFGU

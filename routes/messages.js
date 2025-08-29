import express from "express";

import { Message, validateData } from "../models/message.js";
import { auth } from "../middleware/auth.js";
import { Listing } from "../models/listing.js";
import { User } from "../models/user.js";

const router = express.Router();

router.get("/", auth, async (_, res) => {
  const messages = await Message.find();
  res.send(messages);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateData(req.body);
  if (error) return res.status(400).send(error.issues[0].message);

  const { listingId, fromUserId, toUserId, content } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(400).send("Invalid listingId.");

  const currentUser = await User.findById(fromUserId);
  if (!currentUser) return res.status(400).send("Invalid userId.");

  const targetUser = await User.findById(toUserId);
  if (!targetUser) return res.status(400).send("Invalid userId.");

  const message = new Message({
    listing: {
      _id: listing._id,
      title: listing.title,
      category: listing.category,
      user: listing.user,
    },
    fromUser: { _id: currentUser._id, email: currentUser.email },
    toUser: { _id: targetUser._id, email: targetUser.email },
    content,
  });

  await message.save();

  res.status(201).send(message);
});

export default router;

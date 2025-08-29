import config from "config";
import express from "express";
import multer from "multer";
import _ from "lodash";
import path from "path";

import { Category } from "../models/category.js";
import { Listing, validateData } from "../models/listing.js";
import { User } from "../models/user.js";

import { listingMapper } from "../mappers/listings.js";
import { auth } from "../middleware/auth.js";
import { imageResize } from "../middleware/imageResize.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.get("/", async (req, res) => {
  const listings = await Listing.find();
  const resources = listings.map(listingMapper);
  res.send(resources);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send("Invalid listing ID.");

  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).send("Listing not found.");

  res.send(listingMapper(listing));
});

router.post(
  "/",
  [auth, upload.array("images", config.get("maxImageCount")), imageResize],
  async (req, res) => {
    const body = {
      ...req.body,
      price: parseFloat(req.body.price),
      location: {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      },
    };
    const { error } = validateData(req.body);
    if (error) {
      return res
        .status(400)
        .send(`${error.issues[0].path[0]}. ${error.issues[0].message}`);
    }

    const category = await Category.findById(req.body.categoryId);
    if (!category) return res.status(400).send("Invalid categoryId.");

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send("User not found.");

    const { title, price, description, location } = body;

    const listing = new Listing({
      title,
      price,
      description,
      category: _.pick(category, ["_id", "name"]),
      user: { _id: user._id, email: user.email },
      location: location || null,
      images: req.images,
    });

    await listing.save();

    res.status(201).send(listing);
  }
);

export default router;

import config from "config";
import express from "express";
import _ from "lodash";
import multer from "multer";
import mongoose from "mongoose";

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
  res.json(resources);
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
  [
    auth,
    (req, res, next) => {
      const handler = upload.any();
      handler(req, res, (err) => {
        if (err) return res.status(400).send(err.message);
        if (!req.files) req.files = [];
        next();
      });
    },
    imageResize,
  ],
  async (req, res) => {
    const body = {
      ...req.body,
      price: parseFloat(req.body.price),
      location:
        req.body.latitude && req.body.longitude
          ? {
              latitude: parseFloat(req.body.latitude),
              longitude: parseFloat(req.body.longitude),
            }
          : undefined,
    };
    if (body.description === "") delete body.description;
    const { error } = validateData(body);
    if (error) {
      return res
        .status(400)
        .send(`${error.issues[0].path[0]}. ${error.issues[0].message}`);
    }

    const category = await Category.findById(req.body.categoryId);
    if (!category) return res.status(400).send("Invalid categoryId.");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("User not found.");

    const { title, price, description, location } = body;

    const baseUrl = `${config.get("assetsBaseUrl")}listings/`;

    const images = req.images.map((name) => ({
      url: `${baseUrl}${name}_full.jpg`,
      thumbnailUrl: `${baseUrl}${name}_thumb.jpg`,
    }));

    const listing = new Listing({
      title,
      price,
      description,
      category: _.pick(category, ["_id", "name"]),
      user: { _id: user._id, email: user.email, name: user.name },
      location: location || null,
      images,
    });
    await listing.save();

    res.status(201).send(listing);
  }
);

export default router;

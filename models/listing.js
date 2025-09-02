import mongoose from "mongoose";
import * as z from "zod";
import { shortCategorySchema } from "./shortSchemas.js";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, minLength: 3, maxLength: 255 },
  price: { type: Number, required: true, min: 1, max: 10000 },
  description: { type: String, minLength: 3, maxLength: 255 },
  category: { type: shortCategorySchema, required: true },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  images: [imageSchema],
});

const Listing = mongoose.model("Listing", listingSchema);

function validateData(body) {
  const schema = z.object({
    title: z.string().min(3).max(255),
    price: z.coerce.number().min(1).max(10000),
    description: z.string().min(3).max(255).optional(),
    categoryId: z.string().refine((val) => mongoose.isValidObjectId(val), {
      message: "Invalid categoryId",
    }),
    location: z
      .object({
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
      })
      .optional(),
  });

  return schema.safeParse(body);
}

export { Listing, validateData };

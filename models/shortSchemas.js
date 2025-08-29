import mongoose from "mongoose";

const shortUserSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, maxLength: 50 },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
});

const shortCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 50 },
});

const shortListingSchema = new mongoose.Schema({
  title: { type: String, required: true, minLength: 3, maxLength: 50 },
  category: { type: shortCategorySchema, required: true },
  user: { type: shortUserSchema, required: true },
});

export { shortListingSchema, shortUserSchema, shortCategorySchema };

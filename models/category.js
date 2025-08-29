import mongoose from "mongoose";
import * as z from "zod";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 50 },
  icon: { type: String, required: true, minLength: 3, maxLength: 50 },
  backgroundColor: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  color: { type: String, required: true, minLength: 3, maxLength: 50 },
});

const Category = mongoose.model("Category", categorySchema);

function validateData(body) {
  const schema = z.object({
    name: z.string().min(3).max(50),
    icon: z.string().min(3).max(50),
    backgroundColor: z.string().min(3).max(50),
    color: z.string().min(3).max(50),
  });
  return schema.safeParse(body);
}

export { Category, validateData };

import mongoose from "mongoose";
import * as z from "zod";
import { shortListingSchema, shortUserSchema } from "./shortSchemas.js";

const messageSchema = new mongoose.Schema({
  listing: { type: shortListingSchema, required: true },
  fromUser: { type: shortUserSchema, required: true },
  toUser: { type: shortUserSchema, required: true },
  content: { type: String, required: true, minLength: 3, maxLength: 255 },
  datetime: { type: Date, default: Date.now() },
});

const Message = mongoose.model("Message", messageSchema);

function validateData(body) {
  const schema = z.object({
    listingId: z.string().refine((val) => mongoose.isValidObjectId(val), {
      message: "Invalid listingId",
    }),
    fromUserId: z.string().refine((val) => mongoose.isValidObjectId(val), {
      message: "Invalid userId",
    }),
    toUserId: z.string().refine((val) => mongoose.isValidObjectId(val), {
      message: "Invalid userId",
    }),
    content: z.string().min(3).max(255),
  });
  return schema.safeParse(body);
}

export { Message, validateData };

import config from "config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as z from "zod";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 50 },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 1024,
  },
  avatarUrl: { type: String, default: null },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      avatarUrl: this.avatarUrl,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateData(body) {
  const schema = z.object({
    name: z.string().min(3).max(50),
    email: z.email().min(5).max(255),
    password: z.string().min(5).max(255),
    avatarUrl: z.string().optional(),
  });
  return schema.safeParse(body);
}

export { User, userSchema, validateData };

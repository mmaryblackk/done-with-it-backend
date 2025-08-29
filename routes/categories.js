import express from "express";
import { Category, validateData } from "../models/category.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
});

router.post("/", async (req, res) => {
  const { error } = validateData(req.body);
  if (error) {
    return res
      .status(400)
      .send(`${error.issues[0].path[0]}. ${error.issues[0].message}`);
  }

  const { name, icon, backgroundColor, color } = req.body;

  const category = new Category({
    name,
    icon,
    backgroundColor,
    color,
  });
  await category.save();
  res.send(category);
});

export default router;

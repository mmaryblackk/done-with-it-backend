import fs from "fs";
import path from "path";
import sharp from "sharp";

const outputFolder = "public/assets/listings";

async function imageResize(req, res, next) {
  const images = [];

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    req.images = images;
    return next();
  }

  const resizePromises = req.files.map(async (file) => {
    const { name } = path.parse(file.filename);
    const ext = ".jpg";

    await sharp(file.path)
      .resize(2000)
      .jpeg({ quality: 50 })
      .toFile(path.resolve(outputFolder, `${name}_full${ext}`));

    await sharp(file.path)
      .resize(100)
      .jpeg({ quality: 30 })
      .toFile(path.resolve(outputFolder, `${name}_thumb${ext}`));

    fs.unlinkSync(file.path);

    images.push(name);
  });

  await Promise.all(resizePromises);

  req.images = images;

  next();
}

export { imageResize };

import fs from "fs";
import path from "path";
import sharp from "sharp";

const outputFolder = "public/assets/listings";

async function imageResize(req, res, next) {
  const images = await Promise.all(
    req.files.map(async (file) => {
      const baseName = path.parse(file.filename).name;
      const fullFileName = `${baseName}_full.jpg`;
      const thumbFileName = `${baseName}_thumb.jpg`;

      await sharp(file.path)
        .resize(2000)
        .jpeg({ quality: 50 })
        .toFile(path.resolve(outputFolder, fullFileName));

      await sharp(file.path)
        .resize(100)
        .jpeg({ quality: 30 })
        .toFile(path.resolve(outputFolder, thumbFileName));

      fs.unlinkSync(file.path);

      return {
        url: `http://localhost:9000/assets/listings/${fullFileName}`,
        thumbnailUrl: `http://localhost:9000/assets/listings/${thumbFileName}`,
      };
    })
  );

  req.images = images;
  next();
}

export { imageResize };

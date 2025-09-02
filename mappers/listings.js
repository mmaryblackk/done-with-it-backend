import config from "config";

const listingMapper = (listing) => {
  const obj = listing.toObject();

  obj.images = obj.images.map((image) => {
    if (image.url && image.thumbnailUrl) return image;

    const baseUrl = `${config.get("assetsBaseUrl")}listings/`;
    return {
      url: `${baseUrl}${image.filename}_full.jpg`,
      thumbnailUrl: `${baseUrl}${image.filename}_thumb.jpg`,
    };
  });

  return obj;
};
export { listingMapper };

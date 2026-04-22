const Image = require('../models/Image');

const images = [
  new Image(1, "https://picsum.photos/id/1015/600/400", "Montaña", 10),
  new Image(2, "https://picsum.photos/id/1016/600/400", "Bosque", 12),
  new Image(3, "https://picsum.photos/id/1018/600/400", "Río", 15)
];

const getAllImages = () => {
  return images;
};

module.exports = {
  getAllImages
};
const catalogService = require('../services/catalogService');

const getImages = (req, res) => {
  try {
    const images = catalogService.getImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo imágenes" });
  }
};

module.exports = {
  getImages
};
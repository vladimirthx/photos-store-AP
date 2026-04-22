const catalogRepository = require('../repositories/catalogRepository');

const getImages = () => {
  const images = catalogRepository.getAllImages();

  // Aquí puedes agregar lógica después:
  // - filtros
  // - descuentos
  // - watermark dinámico

  return images;
};

module.exports = {
  getImages
};
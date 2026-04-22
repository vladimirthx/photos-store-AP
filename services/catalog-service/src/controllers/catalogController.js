const Jimp = require('jimp');
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { uploadToSpaces } = require('../services/s3Service');

const uploadPhoto = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file provided' });
    if (!title || !price) return res.status(400).json({ error: 'Title and price are required' });

    const fileId = crypto.randomUUID();
    const originalExtension = file.originalname.split('.').pop() || 'jpg';
    const originalKey = `originals/${fileId}.${originalExtension}`;
    const watermarkKey = `public/${fileId}-watermark.jpg`;

    // Process image and add text watermark using Jimp (pure JS, no native deps)
    const image = await Jimp.read(file.buffer);
    
    // Resize to max width 800px
    if (image.getWidth() > 800) {
      image.resize(800, Jimp.AUTO);
    }

    // Load font and add watermark text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const text = 'PREVISUALIZACIÓN';
    const textWidth = Jimp.measureText(font, text);
    const textX = (image.getWidth() - textWidth) / 2;
    const textY = image.getHeight() / 2 - 16;

    image.print(font, textX, textY, text);
    image.quality(60);

    const watermarkedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Upload original (Private)
    await uploadToSpaces(file.buffer, originalKey, file.mimetype, false);

    // Upload watermarked (Public)
    const watermarkedUrl = await uploadToSpaces(watermarkedBuffer, watermarkKey, 'image/jpeg', true);

    // Save to DB
    const photo = await prisma.photo.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        originalKey,
        watermarkedUrl
      }
    });

    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listPhotos = async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const safePhotos = photos.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      watermarkedUrl: p.watermarkedUrl,
      createdAt: p.createdAt
    }));

    res.status(200).json(safePhotos);
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    const updated = await prisma.photo.update({
      where: { id },
      data: { title, description, price: parseFloat(price) }
    });
    res.status(200).json({ message: 'Photo updated successfully', photo: updated });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.photo.delete({ where: { id } });
    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { uploadPhoto, listPhotos, updatePhoto, deletePhoto };
const sharp = require('sharp');
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
    const watermarkKey = `public/${fileId}-watermark.webp`;

    // Safe SVG watermark that fits in most aspect ratios
    const watermarkSvg = `
      <svg width="400" height="150">
        <style>
          .title { fill: rgba(255, 255, 255, 0.6); font-size: 32px; font-weight: bold; font-family: sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        </style>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title">PREVISUALIZACIÓN</text>
      </svg>
    `;

    const watermarkedBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .composite([{ input: Buffer.from(watermarkSvg), gravity: 'center' }])
      .webp({ quality: 60 })
      .toBuffer();

    // 2. Upload original (Private)
    await uploadToSpaces(file.buffer, originalKey, file.mimetype, false);

    // 3. Upload watermarked (Public)
    const watermarkedUrl = await uploadToSpaces(watermarkedBuffer, watermarkKey, 'image/webp', true);

    // 4. Save to DB
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
    
    // We don't want to expose originalKey directly in the public list, 
    // but admin might need it. For now, just return it if requested or filter in UI.
    const isAdmin = req.user && req.user.role === 'ADMIN';
    
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
      data: {
        title,
        description,
        price: parseFloat(price)
      }
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
    // Note: We should ideally also delete from S3, but we keep it simple for now or implement S3 deletion
    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadPhoto,
  listPhotos,
  updatePhoto,
  deletePhoto
};
const sharp = require('sharp');
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { uploadToSpaces } = require('../services/s3Service');

const uploadPhoto = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const fileId = crypto.randomUUID();
    const originalExtension = file.originalname.split('.').pop();
    const originalKey = `originals/${fileId}.${originalExtension}`;
    const watermarkKey = `public/${fileId}-watermark.webp`;

    // 1. Process with Sharp to create a watermarked / low-res version
    const watermarkSvg = `
      <svg width="800" height="800">
        <style>
          .title { fill: rgba(255, 255, 255, 0.5); font-size: 60px; font-weight: bold; font-family: sans-serif; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title" transform="rotate(-45 400 400)">PREVISUALIZACIÓN</text>
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
    
    // We don't want to expose originalKey directly in the list
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

module.exports = {
  uploadPhoto,
  listPhotos
};
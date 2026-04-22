const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const catalogController = require('../controllers/catalogController');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/photos', catalogController.listPhotos);
router.post('/photos', verifyToken, verifyAdmin, upload.single('photo'), catalogController.uploadPhoto);
router.put('/photos/:id', verifyToken, verifyAdmin, catalogController.updatePhoto);
router.delete('/photos/:id', verifyToken, verifyAdmin, catalogController.deletePhoto);

module.exports = router;
// routes/videoRoutes.js
const express = require('express');
const videoController = require('../controllers/video');

const router = express.Router();

router.post('/generate-thumbnails', videoController.generateThumbnails);
router.post('/metadata',videoController.getVideoMetadata)

module.exports = router;

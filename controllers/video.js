// controllers/videoController.js
const VideoService = require('../services/video');
const Video = require('../models/video');
const Thumbnail = require('../models/thumbnail');
const ImageService = require('../services/image');
const CacheService = require('../services/cache');
const path = require('path');
const fs = require('fs');
const utils = require('../utility/util');
const {uploadToMinio} = require('../services/minio');
const video = require('ffmpeg/lib/video');

exports.generateThumbnails = async (req, res) => {
    const { videoUrl } = req.body;

    try {
        // get from cache
        const cache = await CacheService.getCache('thumbnail_cache:'+videoUrl);
        if (cache) {
            res.json(`thumbnails/`+path.basename(cache));
            return;
        }

        // fallback to get from db if cache didnt exist
        const thumbnail = await Thumbnail.getThumbnailURLByVideoURL(videoUrl);
        if (thumbnail) {
            // Set to cache
            CacheService.setCache('thumbnail_cache:'+videoUrl, thumbnail,5); // ttl in minute
            res.json(`thumbnails/`+path.basename(thumbnail));
            return;
        }

        // start generating new
        const outputDir = utils.createJobDirectory();
        const outputFilename = `video-${path.basename(outputDir)}.mp4`;

        // Download the video
        const videoPath = await VideoService.downloadVideo(videoUrl, outputDir, outputFilename);

        // Extract key frames
        const keyFrames = await VideoService.extractKeyFrames(videoPath, outputDir);

        // Filter key frames for representation
        const newFrames = await ImageService.selectKeyFrames(keyFrames);

        // generate thumbnail and clean up
        const thumbnailPath = `public/thumbnails/${path.basename(outputDir)}.gif`
        await ImageService.createAnimatedThumbnail(newFrames, thumbnailPath, () => {utils.cleanDirectory(outputDir);})

        // Store GIF in MinIO
        if (fs.existsSync(thumbnailPath)) {
            // Store GIF in MinIO
            const thumbnailUrl = await uploadToMinio(thumbnailPath, 'thumbnail-generator');
        } else {
            throw new Error(`Thumbnail file does not exist at path: ${thumbnailPath}`);
        }

        // store in db
        Thumbnail.create(videoUrl, thumbnailPath);

        // store in cache
        CacheService.setCache('thumbnail_cache:'+videoUrl, thumbnailPath, 5); // ttl in minute
        res.json(`thumbnails/`+path.basename(thumbnailPath));
    } catch (error) {
        console.error('Error processing video:', error.message);
        res.status(500).send('Error processing video');
    }
};

exports.getVideoMetadata = async (req,res) =>  {
    const { videoUrl } = req.body;

    try {
        // start generating new
        const outputDir = utils.createJobDirectory();
        const outputFilename = `video-${path.basename(outputDir)}.mp4`;

        // Download the video
        const videoPath = await VideoService.downloadVideo(videoUrl, outputDir, outputFilename);

        // get metadata
        const videoMetadata = await VideoService.getVideoMetadata(videoPath, () => {utils.cleanDirectory(outputDir);});
        
        // create json file
        const jsonFilePath = await utils.createJSONFile(videoMetadata, 'public/metadata/'+outputFilename+'.json');

        // store object to minio 
        if (fs.existsSync(jsonFilePath)) {
            // Store GIF in MinIO
            const thumbnailUrl = await uploadToMinio(jsonFilePath, 'thumbnail-generator');
        } else {
            throw new Error(`file does not exist at path: ${jsonFilePath}`);
        }

        res.json(videoMetadata);
    } catch(err) {
        console.error('Error while get video metadata:', err.message);
        res.status(500).send('Error getting video metadata');
    }
}
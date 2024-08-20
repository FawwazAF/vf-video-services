// services/videoService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoService {
    static async downloadVideo(videoUrl, outputDir, outputFilename) {
        try {
            const videoPath = path.join(outputDir, outputFilename);
            const writer = fs.createWriteStream(videoPath);

            const response = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(videoPath));
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('Error downloading video:', error.message);
            throw error;
        }
    }

    static extractKeyFrames(videoPath, outputDir) {
        try {
            if (!fs.existsSync(videoPath)) {
                throw new Error('Video file does not exist');
            }
            
            if (!fs.existsSync(outputDir)) {
                throw new Error('Output job directory does not exist');
            }

            return new Promise((resolve, reject) => {
                const outputPattern = path.join(outputDir, `frame_%04d.png`);
                ffmpeg(videoPath)
                    .outputOptions([
                        '-vf', 'select=gt(scene\\,0.1),unsharp=5:5:1.0,deflicker,fps=1',
                        '-vsync', 'vfr',
                        '-q:v', '2'
                    ])
                    .on('end', function() {
                        fs.readdir(outputDir, (err, files) => {
                            if (err) {
                                console.error('Error reading output directory:', err.message);
                                return reject(err);
                            }
    
                            const keyFrames = files
                                .filter(file => file.startsWith('frame') && file.endsWith('.png'))
                                .map(file => path.join(outputDir, file));

                            resolve(keyFrames);
                        });
                    })
                    .on('error', function(err) {
                        console.error('Error extracting key frames:', err.message);
                        reject(err);
                    })
                    .save(outputPattern);
            });
        } catch (error) {
            console.error('Error in extractKeyFrames:', error.message);
            throw error;
        }
    }

    static async getVideoMetadata(filePath, callback) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
              if (err) {
                return reject('Error extracting metadata: ' + err);
              }
      
              const format = metadata.format;
              const stream = metadata.streams.find(stream => stream.codec_type === 'video');
      
              const videoMetadata = {
                duration: format.duration, 
                resolution: `${stream.width}x${stream.height}`,
                codec: stream.codec_name,
                bitrate: format.bit_rate,
                frameRate: eval(stream.r_frame_rate)
              };
              
              callback();
              resolve(videoMetadata);
            });
          });
    }
}

module.exports = VideoService;

const ffmpeg = require('fluent-ffmpeg');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');
const GIFEncoder = require('gifencoder');


class ImageService {
    static async selectKeyFrames(framePaths) {
        const differences = [];
    
        // Analyze differences between consecutive frames
        for (let i = 1; i < framePaths.length; i++) {
            try {
                const diff = await this.calculateFrameDifference(framePaths[i - 1], framePaths[i]);
                differences.push({ index: i, difference: diff });
            } catch (error) {
                console.error(`Error calculating difference between frames ${i - 1} and ${i}:`, error.message);
            }
        }
    
        // Sort frames by difference and select the top N frames
        differences.sort((a, b) => b.difference - a.difference);
        let selectedFrames = differences
            .slice(0, 10)
            .map(d => d.index)
            .map(index => framePaths[index]);

        // Sort the selected frames by their names
        selectedFrames = selectedFrames.sort((a, b) => {
            const nameA = a.split('/').pop().toLowerCase();
            const nameB = b.split('/').pop().toLowerCase();
            return nameA.localeCompare(nameB);
        });

        return selectedFrames;
    }
    
    static async calculateFrameDifference(framePath1, framePath2){
        try {
            const image1 = await loadImage(framePath1);
            const image2 = await loadImage(framePath2);
            
            const canvas = createCanvas(image1.width, image1.height);
            const ctx = canvas.getContext('2d');
        
            ctx.drawImage(image1, 0, 0);
            const data1 = ctx.getImageData(0, 0, image1.width, image1.height).data;
        
            ctx.drawImage(image2, 0, 0);
            const data2 = ctx.getImageData(0, 0, image2.width, image2.height).data;
        
            let diff = 0;
            for (let i = 0; i < data1.length; i += 4) {
                diff += Math.abs(data1[i] - data2[i]);     // Red
                diff += Math.abs(data1[i + 1] - data2[i + 1]); // Green
                diff += Math.abs(data1[i + 2] - data2[i + 2]); // Blue
            }
            return diff;
        } catch (error) {
            console.error(`Error calculating difference between frames ${framePath1} and ${framePath2}:`, error.message);
            throw error;
        }
    }

    static async createAnimatedThumbnail(keyFrames, outputPath, cleanUp) {
        try {
            // Load the first frame to determine the dimensions
            const firstImage = await loadImage(keyFrames[0]);
            console.log('Start processing');
            const gifWidth = firstImage.width;
            const gifHeight = firstImage.height;
    
            const encoder = new GIFEncoder(gifWidth, gifHeight);
            const canvas = createCanvas(gifWidth, gifHeight);
            const ctx = canvas.getContext('2d');
    
            const output = fs.createWriteStream(outputPath);
            encoder.createReadStream().pipe(output);
    
            encoder.start();
            encoder.setRepeat(0);
            encoder.setDelay(200);
            encoder.setQuality(3);
    
            for (const framePath of keyFrames) {
                const image = await loadImage(framePath);
                ctx.drawImage(image, 0, 0, gifWidth, gifHeight);
                encoder.addFrame(ctx);
            }
    
            encoder.finish();
            console.log('Thumbnail created');
    
            if (typeof cleanUp === 'function') {
                cleanUp();
            }
    
            await new Promise((resolve, reject) => {
                output.on('finish', resolve);
                output.on('error', reject);
            });
        } catch (error) {
            console.error('Error creating thumbnail:', error);
            throw error;
        }
    }
}

module.exports = ImageService;
const db = require('../config/postgres'); 

class Thumbnail {
    static async create(videoUrl, thumbnailUrl) {
        const query = 'INSERT INTO thumbnails(video_url, thumbnail_url) VALUES($1, $2) RETURNING id';
        const values = [videoUrl, thumbnailUrl];
        const result = await db.query(query, values);
        return result.id;
    }

    static async getThumbnailURLByVideoURL(videoUrl) {
        const query = 'SELECT thumbnail_url FROM thumbnails WHERE video_url = $1';
        const values = [videoUrl];
        try {
            const result = await db.query(query, values);
            if (result.rows.length > 0) {
                return result.rows[0].thumbnail_url;
            }
        } catch (error) {
            console.error('Error retrieving thumbnail URL:', error.message);
            throw error;
        }
    }
}

module.exports = Thumbnail;
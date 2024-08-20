// models/videoModel.js
class Video {
    constructor(url, thumbnail, metadata) {
        this.url = url;
        this.thumbnail = thumbnail;
        this.metadata = metadata;
    }
}

module.exports = Video;

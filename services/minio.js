const path = require('path');
const minioClient = require('../config/minio')


const uploadToMinio = async (filePath, bucketName) => {
    const fileName = path.basename(filePath);
    await minioClient.fPutObject(bucketName, fileName, filePath);
    return fileName;
};

module.exports = { uploadToMinio };

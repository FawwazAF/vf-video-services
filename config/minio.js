const Minio = require('minio');

// Initialize MinIO client
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
});

module.exports = minioClient;
#!/bin/bash

# Wait for MinIO to be ready
until $(curl --output /dev/null --silent --head --fail http://localhost:9000); do
    printf '.'
    sleep 5
done

echo "MinIO is up. Creating bucket..."

# Configure MinIO client
mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Create a bucket named "thumbnail-generator"
mc mb myminio/thumbnail-generator

echo "Bucket 'thumbnail-generator' created successfully."

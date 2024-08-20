# videfly video processing service test

![GitHub stars](https://img.shields.io/github/stars/FawwazAF/vf-video-services)
![GitHub forks](https://img.shields.io/github/forks/FawwazAF/vf-video-services)
![GitHub issues](https://img.shields.io/github/issues/FawwazAF/vf-video-services)
![GitHub license](https://img.shields.io/github/license/FawwazAF/vf-video-services)

## Table of Contents
1. [Introduction](#introduction)
2. [Setup Instructions](#setup-instructions)

## Introduction
Welcome to **vf-video-services**! This project is a demonstration of Processing URL Video to create video metadata and .gif thumbnail.

## Setup Instructions
Follow these steps to get the project up and running on your local machine.

Prerequisites
- Docker
- Docker Compose
- Node js

1. After cloning, do : 
```
npm install
```

2. Build and run the Docker containers:
```
docker-compose up --build
```

3. Run the app
```
node app.js
```

4. If success run the app, you can open `http://localhost:3000` in your browser and fill the form with videoURL
<img width="745" alt="image" src="https://github.com/user-attachments/assets/3e261ff6-e589-4b43-98db-19a49793af0c">


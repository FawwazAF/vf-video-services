const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const path = require('path');

exports.createJobDirectory = () => {
    const uuid = uuidv4();
    const dir = `job/${uuid}`
    if (fs.existsSync(dir)) {
        throw new Error('job dir is exist')
    }

    fs.mkdirSync(dir, { recursive: true });

    return dir
}

exports.cleanDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        fs.unlinkSync(filePath);
    }

    fs.rmdir(dir, (err) => {
        if (err) {
            console.error(`Error deleting directory ${dir}:`, err.message);
        }
    });
}

exports.createJSONFile = async (object, filePath) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(object, null, 2), (err) => {
        if (err) {
          return reject('Error saving metadata to JSON: ' + err);
        }
        resolve(filePath);
      });
    });
  }
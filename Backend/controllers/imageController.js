const fs = require('fs');
const sharp = require('sharp');
const imagePath = require('../config').imagePath;

exports.cleanupImages = () => {
    console.log('----------------------------------------------------------------------------------------------------------------');
    console.log('-------------------------------------------- Running image cleanup ---------------------------------------------');
    console.log('----------------------------------------------------------------------------------------------------------------');

    let expirationTime = 13; // in hours after the image was uploaded
    let now = Date.now();

    fs.readdir(imagePath,
        (err, files) => {
            files.forEach((file) => {
                let fileName = file.split('.')[0];
                if (fileName <= now - 1000 * 60 * 60 * expirationTime) {
                    fs.unlinkSync(imagePath + '/' + file);
                    console.log('Deleting image named: ' + file);
                }
            });
        }
    );
};

exports.resize = (imgPath) => {
    sharp.cache(false);
    sharp(imgPath)
        .resize(320, 240)
        .toBuffer()
        .then(
            (data) =>
                sharp(data)
                    .toFile(imgPath));
};
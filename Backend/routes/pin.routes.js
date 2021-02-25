const express = require('express');
const multer = require('multer');
const path = require('path');
const imagePath = require('../config').imagePath;

const router = express.Router();

const storage = multer.diskStorage({
    destination: imagePath,
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024, files: 1}
});

const pinController = require('../controllers/pinController');


router.get('/', async (req, res) => {
    await pinController.get(req,res);
});

router.post('/create', upload.single('photo'), async (req, res) => {
    await pinController.create(req, res);
});

router.get('/getPin/:id', async (req, res) => {
    await pinController.getPin(req, res);
});

router.get('/getPinsNear/:latitude&:longitude&:radius&:userName', async (req, res) => {
    await pinController.getPinsNear(req, res);
});

router.post('/addComment', async (req, res) => {
    await pinController.addComment(req, res);
});

router.get('/getComments/:id', async (req, res) => {
    await pinController.getComments(req, res);
});

module.exports = router;
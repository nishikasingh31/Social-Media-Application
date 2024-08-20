const express = require('express')
const postRoute = express.Router();
const postController = require('../controllers/postController')
const middleware = require('../middlewares/authMiddlware')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })


postRoute.post('/upload', middleware.verifyToken, upload.single('file'), postController.uploadPost)
postRoute.get('/list', middleware.verifyToken, postController.getPostList)


module.exports = postRoute;
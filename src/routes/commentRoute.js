const express = require('express')
const commentRoute = express.Router();
const commentController = require('../controllers/commentController')
const middleware = require('../middlewares/authMiddlware')


commentRoute.post('/add', middleware.verifyToken, commentController.addComment)
commentRoute.get('/list', middleware.verifyToken, commentController.commentList)


module.exports = commentRoute;
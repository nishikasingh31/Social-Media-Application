const express = require('express')
const userRoute = express.Router();
const userController = require('../controllers/userController')
const middleware = require('../middlewares/authMiddlware')


userRoute.post('/signup', userController.userSignUp)
userRoute.post('/login', userController.userLogIn)
userRoute.post('/login/otp', userController.userLogInOTP)
userRoute.get('/profile/:id', middleware.verifyToken, userController.userProfile)
userRoute.post('/follow', middleware.verifyToken, userController.followUser)
userRoute.get('/followers/list', middleware.verifyToken, userController.getFollowersList)
userRoute.get('/followings/list', middleware.verifyToken, userController.getFollowingsList)
userRoute.post('/unfollow', middleware.verifyToken, userController.unfollowUser)
userRoute.post('/logout', middleware.verifyToken, userController.userLogout)


module.exports = userRoute;
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app_constants = require('../constants/app.json');
const User = require('../models/userModel');


exports.verifyToken = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.json({ success: 0, status: app_constants.UNAUTHORIZED, message: 'Please pass the token!', result: {} })
    }

    const token = authorization.replace("Bearer ", "")
    if (!token) {
        return res.json({ success: 0, status: app_constants.UNAUTHORIZED, message: 'Invalid token!', result: {} })
    }
    const verify_token = await jwt.verify(token, process.env.JWT_SECRET_KEY)

    if (!verify_token) {
        return res.json({ success: 0, status: app_constants.UNAUTHORIZED, message: 'Invalid token!', result: {} })
    }

    const { id } = verify_token
    const user_data = await User.findById(id)
    if (token != user_data.token) {
        return res.json({ success: 0, status: app_constants.UNAUTHORIZED, message: 'Invalid token!', result: {} })
    }

    if (!user_data) {
        return res.json({ success: 0, status: app_constants.BAD_REQUEST, message: 'User does not exist!', result: {} })
    }

    req.user = user_data

    next()
}
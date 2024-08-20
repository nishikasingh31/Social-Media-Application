const User = require("../models/userModel")
const bcrypt = require('bcrypt');
const app_constants = require('../constants/app.json')
const jwt = require('jsonwebtoken');
const Post = require('../models/postModel');
require('dotenv').config()
const sendEmail = require('../helpers/sendEmail')
const fast2sms = require("fast-two-sms");
const axios = require('axios')
const accountSid = 'AC27d171ab7d6a9fd574afc31d8ef82f97';
const authToken = 'aadd30b11d30cd6ec6b2ea7e093d1fb5';
const client = require('twilio')(accountSid, authToken);


exports.userSignUp = async (data) => {
    // for unique email check
    const user_data = await User.findOne({ email: data.email })
    if (user_data) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'Email already exists!', result: {} };
    }

    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(data.password, salt)
    const add_user = await User.create({ ...data, password: hash_password })

    // to send mail
    const subject = "Welcome to Our App!"
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Document</title></head><body><h3>Hi ${data.username},</h3><p>Welcome to our application.</p><p>Thanks for sign up with us.</p><br><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj6nYxsIeKyxqvL5Tx99EIvJ4xiJ9fZQ5omFCfxoxPp1qx81XhUFNxHHzStg&s" alt><br><br><p>Best Regards,</p><p>Rungta Team,</p></body></html>`

    await sendEmail(data.email, subject, html)

    return { success: 1, status: app_constants.SUCCESS, message: 'User added successfully!', result: add_user };
}


exports.userLogIn = async (data) => {
    const { email, password } = data
    const user_data = await User.findOne({ email })

    if (!user_data) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'Email does not exist!', result: {} }
    }

    const password_check = await bcrypt.compare(password, user_data.password)

    if (!password_check) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'Invalid Credentials!', result: {} }
    }

    const token = await jwt.sign({ id: user_data._id }, process.env.JWT_SECRET_KEY)
    await User.updateOne(
        { _id: user_data._id },
        { $set: { token } }
    )

    return { success: 1, status: app_constants.SUCCESS, message: 'User logged in successfully!', result: { token } };
}


exports.userProfile = async (data) => {
    const { id } = data
    const [user_data, post_count] = await Promise.all([
        User.findOne({ _id: id }, { _id: 0, __v: 0, password: 0 }),
        Post.countDocuments({ user_id: id })
    ])

    let result = {}
    const followers_count = user_data.followers.length
    const following_count = user_data.followings.length
    result = JSON.parse(JSON.stringify(user_data));   // for making deep copy

    result.followers_count = followers_count
    result.following_count = following_count
    result.post_count = post_count

    delete result.followers;
    delete result.followings;

    if (!user_data) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'User does not exist!', result: {} }
    }

    return { success: 1, status: app_constants.SUCCESS, message: 'User profile fetched successfully!', result: result };
}


exports.followUser = async (data, auth_user_data) => {
    const auth_user_id = auth_user_data._id
    const existing_followings = auth_user_data.followings
    const follow_user_id = data.id;

    if (auth_user_id == follow_user_id) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'Can not follow yourself!', result: {} }
    }

    const user_data = await User.findOne({ _id: follow_user_id })
    if (!user_data) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'User does not exist!', result: {} }
    }

    const follow_check = existing_followings.includes(follow_user_id)
    if (follow_check) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'User is already followed!', result: {} }
    }

    existing_followings.push(follow_user_id)
    user_data.followers.push(auth_user_id)

    const [update_follow_user, update_auth_user] = await Promise.all([
        User.updateOne(
            { _id: follow_user_id },
            { $set: { followers: user_data.followers } }
        ),
        User.updateOne(
            { _id: auth_user_id },
            { $set: { followings: existing_followings } }
        )
    ])

    if (update_follow_user && update_auth_user) {
        return { success: 1, status: app_constants.SUCCESS, message: 'User followed successfully!', result: {} };
    }

    return { success: 0, status: app_constants.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
}


exports.getFollowersList = async (user_data, data) => {
    const { _id } = user_data;

    const limit = data.limit ? data.limit : 10000;
    const offset = data.offset ? data.offset : 0;
    const search = data.search ? data.search : ''
    let search_query = {}

    if (search) {
        const regex = new RegExp(search, 'i')
        search_query = {
            $or: [
                { "followers_details.username": regex },
                { "followers_details.email": regex }
            ]
        }
    }

    const pipeline = [
        { $match: { _id: _id } },
        {
            $lookup: {
                from: 'users',
                localField: "followers",
                foreignField: "_id",
                as: "followers_details"
            }
        },
        { $unwind: "$followers_details" },
        { $match: search_query }
    ]

    const [result, total_count] = await Promise.all([
        User.aggregate([
            ...pipeline,
            {
                $project: {
                    _id: 0,
                    email: "$followers_details.email",
                    username: "$followers_details.username"
                }
            },
            { $skip: +offset },
            { $limit: Number(limit) },
        ]),
        User.aggregate([
            ...pipeline,
            { $count: "total_count" }
        ])
    ])
    console.log(total_count);


    if (result) {
        return { success: 1, status: app_constants.SUCCESS, message: 'Followers list fetched successfully!', total_count: total_count.length ? total_count[0].total_count : 0, result };
    }

    return { success: 0, status: app_constants.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
}


exports.getFollowingsList = async (user_data, data) => {
    const { followings } = user_data;

    const limit = data.limit ? data.limit : 10000;
    const offset = data.offset ? data.offset : 0;
    const search = data.search ? data.search : ''
    const query = { _id: { $in: followings } }

    if (search) {
        const regex = new RegExp(search, 'i')
        query['$or'] = [
            { "username": regex },
            { "email": regex }
        ]
    }

    const [result, total_count] = await Promise.all([
        User.find(query).select({ username: 1, email: 1, _id: 0 }).skip(offset).limit(limit),
        User.countDocuments(query)
    ])

    if (result) {
        return { success: 1, status: app_constants.SUCCESS, message: 'Following list fetched successfully!', total_count, result };
    }

    return { success: 0, status: app_constants.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
}


exports.unfollowUser = async (data, auth_user_data) => {
    const auth_user_id = auth_user_data._id
    const existing_followings = auth_user_data.followings
    const unfollow_user_id = data.id;

    if (auth_user_id == unfollow_user_id) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'Can not unfollow yourself!', result: {} }
    }

    const user_data = await User.findOne({ _id: unfollow_user_id })
    if (!user_data) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'User does not exist!', result: {} }
    }

    const unfollow_check = existing_followings.includes(unfollow_user_id)
    if (!unfollow_check) {
        return { success: 0, status: app_constants.BAD_REQUEST, message: 'User is not followed!', result: {} }
    }

    // const filtered_existing_foolowings = existing_followings.filter((elem) => elem != unfollow_user_id)
    const filtered_existing_foolowings = existing_followings.filter((e) => {
        return e != unfollow_user_id
    })

    const filtered_followers = user_data.followers.filter((elem) => elem != auth_user_id.toString())

    const [update_unfollow_user, update_auth_user] = await Promise.all([
        User.updateOne(
            { _id: unfollow_user_id },
            { $set: { followers: filtered_followers } }
        ),
        User.updateOne(
            { _id: auth_user_id },
            { $set: { followings: filtered_existing_foolowings } }
        )
    ])

    if (update_unfollow_user && update_auth_user) {
        return { success: 1, status: app_constants.SUCCESS, message: 'User unfollowed successfully!', result: {} };
    }

    return { success: 0, status: app_constants.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
}


exports.userLogout = async (data) => {
    const { _id } = data

    const logout_user = await User.updateOne(
        { _id },
        { $set: { token: '' } }
    )

    if (logout_user) {
        return { success: 1, status: app_constants.SUCCESS, message: 'User logged out successfully!', result: {} };
    }

    return { success: 0, status: app_constants.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
}



exports.userLogInOTP = async (data) => {
    const { mobile_number } = data
    // console.log(mobile_number);
    client.verify.v2.services('VA2a0d92b0c46564ab79d9b13bd68a84f7')
        .verifications
        .create({ to: `+91${mobile_number}`, channel: 'sms' }) // channel can be 'sms', 'call', or 'email'
        .then(verification => console.log(verification.status))
        .catch(ex => console.log(ex));

    return { success: 1, status: app_constants.SUCCESS, message: 'OTP sent successfully!', result: {} };
}
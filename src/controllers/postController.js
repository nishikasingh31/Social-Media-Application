const postService = require('../services/postService')
const validationHelper = require('../helpers/validation')
const app_constants = require('../constants/app.json')


exports.uploadPost = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: 0, status: app_constants.BAD_REQUEST, message: 'Please upload the file!', result: {} })
        }

        req.body.file = req.file
        const upload_post = await postService.uploadPost(req.body, req.user)
        return res.json(upload_post)
    }
    catch (ex) {
        console.log(ex);
    }
}

exports.getPostList = async (req, res) => {
    try {
        const required_fields = ['id']

        const validation = validationHelper.validation(required_fields, req.query)

        if (Object.keys(validation).length) {
            return res.json({ success: 0, status: app_constants.BAD_REQUEST, message: validation, result: {} })
        }

        const get_posts = await postService.getPostList(req.query)
        return res.json(get_posts)
    }
    catch (ex) {
        console.log(ex);
    }
}
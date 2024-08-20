const commentService = require('../services/commentService')
const validationHelper = require('../helpers/validation')
const app_constants = require('../constants/app.json')


exports.addComment = async (req, res) => {
    try {
        const required_fields = ['post_id', 'text']
        const validation = validationHelper.validation(required_fields, req.body)

        if (Object.keys(validation).length) {
            return res.json({ success: 0, status: app_constants.BAD_REQUEST, message: validation, result: {} })
        }

        const add_comment = await commentService.addComment(req.body, req.user)
        return res.json(add_comment)
    }
    catch (ex) {
        console.log(ex);
    }
}



exports.commentList = async (req, res) => {
    try {
        const required_fields = ['post_id']
        const validation = validationHelper.validation(required_fields, req.query)

        if (Object.keys(validation).length) {
            return res.json({ success: 0, status: app_constants.BAD_REQUEST, message: validation, result: {} })
        }

        const comment_list = await commentService.commentList(req.query)
        return res.json(comment_list)
    }
    catch (ex) {
        console.log(ex);
    }
}
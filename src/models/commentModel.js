const { Schema, model } = require('mongoose')


const commentSchema = new Schema({
    text: { type: String, required: true },
    user_id: { type: Schema.ObjectId, ref: "user", required: true },
    likes: [{ type: Schema.ObjectId, ref: "user", default: [] }]
}, { timestamps: true })


const Comment = model('comment', commentSchema)
module.exports = Comment
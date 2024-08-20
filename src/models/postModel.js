const { Schema, model } = require('mongoose')


const postSchema = new Schema({
    file_url: { type: String, required: true },
    caption: { type: String, default: '' },
    user_id: { type: Schema.ObjectId, ref: "user", required: true },
    likes: [{ type: Schema.ObjectId, ref: "user", default: [] }],
    comments: [{ type: Schema.ObjectId, ref: "comment", default: [] }],
}, { timestamps: true })


const Post = model('post', postSchema)
module.exports = Post;
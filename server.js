const express = require('express')
require('dotenv').config()
const app = express()
const connection = require('./src/helpers/db')
const userRoute = require('./src/routes/userRoute')
const postRoute = require('./src/routes/postRoute')
const commentRoute = require('./src/routes/commentRoute')
const thirdPartyRoute = require('./src/routes/thirdPartyRoute')


app.use(express.json())
app.use('/user', userRoute)
app.use('/posts', postRoute)
app.use('/post/comments', commentRoute)
app.use('/api', thirdPartyRoute)



const PORT = process.env.PORT
app.listen(PORT, async () => {
    try {
        await connection;
        console.log(`Running on server ${PORT}`);
    }
    catch (ex) {
        console.log(ex);
    }
})
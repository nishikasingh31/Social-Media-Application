const mongoose = require('mongoose');


const currencySchema = new mongoose.Schema({
    base_currency: { type: String, required: true },
    target_currency: { type: String, required: true },
    date: { type: String, required: true },
    res: {}
})


const Currency = mongoose.model('currency', currencySchema)
module.exports = Currency;
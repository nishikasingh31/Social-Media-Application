require('dotenv').config()
const app_helper = require('../helpers/app');
const Currency = require('../models/currencyModel');


exports.getCurrencyRate = async (data) => {
    const base_currency = data.base_currency;
    const target_currency = data.target_currency;
    const date = app_helper.formateDate(data.date)
    const access_key = process.env.CURRENCY_API_KEY
    const api_url = process.env.CURRENCY_API_URL;

    const db_data = await Currency.findOne({ base_currency, target_currency, date })

    if (db_data) {
        console.log('coming from db')
        return db_data.res;
    }

    const currency_res = await app_helper.makeRequest(api_url, { access_key, source: base_currency, currencies: target_currency, date })
    await Currency.create({ base_currency, target_currency, date, res: currency_res })

    console.log('coming from thid party');
    
    return currency_res;
}
const thirdPartyService = require('../services/thirdPartyService')
const validationHelper = require('../helpers/validation')
const app_constants = require('../constants/app.json')


exports.getCurrencyRate = async (req, res) => {
    try {
        const required_fields = ['base_currency', 'target_currency', 'date']

        const validation = validationHelper.validation(required_fields, req.query)

        if (Object.keys(validation).length) {
            return res.json({ success: 0, status: app_constants.BAD_REQUEST, message: validation, result: {} })
        }

        const currency_rate = await thirdPartyService.getCurrencyRate(req.query)
        return res.json(currency_rate)
    }

    catch (ex) {
        console.log(ex);
    }
}
const express = require('express')
const thirdpartyRoute = express.Router();
const thirdPartyController = require('../controllers/thirdPartyController')


thirdpartyRoute.get('/currency/rate', thirdPartyController.getCurrencyRate)


module.exports = thirdpartyRoute;
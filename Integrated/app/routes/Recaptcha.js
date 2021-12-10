var express = require('express');
const { debug } = require('request');
var router = express.Router();
const request_func = require('request');

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify?secret=###&response=@@@&remoteip=%%%";

router.post('/', function(req, res) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
        return res.json({error: -1, message: "There something is wrong in recaptcha"});
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    let verificationURL = RECAPTCHA_VERIFY_URL.replace('###', secretKey);
    verificationURL = verificationURL.replace('@@@', req.body['g-recaptcha-response']);
    verificationURL = verificationURL.replace('%%%', req.connection.remoteAddress);

    request_func(verificationURL,function(error, response, body) {
        if (error) {
            return res.json({error: -2, message: error.message});;
        }
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return res.json({error: -2, message: "Failed captcha verification"});
        }
        res.json({error: 0});
    });
});

module.exports = router;
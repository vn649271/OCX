var express = require('express');
var router = express.Router();
const request_func = require('request');

router.post('/', function(req, res) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
        return res.json({error: 1, message: "There something is wrong in recaptcha"});
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = 
        "https://www.google.com/recaptcha/api/siteverify?secret=" + 
        secretKey + 
        "&response=" + req.body['g-recaptcha-response'] + 
        "&remoteip=" + req.connection.remoteAddress;
    request_func(verificationURL,function(error, response, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return res.json({error: 2, message: "Failed captcha verification"});
        }
        res.json({error: 0});
    });
});

module.exports = router;
var express = require('express');
var router = express.Router();
const request_func = require('request');

router.post('/', function(req, res) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
        return res.json({"responseError" : "something goes to wrong"});
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = 
        "https://www.google.com/recaptcha/api/siteverify?secret=" + 
        secretKey + 
        "&response=" + req.body['g-recaptcha-response'] + 
        "&remoteip=" + req.connection.remoteAddress;
    console.log(verificationURL);
    request_func(verificationURL,function(error, response, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return res.json({"responseError" : "Failed captcha verification"});
        }
        // req.flash("success", "Recaptcha passed");
        // res.redirect('/');
        res.json({"verify" : 1});
    });
});

module.exports = router;
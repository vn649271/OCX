const Phone = require("../models/Firestore/Phone");
require('dotenv').config();

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

var me;

class PhoneVerifyController {
    constructor() {
        me = this;
    }

    getCode = (req, res) => {
        var phoneNumber = req.query.phone.trim();
        client.verify
            .services(process.env.VERIFY_SERVICE_SID)
            .verifications
            .create({
                to: `+${phoneNumber}`,
                channel: req.query.channel
            })
            .then(data => {
                res.json({ error: 0, message: data });
            })
    }

    verifyCode = (req, res) => {
        var phoneModel = new Phone();
        if (req.query.phone == 'undefined' || req.query.code == 'undefined') {
            req.json({ error: 1, message: "Invalid phone number or verification code" });
            return;
        }
        var phone = `+${req.query.phone.trim()}`;
        var verifyCode = req.query.code;
        client.verify
            .services(process.env.VERIFY_SERVICE_SID)
            .verificationChecks
            .create({
                to: phone,
                code: verifyCode
            })
            .then(data => {
                if (data && data !== null && data.status && data.status !== null &&
                data.status !== 'approved') {
                    res.json({ error: 1, message: "You phone verification is in " + data.status });
                    return;
                }
                const phoneInfo = {
                    number: phone,
                    verifyCode: verifyCode,
                    status: 0
                };

                phoneModel.findOne({
                    where: {
                        number: phone
                    }
                }).then(phone => {
                    if (!phone) {
                        phoneModel.create(phoneInfo).then(newPhoneId => {
                            if (newPhoneId === null) {
                                res.json({ error: 2, message: "Failed to register phone." });
                                return;
                            }
                            res.json({ error: 0, message: newPhoneId });
                        });
                    } else {
                        res.json({ error: 3, message: "The phone is registered already." });
                    }
                });
            });
    }
};

module.exports = PhoneVerifyController;

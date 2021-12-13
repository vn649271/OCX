var util = require('util');
var exec = require('child_process').exec;
const Phone = require("../models/Firestore/Phone");
require('dotenv').config();


const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const PHONE_VERIFY_PENDING = 0;
const PHONE_VERIFY_APPROVED = 1;
const TWILIO_STATUS_CALLBACK_URL = process.env.TWILIO_STATUS_CALLBACK_URL;
const PHONE_VALIDATE_URL = process.env.PHONE_VALIDATE_URL;

var me;

/**
 * Controller for phone verify
 */
class PhoneVerifyController {
    constructor() {
        me = this;
        this.phoneModel = new Phone();
        this.urlForTwilioStatusCallback = TWILIO_STATUS_CALLBACK_URL;
    }


    /**
     * 
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    getStatus = (req, resp) => {
        console.info("PhoneVerifyController.getStatus():    ", req.body);
    }

    /**
     * Validate the phone number
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    validatePhoneNumber(req, res) {
        var phoneNumber = req.body.phone.trim();
        if (phoneNumber == "") {
            return res.json({ error: -1, message: "Not allowed empty phone number." });
        }
        let command = PHONE_VALIDATE_URL.replace('###', phoneNumber);
        command = command.replace('@@@', process.env.ACCOUNT_SID);
        command = command.replace('&&&', process.env.AUTH_TOKEN);
        exec(command, function (error, stdout, stderr) {
			if (stdout.length < 1) {
                return res.json({ error: -2, message: "Failed to validate the phone number as connection failure." });
			}
            const obj = JSON.parse(stdout);
            if (!obj.valid) {
                let errorText = obj.validation_errors[0];
                if (errorText == "TOO_SHORT") {
                    errorText = "The phone number is too short";
                } else if (errorText == "TOO_LONG") {
                    errorText = "The phone number is too long";
                } else if (errorText == "INVALID_BUT_POSSIBLE") {
                    errorText = "The phone number is invalid but possible";
                }
                return res.json({ error: -3, message: errorText });
            }
            return res.json({ error: 0 });
        });
    }

    /**
     * Send the request to get verification code to Twilio service
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    getCode = (req, res) => {
        var phoneNumber = "+" + req.query.phone.trim();
        this.phoneModel.findOne({
            where: {
                number: phoneNumber
            }
        }).then(phoneInfo => {
            if (!phoneInfo) {
                client.verify
                    .services(process.env.VERIFY_SERVICE_SID)
                    .verifications
                    .create({
                        statusCallback: this.urlForTwilioStatusCallback,
                        statusCallbackEvent: ['initiated', 'answered'],
                        statusCallbackMethod: 'POST',
                        to: phoneNumber,
                        channel: req.query.channel
                    })
                    .then(data => {
                        if (data !== undefined && data !== null && data.status && data.status !== null) {
                            if (data.status === 'pending') {
                                const phoneInfo = {
                                    number: phoneNumber,
                                    status: PHONE_VERIFY_PENDING
                                };
                                me.phoneModel.create(phoneInfo).then(newPhoneId => {
                                    if (newPhoneId === null) {
                                        res.json({ error: -1, message: "Failed to register phone." });
                                        return;
                                    }
                                    res.json({ error: 0, message: newPhoneId });
                                });
                            } else {
                                res.json({ error: -2, message: "Phone verifiy error: " + data.status });
                            }
                            return;
                        }
                        res.json({ error: -3, message: "Failed to request code for phone verification. Please try to again later" });
                    });
            } else {
                res.json({ error: -10, message: "The phone is used for verification already" });
            }
        })
    }

    /**
     * Send the request to verify provided code to Twilio service
     * @param {object} req request object from the client 
     * @param {object} res response object to the client
     */
    verifyCode = (req, res) => {
        var phoneNumber = "+" + req.query.phone.trim();
        var verifyCode = req.query.code;
        this.phoneModel.findOne({
            where: {
                number: phoneNumber
            }
        }).then(phoneInfo => {
            if (!phoneInfo) {
                res.json({ error: -1, message: "Invalid phone number for verification" });
            } else {
                if (phoneInfo.status != PHONE_VERIFY_PENDING) {
                    res.json({ error: -2, message: "Invalid verify status" });
                    return;
                }
                var phoneId = phoneInfo.id;
                client.verify
                    .services(process.env.VERIFY_SERVICE_SID)
                    .verificationChecks
                    .create({
                        to: phoneNumber,
                        code: verifyCode
                    })
                    .then(data => {
                        if (data !== undefined && data !== null && data.status && data.status !== null) {
                            if (data.status === 'approved') {
                                let ret = me.phoneModel.setStatus(phoneId, PHONE_VERIFY_APPROVED);
                                res.json({ error: 0, message: phoneId });
                                return;
                            }
                            res.json({ error: -3, message: "Phone verify status is invalid" });
                            return;
                        }
                        res.json({ error: -4, message: "Failed to verify phone" });
                    });
            }
        });
    }
};

module.exports = PhoneVerifyController;

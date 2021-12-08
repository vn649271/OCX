const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Firestore/Users");
const Phone = require("../models/Firestore/Phone");
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');
require('dotenv').config();

var TOKEN_GENERATION_SECRET_KEY = process.env.SECRET_KEY;

var me;

class UserAuthController {
    constructor() {
        me = this;
    }

    requestPinCodeAgain = (req, res) => {
        new User().findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if (user) {
                me.sendEmail(user.id, user, res);
                return;
            } else {
                res.json({ error: 1, message: "User already exists." });
            }
        }).catch(err => {
            res.json({ error: 3, message: err + " --> " + req.body.password + " ++error" });
        });
    }

    _registerWithGmail = (phoneInfo, params) => {
        if (phoneInfo === undefined || phoneInfo === null) {
            params.resp.json({ error: 1, message: "Failed to get phone information." });
            return;
        }
        const userData = {
            first_name: params.req.body.first_name,
            last_name: params.req.body.last_name,
            email: params.req.body.email,
            password: params.req.body.password,
            phone: phoneInfo.number,
            email_type: params.req.body.email_type,
            token: "",
            pin_code: "",
            status: 0
        };
        new User().findOne({
            where: {
                email: params.req.body.email
            }
        }).then(user => {
            if (!user) {
                bcrypt.hash(params.req.body.password, 10, (err, hash) => {
                    userData.password = hash;
                    new User().create(userData).then(newUserId => {
                        if (newUserId === null) {
                            params.resp.json({ error: 2, message: "Failed to add new user." });
                            return;
                        }
                        params.resp.json({ error: 0 });
                    });
                });
            } else {
                params.resp.json({ error: 1, message: "The Gmail account is registered already" });
            }
        });
    }

    registerWithGmail = (req, res) => {
        // First get phone info with phoneId
        var phoneModel = new Phone();
        if (req.body.email_type !== undefined && req.body.email_type) {
            phoneModel.getById(
                req.body.phoneId,
                this._registerWithGmail,
                {
                    req: req,
                    resp: res
                }
            );
        }
    }

    register = (req, res) => {
        if (req.body.email_type) {
            this.registerWithGmail(req, res);
            return;
        }
        const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone_for_email,
            email_type: req.body.email_type,
            token: "",
            pin_code: "",
            status: 0
        };
        new User().findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if (!user) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    userData.password = hash;
                    new User().create(userData).then(newUserId => {
                        if (newUserId === null) {
                            res.json({ error: 2, message: "Failed to add new user." });
                            return;
                        }
                        me.sendEmail(newUserId, userData, res);
                        return;
                        // res.json({ status: user.email + " Registered" });
                    }).catch(err => {
                        res.json({ error: 3, message: err + " ==error" });
                    });
                });
            } else {
                res.json({ error: 4, message: "User already exists." });
            }
        }).catch(err => {
            res.json({ error: 5, message: err + " --> " + req.body.password + " ++error" });
        });
    }

    login = (req, res) => {
        new User().findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    let lastToken = user.token;
                    if (lastToken === undefined || lastToken === null || lastToken == "") {
                        lastToken = user.pin_code;
                    }
                    let token = jwt.sign({ token: lastToken }, TOKEN_GENERATION_SECRET_KEY, {
                        expiresIn: 1440
                    });
                    let ret = new User().setToken(user.id, token);
                    res.json({ error: 0, message: token });
                } else {
                    res.json({ error: 1, message: 'Wrong Email or password. Please check again.' })
                }
            } else {
                res.json({ error: 2, message: 'User does not exists.' })
            }
        }).catch(err => {
            res.json({ error: 3, message: err.message })
        })
    }

    verifyPinCode = (req, res) => {
        new User().findOne({
            where: {
                pin_code: req.body.pinCode
            }
        }).then(user => {
            if (!user) {
                res.json({ error: 1, message: 'Failed to verify code.' });
                return;
            }
            if (user.status > 0) {
                res.json({ error: 2, message: 'The verification code was used already.' });
                return;
            }
            res.json({ error: 0 });
        });
    }

    //send email
    sendEmail = (newUserId, userInfo, response) => {
        var toAddress = userInfo.email;
        var smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.ADMIN_GMAIL_ADDRESS,
                pass: process.env.ADMIN_GMAIL_PASSWORD
            }
        };
        var transporter = nodemailer.createTransport(smtpConfig);
        var pinCode = randtoken.generate(5);
        let mailContent =
            '<p>You requested for email verification, ' +
            'kindly use this pin code <br><b>' +
            `${pinCode}` +
            '</b><br> to verify your email address' +
            '</p>';
        let ret = new User().setPinCode(newUserId, pinCode);
        var mailOptions = {
            from: process.env.ADMIN_GMAIL_ADDRESS,
            to: toAddress,
            subject: 'Email verification - openchain.exchange',
            html: mailContent
        };
        // response.json({ error: 0 });
        // return;
        transporter.sendMail(mailOptions, function (error) {

            if (error) {
                console.log("####### Failed to send mail: ", error);
                response.json({ error: 1, message: error.message });
            } else {
                response.json({ error: 0 });
            }
        });
    }
};

module.exports = UserAuthController;

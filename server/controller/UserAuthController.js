const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
require('dotenv').config();

var me;

class UserAuthController {
    constructor() {
        me = this;
    }

    register = (req, res) => {
        const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
        };
        User.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            if (!user) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    userData.password = hash;
                    User.create(userData)
                    .then(user => {
                        me.sendEmail(user.email);
                        res.json({ status: user.email + " Registered" });
                    })
                    .catch(err => {
                        res.send(err + " ==error");
                    });
                });
            } else {
                res.json({ error: "User already exists" });
            }
        })
        .catch(err => {
            res.send(err + " --> " + req.body.password +" ++error");
        });
    }

    login = (req, res) => {     
        User.findOne({
            where: {
                email: req.body.email
            }      
        })
        .then(user => {
            if (user) {
              if(bcrypt.compareSync(req.body.password, user.password)){
                    let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })
                    res.send(token)
                } else {
                    res.status(400).json({error: 'Wrong Credendials'})
                }
            } else {
                res.status(400).json({error: 'User does not exists'})
            }
        })
        .catch(err => {
            res.status(400).json({error: err})
        })
    }

    updateToken = (email, token) => {
        User.findOne({
            where: {
                email: email
            }
        })
        .then(user => {
            if (!user) {
                res.status(400).json({ error: 'User does not exists' })
                return;
            }
            user.update('token', token)
            .then(user => {
                res.send(token);
            });
        });
    }
    
    //send email
    sendEmail = (toAddress) => {
        var type = 'success',
            msg = 'Email already verified';
        if (result.length < 1) {
            req.flash('error', 'The Email is not registered with us');
            res.redirect('/');
            return;
        }
        if(result[0].verify > 0 ) {
            req.flash(type, msg);
            res.redirect('/');
            return;
        }
        var token = randtoken.generate(20);
        this._sendEmail(toAddress, token, function(error, errInfo) {
            if (error == 0) {
                me.updateToken(toAddress, token);
                type = 'success';
                msg = 'The verification link has been sent to your email address';
            } else {
                type = 'error';
                msg = errInfo.message; //'Something goes to wrong. Please try again';
            }
            req.flash(type, msg);
            res.redirect('/');
        });
    }

    _sendEmail = (toAddress, token, onComplete) => {
        var toAddress = toAddress;
        var token = token;
        
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
        let port = process.env.PORT;
        let mailContent = 
            '<p>You requested for email verification, ' + 
                'kindly use this ' + 
                    `<a href="http://localhost:${port}/email/verify?token=${token}">link</a>` +
                ' to verify your email address' +
            '</p>';
        var mailOptions = {
            from: process.env.ADMIN_GMAIL_ADDRESS,
            to: toAddress,
            subject: 'Email verification - openchain.com',
            html: mailContent
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                onComplete(1, error);
            } else {
                onComplete(0);
            }
        });
    }
};

module.exports = UserAuthController;
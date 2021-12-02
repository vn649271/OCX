const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');
require('dotenv').config();

var me;

class UserAuthController {
    constructor() {
        me = this;
    }

    register = (req, res) => {
        let today = new Date().toISOString().substr(0, 10);
        const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            token: "",
            status: 0,
            created_at: today,
            updated_at: today
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
                    User.create(userData).then(user => {
                        me.sendEmail(user, res);
                        // res.json({ status: user.email + " Registered" });
                    })
                    .catch(err => {
                        res.send(err + " ==error");
                    });
                });
            } else {
                res.json({ error: 1, message: "User already exists" });
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
    sendEmail = (userInfo, response) => {
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
                'kindly use this pin code <br>' + 
                    `${pinCode}` +
                '<br> to verify your email address' +
            '</p>';
        var mailOptions = {
            from: process.env.ADMIN_GMAIL_ADDRESS,
            to: toAddress,
            subject: 'Email verification - openchain.com',
            html: mailContent
        };
        transporter.sendMail(mailOptions, function(error) {
            // response.json({ error: 0 } );
            // return;
            if (error) {
                console.log("####### Failed to send mail: ", error);
                response.json({ error: 1, message: error.message } );
            } else {
                response.json({ error: 0 } );
            }
        });
    }
};

module.exports = UserAuthController;
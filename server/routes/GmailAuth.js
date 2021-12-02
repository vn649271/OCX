const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get("/failed", (req, res) => {
    res.send("Failed")
});

var passportAuthCallback = passport.authenticate(
    'google', 
    {
        scope: ['email', 'profile']
    }
);

router.post('/', passportAuthCallback);

var passportAuthFailedCallback = passport.authenticate(
    'google',
    {
        failureRedirect: '/google/failed'
    }
);

router.get(
    '/callback', 
    passportAuthFailedCallback,
    function (req, res) {
        if (req.user) {
            res.send(`Welcome ${req.user.email}`)
        } else {
            res.sendStatus(401);
        }
    }
);

router.get("/logout", (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
});

module.exports = router;

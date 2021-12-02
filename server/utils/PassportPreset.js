const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    new GoogleStrategy({
        clientID: "618639350562-ta19emhaehlhdoelghnv5176jketlah4.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:5000/google/callback",
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    })
);
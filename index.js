
const express = require('express');
const passport = require('passport');
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "/.env") });

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// Configure session management
app.use(session({
    secret: 'yourSecretKey2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user instances
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    console.log("deseralizeUser:", id)
    done(null, { id: id });
});

// Configure the Google strategy for use by Passport.js
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    prompt: 'select_account'
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    console.log("ID", profile.id)
    console.log("displayName", profile.displayName)
    console.log("photos", profile.photos[0].value)
    // Here, you would find or create a user in your database
    // Example:
    // User.findOrCreate({ googleId: profile.id }, (err, user) => {
    //   return done(err, user);
    // });

    done(null, profile);
}));

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // console.log("Callback")
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        // Optionally, clear the cookie explicitly if needed
        res.clearCookie('connect.sid'); // The name 'connect.sid' is the default session cookie name; change it if you use a different name.
        res.redirect('/'); // Redirect to homepage or login page after logout
    });
});

app.listen(3001, () => console.log('App listening on port 3001'));

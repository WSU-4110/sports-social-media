// Libraries
const axios = require('axios');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const express = require('express');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sportsocialmediaprofile-default-rtdb.firebaseio.com',
});

const csrfMiddleware = csrf({ cookie: true });

// Settings
const app = express();
PORT = 3000;
app.listen(PORT);

// View Engine
app.set('view engine', 'ejs');

// Folder Path
app.use(express.static(`${__dirname}/public`));

// Settings for
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all('*', (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

// Home Page
app.get('/', (req, res) => {
    const getAllTeams = async () => {
        try {
            const response = await axios.get(
                `https://maqhspyw3j.execute-api.us-east-1.amazonaws.com/dev/teams.json`
            );
            teamData = response.data;
            res.render('home', { teamData });
        } catch (error) {
            console.error(error);
        }
    };

    getAllTeams();
});

// Team Page
app.get('/teams/:teamName', (req, res) => {
    const { teamName } = req.params;
    let team;

    const getTeam = async () => {
        try {
            const response = await axios.get(
                `https://maqhspyw3j.execute-api.us-east-1.amazonaws.com/dev/${teamName}.json`
            );
            team = response.data;
            res.render('teamPage', { team });
        } catch (error) {
            console.error(error);
        }
    };

    getTeam();
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/profile', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const type = req.query.type || 'none';

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((userData) => {
            res.render('profile', { userData });
            console.log(userData);
        })
        .catch((error) => {
            res.redirect(`/login?type=${type}`);
        });
});

app.post('/sessionLogin', (req, res) => {
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin
        .auth()
        .createSessionCookie(idToken, { expiresIn })
        .then(
            (sessionCookie) => {
                const options = { maxAge: expiresIn, httpOnly: true };
                res.cookie('session', sessionCookie, options);
                res.end(JSON.stringify({ status: 'success' }));
            },
            (error) => {
                res.status(401).send('UNAUTHORIZED REQUEST!');
            }
        );
});

app.get('/signout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

app.get('/forgot', (req, res) => {
    res.render('forgot');
});

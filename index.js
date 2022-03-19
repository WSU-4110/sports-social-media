/* Libraries */
const axios = require('axios');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const express = require('express');
const admin = require('firebase-admin');

/* Firebase Settings */
const app = express();
const port = 3000;

/* Firebase Cookie Settings (User Authentication) */
const csrfMiddleware = csrf({ cookie: true });
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

/* Firebase Admin Initialization */
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sportsocialmediaprofile-default-rtdb.firebaseio.com',
});
const db = admin.firestore();
const usersDb = db.collection('users');

/* View Engine */
app.set('view engine', 'ejs');

/* Public Folder Path for css, js, and images */
app.use(express.static(`${__dirname}/public`));

/* API URL */
const API = 'https://maqhspyw3j.execute-api.us-east-1.amazonaws.com/dev';

/* Add Cookie to each page  */
app.all('*', (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

/* Home Page  */
app.get('/', (req, res) => {
    const getAllTeams = async () => {
        try {
            const response = await axios.get(`${API}/teams.json`);
            const teamData = response.data;
            res.render('home', { teamData });
        } catch (error) {
            console.error(error);
        }
    };

    getAllTeams();
});

/* Team Page */
app.get('/teams/:teamName', (req, res) => {
    const { teamName } = req.params;
    let team;
    const getTeam = async () => {
        try {
            const response = await axios.get(`${API}/${teamName}.json`);
            team = response.data;
            res.render('teamPage', { team });
        } catch (error) {
            res.status(401).send('An Error Occuered!');
            console.error(error);
        }
    };
    getTeam();
});

/* Signup Page */
app.get('/signup', (req, res) => {
    res.render('signup');
});

/* Login Page */
app.get('/login', (req, res) => {
    res.render('login');
});

/* Logout Page */
app.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

/* Forgot Password Page */
app.get('/forgot', (req, res) => {
    res.render('forgot');
});

/* Session Login */
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
                console.log(error);
                res.status(401).send('UNAUTHORIZED REQUEST!');
            }
        );
});

/* Profile Page */
app.get('/profile', async (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const type = req.query.type || 'none';
    const response = await axios.get(`${API}/all.json`);
    const playerData = response.data;
    const favoriteInfo = [];

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((userData) => {
            usersDb
                .doc(`${userData.uid}`)
                .get()
                .then((doc) => {
                    const currentUserData = doc.data();
                    const favoritesData = currentUserData.favorites;
                    playerData.forEach((player) => {
                        favoritesData.forEach((favorites) => {
                            if (player.name) {
                                const playerName = player.name;
                                const favoritesName = favorites;
                                if (favoritesName === playerName) {
                                    favoriteInfo.push(player);
                                }
                            }
                        });
                    });
                    res.render('profile', { currentUserData, favoriteInfo });
                });
        })
        .catch((error) => {
            console.log(error);
            res.redirect(`/login?type=${type}`);
        });
});

/* Favorite a player */
app.post('/favorite', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const { player } = req.body;

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((userData) => {
            const user = userData.uid;
            usersDb.doc(user).update({
                favorites: admin.firestore.FieldValue.arrayUnion(player),
            });
            res.status(200).json({
                message: `${player} has been added!`,
                status: 200,
            });
        })
        .catch((error) => {
            const message = error.code;
            if (message === 'auth/argument-error') {
                res.status(401).json({
                    message: 'Please login to use this feature!',
                    status: 401,
                });
            } else {
                res.status(401).json({
                    message: 'An error occured!',
                    status: 401,
                });
            }
        });
});

/* Unfavorite a player */
app.post('/unfavorite', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const { player } = req.body;

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((userData) => {
            const user = userData.uid;
            usersDb.doc(user).update({
                favorites: admin.firestore.FieldValue.arrayRemove(player),
            });
            res.status(200).send(`${player} removed!`);
        })
        .catch((error) => {
            console.log(error);
            res.status(401).send('ERROR');
        });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

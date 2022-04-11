/* Libraries */
const axios = require('axios');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const express = require('express');
const admin = require('firebase-admin');

/* API URL */
const API = 'https://maqhspyw3j.execute-api.us-east-1.amazonaws.com/dev';

/* Firebase Service Account Settings */
const serviceAccount = require('./serviceAccountKey.json');

/* APP Settings */
const app = express();
const port = 3000;

/* Firebase Admin Initialization */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sportsocialmediaprofile-default-rtdb.firebaseio.com',
});
const fbAuth = admin.auth();
const db = admin.firestore();
const usersDb = db.collection('users');

/* Firebase Cookie Settings (User Authentication) */
const csrfMiddleware = csrf({ cookie: true });
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

/* View Engine */
app.set('view engine', 'ejs');

/* Public Folder Path for css, js, and images */
app.use(express.static(`${__dirname}/public`));

/* Add Cookie to each page  */
app.all('*', (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

/* Home Page  */
app.get('/', async (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const response = await axios.get(`${API}/teams.json`); // gets all team name and logo from api
    const teamData = response.data;

    if (sessionCookie !== '') {
        // check if a user is logged in or not
        try {
            const user = await fbAuth.verifySessionCookie(sessionCookie, true);
            const fav = await usersDb.doc(user.uid).get(); // get signed in user information
            const currentUserData = fav.data();
            const favoriteTeamsData = currentUserData.favoriteTeams; // get all favorite teams from user

            teamData.forEach((team) => {
                if (favoriteTeamsData.includes(team.team)) {
                    team.favoriteTeamStatus = 'true';
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    res.render('home', { teamData });
});

/* Team Page */
app.get('/teams/:teamName', async (req, res) => {
    const { teamName } = req.params; // gets teamname
    const sessionCookie = req.cookies.session || '';
    const response = await axios.get(`${API}/${teamName}.json`); // gets team info with players info
    const team = response.data;

    if (sessionCookie !== '') {
        try {
            const user = await fbAuth.verifySessionCookie(sessionCookie, true);
            const fav = await usersDb.doc(user.uid).get(); // get signed in user information

            const currentUserData = fav.data();
            const favoritesData = currentUserData.favorites; // get all favorites from user
            const favoriteTeamsData = currentUserData.favoriteTeams; // get all favorite teams from user

            team.forEach((player) => {
                if (favoriteTeamsData.includes(player.team)) {
                    player.favoriteTeamStatus = 'true';
                }
                favoritesData.forEach((favorites) => {
                    // only grab player info and discard team info from all.json file
                    if (player.name) {
                        const playerName = player.name; // get player name from all player
                        const favoritesName = favorites; // get favorite player name
                        if (favoritesName === playerName) {
                            player.favStatus = 'true'; // if favorite player name matches a player get all info and push into empty array
                        }
                    }
                });
            });
        } catch (error) {
            console.error(error);
        }
    }
    res.render('teamPage', { team });
});

/* Login Page */
app.get('/login', (req, res) => {
    res.render('login');
});

/* Logout Page */
app.get('/logout', (req, res) => {
    res.clearCookie('session'); // clears session cookie which logs out user
    res.redirect('/');
});

/* Forgot Password Page */
app.get('/forgot', (req, res) => {
    res.render('forgot');
});

/* Signup Page */
app.get('/signup', (req, res) => {
    res.render('signup');
});

/* Signup Post */
app.post('/signup', async (req, res) => {
    const { email, name, password } = req.body; // get user email address, name, and password

    try {
        // create firebase user
        const user = await fbAuth.createUser({
            email: email,
            password: password,
            displayName: name,
        });

        // add firebase user in the firestore
        usersDb.doc(user.uid).set({
            favorites: [],
            favoriteTeams: [],
            email: user.email,
            displayName: user.displayName,
        });

        // send success message
        res.status(200).json({
            message: `${email} has been registered!`, // send registration success
            status: 200,
        });
    } catch (error) {
        // error message handling
        const message = error.code; // get error message from Firebase
        let returnMessage; // variable to assign error code message

        switch (message) {
            case 'auth/email-already-exists': // error occurs when email has already been registered;
                returnMessage = 'User already exists!';
                break;
            case 'auth/invalid-password': // error occurs when invalid/weak password is entered
                returnMessage = 'Weak/invalid password!';
                break;
            default:
                returnMessage = 'An error occurred!'; // error occurs in general cases
        }

        // send error message
        res.status(401).json({
            message: returnMessage, // assign error message to return to client
            status: 401,
        });
    }
});

/* Session Login */
app.post('/sessionLogin', async (req, res) => {
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        // create session cookie
        const sessionCookie = await fbAuth.createSessionCookie(idToken, {
            expiresIn,
        });
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie('session', sessionCookie, options);
        res.end(JSON.stringify({ status: 'success' }));
    } catch (error) {
        // error handling
        console.log(error);
        res.status(401).send('UNAUTHORIZED REQUEST!');
    }
});

/* Profile Page */
app.get('/profile', async (req, res) => {
    const sessionCookie = req.cookies.session || ''; // get cookie info
    const type = req.query.type || 'none';
    const response = await axios.get(`${API}/all.json`); // request all player data
    const playerData = response.data; // response from all player data
    const favoriteInfo = []; // empty array to store favorite info
    const favoriteTeamsInfo = []; // empty array to store favorite teams info

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie
        const fav = await usersDb.doc(user.uid).get(); // get signed in user inforamtion
        const currentUserData = fav.data();
        const favoritesData = currentUserData.favorites; // get all favorites from user
        const favoriteTeamsData = currentUserData.favoriteTeams; // get all favorite teams from user

        // get all players info and compare with favorites
        playerData.forEach((player) => {
            if (favoriteTeamsData.includes(player.team)) {
                favoriteTeamsInfo.push(player);
            }
            favoritesData.forEach((favorites) => {
                // only grab player info and discard team info from all.json file
                if (player.name) {
                    const playerName = player.name; // get player name from all player
                    const favoritesName = favorites; // get favorite player name
                    if (favoritesName === playerName) {
                        favoriteInfo.push(player); // if favorite player name matches a player get all info and push into empty array
                    }
                }
            });
        });
        favoriteInfo.sort((a, b) => a.name.localeCompare(b.name)); // sort favorites by name
        favoriteTeamsInfo.sort((a, b) => a.team.localeCompare(b.team)); // sort favorites by name
        res.render('profile', {
            currentUserData,
            favoriteInfo,
            favoriteTeamsInfo,
        });
    } catch (error) {
        console.log(error);
        res.redirect(`/login?type=${type}`);
    }
});

app.get('/account', async (req, res) => {
    const sessionCookie = req.cookies.session || ''; // get cookie info
    const type = req.query.type || 'none';

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie
        const fav = await usersDb.doc(user.uid).get(); // get signed in user inforamtion
        const currentUserData = fav.data();
        res.render('accountSettings', { currentUserData });
    } catch (error) {
        res.redirect(`/login?type=${type}`);
    }
});

/* Delete Account */
app.post('/delete', async (req, res) => {
    const sessionCookie = req.cookies.session || '';

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie for user
        fbAuth.deleteUser(user.uid);
        usersDb.doc(user.uid).delete();
        res.clearCookie('session'); // clears session cookie which logs out user
        res.status(200).send('deleted'); // send success
    } catch (error) {
        console.log(error);
        res.status(401).send('ERROR');
    }
});

/* Change Username */
app.post('/changeusername', async (req, res) => {
    const sessionCookie = req.cookies.session || '';

    const { username } = req.body; // get player name to add to favorite
    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie for user
        fbAuth.updateUser(user.uid, {
            displayName: username,
        });
        usersDb.doc(user.uid).update({
            displayName: username, // add player to current user favorites
        });
        res.status(200).send('deleted'); // send success
    } catch (error) {
        console.log(error);
        res.status(401).send('ERROR');
    }
});

/* Favorite a player */
app.post('/favorite', async (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const { player } = req.body; // get player name to add to favorite

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie for user
        usersDb.doc(user.uid).update({
            favorites: admin.firestore.FieldValue.arrayUnion(player), // add player to current user favorites
        });
        res.status(200).json({
            message: `${player} has been added to your favorites!`, // send success
            status: 200,
        });
    } catch (error) {
        const message = error.code; // get error message from Firebase
        if (message === 'auth/argument-error') {
            res.status(401).json({
                message: 'Please login to use this feature!', // error happens when user is not logged in
                status: 401,
            });
        } else {
            res.status(401).json({
                message: 'An error occured!', // any other error
                status: 401,
            });
        }
    }
});

/* Unfavorite a player */
app.post('/unfavorite', async (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const { player } = req.body; // get player name to remove from favorites

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie for user
        usersDb.doc(user.uid).update({
            favorites: admin.firestore.FieldValue.arrayRemove(player), // remove player from current user favorites
        });
        res.status(200).send(`${player} removed!`); // send success
    } catch (error) {
        console.log(error);
        res.status(401).send('ERROR');
    }
});

/* Favorite a team */
app.post('/favoriteTeam', async (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const { teamName } = req.body; // get team name to add to favorite teams

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie for user
        usersDb.doc(user.uid).update({
            favoriteTeams: admin.firestore.FieldValue.arrayUnion(teamName), // add team to current user favoriteTeams
        });
        res.status(200).json({
            message: `${teamName} has been added to your favorite teams!`, // send success
            status: 200,
        });
    } catch (error) {
        const message = error.code; // get error message from Firebase
        if (message === 'auth/argument-error') {
            res.status(401).json({
                message: 'Please login to use this feature!', // error happens when user is not logged in
                status: 401,
            });
        } else {
            res.status(401).json({
                message: 'An error occured!', // any other error
                status: 401,
            });
        }
    }
});

/* Unfavorite a team */
app.post('/unfavoriteTeam', async (req, res) => {
    const sessionCookie = req.cookies.session || '';
    const { teamName } = req.body; // get team name to remove from favorites

    try {
        const user = await fbAuth.verifySessionCookie(sessionCookie, true); // verify session cookie for user
        usersDb.doc(user.uid).update({
            favoriteTeams: admin.firestore.FieldValue.arrayRemove(teamName), // remove team from current user favorites
        });
        res.status(200).send(`${teamName} removed!`); // send success
    } catch (error) {
        console.log(error);
        res.status(401).send('ERROR');
    }
});

app.use((req, res) => {
    res.status(404).send('Sorry, page not found');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

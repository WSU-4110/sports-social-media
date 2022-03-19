/* eslint-disable no-undef */
/* Firebase initializeApp */
function config() {
    const firebaseConfig = {
        apiKey: 'AIzaSyDhYbSc9y3bw0j7EmLtL2k4huvoK99Uhxs',
        authDomain: 'sportsocialmediaprofile.firebaseapp.com',
        databaseURL:
            'https://sportsocialmediaprofile-default-rtdb.firebaseio.com',
        projectId: 'sportsocialmediaprofile',
        storageBucket: 'sportsocialmediaprofile.appspot.com',
        messagingSenderId: '701173843774',
        appId: '1:701173843774:web:41588c9dcc218e8cc6ce6f',
    };
    firebase.initializeApp(firebaseConfig);
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
}

/* Firebase Signup */
$('#signup').on('submit', () => {
    config();
    const email = $('#email').val();
    const password = $('#password').val();
    const name = $('#name').val();

    const db = firebase.firestore();

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(({ user }) =>
            db
                .collection('users')
                .doc(user.uid)
                .set({ favorites: [], email: email, displayName: name })
                .then(() => {
                    user.updateProfile({
                        displayName: name,
                    });
                })
                .then(() => firebase.auth().signOut())
                .then(() => {
                    window.location.assign('/profile?type=success');
                })
                .catch((error) => {
                    let type = '';
                    let title = '';
                    let text = '';
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            title = 'User Already Exists!';
                            text = '';
                            type = 'error';
                            break;
                        case 'auth/weak-password':
                            title = 'Weak Password';
                            text = 'Please try again';
                            type = 'error';
                            break;
                        default:
                            title = 'An Error Occured';
                            text = 'Try Again Later!';
                            type = 'error';
                    }
                    swal(title, text, type);
                    return false;
                })
        );
    return false;
});

/* Firebase Login */
$('#login').on('submit', () => {
    config();
    const email = $('#email').val();
    const password = $('#password').val();

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(({ user }) =>
            user.getIdToken().then((idToken) =>
                fetch('/sessionLogin', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    },
                    body: JSON.stringify({ idToken }),
                })
            )
        )
        .then(() => firebase.auth().signOut())
        .then(() => {
            window.location.assign('/profile');
        })
        .catch((error) => {
            let type = '';
            let title = '';
            let text = '';
            switch (error.code) {
                case 'auth/user-not-found':
                    title = 'User Does Not Exist!';
                    text = 'Please Sign Up';
                    type = 'warning';
                    break;
                case 'auth/wrong-password':
                case 'auth/too-many-requests':
                    title = 'Invalid Password';
                    text = 'Please try again';
                    type = 'error';
                    break;
                default:
                    title = 'An Error Occured';
                    text = 'Try Again Later!';
                    type = 'error';
            }
            swal(title, text, type);
            return false;
        });
    return false;
});

/* Firebase Favorite */
/* Firebase Favorite */
$(document).ready(() => {
    $('.favorite').on('click', function () {
        const player = $(this)[0].previousSibling.data;
        fetch('/favorite', {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player: player }),
        }).then((response) => {
            response
                .json()
                .then((parsedJson) => {
                    const { status } = parsedJson;
                    const { message } = parsedJson;
                    if (status === 401) {
                        swal('Error', message, 'warning');
                    }
                    if (status === 200) {
                        swal('Success', message, 'success');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    });
});

/* Firebase Unfavorite */
$('.unfavorite').on('click', function () {
    const player = $(this)[0].previousSibling.data;
    swal({
        title: 'Are you sure?',
        icon: 'warning',
        buttons: ['No, cancel it!', 'Yes, I am sure!'],
        dangerMode: true,
    }).then((unfavorite) => {
        if (unfavorite) {
            fetch('/unfavorite', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ player: player }),
            })
                .then((response) => {
                    const { status } = response;

                    if (status === 401) {
                        console.log(status);
                    }
                    if (status === 200) {
                        window.location.reload();
                    }
                })
                .catch((err) => console.log(err));
        } else {
            swal('Canceled!');
        }
    });
});

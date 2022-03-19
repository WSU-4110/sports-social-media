/* eslint-disable no-undef */

/* Firebase Signup */
$('#signup').on('submit', () => {
    // get input values
    const email = $('#email').val();
    const password = $('#password').val();
    const name = $('#name').val();

    // firestore db
    const db = firebase.firestore();

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password) // create user
        .then(({ user }) =>
            db
                .collection('users')
                .doc(user.uid)
                .set({ favorites: [], email: email, displayName: name }) // add user to "users" firestore db
                .then(() => {
                    user.updateProfile({
                        displayName: name,
                    });
                })
                .then(() => firebase.auth().signOut())
                .then(() => {
                    window.location.assign('/profile?type=success'); // redirect to signup page
                })
                .catch((error) => {
                    const { code } = error; // get error message
                    let type = '';
                    let title = '';
                    let text = '';
                    switch (code) {
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
                    swal(title, text, type); // send error alert
                    return false;
                })
        );
    return false;
});

/* Firebase Forgot Password */
$('#forgot').on('submit', () => {
    // get email input
    const email = $('#email').val();

    firebase
        .auth()
        .sendPasswordResetEmail(email) // send reset url link to email
        .then(() => {
            swal(
                'Password Reset Email Sent!',
                `Email sent to ${email}`,
                'success'
            );
        })
        .catch((error) => {
            const { code } = error; // get error message
            let type = '';
            let title = '';
            let text = '';
            switch (code) {
                case 'auth/user-not-found':
                    title = 'User Does Not Exist!';
                    text = 'Please Sign Up';
                    type = 'warning';
                    break;
                default:
                    title = 'An Error Occured';
                    text = 'Try Again Later!';
                    type = 'error';
            }
            swal(title, text, type); // send error alert
            return false;
        });
    return false;
});

/* Firebase Login */
$('#login').on('submit', () => {
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
            const { code } = error;
            let type = '';
            let title = '';
            let text = '';
            switch (code) {
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
        });
    return false;
});

/* Firebase Favorite */
$('.favorite').on('click', function () {
    const player = $(this)[0].previousSibling.data; // get player name from playercard
    fetch('/favorite', {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player: player }), // send post request with player name
    }).then((response) => {
        response
            .json()
            .then((data) => {
                const { status } = data; //  response status
                const { message } = data; // response message
                if (status === 401) {
                    swal('Error', message, 'warning'); // error alert
                }
                if (status === 200) {
                    swal('Success', message, 'success'); // success alert
                }
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

/* Firebase Unfavorite */
$('.unfavorite').on('click', function () {
    const player = $(this)[0].previousSibling.data; // get player name from playercard
    // Confirmation Alert
    swal({
        title: 'Are you sure?',
        text: `${player} will be removed from your favorites!`,
        icon: 'warning',
        buttons: ['Cancel', 'Ok'],
        dangerMode: true,
    }).then((unfavorite) => {
        // if confirmation yes
        if (unfavorite) {
            fetch('/unfavorite', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ player: player }), // send post request with player name to unfavorite
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
                .catch((error) => {
                    console.log(error);
                });
        }
        // if confirmation canceled
        else {
            swal('Canceled!');
        }
    });
});

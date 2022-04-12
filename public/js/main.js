/* eslint-disable max-classes-per-file */
/* eslint-disable no-undef */

/* Firebase Signup */
$('#signup').on('submit', () => {
    // get input values
    const email = $('#email').val();
    const password = $('#password').val();
    const name = $('#name').val();

    fetch('/signup', {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            name: name,
            password: password,
        }),
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
                    window.location.assign('/profile?type=success');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    });
    return false;
});

/* Firebase Forgot Password */
$('#forgot').on('submit', () => {
    // get email input

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

/* Firebase Change Password */
$('#deleteAccount').on('click', () => {
    swal({
        title: 'Are you sure?',
        text: 'Your Account will be deleted!',
        icon: 'warning',
        buttons: ['Cancel', 'Ok'],
        dangerMode: true,
    }).then((deleteAccount) => {
        // if confirmation yes
        if (deleteAccount) {
            fetch('/delete', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    const { status } = response;
                    if (status === 401) {
                        console.log(status);
                    }
                    if (status === 200) {
                        window.location.assign('/');
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

/* Firebase Change Username */
$('#changeUsername').on('submit', () => {
    // get email input
    const username = $('#username').val();
    swal({
        title: 'Are you sure?',
        text: 'Your username will be changed',
        icon: 'warning',
        buttons: ['Cancel', 'Ok'],
        dangerMode: true,
    }).then((changeUsername) => {
        // if confirmation yes
        if (changeUsername) {
            fetch('/changeusername', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }), // send post request with player name to unfavorite
            })
                .then((response) => {
                    const { status } = response;
                    if (status === 401) {
                        console.log(status);
                    }
                    if (status === 200) {
                        window.location.reload();
                        console.log(status);
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
    return false;
});

/* Firebase Favorite */
$('.favorite').on('click', function () {
    let player = $(this)[0].previousSibling.data; // get player name from playercard
    player = player.trim();

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
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

/* Firebase Unfavorite */
$('.unfavorite').on('click', function () {
    let player = $(this)[0].previousSibling.data; // get player name from playercard
    player = player.trim();
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

/* Firebase Team Favorite */
$('.favoriteTeam').on('click', function () {
    let teamName = $(this)[0].parentNode.innerText; // get team name from team card
    teamName = teamName.trim();

    fetch('/favoriteTeam', {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName: teamName }), // send post request with team name
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
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

/* Firebase Unfavorite */
$('.unfavoriteTeam').on('click', function () {
    let teamName = $(this)[0].parentNode.innerText; // get team name from team card
    teamName = teamName.trim();

    // Confirmation Alert
    swal({
        title: 'Are you sure?',
        text: `${teamName} will be removed from your favorites teams!`,
        icon: 'warning',
        buttons: ['Cancel', 'Ok'],
        dangerMode: true,
    }).then((unfavorite) => {
        // if confirmation yes
        if (unfavorite) {
            fetch('/unfavoriteTeam', {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamName: teamName }), // send post request with team name to unfavorite
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

/* Filtering Conference Options */
$('#filterC').change(() => {
    // Conference filter function
    // created variable to get the selected text from drop down menu
    const value = $('#filterC :selected').text();
    $('.teamCard').hide(); // hide everything that doesn't have a data value equal to the selected option
    $(`[data-conference="${value}"]`).show(); // show teams that have selected data value
});

/* Filtering Divison Options */
$('#filterD').change(() => {
    // DIvision filter function
    const value1 = $('#filterD :selected').text(); // grab the selected option
    $('.teamCard').hide(); // hide everything else
    $(`[data-division="${value1}"]`).show(); // show the teams with data value equal to the selected option
});

/* Sidebar scipt */

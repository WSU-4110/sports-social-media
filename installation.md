## Requirements

 * [Node](#node)
 * [Firebase](#firebase)
 * [AWS](#aws)

# Node

For development, you will only need Node.js and a node global package installed in your environement.

-   #### Node installation on Windows

    Just go on [official Node.js website](https://nodejs.org/) and download the installer.
    Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

-   #### Node installation on Ubuntu

    You can install nodejs and npm easily with apt install, just run the following commands.

        $ sudo apt install nodejs
        $ sudo apt install npm

-   #### Other Operating Systems
    You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

## Running Locally

```sh
git clone https://github.com/WSU-4110/sports-social-media-profile-locater.git
cd sports-social-media-profile-locater
npm install
node index.js
```

# Firebase

Firebase is required to store data for users

1. Create a Firebase application by a click on https://console.firebase.google.com/
2.  Get service account key After you click the Generate New Private Key button, a JSON file containing your service account’s credentials will be downloaded. You’ll need this to initialize the SDK in the next step. To read more visit https://firebase.google.com/docs/admin/setup
3.  Create  a Firestore database with the collection name "users"
4.  From the previous step copy the contents in the JSON file and encode it by visiting https://www.base64encode.org/
5.  Save the result in an .env file with the key name "FIREBASE_CREDS" as shown in the .env.example file

# AWS Resources

Visit [API Section](https://github.com/WSU-4110/sports-social-media-profile-locater/tree/main/api).


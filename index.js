#!/usr/bin/env node

const { writeFileSync } = require('fs');
const request = require('request');
const localOauth = require('oauth-cli');

const [,,path, credentialsPath] = process.argv;

const baseUrl = 'https://api.monzo.com/'

const options = {
    authCode: {
        endpoint: 'https://auth.monzo.com/',
        redirectUrl: 'http://localhost:8080',
    },
    accessToken: {
        endpoint: `${baseUrl}oauth2/token`,
        clientAuth: 'form',
    },
    client: {
        id: process.env.MONZO_CLIENT_ID,
        secret: process.env.MONZO_CLIENT_SECRET,
    },
}

const credentialsFile = credentialsPath ?
    `${process.cwd()}/${credentialsPath}` :
    `${process.env.HOME}/.monzo.json`;

function getCredentials(file, callback) {
    const oldCredentials = require(file);
    localOauth(options, oldCredentials, (error, refreshedCredentials) => {
        if(error) return callback(error)
        writeFileSync(file, JSON.stringify(refreshedCredentials, null, 2));
        callback(null, refreshedCredentials);
    });
};

getCredentials(credentialsFile, (error, credentials) => {
    if (error) {
        return console.log(error);
    }
    request({
        baseUrl,
        url: path,
        auth: { bearer: credentials.accessToken },
        headers: {
            'User-Agent': 'Terminal'
        }
    }, (err, res, body) => {
        console.log(body);
        process.exit(0);
    });
});

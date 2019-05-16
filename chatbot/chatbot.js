'use strict';
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const structjson = require('./structjson.js');
const config = require('../config/keys');

// Get content from file
var fs = require("fs");
var contents = fs.readFileSync('/home/fede/Documents/Proyectos-Iron/cannabot/cannabot-gcloud-creds.json');
// Define to JSON type
var jsonContent = JSON.parse(contents);

const mongoose = require('mongoose');

const googleAuth = require('google-oauth-jwt');

const projectId = jsonContent.project_id;
const sessionId = uuid.v4();
const languageCode = 'en-US';

const credentials = {
    client_email: jsonContent.googleClientEmail,
    private_key:
    jsonContent.googlePrivateKey,
};

//const sessionClient = new dialogflow.SessionsClient({projectId, credentials});
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: '/home/fede/Documents/Proyectos-Iron/cannabot/cannabot-gcloud-creds.json'
});


const Registration = mongoose.model('registration');


module.exports = {

    getToken: async function() {
        return new Promise((resolve) => {

            googleAuth.authenticate(
                {
                    email: jsonContent.client_email,
                    keyFile: '/home/fede/Documents/Proyectos-Iron/cannabot/cannabot-gcloud-creds.pem',
                    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                },
                (err, token) => {
                    resolve(token);
                    console.log(" async function getToken => ", token)
                },
            );
        });
    },

    textQuery: async function(text, userID, parameters = {}) {
        let self = module.exports;
        const sessionPath = sessionClient.sessionPath(projectId, sessionId + userID);

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: languageCode,
                },
            },
            queryParams: {
                payload: {
                    data: parameters
                }
            }
        };

        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;



    },

    eventQuery: async function(event, userID,  parameters = {}) {
        let self = module.exports;
        let sessionPath = sessionClient.sessionPath(projectId, sessionId + userID);

        const request = {
            session: sessionPath,
            queryInput: {
                event: {
                    name: event,
                    parameters: structjson.jsonToStructProto(parameters), //Dialogflow's v2 API uses gRPC. You'll need a jsonToStructProto method to convert your JavaScript object to a proto struct.
                    languageCode: languageCode,
                },
            }
        };

        let responses = await sessionClient.detectIntent(request);
        responses = self.handleAction(responses);
        return responses;

    },


    handleAction: function(responses){
        let self = module.exports;
        let queryResult = responses[0].queryResult;

        switch (queryResult.action) {
            case 'recommendcourses-yes':
                if (queryResult.allRequiredParamsPresent) {
                    self.saveRegistration(queryResult.parameters.fields);
                }
                break;
        }

        return responses;
    },

    saveRegistration: async function(fields){
        const registration = new Registration({
            name: fields.name.stringValue,
            address: fields.address.stringValue,
            phone: fields.phone.stringValue,
            email: fields.email.stringValue,
            dateSent: Date.now()
        });
        try{
            let reg = await registration.save();
            console.log(reg);
        } catch (err){
            console.log(err);
        }
    }
}

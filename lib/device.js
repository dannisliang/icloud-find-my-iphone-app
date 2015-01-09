'use strict';

var util = require('util'),
    async = require('async'),
    http = require('icloud-http-client');

function Device(properties, session, contexts) {
    this.properties = properties;
    this.session = session;
    this.contexts = contexts;

    Object.defineProperty(this, 'properties', {
        value: this.properties
    });
}

// Sends a sound alert to the device
Device.prototype.alert = function(subject, callback) {
    var form = JSON.stringify({
        device: this.properties.id,
        subject: subject || 'Find My iPhone Alert',
        serverContext: this.contexts.serverContext,
        clientContext: this.contexts.clientContext
    });

    http.post({
        uri: util.format(
'%s/fmipservice/client/web/playSound?clientBuildNumber=%s&clientId=%s&dsid=%s',
            this.session.session.webservices.findme.url,
            this.session.session.id.buildNumber, this.session.session.id.uuid,
            this.session.session.dsInfo.dsid),
        form: form, // clientContext: CLIENT_CONTEXT
        headers: {
            'User-Agent': http.userAgent(),
            'Origin': http.origin(),
            'Cookie': this.session.cookies,
            'Content-Type': http.mime('json'),
            'Content-Length': form.length
        }
    }, function(err, result) {
        if(!err && result && result.content) {
            this.properties = result.content;
            return callback(null, true);
        } else return callback(err, null);
    });
};

// Sets this device on 'lost mode'
Device.prototype.lock = function(options, callback) {
    if(!options.passcode) {
        return callback(new Error(
            'You must set a passcode, enter any if one is already enabled'),
            null);
    }

    try {
        var passcode = parseInt(options.passcode);
    } catch(e) {
        return callback(new Error('Passcode is not valid'), null);
    }

    var form = JSON.stringify({
            device: this.properties.id,
            lostModeEnabled: true, trackingEnabled: true,
            userText: true, emailUpdates: true,
            passcode: passcode,
            ownerNbr: options.ownerNbr || '',
            text: options.text || 'This iPhone has been lost. Please call me.',
            serverContext: this.contexts.serverContext,
            clientContext: this.contexts.clientContext
        });

        http.post({
            uri: util.format(
'%s/fmipservice/client/web/lostDevice?clientBuildNumber=%s&clientId=%s&dsid=%s',
                this.session.session.webservices.findme.url,
                this.session.session.id.buildNumber,
                this.session.session.id.uuid,
                this.session.session.dsInfo.dsid),
                form: form, // clientContext: CLIENT_CONTEXT
                headers: {
                    'User-Agent': http.userAgent(),
                    'Origin': http.origin(),
                    'Cookie': this.session.cookies,
                    'Content-Type': http.mime('json'),
                    'Content-Length': form.length
                }
        },
        function(err, result) {
            if(!err && result && result.content) {
                this.properties = result.content;
                return callback(null, true);
            } else return callback(err, null);
        }
    );
};

// TODO: Erase device
Device.prototype.erase = function(callback) {

};

module.exports = Device;

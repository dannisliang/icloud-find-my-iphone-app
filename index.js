'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    async = require('async'),
    http = require('icloud-http-client');

var Device = require('./lib/device');

function refresh(location, session, clientContext, serverContext, tokens) {
    var cookies = tokens.concat(session.cookies);

    var form = JSON.stringify({ clientContext: clientContext,
        serverContext: serverContext });

    async.waterfall([
        function(callback) {
            http.post({
                uri: util.format(
'%s/fmipservice/client/web/refreshClient?clientBuildNumber=%s&clientId=%s&dsid=%s',
                    session.session.webservices.findme.url,
                    session.session.id.buildNumber, session.session.id.uuid,
                    session.session.dsInfo.dsid),
                    form: form, // clientContext: CLIENT_CONTEXT
                    headers: {
                        'User-Agent': http.userAgent(),
                        'Origin': http.origin(),
                        'Cookie': cookies,
                        'Content-Type': http.mime('json'),
                        'Content-Length': form.length
                    }
                },
                function(err, data) {
                    return err ? callback(err, null) : callback(null, data);
                }
            );
        },
        function(data, callback) {
            try {
                return callback(null, JSON.parse(data));
            } catch(e) {
                return callback(e, null);
            }
        }
    ], function(err, json) {
        if(!err && json) {
            var devices = [];

            json.content.forEach(function(deviceProperties) {
                devices.push(new Device(deviceProperties, session, {
                    clientContext: clientContext,
                    serverContext: serverContext })
                );
            });

            location.emit('location', devices);
        } else {
            location.emit('error', err);
        }
    });
}

// Expose `init` to initialize module
exports.init = function(session) {
    var ci = require('correcting-interval');

    var location = new EventEmitter(),
        clientContext = { appName: 'iCloud Find (Web)', shouldLocate: true };

    // TODO: Figure out where this originates from
    /* var CLIENT_CONTEXT = {'appName': 'iCloud Find (Web)','appVersion': '2.0',
    'timezone': 'US/Pacific', 'inactiveTime': 2,
    "apiVersion":"3.0", "fmly":true, "shouldLocate":true,
    "selectedDevice":"all" };*/

    // TODO: Remove magic from form
    // Tip: You could send an empty response and still get something
    var form = JSON.stringify(clientContext);

    async.waterfall([
        function(callback) {
            // Initialize the service
            http.post({
                uri: util.format(
'%s/fmipservice/client/web/initClient?clientBuildNumber=%s&clientId=%s&dsid=%d',
                    session.session.webservices.findme.url,
                    session.session.id.buildNumber, session.session.id.uuid,
                    session.session.dsInfo.dsid),
                form: form, //, clientContext: CLIENT_CONTEXT
                headers: {
                    'User-Agent': http.userAgent(),
                    'Origin': http.origin(),
                    'Cookie': session.cookies[0].join('; '),
                    'Content-Type': http.mime('json'),
                    'Content-Length': form.length
                }
            }, function(err, data, cookies) {
                return err ? callback(err, null, null) :
                    callback(null, data, cookies);
            });
        },
        // Parse contents
        function(json, cookies, callback) {
            try {
                return callback(null, { context: JSON.parse(json),
                    cookies: cookies });
            } catch(e) {
                return callback(e, null, null);
            }
        }
    ], function(err, json) {
        if(!err && json) {
            var serverContext = json.context.serverContext,
                tokens = json.cookies;

            var devices = [];

            json.context.content.forEach(function(deviceProperties) {
                devices.push(new Device(deviceProperties, session, {
                    clientContext: clientContext,
                    serverContext: {} })
                );
            });

            location.emit('connected', devices);

            // TODO: Avoid setInterval
            var ctrl = ci.setCorrectingInterval(function() {
                refresh(location, session, clientContext, serverContext, tokens);
            }, serverContext.callbackIntervalInMS || 2000);
        } else {
            location.emit('error', err);
        }
    });

    return location;
};

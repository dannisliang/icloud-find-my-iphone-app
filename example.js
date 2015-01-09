'use strict';

var icloud = require('icloud-session'),
    fmip = require('./index');

var credentials = {
    appleId: 'YOUR_APPLE_ID',
    password: 'YOUR_PASSWORD'
}

// Login
icloud.login(credentials.appleId, credentials.password, {},
    function(err, session) {
        if(!err && session) {
            // You can use the session module to run the app
            // See below for sample output
            var app = fmip.init(session);

            // This is called when the client is initialized
            // See below for sample output
            app.once('connected', function(devices) {
                // Suppose someone stole your iPhone 4
                var device = devices[0];

                // Look at current device properties, including battery
                console.log(device.properties);

                // Send a sound alert
                device.alert('Thief!', function(success) {
                    console.log('Alert sent');
                });

                // Lock the device
                device.lock({ passcode: 1234, ownerNbr: '(555) 555-5555',
                    text: 'Stop right there!' },
                    function(success) {
                        console.log('Device locked');
                    }
                );
            });

            // This is called when the location is being updated
            app.on('location', function(devices) {
                // Actively track devices in real-time
                console.log(devices);
            });

            // This is called if any errors arise
            app.on('error', function(error) {
                console.error(error);
            });
        } else {
            console.error(err);
        }
    }
);

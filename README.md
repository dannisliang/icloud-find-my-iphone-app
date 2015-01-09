# icloud-find-my-iphone-app
Find My IPhone App Plugin

## Install
Since this is not yet available on npm, you can install the module by following
these steps:

1. Clone this repository

        $ git clone https://github.com/alexlincoln/icloud-find-my-iphone-app.git

2. Clone the `icloud-session` repository

        $ git clone https://github.com/alexlincoln/icloud-session.git

2. Clone the `icloud-http-client` repository

        $ git clone https://github.com/alexlincoln/icloud-http-client.git

3. Install the `icloud-http-client` module on both `icloud-session` and
`icloud-find-my-iphone-app`

        $ npm install /path/to/icloud-http-client

4. Install the `icloud-session` module

        $ npm install /path/to/icloud-session

## Example

```javascript
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
```

## API
### .init(session)
This kickstarts the application with the given session. You must login
to ICloud in order to obtain the `session`. It requires one parameter `session`,
which contains certain information that are needed to run this module. Once
initialized, it will emit events - see below on which events to listen for. See
above for an example.

## Device
### .alert(subject, callback)
This function will send a sound alert to the target device. It takes two
parameters `subject` (string) and `callback` (function), and returns a true or
false value depending on success.  

### .lock(options, callback)
This function will lock the targeted device and set it in 'lost mode'. It takes
two paramters `options` (object) and `callback` (function), and returns a true
or false value depending on success. It takes a few different options:

- `passcode` (number) - Any numerical 4-digit code (required), it will not
overwrite if one is already set
- `ownerNbr` (string) - Contact number to leave on device lock (optional)
- `text` (string) - Message to send to device on lock (optional)

## Events
### `connected`
This event will be emitted once the connection has been successfully made.
Location details contained in this event are not likely to be accurate or even
found yet. See below for sample output. See above for an example.

### `location`
This event will be emitted when a new location has been obtained. This module
follows the same flow as the web version, meaning it will send continual
updates every `2 seconds`. The event will always send you the location of all
devices enabled. See below for sample output. See above for an example.

### `error`
This event will be emitted anytime the application encounters invalid HTTP
responses or unexpected output. See above for an example.

Sample output for enabled IPhone 4 and 5c devices:
(Tip: Use `util.inspect` to inspect nested objects)
```
[ {
    canWipeAfterLock: true,
    remoteWipe: null,
    locFoundEnabled: false,
    location: null,
    deviceModel: 'FourthGen',
    remoteLock: null,
    activationLocked: false,
    locationEnabled: true,
    rawDeviceModel: 'iPhone3,2',
    modelDisplayName: 'iPhone',
    lostModeCapable: true,
    id: 'DEVICE ID',
    deviceDisplayName: 'iPhone 4',
    darkWake: false,
    locationCapable: true,
    batteryLevel: 0,
    maxMsgChar: 160,
    name: 'iPhone',
    features: [Object],
    deviceClass: 'iPhone',
    wipeInProgress: false,
    fmlyShare: false,
    passcodeLength: 4,
    mesg: null,
    isMac: false,
    snd: [Object],
    isLocating: true,
    deviceColor: null,
    trackingInfo: null,
    batteryStatus: 'Unknown',
    deviceStatus: '203',
    wipedTimestamp: null,
    lockedTimestamp: null,
    msg: [Object],
    lostTimestamp: '',
    lostModeEnabled: false,
    thisDevice: false,
    lostDevice: null,
    prsId: null
    },
    {
        canWipeAfterLock: true,
        remoteWipe: null,
        locFoundEnabled: false,
        location: [Object], // Hint: This key contains the device's geolocation
        deviceModel: '5c-3b3b3c-f5f4f7',
        remoteLock: null,
        activationLocked: true,
        locationEnabled: true,
        rawDeviceModel: 'iPhone5,3',
        modelDisplayName: 'iPhone',
        lostModeCapable: true,
        id: 'DEVICE ID',
        deviceDisplayName: 'iPhone 5c',
        darkWake: false,
        locationCapable: true,
        batteryLevel: 0,
        maxMsgChar: 160,
        name: 'iPhone',
        features: [Object],
        deviceClass: 'iPhone',
        wipeInProgress: false,
        fmlyShare: false,
        passcodeLength: 4,
        mesg: null,
        isMac: false,
        snd: null,
        isLocating: true,
        deviceColor: '3b3b3c-f5f4f7',
        trackingInfo: null,
        batteryStatus: 'Unknown',
        deviceStatus: '203',
        wipedTimestamp: null,
        lockedTimestamp: null,
        msg: null,
        lostTimestamp: '',
        lostModeEnabled: false,
        thisDevice: false,
        lostDevice: null,
        prsId: null } ]
```

## TODO
- Erase device implementation
- Support for Two-Factor Authentication flow
- Tests

## Bugs/Errors
As always feel free to submit any bugs or errors that you come across. Pull
requests are welcomed.

## License
Copyright (c) 2015 alexlincoln

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

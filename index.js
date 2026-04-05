require('dotenv').config()
const rp = require('request-promise');
const deviceUUIDs = require('./devices.json');

const token = process.env.API_TOKEN;
const platformURL = process.env.PLATFORM_URL || 'https://demo.davra.com/';

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function deviceExist(UUID) {
    var options = {
        method: 'GET',
        url: platformURL + 'api/v1/devices/' + UUID,
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true,
    };
    return rp(options);
}

function sendToIotdata(payload) {
    var options = {
        method: 'PUT',
        url: platformURL + 'api/v1/iotdata',
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true,
        body: payload
    };

    return rp(options).then(response => {
        console.log(`[${new Date().toISOString()}] IoT data sent successfully`);
    }).catch(error => {
        console.error(`[${new Date().toISOString()}] Error sending IoT data:`, error.message);
    });
}

function generateDataPoints(uuid) {
    return [{
        "UUID": uuid,
        "name": "engine.temperature_celsius",
        "value": randomIntFromInterval(40, 75),
        "msg_type": "datum",
    }];
}

function runAutomation() {
    console.log(`\n--- Running automation at ${new Date().toISOString()} ---`);
    deviceUUIDs.forEach(uuid => {
        console.log('Processing device:', uuid);
        deviceExist(uuid).then(res => {
            if (res.totalRecords && res.records
                && res.records[0]
                && res.records[0].UUID == uuid) {
                var datapoints = generateDataPoints(uuid);
                sendToIotdata(datapoints);
            } else {
                console.error('No device matching:', uuid);
            }
        }).catch(error => {
            console.error('Error checking device:', error.message);
        });
    });
}

runAutomation();
setInterval(runAutomation, 60000);
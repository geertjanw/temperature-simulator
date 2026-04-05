require('dotenv').config()
const deviceUUIDs = require('./devices.json');

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomStatus() {
    const statuses = ['nominal', 'warning', 'critical', 'optimal'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function deviceExist(UUID) {
    return Promise.resolve({
        totalRecords: 1,
        records: [{ UUID }]
    });
}

function sendToIotdata(payload) {
    console.log(`[${new Date().toISOString()}] Simulated IoT data sent:`);
    console.log(JSON.stringify(payload, null, 2));
    return Promise.resolve();
}

function generateDataPoints(uuid) {
    return [
        {
            "UUID": uuid,
            "name": "engine.temperature_celsius",
            "value": randomIntFromInterval(20, 120),
            "msg_type": "datum",
        }
    ]
}

function runAutomation() {
    console.log(`\n--- Running automation at ${new Date().toISOString()} ---`);
    deviceUUIDs.forEach(uuid => {
        deviceExist(uuid).then(res => {
            if (res.totalRecords && res.records
                && res.records[0]
                && res.records[0].UUID == uuid) {
                var datapoints = generateDataPoints(uuid)
                sendToIotdata(datapoints)
            } else {
                console.error("No device matching :" + uuid)
            }
        })
    })
}

runAutomation()
setInterval(runAutomation, 60000)
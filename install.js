const Service = require('node-windows').Service;
const path = require("path");
const config = require("./config");
 
const svc = new Service({
    name: 'ShareMyFiles',
    description: `This service is to share files in network, port: ${config.port}.`,
    script: path.join(__dirname, "main.js")
});

svc.on('install', function() {
    svc.start();
    console.log("Starting service succeeds...");
});

svc.install();
console.log("Installing service succeeds...");
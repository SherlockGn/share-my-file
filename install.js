const Service = require('node-windows').Service;
const path = require("path");
 
var svc = new Service({
    name: 'ShareMyFiles',
    description: 'This service is to share files in network',
    script: path.join(__dirname, "main.js")
});

svc.on('install',function(){
    svc.start();
});

svc.install();
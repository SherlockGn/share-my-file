const fs = require('fs');
const path = require("path");
const express = require('express');
const multer  = require('multer')

const config = require("./config");

const publicDirectory = path.join(__dirname, "public");
const dataDirectory = path.join(__dirname, "public", "data");

const app = express();
const upload = multer({ dest: dataDirectory });

app.use('/static', express.static(publicDirectory));

app.get('/', function(req, res) {
    res.redirect("/static/source/index.html");
})

app.get('/api/files', function(req, res, next) {
    res.json(fs.readdirSync(dataDirectory));
});

app.post('/api/files/upload', upload.single('file'), function(req, res, next){
    const source = req.file.path;
    const dest = path.join(req.file.destination, req.file.originalname);
    fs.rename(source, dest, function(err) {
        if (err) {
            console.err(err);
            res.status(400).send();
        } else {
            res.status(200).send();
        }
    });
});

app.delete('/api/files/:name', function(req, res, next) {
    const name = req.params.name;
    const filePath = path.join(dataDirectory, name);
    fs.unlink(filePath, function(err) {
        if (err) {
            console.err(err);
            res.status(400).send();
        } else {
            res.status(200).send();
        }
    })
});

app.listen(config.port, function() {
    console.table({
        port: config.port,
        dir: __dirname
    })
});
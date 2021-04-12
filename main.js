const fs = require('fs')
const path = require("path")
const cp = require("child_process");
const express = require('express')
const multer  = require('multer')

const config = require("./config")

const publicDirectory = path.join(__dirname, "public")
const dataDirectory = path.join(__dirname, "public", "data")

const app = express()
const upload = multer({ dest: dataDirectory })

const listFilesAndFolders = async (abPath) => {
    console.log(abPath)
    const files = await new Promise((resolve, reject) => {
        console.log(abPath)
        fs.readdir(abPath.endsWith(':') ? `${abPath}\\` : abPath, (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(data)
        })
    })
    const ret = {
        folders: [],
        files: []
    }
    console.log(files)
    for (const item of files) {
        const isFile = await new Promise((resolve, reject) => {
            console.log(abPath + '\\' + item)
            fs.stat(abPath + '\\' + item, (err, f) => {
                if (err) {
                    resolve(null)
                    return
                }
                resolve(f.isFile())
            })
        })
        if (isFile === true) {
            ret.files.push(item)
        } else if (isFile === false) {
            ret.folders.push(item)
        }
    }
    return ret
}

app.use('/static', express.static(publicDirectory))

app.get('/', function(req, res) {
    res.redirect("/static/source/index.html")
})

app.get('/api/files', (req, res, next) => {
    res.json(fs.readdirSync(dataDirectory))
})

app.post('/api/files/upload', upload.single('file'), (req, res, next) => {
    const source = req.file.path
    const dest = path.join(req.file.destination, req.file.originalname)
    fs.rename(source, dest, err => {
        if (err) {
            res.status(400).send()
        } else {
            res.status(200).send()
        }
    })
})

app.delete('/api/files/:name', (req, res, next) => {
    const name = req.params.name
    const filePath = path.join(dataDirectory, name)
    fs.unlink(filePath, err => {
        if (err) {
            res.status(400).send()
        } else {
            res.status(200).send()
        }
    })
})

app.get('/api/disk/labels', (req, res, next) => {
    cp.exec('wmic logicaldisk get caption', (err, stdout, stderr) => {
        if(err) {
            res.status(400).send(err)
        } else if (stderr) {
            res.status(400).send(stderr)
        } else {
            res.status(200).json(stdout.split('\n').map(i => i.trim()).filter(i => i.endsWith(':')))
        }
    })
})

app.get('/api/disk/files', async (req, res, next) => {
    const abPath = req.query.path
    const download = req.query.download
    if (download) {
        res.download(abPath)
    } else {
        console.log("abpath", abPath)
        const data = await listFilesAndFolders(abPath)
        res.status(200).json(data)
    }
})

app.listen(config.port, function() {
    console.table({
        port: config.port,
        dir: __dirname
    })
})
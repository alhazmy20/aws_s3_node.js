// to call enviroment variables
require("dotenv").config();
const express = require("express");
const app = express();
//Initilize AWS object so you can call AWS Services
const aws = require("aws-sdk");
//middleware that handel uploaded files that are recieved from API call then send it to S3
const multer = require("multer");
//Initialize S3 object that will be send to the bucket
const multer_S3 = require("multer-s3");

aws.config.update({
    secretAccessKey: process.env.AWS_SECERET_ACESS_KEY,
    accessKeyId: process.env.AWS_ACESS_KEY_ID,
    region: process.env.AWS_DEFAULT_REGION
});

// Initilize the service that we want from AWS library 
const s3 = new aws.S3();
const BUCKET = process.env.AWS_BUCKET;
//Initilize multer object to choose where to store the file that is recieved from the our API
const upload = multer({
    //Initilize S3 object that will be uploaded to our specific bucket
    storage: multer_S3({
        bucket: BUCKET,
        s3: s3,
        acl: "public-read",
        key: (req, file, cb) => {
            cb(null, file.originalname)
        }
    })
})

app.post("/upload", upload.single("file"), function (req, res) {
    res.send("file " + req.file.originalname + " is sucessfully uploaded to S3");
})

app.get("/download/:filename", async function (req, res) {
    let response = await s3.getObject({ Bucket: BUCKET, Key: req.params.filename }).promise()
    res.send(response.Body);
})

app.listen(5000, function () {
    console.log("server is running")
});
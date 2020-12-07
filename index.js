const express = require("express");
const bodyParser = require("body-parser");
var mysql = require("mysql");
const fileUpload = require('express-fileupload');
var config = require("./config.json");

var db = mysql.createPool({
    connectionLimit: 4, // Faster connections.
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_name,
    multipleStatements: true
});

const app = express();

app.use(fileUpload({
    createParentPath: true
}));

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use("/static", express.static("static"));

app.use(bodyParser.json());

app.get("/", function (req, res) {
    db.query("SELECT * FROM readings", [], function (err, response) {
        res.render("index.ejs", { readings: response })
    })
});

app.get('/getdata', function (req, res) {
    db.query("SELECT * FROM readings", [], function (err, response) {
        res.send({ a: "1" })
    })
})

app.get('/getrawdata', function (req, res) {
    db.query("SELECT * FROM readings", [], function (err, response) {
        res.send(response)
    })
})


app.post('/uploadimage', function (req, res) {
    if (req.body.apikey != config.apikey) {
        if (req.files) {
            req.files.plot.mv('./static/plot.png')
            res.send('success')
        } else {
            res.send('missing req.files.plot')
        }
    } else {
        res.status('403').send("not allowed")
    }
})

app.post("/newdata", function (req, res) {
    if (req.body.apikey != config.apikey) {
     
        db.query("INSERT into readings set ?", { NAME: req.body.wattAC }, function (err) {
           
           if(err) console.log(err)
           
            res.send(req.body)

        })

    } else {
        res.status('403').send("not allowed")
    }
})

app.enable("trust proxy");
app.set("view engine", "ejs");

app.set("views", "views");


console.log("loaded");
app.listen(config.port);

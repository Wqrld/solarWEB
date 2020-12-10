const express = require("express");
const bodyParser = require("body-parser");
var mysql = require("mysql");
const fileUpload = require('express-fileupload');
var config = require("./config.json");
var lastDC;

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

db.query("SELECT * FROM readouts where wattDC < 7000 order by runtime desc", [], function (err, response) {
    lastDC = response[0].wattDC;
})

//SELECT * FROM news WHERE date >= now() - INTERVAL 1 DAY;

app.get("/", function (req, res) {
    db.query("SELECT * FROM readouts where wattDC < 7000 AND datetime >= now() - INTERVAL 2 DAY", [], function (err, dailyReadouts) {
        if (err) console.log(err)
        for (let i = 0; i < dailyReadouts.length; i++) {
            if (i > 1 && dailyReadouts[i].wattDC > dailyReadouts[i - 1].wattDC + 500) {
                dailyReadouts[i] = dailyReadouts[i - 1]
            }
        }

        db.query("select datetime, MAX(wattDC) as wattDC FROM readouts where wattDC < 7000 AND datetime IS NOT NULL GROUP BY DATE_FORMAT(datetime, '%m%d');", [], function (err, maxPerDay) {
            if (err) console.log(err)


            res.render("index.ejs", { readouts: JSON.stringify(dailyReadouts), maxPerDay: JSON.stringify(maxPerDay) })
        });

    })
});

app.get('/getdata', function (req, res) {
    db.query("SELECT * FROM readouts where wattDC < 7000 order by runtime desc", [], function (err, response) {
        res.send(response[0])
    })
})

app.get('/getrawdata', function (req, res) {
    db.query("SELECT * FROM readouts where wattDC < 7000 order by runtime desc", [], function (err, response) {
        res.send(response)
    })
})
// app.post('/ret', function (req, res) {
//     console.log(req.headers)
//     res.send("success")
// })

// app.post('/uploadimage', function (req, res) {
//     if (req.body.apikey != config.apikey) {
//         if (req.files) {
//             req.files.plot.mv('./static/plot.png')
//             res.send('success')
//         } else {
//             res.send('missing req.files.plot')
//         }
//     } else {
//         res.status('403').send("not allowed")
//     }
// })

app.post("/newdata", function (req, res) {
    console.log("headers")
    console.log(req.headers)
    console.log(config.apikey)
    if (req.headers.apikey == config.apikey) {

        if (lastDC != undefined && req.body.wattDC < lastDC + 500) {
            console.log("inserting");

            db.query("INSERT into readouts set ?", {
                datetime: require('moment')().format('YYYY-MM-DD HH:mm:ss'),
                wattTotaal: req.body.wattTotaal,
                wattDC: req.body.wattDC,
                wattAC: req.body.wattAC,
                runtime: req.body.runtime
            }, function (err) {

                if (err) console.log(err)

                res.send(req.body)

            })
            lastDC = req.body.wattDC
        }


    } else {
        res.status('403').send("not allowed")
    }
})

app.enable("trust proxy");
app.set("view engine", "ejs");

app.set("views", "views");


console.log("loaded");
app.listen(config.port);
